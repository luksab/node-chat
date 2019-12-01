const fs = require('fs'),
 path = require('path'),
 sio = require('socket.io'),
 static = require('node-static'),
 sanitizeHtml = require('sanitize-html'),
 crypto = require('crypto'),
 webpush = require('web-push');
//Push Notification

const pushOptions = require('../pushOptions.json');
let webPushSubs = {};
const publicEncryptKeys = {}
const publicSignKeys = {}

const file = new static.Server(path.join(__dirname, '..', 'public'));
const app = require('http').createServer((req,res)=>file.serve(req, res)).listen(8080);

var io = sio.listen(app,{pingTimeout: 5000}),
  nicknames = {},
  users = {};

  io.sockets.on('connection', function (socket) {

    socket.on('dm', function (msg) {
        if (!socket.nickname) {
          socket.emit('announcement', 'Please select a nickname first!');
          return;
        }
        if(msg.user !== "allChat"){
          try{
              //console.log("dm from "+socket.nickname+" to "+msg.user+": "+msg.msg);
              users[msg.user].sockets.forEach((e)=>e.emit('dm', {from: socket.nickname,msg: sanitizeHtml(msg.msg, {allowedTags: [],allowedAttributes: {}}),
                uuid:sanitizeHtml(msg.uuid, {allowedTags: [],allowedAttributes: {}})}));
          }catch(e){console.log(e)}
          try{
          //console.log(webPushSubs[msg.user])
          if(webPushSubs[msg.user])
            webPushSubs[msg.user].forEach(element => {
              webpush.sendNotification(
                element,
                ""+socket.nickname+": "+msg.msg,
                pushOptions
                );
            });
            }catch(e){console.log(e)}
        }
        else{
          socket.broadcast.emit('dm', {from: socket.nickname,msg: sanitizeHtml(msg.msg, {allowedTags: [],allowedAttributes: {}}),
                uuid:sanitizeHtml(msg.uuid, {allowedTags: [],allowedAttributes: {}})});
        }
      //socket.broadcast.emit('user message', socket.nickname, msg);
    });

    socket.on('dmImage', function (msg) {
      if(msg.user !== "allChat"){
        try{
            //console.log("dm from "+socket.nickname+" to "+msg.user+": "+msg.msg);
            users[msg.user].sockets.forEach((e)=>e.emit('dmImage', {from: socket.nickname,msg: sanitizeHtml(msg.msg, {allowedTags: ["img","IMG"],allowedAttributes: {}}),
              uuid:sanitizeHtml(msg.uuid, {allowedTags: [],allowedAttributes: {}})}));
        }catch(e){console.log(e)}
        try{
        //console.log(webPushSubs[msg.user])
        webPushSubs[msg.user].forEach(element => {
          webpush.sendNotification(
            element,
            ""+socket.nickname+": Image",
            pushOptions
            );
        });
        }catch(e){console.log(e)}
      }
      else{
        socket.broadcast.emit('dmImage', {from: socket.nickname,msg: sanitizeHtml(msg.msg, {allowedTags: ["img","IMG"],allowedAttributes: {}}),
              uuid:sanitizeHtml(msg.uuid, {allowedTags: [],allowedAttributes: {}})});
      }
    //socket.broadcast.emit('user message', socket.nickname, msg);
    });

    socket.on('encryptedDM', function (msg) {
      try{
          //console.log("dm from "+socket.nickname+" to "+msg.user+": "+msg.msg);
          users[msg.user].sockets.forEach((e)=>e.emit('encryptedDM', {from: socket.nickname,msg: msg.msg,signature:msg.signature,
            uuid:sanitizeHtml(msg.uuid, {allowedTags: [],allowedAttributes: {}})}));
      }catch(e){console.log(e)}
      try{
        //console.log(webPushSubs[msg.user])
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
          /*console.log(publicSignKeys)//prints {}, even after socket.on('PushEncryptKey') was called
          console.log(socket.nickname+" is requesting Key from "+name+" it is "+publicEncryptKeys[name]+
            " and "+publicSignKeys[name]);*/
          socket.emit('establishEncryption',name, {encrypt:publicEncryptKeys[name],sign:publicSignKeys[name]});
        }catch(e){console.log(e)}
    });

    socket.on('nickname', function (nick, fn) {
      //console.log(nick);
      if(nick == null)
        return fn(true);
      nickname = sanitizeHtml(nick['nick'], {allowedTags: [],allowedAttributes: {}});
      if(nickname == null || nickname == null)
        return fn(true);
      //Nickname is now valid
      if(typeof nick['passwd'] !== "string")
        nick['passwd'] = "";

      if (users[nickname] && users[nickname].passwd == ""){//User is signed in and has no pw
        console.log("user "+nickname+" is signed in")
        return fn(true);
      }
      if(nick['passwd'] == ""){//no password set
        console.log("no pw set by user "+nick['nick']);
        //We know, that users[nickname] has no be false
        users[nickname] = {sockets:[],passwd:false,encryptKey:false,signKey:false};
        users[nickname].sockets[socket.id] = socket;
        nicknames[nickname] = nickname;
        socket.nickname = nickname;
        io.sockets.emit('nicknames', nicknames);
        return fn(false);
      }else{//password set
        let passwd = crypto.createHash('sha1').update(nick['passwd']).digest('hex');
        if(users[nickname] == null){
          users[nickname] = {sockets:[],passwd:passwd,encryptKey:false,signKey:false};
          users[nickname].sockets[socket.id] = socket;
        }
        else if(users[nickname].passwd === passwd){
          users[nickname].sockets.push(socket);
        }
        else
          return fn(true);
        nicknames[nickname] = nickname;
        socket.nickname = nickname;
        io.sockets.emit('nicknames', nicknames);
        return fn(false);
      }
      console.log(socket.nickname)
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
        console.log("disconnect without login"+socket.nickname);
        return;
      }
      console.log(socket.id)
      delete users[socket.nickname]['sockets'][socket.id];
      for (let elements of users[socket.nickname]['sockets'].keys()) {
        console.log(elements); 
      }
      if(users[socket.nickname]['sockets'].length === 0){
        console.log("deleting user "+socket.nickname)
        delete users[socket.nickname];
        delete nicknames[socket.nickname];
        socket.broadcast.emit('nicknames', nicknames);
      }
      else{
        
      }
    });
  });
console.log("starting :)");
//disable crashing :)
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
