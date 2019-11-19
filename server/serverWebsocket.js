const fs = require('fs'),
 path = require('path'),
 sio = require('socket.io'),
 static = require('node-static'),
 sanitizeHtml = require('sanitize-html'),
 cryptoHash = require('crypto'),
 webpush = require('web-push');
//Push Notification

const pushOptions = require('../pushOptions.json');
let webPushSubs = {};
const publicEncryptKeys = {}
const publicSignKeys = {}

let users = {
  "ID1":{
    "keys":{"encrypt":"Key1","sign":"Key2"},
    "WebSockets":[],
    "friends":["ID2","ID3"]
  }
  ,"ID2":{}}

fs.readFile('/home/pi/node/node-chat/public/websocket/index.html', function (err, data) {
  if (err) {
      global["index"] = `Error getting the file: ${err}.`;
  } else {
      //res.writeHeader('Content-type', 'text/html');
      global["index"] = data;
  }
});

setInterval(() => {
  fs.readFile('/home/pi/node/node-chat/public/websocket/index.html', function (err, data) {
    if (err) {
        global["index"] = `Error getting the file: ${err}.`;
    } else {
        //res.writeHeader('Content-type', 'text/html');
        global["index"] = data;
    }
  });
}, 1000);

require('uWebSockets.js').App({})
.ws('/*', {
/* Options */
compression: 1,
maxPayloadLength: 16 * 1024 * 1024,
idleTimeout: 30,
/* Handlers */
open: (ws, req) => {
  console.log('A WebSocket connected via URL: ' + req.getUrl() + '!');
},
message: (ws, message, isBinary) => {
  if(bufToStr(message) === "ping")
    return;
  /* Ok is false if backpressure was built up, wait for drain */

  /*console.log(isBinary);
  console.log(bufToStr(message));
  console.log(new Uint8Array(message));*/
  if(isBinary){
    message = new Uint8Array(message);
    let header = message[0];
    let recipient = message.slice(1,5);
    let msg = message.slice(5);
    if(header == 0){
      console.log("connection from",Buffer.from(recipient).readUInt32BE(0));

    }
  }
  else{
    message = bufToStr(message);
    if(message === "register"){
      let uid = generateUID();
      console.log("ge");
      const ok = ws.send(JSON.stringify({"type":"uid","uid":uid.toString(32)}));
      console.log({"type":"uid","uid":uid});
      users[uid] = {
        "keys":{"enc":false,"sign":false},
        "websockets":[ws],
        "friends": []
      }
      ws["id"] = uid;
      return;
    }
    let json = false;
    try{
      message = JSON.parse(message);
      json = true;
    }
    catch{
      json = false;
    }
    console.log(message)
    if(json && message["type"] === "login"){
      
      if(true || users[message["uid"]]["keys"]["enc"] && users[message["uid"]]["keys"]["sign"]){
        ws["verified"] = false;
        users[message["uid"]]["websockets"].push(ws);
        let randomMsg = randomStr(32);
        ws["randomMsg"] = randomMsg;

        encryptData(users[message["uid"]]["keys"]["enc"], randomMsg).then((encyptedData)=>{
          ws.send(JSON.stringify({"type":"randomMsg","randomMsg":encyptedData}));
        })
      }else{
        ws.send("No keys on the server for that uid!")
      }
    }
  }
  //const ok = ws.send(message.slice(5), isBinary);
},
drain: (ws) => {
  console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
},
close: (ws, code, message) => {
  console.log('WebSocket closed');
}
}).any('/*', (res, req) => {
  res.end(global["index"]);
}).listen(8000, (token) => {
if (token) {
  console.log('Listening to port ' + 8000);
} else {
  console.log('Failed to listen to port ' + 8000);
}
});

bufToStr = (message)=>Buffer.from(message).toString();

let randomState = 1;
function generateUID(){
  var t = randomState += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0);
}
function randomStr(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}



var WebCrypto = require("node-webcrypto-ossl");
 
var crypto = new WebCrypto({
  directory: "key_storage"
})

function encryptData(key, data) {
  return crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
      //iv: vector
    },
    key,
    textToArrayBuffer(data)
  )
}
function textToArrayBuffer(str) {
  var buf = unescape(encodeURIComponent(str)) // 2 bytes for each char
  var bufView = new Uint8Array(buf.length)
  for (var i=0; i < buf.length; i++) {
    bufView[i] = buf.charCodeAt(i)
  }
  return bufView
}

/*const file = new static.Server(path.join(__dirname, '..', 'public'));
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
          /*socket.emit('establishEncryption',name, {encrypt:publicEncryptKeys[name],sign:publicSignKeys[name]});
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
*/
//disable crashing :)
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
