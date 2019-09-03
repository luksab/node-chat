const fs = require('fs'),
 path = require('path'),
 sio = require('socket.io'),
 static = require('node-static'),
 sanitizeHtml = require('sanitize-html'),
 crypto = require('crypto'),
 webpush = require('web-push');
//Push Notification

const pushOptions = require(./pushOptions.json);
let webPushSubs = {};
const publicEncryptKeys = {}
const publicSignKeys = {}

const file = new static.Server(path.join(__dirname, '..', 'public'));
const app = require('http').createServer((req,res)=>file.serve(req, res)).listen(8080);

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
            //console.log("dm from "+socket.nickname+" to "+msg.user+": "+msg.msg);
            users[msg.user].forEach((e)=>e.emit('dm', {from: socket.nickname,msg: msg.msg}));
        }catch(e){console.log(e)}
        try{
        console.log(webPushSubs[msg.user])
        if(webPushSubs[msg.user])
          webPushSubs[msg.user].forEach(element => {
            webpush.sendNotification(
              element,
              ""+socket.nickname+": "+msg.msg,
              pushOptions
              );
          });
          }catch(e){console.log(e)}
      //socket.broadcast.emit('user message', socket.nickname, msg);
    });

    socket.on('dmImage', function (msg) {
      try{
          //console.log("dm from "+socket.nickname+" to "+msg.user+": "+msg.msg);
          users[msg.user].forEach((e)=>e.emit('dmImage', {from: socket.nickname,msg: msg.msg}));
      }catch(e){console.log(e)}
      try{
      console.log(webPushSubs[msg.user])
      webPushSubs[msg.user].forEach(element => {
        webpush.sendNotification(
          element,
          ""+socket.nickname+": Image",
          pushOptions
          );
      });
      }catch(e){console.log(e)}
    //socket.broadcast.emit('user message', socket.nickname, msg);
  });

    socket.on('encryptedDM', function (msg) {
      try{
          //console.log("dm from "+socket.nickname+" to "+msg.user+": "+msg.msg);
          users[msg.user].forEach((e)=>e.emit('encryptedDM', {from: socket.nickname,msg: msg.msg,signature:msg.signature}));
      }catch(e){console.log(e)}
      try{
        console.log(webPushSubs[msg.user])
        if(webPushSubs[msg.user])
          webPushSubs[msg.user].forEach(element => {
            webpush.sendNotification(
              element,
              ""+socket.nickname+": "+msg.msg,
              pushOptions
              );
          });
      }catch(e){console.log(e)}
      //socket.broadcast.emit('user message', socket.nickname, msg);
    });
    
    
    socket.on('PushEncryptKey', function (publicKey) {
        try{
            publicEncryptKeys[socket.nickname] = publicKey;
            //console.log(socket.nickname+" is broadcasting encryption Key\n"+publicEncryptKeys[socket.nickname]);
            //socket.broadcast.emit('establishEncryption', socket.nickname, publicKey);
        }catch(e){console.log(e)}
    });
    
    socket.on('PushSignKey', function (publicKey) {
        try{
            publicSignKeys[socket.nickname] = publicKey;
            //console.log(socket.nickname+" is broadcasting signing Key\n"+publicKey);
            //socket.broadcast.emit('establishEncryption', socket.nickname, publicKey);
        }catch(e){console.log(e)}
    });


    socket.on('getKey', function (name) {
        try{
          console.log(publicSignKeys)//prints {}, even after socket.on('PushEncryptKey') was called
            console.log(socket.nickname+" is requesting Key from "+name+" it is "+publicEncryptKeys[name]+
            " and "+publicSignKeys[name]);
            socket.emit('establishEncryption',name, {encrypt:publicEncryptKeys[name],sign:publicSignKeys[name]});
        }catch(e){console.log(e)}
    });

    socket.on('nickname', function (nick, fn) {
      //console.log(nick);
      if(nick == null)
          return socket.emit('reload');
      nickname = sanitizeHtml(nick['nick'], {allowedTags: [],allowedAttributes: {}});
      if ((nicknames[nickname] && users[nickname][0].passwd == "") || nick === "" || nick == null){
        fn(true);
        return;
      }
      else{
        let passwd = crypto.createHash('sha1').update(nick['passwd']).digest('hex')
        if(users[nickname] && users[nickname][0].passwd != "" && users[nickname][0].passwd !== passwd)
            return fn(true);
        fn(false);
        nicknames[nickname] = socket.nickname = nickname;
        if(users[nickname] == null)
          users[nickname] = [];
        users[nickname].push(socket);
        //socket.broadcast.emit('announcement', nickname + ' connected');
        io.sockets.emit('nicknames', nicknames);
        if(nick['passwd'] != ""){
          //console.log("setting passwd");
          users[nickname][0].passwd = passwd;
        }
      }
    });

    socket.on('push', (pushSubscription) => {
      if(pushSubscription == null)
        return false;
      if(webPushSubs[socket.nickname] != null){
        let duplicate = false;
        webPushSubs[socket.nickname].forEach((push)=>duplicate = (push.endpoint===pushSubscription.endpoint)?true:duplicate)
        console.log("webPushSub has dup: "+duplicate)
        if(duplicate)
          return false;
      }
      if(webPushSubs[socket.nickname] != null)
        return webPushSubs[socket.nickname].push(pushSubscription);
      webPushSubs[socket.nickname] = [];
      webPushSubs[socket.nickname].push(pushSubscription);
    });

    socket.on('disconnect', function () {
      if (!socket.nickname) {//socket didn't login - do nothing
        console.log("disconnect without login");
        return;
      }
      console.log(webPushSubs.hasOwnProperty(nickname))
      if(!(webPushSubs.hasOwnProperty(nickname))){//If user didn't enable webPush
        delete nicknames[socket.nickname];
        if(!(users[socket.nickname][0].passwd == "")){//If user doesn't have a password
          delete users[socket.nickname];
        }
        //socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
        socket.broadcast.emit('nicknames', nicknames);
      }
      else
        console.log(webPushSubs);
    });
  });
  
//disable crashing :)
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
