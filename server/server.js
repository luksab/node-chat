const fs = require('fs'),
 path = require('path'),
 sio = require('socket.io'),
 static = require('node-static'),
 sanitizeHtml = require('sanitize-html'),
 crypto = require('crypto');
 
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/luksab.ml/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/luksab.ml/cert.pem')
};

require('http').createServer((req,res)=>{
    res.writeHead(301, {"Location": 'https://' + req.headers['host'] + req.url});
    res.end();}
  ).listen(80);

const file = new static.Server(path.join(__dirname, '..', 'public'));
const app = require('https').createServer(options, (req,res)=>file.serve(req, res)).listen(443);

var io = sio.listen(app,{pingTimeout: 5000}),
  nicknames = {},
  users = {};

  io.sockets.on('connection', function (socket) {

    socket.on('user message', function (msg) {
      if (!socket.nickname) {
        socket.emit('announcement', 'Please select a nickname first!');
        return;
      }
      socket.broadcast.emit('user message', socket.nickname, sanitizeHtml(msg, {allowedTags: [],allowedAttributes: {}}));
    });

    socket.on('user image', function (msg) {
      //console.log(msg);
      /*name = "1";
      fs.writeFileSync(`${name}.jpg`,msg.substring(22),{encoding:'base64'},err=>console.log(err));*/
      socket.broadcast.emit('user image', socket.nickname, msg);
    });
    
    socket.on('dm', function (msg) {
        try{
            console.log("dm from "+socket.nickname+" to "+msg.user+": "+msg.msg);
            users[msg.user].emit('dm', {from: socket.nickname,msg: msg.msg});
        }catch(e){console.log(e);}
      socket.broadcast.emit('user message', socket.nickname, msg);
    });

    socket.on('nickname', function (nick, fn) {
      //console.log(nick);
      if(nick == null)
          return socket.emit('reload');
      nickname = sanitizeHtml(nick['nick'], {allowedTags: [],allowedAttributes: {}});
      if (nicknames[nickname] || nick === ""){
        fn(true);
        return;
      }
      else {
        let passwd = crypto.createHash('sha1').update(nick['passwd']).digest('hex')
        if(users[nickname] && users[nickname].passwd != "" && users[nickname].passwd !== passwd)
            return fn(true);
        fn(false);
        nicknames[nickname] = socket.nickname = nickname;
        users[nickname] = socket;
        socket.broadcast.emit('announcement', nickname + ' connected');
        io.sockets.emit('nicknames', nicknames);
        if(nick['passwd'] != ""){
          console.log("setting passwd");
          users[nickname].passwd = passwd;
        }
      }
    });

    socket.on('disconnect', function () {
      if (!socket.nickname) {
        return;
      }

      delete nicknames[socket.nickname];
      if(!users[socket.nickname].passwd){
        delete users[socket.nickname];
      }
      socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
      socket.broadcast.emit('nicknames', nicknames);
    });
  });
  
//disable crashing :)
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
