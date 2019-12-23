'use strict';
function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

let nicknames = [];
let names = {/*ID:name */ };
let ids = {/*name:ID */ };
let users = {/*
  "ID1":{
    "keys":{"encrypt":"Key1","sign":"Key2"},
    "name": "[name]"
  }
  ,"ID2":{}*/};


function refreshNicks() {
  rebuildNicknames();
  console.log("refreshNicks", names);
  const nicknameElement = document.getElementById("nicknames");
  let string = "";
  string = '<span>Online: </span>';
  string += '<b>allChat</b>';
  if (contactsSearch.value != "") {
    let nicks = fuzzysort.go(contactsSearch.value, Object.values(nicknames), { threshold: -999 });
    for (var i in nicks) {
      if (nicks[i] == 0)
        break;
      if (nicks[i].target === localStorage.getItem('name'))
        string += '<b style="background: coral">';
      else
        string += '<b>';
      string += nicks[i];
      string += Object.keys(names).includes(nicks[i].target) ? names[nicks[i].target] : nicks[i].target;
      string += '</b>';
    }
    return nicknameElement.innerHTML = string;
  }
  for (var i in nicknames) {
    console.log("asdf", nicknames[i]);
    if (nicknames[i] === localStorage.getItem('name'))
      string += '<b style="background: coral">';
    else
      string += '<b>';
    string += Object.keys(names).includes(nicknames[i]) ? names[nicknames[i]] : nicknames[i];
    string += '</b>';
  }
  nicknameElement.innerHTML = string;
}
function rebuildNicknames() {
  nicknames = [];
  for (let user in users) {
    user = users[user];
    nicknames.push(user.name) || nicknames.push(user.uid.toString());
  }
}
window.onload = () => {
  console.log("load");
  //initImage();
  localStorage.setItem('name', localStorage.getItem('name') || "me");

  let lines = document.getElementById('lines'), contactsSearch = document.getElementById('contactsSearch');
  let dmName = location.search.substring(1) ? location.search.substring(1) : "allChat", dms = {};
  if (dmName != "allChat") {
    document.getElementsByTagName('span')[0].innerText = "☰ " + ((dmName === "allChat") ? "Cool Chat" : dmName);
  }

  const isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0));


  wsConnect();

  window.setInterval(() => {
    if (window.ws.readyState === 1) {
      console.log("ping!");
      window.ws.send("ping");
    }
  }, 10000)

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
  document.getElementById('nicknames').addEventListener('click', (ev) => {
    const clickedEl = ev.target;
    if (clickedEl.tagName == 'B') {
      const nickName = clickedEl.innerText;
      if (clickedEl.innerText === localStorage.getItem('name')) {
        const umenu = document.getElementById("umenu");
        umenu.style.transition = "top 0.3s ease-in-out";
        umenu.style.top = '2.5vh';
        setTimeout(() => umenu.style.transition = "top 0s ease-in-out", 500);
        umenu.innerHTML = '<p>' + nickName + '</p><p>' + localStorage.getItem('signKeyP') + '</p>' +
          '<p>' + localStorage.getItem('encryptKeyP') + '</p>';
        umenu.innerHTML += `<form action="#" class="wrap" id="change-nickname">
        <label for="changeNickname" style="color: #00b5d6;">Please type in your nickname and press enter.</label>
        <input id="changeNickname" aria-label="`+ nickName + `" type="text" placeholder="` + nickName + `" autocomplete="off" onclick=""/>
        <input type="submit" id="changeNick" value="change" margin = "10px">
        </form>`
        document.getElementById("changeNick").onclick = async function () {
          window.ws.send(JSON.stringify({ "type": "changeName", "name": document.getElementById("changeNickname").value}))
          const umenu = document.getElementById("umenu");
          umenu.style.transition = "top 0.3s ease-in-out";
          umenu.style.top = '-200vh';
          setTimeout(() => umenu.style.transition = "top 0s ease-in-out", 500);
        }
        umenu.onclick = (e) => {
          if (e.target !== document.getElementById("umenu"))
            return false;
          const umenu = document.getElementById("umenu");
          umenu.style.transition = "top 0.3s ease-in-out";
          umenu.style.top = '-200vh';
          setTimeout(() => umenu.style.transition = "top 0s ease-in-out", 500);
        };
        return false;
      } else if (dmName == nickName && nickName !== "allChat") {
        const umenu = document.getElementById("umenu");
        umenu.style.transition = "top 0.3s ease-in-out";
        umenu.style.top = '2.5vh';
        setTimeout(() => umenu.style.transition = "top 0s ease-in-out", 500);
        umenu.onclick = () => {
          const umenu = document.getElementById("umenu");
          umenu.style.transition = "top 0.3s ease-in-out";
          umenu.style.top = '-200vh';
          setTimeout(() => umenu.style.transition = "top 0s ease-in-out", 500);
        };
        umenu.innerHTML = '<p>' + nickName + '</p><p>' + publicKeys[nickName].signS + '</p><p>' + publicKeys[nickName].encryptS + '</p>';
        return false;
      }
      cycleNavBar()
      dmName = nickName;
      if (dmName !== "allChat")
        window.ws.send(JSON.stringify({ "type": "getKey", "uid": dmName }));
      document.getElementsByTagName('span')[1].innerText = "☰ " + ((dmName === "allChat") ? "Cool Chat" : dmName);
      lines.innerHTML = '';
      if (!MessageFromDB(dmName) && dms[dmName] != null)
        for (let el of dms[dmName])
          lines.innerHTML += '<p><b>' + el.from + '</b>' + el.msg + '</p>';
      setTimeout(() => lines.scrollTop = lines.scrollHeight, 10);
    }
  });

  function MessageFromDB(chat) {
    try {
      var trans = db.transaction(["messages"], 'readwrite');
      var objectStore = trans.objectStore("messages");
      var index = objectStore.index("chat");
      var cursor = index.openCursor()
      cursor.onsuccess = (event) => {
        var cursor = event.target.result;
        if (cursor) {
          if (chat === cursor.value.chat) {
            if (typeof cursor.value.encrypted !== "undefined" && cursor.value.encrypted)
              lines.innerHTML += '<p class="encrypted" dbID="' + cursor.value.id + '"><b>' + cursor.value.sender + '</b>' + cursor.value.message + '</p>';
            else
              lines.innerHTML += '<p dbID="' + cursor.value.id + '" ><b>' + cursor.value.sender + '</b>' + cursor.value.message + '</p>';
            if (cursor.value.message.indexOf("<img") === 0) {
              const img = lines.children[lines.children.length - 1].children[1];
              img.removeAttribute("height");
              img.removeAttribute("width");
              const w = (lines.clientWidth | 0) - 20, h = (lines.clientHeight | 0) - 20;
              if (w < h)
                img.width = w;
              else
                img.height = h;
              img.onload = () => lines.scrollTop = lines.scrollHeight;
            }
          }
          cursor.continue();
        }
        setTimeout(() => lines.scrollTop = lines.scrollHeight, 10);
      }
      cursor.onerror = (e) => console.log(e);
      return true;
    }
    catch (e) { console.log(e); return false; }
  }

  function addMessageToDB(chat, from, msg, encrypted = false, element = false, uuid) {
    try {
      var trans = db.transaction(["messages"], 'readwrite');
      var objectStore = trans.objectStore("messages");
      var request = objectStore.add({ chat: chat, sender: from, message: msg, encrypted: encrypted });
      request.onsuccess = function (event) {
        if (element)
          element.setAttribute("dbid", event.srcElement.result)
        console.log(event.srcElement.result)
      };
      request.onerror = function (event) {
        console.error(event);
      }
    }
    catch (e) { console.error(e) }
  }


  function dm(from, msg, uuid, encrypted = false, chat = false) {
    console.log(users);
    if(users[from])
      from = users[from]["name"] || from;
    console.log(uuid)
    chat = chat ? from : chat;
    console.log(chat)
    if (chat && chat !== dmName) {
      if (!(dms.hasOwnProperty(chat))) {
        dms[chat] = [];
      }
      dms[chat].push({ from: from, msg: msg, encrypted: encrypted, uuid: uuid });
      addMessageToDB(chat, from, msg, encrypted, lines.children[lines.children.length - 1], uuid);
      return;
    }

    if (!(dms.hasOwnProperty(dmName))) {
      dms[dmName] = [];
    }
    dms[dmName].push({ from: from, msg: msg, encrypted: encrypted, uuid: uuid });
    if (encrypted)
      lines.innerHTML += '<p class="encrypted" uuid="' + uuid + '"><b>' + from + '</b>' + msg + '</p>';
    else
      lines.innerHTML += '<p uuid="' + uuid + '"><b>' + from + '</b>' + msg + '</p>';
    addMessageToDB(dmName, from, msg, encrypted, lines.children[lines.children.length - 1], uuid);
    if (msg.indexOf("<img") === 0) {
      const img = lines.children[lines.children.length - 1].children[1];
      img.removeAttribute("height");
      img.removeAttribute("width");
      const w = (lines.clientWidth | 0) - 20, h = (lines.clientHeight | 0) - 20;
      if (w < h)
        img.width = w;
      else
        img.height = h;
      img.onload = () => lines.scrollTop = lines.scrollHeight;
    }
    setTimeout(() => lines.scrollTop = lines.scrollHeight, 10);
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

  function message(from, msg) {
    lines.innerHTML += '<p><b>' + from + '</b>' + msg + '</p>';
    setTimeout(() => lines.scrollTop = lines.scrollHeight, 10);
  }

  function addFriend(friend) {
    window.ws.send(JSON.stringify({ "type": "addFriend", "uid": friend }));
    let friends = new Set(JSON.parse(localStorage.getItem('friends')));
    friends.add(friend);
    localStorage.setItem('friends', JSON.stringify([...friends]));
  }

  contactsSearch.onchange = contactsSearch.onkeyup = contactsSearch.onclick = () => {
    refreshNicks();
    if (contactsSearch.value != "") {
      console.log(nicknames);
      return ws.send(JSON.stringify({ "type": "userSearch", "search": contactsSearch.value }));
    }
  };

  //
  // dom manipulation code
  //
  document.getElementById('DeleteMe').onclick = () => {
    if (document.getElementById('DeleteMe').innerHTML === "Delete my user") {
      window.ws.send(JSON.stringify({ "type": "deleteMe", "sure": "no" }));
      document.getElementById('DeleteMe').innerHTML = "Are you sure you want to delete your user?";
    }
    else if (document.getElementById('DeleteMe').innerHTML === "Are you sure you want to delete your user?") {
      window.ws.send(JSON.stringify({ "type": "deleteMe", "sure": "yes" }));
      document.getElementById('DeleteMe').innerHTML = "Deleting...";
      localStorage.clear();
      location.reload();
    }
  }

  document.getElementById('register').onclick = async function () {
    document.getElementById('register').disabled = true;
    const passwd = document.getElementById("passwd").value;
    if (localStorage.getItem("encryptKeyS").indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
      localStorage.getItem("signKeyS").indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
      localStorage.getItem("uid") != null) {
      console.log("login");
      let privateEKey = await importPrivateDecryptKey(localStorage.getItem("encryptKeyS"));
      let privateSKey = await importPrivateDecryptKey(localStorage.getItem("signKeyS"));
      const toSend = {
        "type": "login",
        "uid": parseInt(localStorage.getItem("uid"), 10).toString(32),
      }
      console.log(toSend);
      return window.ws.send(JSON.stringify(toSend));
    }
    console.log("register");

    generateKeys(passwd, (enc, sign) => {
      deriveKey(saltBuf, passwd).then(function (keyBuf) {
        console.log("keyBuf:", keyBuf);
        //enc = await encryptMessage(keyBuf,enc);
        //sign = await encryptMessage(keyBuf,sign);
        localStorage.setItem("encryptKeyS", enc);
        localStorage.setItem("signKeyS", sign);

        //console.log(await decryptMessage(keyBuf,enc));//localStorage.getItem('encryptKeyS')));

        enc = localStorage.getItem('encryptKeyP');
        sign = localStorage.getItem('signKeyP');
        const toSend = {
          "type": "register",
          "keys": { "enc": enc, "sign": sign },
        }
        window.ws.send(JSON.stringify(toSend));
      });
    });
    return false;
  }

  document.getElementById('send-message').addEventListener (
    "submit", function (e) {
    e.preventDefault();
    let uuid = generateUUID();
    const messageElement = document.getElementById("message");
    if (dmName) {
      if (publicKeys[dmName])
        encryptData(publicKeys[dmName].encrypt, messageElement.value).then((encyptedData) => {
          signData(signKey, encyptedData).then((SignedTest) => {
            dm('me', messageElement.value, uuid, true);
            console.log("sending Encrypted MSG");
            console.log(JSON.stringify({ "type": "encryptedDM", "user": dmName, "msg": encyptedData, "signature": SignedTest, "uuid": uuid }))
            window.ws.send(JSON.stringify({ "type": "encryptedDM", "user": dmName, "msg": encyptedData, "signature": SignedTest, "uuid": uuid }));
            messageElement.value = "";
            messageElement.focus();
            document.getElementById("lines").scrollTop = lines.scrollHeight;
            //$('#lines').get(0).scrollTop = lines.scrollHeight;
          })
        })
      else {
        dm('me', messageElement.value, uuid);
        console.log(JSON.stringify({ "type": "dm", "user": dmName, "msg": messageElement.value, "uuid": uuid }))
        window.ws.send(JSON.stringify({ "type": "dm", "user": dmName, "msg": messageElement.value, "uuid": uuid }));
        messageElement.value = "";
        messageElement.focus();
        document.getElementById("lines").scrollTop = lines.scrollHeight;
        //$('#lines').get(0).scrollTop = lines.scrollHeight;
      }
      return false;
    }
    alert("No dm");
  });
};