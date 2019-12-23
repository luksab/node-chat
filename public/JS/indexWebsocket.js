'use strict';
function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function cycleNavBar(close){
  if(!window.matchMedia('(min-width: 800px)').matches){
      if(document.getElementById("mySidenav").style.width == "25em")
          document.getElementById("mySidenav").style.width = "0";
      else if(!close){
          document.getElementById("mySidenav").style.width = "25em";
      }
  }
  return false;
}
var rightClickEvent = 0;
var settingsMenu = document.querySelector('#settingsMenu');

function openSettings(){
  renderSettings();
  settingsMenu.style.transition = "top 0.3s ease-in-out";
  settingsMenu.style.top = '2.5vh';
  setTimeout(()=>settingsMenu.style.transition = "top 0s ease-in-out",500)
}

function closeSettings(event){
  //console.log(event)
  if(event.target == settingsMenu){
    settingsMenu.style.transition = "top 0.3s ease-in-out";
    settingsMenu.style.top = '-200vh';
    setTimeout(()=>settingsMenu.style.transition = "top 0s ease-in-out",500)
  }
}

window.onresize = function(event) {
if(window.matchMedia('(min-width: 800px)').matches){
      if(document.getElementById("mySidenav").style.width == "0px")
          document.getElementById("mySidenav").style.width = "25em";
  }
};

window.onload = ()=>{
  console.log("load");
  paste_image_reader(jQuery);
  initImage();
  localStorage.setItem('name',localStorage.getItem('name') || "me");

  let lines = document.getElementById('lines'), contactsSearch = document.getElementById('contactsSearch');
  let dmName = location.search.substring(1)?location.search.substring(1):"allChat", dms={};
  if(dmName != "allChat"){
    document.getElementsByTagName('span')[0].innerText = "☰ "+((dmName==="allChat")?"Cool Chat":dmName);
  }
  let nicknames=[];
  let names = {/*ID:name */};
  let ids = {/*name:ID */};
  const isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0));

  const wsConnect = ()=>{
    if(!navigator.onLine){
      window.setTimeout(wsConnect,500);
    }
    if(location.href === "http://localhost:8000/"){
      window.ws = new WebSocket("ws://localhost:8000/index.html");
    }
    else
      window.ws = new WebSocket("wss://luksab.de/websocket/index.html:8000");
    window.ws.onopen = async function () {
      $('#chat').addClass('connected');
      document.getElementById('register').disabled = false;
      
      const passwd = $('#passwd').val();
      if(localStorage.getItem("encryptKeyS").indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
        localStorage.getItem("signKeyS").indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
        localStorage.getItem("uid") != null){
          document.getElementById('register').value = "Login";
          let privateEKey = await importPrivateDecryptKey(localStorage.getItem("encryptKeyS"));
          let privateSKey = await importPrivateDecryptKey(localStorage.getItem("signKeyS"));
          const toSend = {
            "type":"login",
            "uid":parseInt(localStorage.getItem("uid"),10).toString(32),
          }
          console.log(toSend);
          return window.ws.send(JSON.stringify(toSend));
      }
    };
    window.ws.onmessage = async (message)=>{
        console.log(message);
        let msg = JSON.parse(message.data);
        console.log(msg);
        switch (msg["type"]) {
          case "dm":{
            dm(msg.from,msg.msg,msg.uuid);
            break;
          }case "whois":{
            console.log("name",msg["name"]);
            ids[msg["name"]] = false;
            users[msg["uid"]] = {"uid":msg["uid"]};
            if(msg["name"]){
              names[msg["uid"]] = msg["name"];
              ids[msg["name"]] = msg["uid"];
              users[msg["uid"]] = {"uid":msg["uid"],"name":msg["name"]};
            }
            if(msg["name"] && !nicknames.includes(msg["name"]))
              nicknames.push(msg["name"])
            break;
          }case "error":{
            console.error(msg["msg"]);
            $('#chat').removeClass('nickname-set');
            document.getElementById('register').disabled = false;
            $('#nickname-err').css('visibility', 'visible');
            document.getElementById('nickname-err').innerHTML = msg["msg"];
            if(msg["code"] === "no uid"){
              localStorage.removeItem("uid");
            }
            break;
          }case "uid":{
            let uid = parseInt(msg["uid"],32);
            function base64StringToArrayBuffer(b64str) {
              var byteStr = atob(b64str)
              var bytes = new Uint8Array(byteStr.length)
              for (var i = 0; i < byteStr.length; i++) {
                bytes[i] = byteStr.charCodeAt(i)
              }
              return bytes.buffer
            }
            let FromBase64 = function (str) {
                return new Uint8Array(atob(str).split('').map(function (c) { return c.charCodeAt(0); }));
            }
            console.log("from",FromBase64(msg["rS"]));
            let privateKey = await importPrivateDecryptKey(localStorage.getItem("encryptKeyS"));
            let randomMessage = await decryptData(privateKey,FromBase64(msg["rS"]));
            console.log(uid);
            window.ws.uid = uid;
            users[uid] = {"uid":uid,"name":"me"};
            console.log(randomMessage);
            console.log(arrayBufferToText(randomMessage));
            window.ws.send(JSON.stringify({"type":"randomMsg","randomMsg":arrayBufferToText(randomMessage)}));
            break;
          }case "succsess":{
            if (msg["succsess"]) {
              window.ws.send(JSON.stringify({"type":"myFriends"}));
              refreshNicks();
              localStorage.setItem("uid",ws.uid);
              $('#message').val('').focus();
              document.getElementById('message').disabled = false;
              document.getElementById('imagefile').disabled = false;
              return $('#chat').addClass('nickname-set');
            } $('#nickname-err').css('visibility', 'visible');
            break;
          }case "search":{
            if(msg["name"])
              nicknames.push(msg["name"]);
            else
              nicknames.push(msg["uid"]);
            const nickSet = new Set(nicknames);
            nicknames = [...nickSet];
            refreshNicks();
            break;
          }case "key":{
            publicKeys[msg["uid"]] = msg["keys"];
            break;
          }case "changeName":{
            users[ws.uid]["name"] = msg["name"];
            nicknames = nicknames.filter(e=>e != localStorage.getItem("name"));
            localStorage.setItem("name",msg["name"]);
            nicknames.push(msg["name"]);
            refreshNicks();
            break;
          }case "friends":{
            if(msg["friends"] != [])
              nicknames.push(...msg["friends"]);
            const nickSet = new Set(nicknames);
            nicknames = [...nickSet];
            refreshNicks();
            msg["friends"].forEach((uid)=>window.ws.send(JSON.stringify({"type":"whois","uid":parseInt(uid)})));
            break;
          }default:
            console.log("Message from Server:",msg);
            break;
        }
    };
    window.ws.onclose = ()=>{
        $('#chat').removeClass('connected');
        document.getElementById('message').disabled = true;
        document.getElementById('imagefile').disabled = true;
        document.getElementById('register').disabled = true;
        console.log("reconnect");
        window.setTimeout(wsConnect,500);
    }
    window.ws.onerror = (e)=>{
      console.error(e.message);
      window.ws.close();
  }
  };
  wsConnect();

  window.setInterval(()=>{
      if(window.ws.readyState === 1){
          console.log("ping!");
          window.ws.send("ping");
      }
  },10000)

  /*socket.on('announcement', function (msg) {
    $('#lines').append($('<p>').append($('<em>').text(msg)));
  });

  socket.on('reload', ()=>location.reload());
  
  socket.on('nicknames', function (nicks) {
    nicknames = nicks
    $('#nicknames').empty().append($('<span>Online: </span>'));
    $('#nicknames').append($('<b>').text("allChat"));
    //var nicknames = document.getElementsByClassName("nicknames");
    for (var i in nicknames) {
      $('#nicknames').append($((nicknames[i]===localStorage.getItem('name'))?'<b style="background: coral">':'<b>').text(nicknames[i]));
    }
  });
  */
  document.getElementById('nicknames').addEventListener('click', (ev) =>  {
    const clickedEl = ev.target;
    if(clickedEl.tagName == 'B') {
      const nickName = clickedEl.innerText;
      if(clickedEl.innerText === localStorage.getItem('name')){
        const umenu = document.getElementById("umenu");
        umenu.style.transition = "top 0.3s ease-in-out";
        umenu.style.top = '2.5vh';
        setTimeout(()=>umenu.style.transition = "top 0s ease-in-out",500);
        umenu.innerHTML= '<p>'+nickName+'</p><p>' + localStorage.getItem('signKeyP') + '</p>'+
                  '<p>' + localStorage.getItem('encryptKeyP') + '</p>';
        umenu.innerHTML+= `<form action="#" class="wrap" id="change-nickname">
        <label for="changeNickname" style="color: #00b5d6;">Please type in your nickname and press enter.</label>
        <input id="changeNickname" aria-label="`+nickName+`" type="text" placeholder="`+nickName+`" autocomplete="off" onclick=""/>
        <input type="submit" id="changeNick" value="change" margin = "10px">
        </form>`
        document.getElementById("changeNick").onclick = async function () {
          window.ws.send(JSON.stringify({"type":"changeName","name":$('#changeNickname').val()}))
          const umenu = document.getElementById("umenu");
          umenu.style.transition = "top 0.3s ease-in-out";
          umenu.style.top = '-200vh';
          setTimeout(()=>umenu.style.transition = "top 0s ease-in-out",500);
        }
        umenu.onclick = (e)=>{
          if(e.target !== document.getElementById("umenu"))
            return false;
          const umenu = document.getElementById("umenu");
          umenu.style.transition = "top 0.3s ease-in-out";
          umenu.style.top = '-200vh';
          setTimeout(()=>umenu.style.transition = "top 0s ease-in-out",500);
        };
        return false;
      }else if(dmName == nickName && nickName !== "allChat"){
        const umenu = document.getElementById("umenu");
        umenu.style.transition = "top 0.3s ease-in-out";
        umenu.style.top = '2.5vh';
        setTimeout(()=>umenu.style.transition = "top 0s ease-in-out",500);
        umenu.onclick = ()=>{
          const umenu = document.getElementById("umenu");
          umenu.style.transition = "top 0.3s ease-in-out";
          umenu.style.top = '-200vh';
          setTimeout(()=>umenu.style.transition = "top 0s ease-in-out",500);
        };
        umenu.innerHTML= '<p>'+nickName+'</p><p>' + publicKeys[nickName].signS + '</p><p>' + publicKeys[nickName].encryptS + '</p>';
        return false;
      }
      cycleNavBar()
      dmName = nickName;
      if(dmName !== "allChat")
        window.ws.send(JSON.stringify({"type":"getKey","uid":dmName}));
      document.getElementsByTagName('span')[1].innerText = "☰ "+((dmName==="allChat")?"Cool Chat":dmName);
      lines.innerHTML = '';
      if(!MessageFromDB(dmName) && dms[dmName] != null)
        for(let el of dms[dmName])
          lines.innerHTML += '<p><b>' + el.from + '</b>' + el.msg + '</p>';
      setTimeout(()=>lines.scrollTop = lines.scrollHeight,10);
    }
  });

  function MessageFromDB(chat){
    try{
      var trans = db.transaction(["messages"], 'readwrite');
      var objectStore = trans.objectStore("messages");
      var index = objectStore.index("chat");
      var cursor=index.openCursor()
      cursor.onsuccess = (event)=>{
        var cursor = event.target.result;
        if(cursor){
          if(chat === cursor.value.chat){
            if(typeof cursor.value.encrypted !== "undefined" && cursor.value.encrypted)
              lines.innerHTML += '<p class="encrypted" dbID="'+cursor.value.id+'"><b>' + cursor.value.sender + '</b>' + cursor.value.message + '</p>';
            else
              lines.innerHTML += '<p dbID="'+cursor.value.id+'" ><b>' + cursor.value.sender + '</b>' + cursor.value.message + '</p>';
            if(cursor.value.message.indexOf("<img") === 0){
              const img = lines.children[lines.children.length-1].children[1];
              img.removeAttribute("height");
              img.removeAttribute("width");
              const w = (lines.clientWidth|0)-20, h = (lines.clientHeight|0)-20;
              if(w<h)
                img.width = w;
              else
                img.height = h;
              img.onload = ()=>lines.scrollTop = lines.scrollHeight;
            }
          }
          cursor.continue();
        }
        setTimeout(()=>lines.scrollTop = lines.scrollHeight,10);
      }
      cursor.onerror = (e)=>console.log(e);
      return true;
    }
    catch(e){console.log(e);return false;}
  }
  
  function addMessageToDB(chat,from,msg,encrypted=false,element=false,uuid){
    try{
      var trans = db.transaction(["messages"], 'readwrite');
      var objectStore = trans.objectStore("messages");
      var request = objectStore.add({chat:chat,sender:from,message:msg,encrypted:encrypted});
			request.onsuccess = function(event) {
        if(element)
          element.setAttribute("dbid",event.srcElement.result)
        console.log(event.srcElement.result)
      };   
      request.onerror = function(event) {
          console.error(event);
      }
    }
    catch(e){console.error(e)}
  }
  
  let users = {/*
    "ID1":{
      "keys":{"encrypt":"Key1","sign":"Key2"},
      "name": "[name]"
    }
    ,"ID2":{}*/}

  function dm (from, msg, uuid, encrypted=false, chat=false) {
    console.log(users);
    from = users[from]["name"] || from;
    console.log(uuid)
    chat = chat?from:chat;
    console.log(chat)
    if(chat && chat !== dmName){
      if(!(dms.hasOwnProperty(chat))){
        dms[chat] = [];
      }
      dms[chat].push({from:from,msg:msg,encrypted:encrypted,uuid:uuid});
      addMessageToDB(chat,from,msg,encrypted,lines.children[lines.children.length-1],uuid);
      return;
    }
    
    if(!(dms.hasOwnProperty(dmName))){
        dms[dmName] = [];
    }
    dms[dmName].push({from:from,msg:msg,encrypted:encrypted,uuid:uuid});
    if(encrypted)
      lines.innerHTML += '<p class="encrypted" uuid="'+uuid+'"><b>' + from + '</b>' + msg + '</p>';
    else
      lines.innerHTML += '<p uuid="'+uuid+'"><b>' + from + '</b>' + msg + '</p>';
    addMessageToDB(dmName,from,msg,encrypted,lines.children[lines.children.length-1],uuid);
    if(msg.indexOf("<img") === 0){
      const img = lines.children[lines.children.length-1].children[1];
      img.removeAttribute("height");
      img.removeAttribute("width");
      const w = (lines.clientWidth|0)-20, h = (lines.clientHeight|0)-20;
      if(w<h)
        img.width = w;
      else
        img.height = h;
      img.onload = ()=>lines.scrollTop = lines.scrollHeight;
    }
    setTimeout(()=>lines.scrollTop = lines.scrollHeight,10);
  }

  /*socket.on('reconnect', function () {
    //$('#lines').remove();
    socket.emit('nickname', {nick:localStorage.getItem('name'), passwd:localStorage.getItem('passwd')},(set) => {
        if (!set) {
          $('#message').val('').focus();
          document.getElementById('message').disabled = false;
          document.getElementById('imagefile').disabled = false;
          return $('#chat').addClass('nickname-set');
        }
        localStorage.removeItem('name');
        localStorage.removeItem('passwd');
        unsubscribeUser()
        location.reload();
        });
    message('System', 'Reconnected to the server');
  });*/

  /*socket.on("dmImage",(msg)=>{
    let w = (lines.clientWidth|0)-20;
    let h = (lines.clientHeight|0)-20;
    if(msg.from==dmName){
      if(w<h)
        dm(msg.from,'<img background-image src="' + msg.msg + '" width="'+ w +'"/>',msg.uuid);
      else
        dm(msg.from,'<img background-image src="' + msg.msg + '" height="'+ h +'"/>',msg.uuid);}
    else{
        addMessageToDB(msg.from,msg.from,'<img background-image src="' + msg.msg + '" width="'+ w +'"/>',false,false,msg.uuid);
        if(!(dms.hasOwnProperty(msg.from))){
          dms[msg.from] = [];
        }
        dms[msg.from].push({from:msg.from,msg:'<img background-image src="' + msg.msg + '" width="'+ w +'"/>',uuid:msg.uuid});
      }
  })

  socket.on('error', function (e) {
    message('System', e ? e : 'A unknown error occurred');
  });*/

  function message (from, msg) {
    lines.innerHTML += '<p><b>' + from + '</b>' + msg + '</p>';
    setTimeout(()=>lines.scrollTop = lines.scrollHeight,10);
  }

  function addFriend (friend){
    window.ws.send(JSON.stringify({"type":"addFriend","uid":friend}));
    let friends = new Set(JSON.parse(localStorage.getItem('friends')));
    friends.add(friend);
    localStorage.setItem('friends', JSON.stringify([...friends]));
  }

  contactsSearch.onchange = contactsSearch.onkeyup = contactsSearch.onclick = ()=>{
    if(contactsSearch.value != ""){
        console.log(nicknames);
        refreshNicks();
        return ws.send(JSON.stringify({"type":"userSearch","search":contactsSearch.value}));
    }
    $('#nicknames').empty().append($('<span>Online: </span>'));
    $('#nicknames').append($('<b>').text("allChat"));
    //var nicknames = document.getElementsByClassName("nicknames");
    for (var i in nicknames) {
        $('#nicknames').append($((nicknames[i]===localStorage.getItem('name'))?'<b style="background: coral">':'<b>').text(nicknames[i]));
    }
  };
  function refreshNicks() {
    rebuildNicknames();
    console.log("refreshNicks",names);
    if(contactsSearch.value != ""){
      console.log(nicknames);
      let nicks = fuzzysort.go(contactsSearch.value,Object.values(nicknames),{threshold: -999});
      $('#nicknames').empty().append($('<span>Online: </span>'));
      $('#nicknames').append($('<b>').text("allChat"));
      //var nicknames = document.getElementsByClassName("nicknames");
      for (var i in nicks) {
          $('#nicknames').append($((nicks[i].target===localStorage.getItem('name'))?
            '<b style="background: coral">':'<b>').text(Object.keys(names).includes(nicks[i].target)?names[nicks[i].target]:nicks[i].target));
          $('#nicknames').append($('<b>').text());
      }
      return;
    }
    $('#nicknames').empty().append($('<span>Online: </span>'));
    $('#nicknames').append($('<b>').text("allChat"));
    //var nicknames = document.getElementsByClassName("nicknames");
    for (var i in nicknames) {
      $('#nicknames').append($((nicknames[i]===localStorage.getItem('name'))?
      '<b style="background: coral">':'<b>').text(Object.keys(names).includes(nicknames[i])?names[nicknames[i]]:nicknames[i]));
    }
  }
  function rebuildNicknames(){
    nicknames=[];
    for(let user in users) {
      user = users[user];
      nicknames.push(user.name) || nicknames.push(user.uid.toString());
    }
  }

  //
  // dom manipulation code
  //
  document.getElementById('DeleteMe').onclick = ()=>{
    if(document.getElementById('DeleteMe').innerHTML === "Delete my user"){
      window.ws.send(JSON.stringify({"type":"deleteMe","sure":"no"}));
      document.getElementById('DeleteMe').innerHTML = "Are you sure you want to delete your user?";
    }
    else if(document.getElementById('DeleteMe').innerHTML === "Are you sure you want to delete your user?"){
      window.ws.send(JSON.stringify({"type":"deleteMe","sure":"yes"}));
      document.getElementById('DeleteMe').innerHTML = "Deleting...";
      localStorage.clear();
      location.reload();
    }
  }

    document.getElementById('register').onclick = async function () {
      document.getElementById('register').disabled = true;
      const passwd = $('#passwd').val();
      if(localStorage.getItem("encryptKeyS").indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
        localStorage.getItem("signKeyS").indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
        localStorage.getItem("uid") != null){
          console.log("login");
          let privateEKey = await importPrivateDecryptKey(localStorage.getItem("encryptKeyS"));
          let privateSKey = await importPrivateDecryptKey(localStorage.getItem("signKeyS"));
          const toSend = {
            "type":"login",
            "uid":parseInt(localStorage.getItem("uid"),10).toString(32),
          }
          console.log(toSend);
          return window.ws.send(JSON.stringify(toSend));
      }
      console.log("register");

      generateKeys(passwd,(enc,sign)=>{
        deriveKey(saltBuf, passwd).then(function (keyBuf) {
          console.log("keyBuf:",keyBuf);
          //enc = await encryptMessage(keyBuf,enc);
          //sign = await encryptMessage(keyBuf,sign);
          localStorage.setItem("encryptKeyS",enc);
          localStorage.setItem("signKeyS",sign);

          //console.log(await decryptMessage(keyBuf,enc));//localStorage.getItem('encryptKeyS')));

          enc = localStorage.getItem('encryptKeyP');
          sign= localStorage.getItem('signKeyP');
          const toSend = {
            "type":"register",
            "keys":{"enc":enc,"sign":sign},
          }
          window.ws.send(JSON.stringify(toSend));
        });
      });
      return false;
    }

    $('#send-message').submit(function (e) {
      e.preventDefault();
      let uuid = generateUUID();
      if(dmName){
        if(publicKeys[dmName])
          encryptData(publicKeys[dmName].encrypt, $('#message').val()).then((encyptedData)=>{
            signData(signKey, encyptedData).then((SignedTest)=>{
              dm('me', $('#message').val(),uuid, true);
              console.log("sending Encrypted MSG");
              console.log(JSON.stringify({"type":"encryptedDM","user":dmName,"msg":encyptedData,"signature":SignedTest,"uuid":uuid}))
              window.ws.send(JSON.stringify({"type":"encryptedDM","user":dmName,"msg":encyptedData,"signature":SignedTest,"uuid":uuid}));
              $('#message').val('').focus();
              $('#lines').get(0).scrollTop = lines.scrollHeight;
            })
          })
        else{
          dm('me', $('#message').val(),uuid);
          console.log(JSON.stringify({"type":"dm","user":dmName,"msg":$('#message').val(),"uuid":uuid}))
          window.ws.send(JSON.stringify({"type":"dm","user":dmName,"msg":$('#message').val(),"uuid":uuid}));
          $('#message').val('').focus();
          $('#lines').get(0).scrollTop = lines.scrollHeight;
        }
        return false;
      }
      alert("No dm");
    });
};