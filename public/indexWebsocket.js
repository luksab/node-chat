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

let swipe_det;
function detectswipe(el,func) {
  swipe_det = new Object();
  swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
  var min_x = 30;  //min x swipe for horizontal swipe
  var max_x = 30;  //max x difference for vertical swipe
  var min_y = 50;  //min y swipe for vertical swipe
  var max_y = 60;  //max y difference for horizontal swipe
  var direc = "";
  let ele = document.getElementById(el);
  ele.addEventListener('touchstart',function(e){
    var t = e.touches[0];
    swipe_det.sX = t.screenX; 
    swipe_det.sY = t.screenY;
  },false);
  ele.addEventListener('touchmove',function(e){
    //e.preventDefault();
    var t = e.touches[0];
    swipe_det.eX = t.screenX; 
    swipe_det.eY = t.screenY;    
  },false);
  ele.addEventListener('touchend',function(e){
    //horizontal detection
    if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
      if(swipe_det.eX > swipe_det.sX) direc = "r";
      else direc = "l";
    }
    //vertical detection
    else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
      if(swipe_det.eY > swipe_det.sY) direc = "d";
      else direc = "u";
    }

    if (direc != "") {
      if(typeof func == 'function') func(el,direc);
    }
    direc = "";
    swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
  },false);  
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
  // Created by STRd6
  // MIT License
  // jquery.paste_image_reader.js
  (function($) {
    var defaults;
    $.event.fix = (function(originalFix) {
      return function(event) {
        event = originalFix.apply(this, arguments);
        if (event.type.indexOf("copy") === 0 || event.type.indexOf("paste") === 0) {
          event.clipboardData = event.originalEvent.clipboardData;
        }
        return event;
      };
    })($.event.fix);
    defaults = {
      callback: $.noop,
      matchType: /image.*/
    };
    return ($.fn.pasteImageReader = function(options) {
      if (typeof options === "function") {
        options = {
          callback: options
        };
      }
      options = $.extend({}, defaults, options);
      return this.each(function() {
        var $this, element;
        element = this;
        $this = $(this);
        return $this.bind("paste", function(event) {
          var clipboardData, found;
          found = false;
          clipboardData = event.clipboardData;
          return Array.prototype.forEach.call(clipboardData.types, function(type, i) {
            var file, reader;
            if (found) {
              return;
            }
            if (
              type.match(options.matchType) ||
              clipboardData.items[i].type.match(options.matchType)
            ) {
              file = clipboardData.items[i].getAsFile();
              reader = new FileReader();
              reader.onload = function(evt) {
                return options.callback.call(element, {
                  dataURL: evt.target.result,
                  event: evt,
                  file: file,
                  name: file.name
                });
              };
              reader.readAsDataURL(file);
              return (found = true);
            }
          });
        });
      });
    });
  })(jQuery);
    

  // In the following line, you should include the prefixes of implementations you want to test.
  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  // DON'T use "var indexedDB = ..." if you're not in a function.
  // Moreover, you may need references to some window.IDB* objects:
  IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
  // Let us open our database
  var DBOpenRequest = indexedDB.open("messages", 1);
  // these two event handlers act on the database being opened successfully, or not
  DBOpenRequest.onerror = function(event) {
    console.error(event);
  };

  let db;
  DBOpenRequest.onsuccess = function(event) {
    console.log("Database initialised");

    // store the result of opening the database in the db variable. This is used a lot below
    db = DBOpenRequest.result;
    if(dmName != "allChat")
      MessageFromDB(dmName);
    /*var request = store.get(id); //getting single object by id from object store

    request.onsuccess = function(e) {
        showDetails(e.target.result); // data retreived
        db.close();
    };

    request.onerror = function(e) {
            console.log("Error Getting: ", e);
    };*/
  };
  
  // This event handles the event whereby a new version of the database needs to be created
  // Either one has not been created before, or a new version number has been submitted via the
  // window.indexedDB.open line above
  //it is only implemented in recent browsers
  DBOpenRequest.onupgradeneeded = function(event) {
    var db = event.target.result;

    db.onerror = function(event) {
      console.error('Error loading database.');
    };

    // Create an objectStore for this database

    let objectStore = db.createObjectStore("messages", { keyPath: "id", autoIncrement:true });

    // define what data items the objectStore will contain
    objectStore.createIndex("chat", "chat", { unique: false });
    objectStore.createIndex("sender", "sender", { unique: false });
    objectStore.createIndex("message", "message", { unique: false });

    console.log('Object store created.');

  };



  let lines = document.getElementById('lines'), contactsSearch = document.getElementById('contactsSearch');
  let dmName = location.search.substring(1)?location.search.substring(1):"allChat", dms={};
  if(dmName != "allChat"){
    document.getElementsByTagName('span')[0].innerText = "☰ "+((dmName==="allChat")?"Cool Chat":dmName);
  }
  let nicknames=[];
  let names = {/*ID:name */};
  let ids = {/*name:ID */};
  let isSubscribed = false;
  let swRegistration = null;
  const applicationServerPublicKey = 'BM_12EMi2xCAVhD2tn_gr3DugdW_bYnxtVCJd1qzAZTag5gi-IH97Vetc5sYfr155JiPGceLMVMXy29GmFCES20';
  const pushButton = document.querySelector('.pushButton');
  const isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0));

  if (false &&'serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/service-worker.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);
  
      swRegistration = swReg;
      initializeUI();
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
  } else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
  }

  function sendMessageToSW(message) {
    // This wraps the message posting/response in a promise, which will resolve if the response doesn't
    // contain an error, and reject with the error if it does. If you'd prefer, it's possible to call
    // controller.postMessage() and set up the onmessage handler independently of a promise, but this is
    // a convenient wrapper.
    return new Promise(function(resolve, reject) {
      var messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };
  
      // This sends the message data as well as transferring messageChannel.port2 to the service worker.
      // The service worker can then use the transferred port to reply via postMessage(), which
      // will in turn trigger the onmessage handler on messageChannel.port1.
      // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
      navigator.serviceWorker.controller.postMessage(message,
        [messageChannel.port2]);
    });
  }

  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }



  function initializeUI() {
    pushButton.addEventListener('click', function() {
      pushButton.disabled = true;
      if (isSubscribed) {
        unsubscribeUser();
      } else {
        subscribeUser();
      }
    });
  
    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      isSubscribed = !(subscription === null);
  
      updateSubscriptionOnServer(subscription);
  
      if (isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }
  
      updateBtn();
    });
  }

  function updateBtn() {
    if (Notification.permission === 'denied') {
      pushButton.textContent = 'Push Messaging Blocked.';
      pushButton.disabled = true;
      updateSubscriptionOnServer(null);
      return;
    }
  
    if (isSubscribed) {
      pushButton.textContent = 'Disable Push Messaging';
    } else {
      pushButton.textContent = 'Enable Push Messaging';
    }
  
    pushButton.disabled = false;
  }

  function updateSubscriptionOnServer(subscription) {
    //TODO: PUSH SUBSCRIPTION
    //window.ws.send(JSON.stringify({"type":"push","subscription":subscription}));
    console.log(JSON.stringify(subscription))
  }
  
  function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      console.log('User is subscribed.');
  
      updateSubscriptionOnServer(subscription);
  
      isSubscribed = true;
  
      updateBtn();
    })
    .catch(function(err) {
      console.error('Failed to subscribe the user: ', err);
      updateBtn();
    });
  }
  
  function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(function(error) {
      console.error('Error unsubscribing', error);
    })
    .then(function() {
      updateSubscriptionOnServer(null);
  
      console.log('User is unsubscribed.');
      isSubscribed = false;
  
      updateBtn();
    });
  }

  function logout(event){
    if(event.target.innerHTML === "Yes"){
      try{
        unsubscribeUser();
      }catch(e){}
      localStorage.clear();
      location.reload();
      return false;
    }
  }
  document.getElementById('Logout').addEventListener('click',()=>{
    document.getElementById("rmenu").innerHTML='<ul><li>Do you really want to log out?</li><li> <div><a style="cursor: pointer;">Yes</a></div><div><a style="cursor: pointer;">No</a></div></li></ul>';
    document.getElementById("rmenu").className = "show";
    let rect = document.getElementById('Logout').getBoundingClientRect();
    document.getElementById("rmenu").style.top = rect.top + 'px';
    document.getElementById("rmenu").style.left = rect.left + 'px';
    document.getElementById("rmenu").onclick = logout;
    return false;
  });

  document.getElementById('Reload').addEventListener('click',()=>{
    sendMessageToSW({delete:true})
    setTimeout(()=>location.reload(true),1000);
  });



  //let rightClickEvent;

  function addFriendEvent(event){
    if(event.target.innerHTML === "Yes"){
      addFriend(rightClickEvent.target.innerText);
    }
  }

  function deleteMsgEvent(event){
    if(event.target.innerHTML === "Yes" && rightClickEvent.rootEl.parentElement.getAttribute("id") === "lines" && rightClickEvent.rootEl.getAttribute("dbid") !== 0){
      var trans = db.transaction(["messages"], 'readwrite');
      var objectStore = trans.objectStore("messages");
      var index = objectStore.index("chat");
  
      // Make a request to delete the specified record out of the object store
      console.log(rightClickEvent.rootEl.getAttribute("dbid"))
      let id = parseInt(rightClickEvent.rootEl.getAttribute("dbid"));
      if(id > 0){
        var objectStoreRequest = objectStore.delete(id);
        objectStoreRequest.onsuccess = function(event) {
          console.log("deleted successfully");
        };
        objectStoreRequest.onerror = function(event) {
          console.log("couldn't delete: "+event);
        };
        rightClickEvent.rootEl.parentElement.removeChild(rightClickEvent.rootEl);
      }
      else{
        message('System', 'Couldn\'t delete message. Reloading might help.');
      }
    }
  }
  $(document).bind("click", function(event) {
    document.getElementById("rmenu").className = "hide";
  });
  if (document.addEventListener) {
    document.addEventListener('contextmenu', function(e) {
      rightClickEvent = e;
      console.log(e.target.parentElement)
      //delete Message code
      let rootEl = e.target.getAttribute("dbid")?e.target:e.target.parentElement;
      rootEl = rootEl.getAttribute("dbid")?rootEl:null;
      console.log(e.target.getAttribute("dbid"))
      console.log(rootEl || "Didn't click on a message!")
      if(rootEl && rootEl.parentElement.getAttribute("id") === "lines" && rootEl.getAttribute("dbid") !== 0){
        e.preventDefault();
        document.getElementById("rmenu").innerHTML='<ul><li>Do you really want to delete the message?</li><li id="messageToDelete"> </li><li> <div><a class="danger" style="cursor: pointer;">Yes</a></div><div><a style="cursor: pointer;">No</a></div></li></ul>';
        document.getElementById("rmenu").className = "show";
        document.getElementById("rmenu").style.top = mouseY(event) + 'px';
        document.getElementById("rmenu").style.left = mouseX(event) + 'px';
        document.getElementById("rmenu").onclick = deleteMsgEvent;
        if(rootEl.children[1] && rootEl.children[1].tagName === "IMG")
          document.getElementById("messageToDelete").innerHTML = '<b>'+rootEl.children[0].innerHTML+"</b>: Image";
        else
          document.getElementById("messageToDelete").innerHTML = rootEl.innerHTML;
        rightClickEvent.rootEl = rootEl;
      }
      else if(event.target.parentElement.getAttribute("id") === "nicknames" && event.target.tagName === "B"){
        e.preventDefault();
        document.getElementById("rmenu").innerHTML='<ul><li>Do you want to add '+event.target.innerText+' as a friend?</li><li id="messageToDelete"> </li><li> <div><a style="cursor: pointer;">Yes</a></div><div><a style="cursor: pointer;">No</a></div></li></ul>';
        document.getElementById("rmenu").className = "show";
        document.getElementById("rmenu").style.top = mouseY(event) + 'px';
        document.getElementById("rmenu").style.left = mouseX(event) + 'px';
        document.getElementById("rmenu").onclick = addFriendEvent;
        console.log(event.target.innerText);
      }
    }, false);
  } else {
    document.attachEvent('oncontextmenu', function() {
      window.event.returnValue = false;
    });
  }
  function mouseX(evt) {
    if (evt.pageX) {
      return evt.pageX;
    } else if (evt.clientX) {
      return evt.clientX + (document.documentElement.scrollLeft ?
        document.documentElement.scrollLeft :
        document.body.scrollLeft);
    } else {
      return null;
    }
  }
  function mouseY(evt) {
    if (evt.pageY) {
      return evt.pageY;
    } else if (evt.clientY) {
      return evt.clientY + (document.documentElement.scrollTop ?
        document.documentElement.scrollTop :
        document.body.scrollTop);
    } else {
      return null;
    }
  }

  function myfunction(el,d) {
    alert("you swiped on element with id '"+el+"' to "+d+" direction");
  }
  
  detectswipe('chat',(el,d)=>(d==='r')?cycleNavBar():false);
  detectswipe('mySidenav',(el,d)=>(d==='l')?cycleNavBar():false);


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

  /*socket.on("dm",(msg)=>dm(msg.from,msg.msg,msg.uuid))
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
  

  /*socket.on('reconnecting', function () {
    message('System', 'Attempting to re-connect to the server');
  });*/
  /*socket.on('disconnect', ()=>message('System', 'Disconnected'));

  socket.on('error', function (e) {
    message('System', e ? e : 'A unknown error occurred');
  });*/

  function message (from, msg) {
    lines.innerHTML += '<p><b>' + from + '</b>' + msg + '</p>';
    setTimeout(()=>lines.scrollTop = lines.scrollHeight,10);
  }

  function image (from, base64Image, uuid) {
    let w = (lines.clientWidth|0)-20;
    //lines.innerHTML += '<p><b>' + from + '</b>' + '<img background-image src="' + base64Image + '" width="'+ w +'"/>' + '</p>';
    let h = (lines.clientHeight|0)-20;
    if(w<h)
      dm(from,'<img background-image src="' + base64Image + '" width="'+ w +'"/>',uuid,false)
    else
      dm(from,'<img background-image src="' + base64Image + '" height="'+ h +'"/>',uuid,false)
    //setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER);
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
    
    
    
    $('#imagefile').bind('change', function(e){
        reduceFileSize(this.files[0], 600, Infinity, 0.9, blob => {
            let uuid = generateUUID();
            image('me',blob,uuid);
            socket.emit('dmImage', {user: dmName,msg: blob,uuid:uuid});
        });
    });
    //var dataURL, filename;
    $("#message").pasteImageReader(function(results) {
        //filename = results.filename, dataURL = results.dataURL;
        const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
            const byteCharacters = atob(b64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                const slice = byteCharacters.slice(offset, offset + sliceSize);

                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays, {type: contentType});
            return blob;
        }
        let file = b64toBlob(results.dataURL.slice(22),results.dataURL.slice(5,results.dataURL.indexOf(";")));
        reduceFileSize(file, 600, Infinity, 0.9, (blob,canvas) => {
            let uuid = generateUUID();
            image('me',blob,uuid);
            socket.emit('dmImage', {user: dmName,msg: blob,uuid:uuid});
        });
    });
  
  
        // From https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob, needed for Safari:
        if (!HTMLCanvasElement.prototype.toBlob) {
            Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
                value: function(callback, type, quality) {

                    var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
                        len = binStr.length,
                        arr = new Uint8Array(len);

                    for (var i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }

                    callback(new Blob([arr], {type: type || 'image/png'}));
                }
            });
        }

        window.URL = window.URL || window.webkitURL;

        // Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
        // -2 = not jpeg, -1 = no data, 1..8 = orientations
        function getExifOrientation(file, callback) {
            // Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
            if (file.slice) {
                file = file.slice(0, 131072);
            } else if (file.webkitSlice) {
                file = file.webkitSlice(0, 131072);
            }

            var reader = new FileReader();
            reader.onload = function(e) {
                var view = new DataView(e.target.result);
                if (view.getUint16(0, false) != 0xFFD8) {
                    callback(-2);
                    return;
                }
                var length = view.byteLength, offset = 2;
                while (offset < length) {
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker == 0xFFE1) {
                        if (view.getUint32(offset += 2, false) != 0x45786966) {
                            callback(-1);
                            return;
                        }
                        var little = view.getUint16(offset += 6, false) == 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        var tags = view.getUint16(offset, little);
                        offset += 2;
                        for (var i = 0; i < tags; i++)
                            if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                                callback(view.getUint16(offset + (i * 12) + 8, little));
                                return;
                            }
                    }
                    else if ((marker & 0xFF00) != 0xFF00) break;
                    else offset += view.getUint16(offset, false);
                }
                callback(-1);
            };
            reader.readAsArrayBuffer(file);
        }

        // Derived from https://stackoverflow.com/a/40867559, cc by-sa
        function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation) {
            var canvas = document.createElement('canvas');
            if (orientation > 4) {
                canvas.width = rawHeight;
                canvas.height = rawWidth;
            } else {
                canvas.width = rawWidth;
                canvas.height = rawHeight;
            }

            if (orientation > 1) {
                console.log("EXIF orientation = " + orientation + ", rotating picture");
            }

            var ctx = canvas.getContext('2d');
            switch (orientation) {
                case 2: ctx.transform(-1, 0, 0, 1, rawWidth, 0); break;
                case 3: ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight); break;
                case 4: ctx.transform(1, 0, 0, -1, 0, rawHeight); break;
                case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
                case 6: ctx.transform(0, 1, -1, 0, rawHeight, 0); break;
                case 7: ctx.transform(0, -1, -1, 0, rawHeight, rawWidth); break;
                case 8: ctx.transform(0, -1, 1, 0, 0, rawWidth); break;
            }
            ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
            return canvas;
        }

        function reduceFileSize(file, maxWidth, maxHeight, quality, callback) {
            /*if (file.size <= acceptFileSize) {
                callback(file);
                return;
            }*/
            var img = new Image();
            img.onerror = function() {
                URL.revokeObjectURL(this.src);
                callback(file);
            };
            img.onload = function() {
                URL.revokeObjectURL(this.src);
                getExifOrientation(file, function(orientation) {
                    var w = img.width, h = img.height;
                    var scale = (orientation > 4 ?
                        Math.min(maxHeight / w, maxWidth / h, 1) :
                        Math.min(maxWidth / w, maxHeight / h, 1));
                    h = Math.round(h * scale);
                    w = Math.round(w * scale);

                    var canvas = imgToCanvasWithOrientation(img, w, h, orientation);
                    var blob = canvas.toDataURL("image/jpeg", 0.7);
                    callback(blob, canvas);
                    /*canvas.toBlob(function(blob) {
                        console.log("Resized image to " + w + "x" + h + ", " + (blob.size >> 10) + "kB");
                        callback(blob);
                    }, 'image/jpeg', quality);*/
                });
            };
            img.src = URL.createObjectURL(file);
        }
        
        
        
    //Encryption shit
    function generateKey(alg, scope) {
      return new Promise(function(resolve) {
        var genkey = crypto.subtle.generateKey(alg, true, scope)
        genkey.then(function (pair) {
          resolve(pair)
        }).catch((e)=>console.error(e.message))
      })
    }

    function arrayBufferToBase64String(arrayBuffer) {
      var byteArray = new Uint8Array(arrayBuffer)
      var byteString = ''
      for (var i=0; i<byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i])
      }
      return btoa(byteString)
    }

    function base64StringToArrayBuffer(b64str) {
      var byteStr = atob(b64str)
      var bytes = new Uint8Array(byteStr.length)
      for (var i = 0; i < byteStr.length; i++) {
        bytes[i] = byteStr.charCodeAt(i)
      }
      return bytes.buffer
    }

    function textToArrayBuffer(str) {
      var buf = unescape(encodeURIComponent(str)) // 2 bytes for each char
      var bufView = new Uint8Array(buf.length)
      for (var i=0; i < buf.length; i++) {
        bufView[i] = buf.charCodeAt(i)
      }
      return bufView
    }

    function arrayBufferToText(arrayBuffer) {
      var byteArray = new Uint8Array(arrayBuffer)
      var str = ''
      for (var i=0; i<byteArray.byteLength; i++) {
        str += String.fromCharCode(byteArray[i])
      }
      return str
    }


    function arrayBufferToBase64(arr) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(arr)))
    }

    function convertBinaryToPem(binaryData, label) {
      var base64Cert = arrayBufferToBase64String(binaryData)
      var pemCert = "-----BEGIN " + label + "-----\r\n"
      var nextIndex = 0
      var lineLength
      while (nextIndex < base64Cert.length) {
        if (nextIndex + 64 <= base64Cert.length) {
          pemCert += base64Cert.substr(nextIndex, 64) + "\r\n"
        } else {
          pemCert += base64Cert.substr(nextIndex) + "\r\n"
        }
        nextIndex += 64
      }
      pemCert += "-----END " + label + "-----\r\n"
      return pemCert
    }

    function convertPemToBinary(pem) {
      var lines = pem.split('\n')
      var encoded = ''
      for(var i = 0;i < lines.length;i++){
        if (lines[i].trim().length > 0 &&
            lines[i].indexOf('-BEGIN RSA PRIVATE KEY-') < 0 &&
            lines[i].indexOf('-BEGIN RSA PUBLIC KEY-') < 0 &&
            lines[i].indexOf('-END RSA PRIVATE KEY-') < 0 &&
            lines[i].indexOf('-END RSA PUBLIC KEY-') < 0) {
          encoded += lines[i].trim()
        }
      }
      return base64StringToArrayBuffer(encoded)
    }

    function importPublicEncryptKey(pemKey) {
      return new Promise(function(resolve) {
        var importer = crypto.subtle.importKey("spki", convertPemToBinary(pemKey), encryptAlgorithm, true, ["encrypt"])
        importer.then(function(key) {
          resolve(key)
        }).catch((e)=>console.log(e.message))
      })
    }

    function importPublicKey(pemKey) {
      return new Promise(function(resolve) {
        var importer = crypto.subtle.importKey("spki", convertPemToBinary(pemKey), signAlgorithm, true, ["verify"])
        importer.then(function(key) {
          resolve(key)
        })
      })
    }

    function importPrivateKey(pemKey) {
      return new Promise(function(resolve) {
        var importer = crypto.subtle.importKey("pkcs8", convertPemToBinary(pemKey), signAlgorithm, true, ["sign"])
        importer.then(function(key) {
          resolve(key)
        })
      })
    }

    function importPrivateDecryptKey(pemKey) {
      return new Promise(function(resolve) {
        var importer = crypto.subtle.importKey("pkcs8", convertPemToBinary(pemKey), encryptAlgorithm, true, ["decrypt"])
        importer.then(function(key) {
          resolve(key)
        })
      })
    }

    function exportPublicKey(keys) {
      return new Promise(function(resolve) {
        window.crypto.subtle.exportKey('spki', keys.publicKey).
        then(function(spki) {
          resolve(convertBinaryToPem(spki, "RSA PUBLIC KEY"))
        })
      })
    }

    function exportPrivateKey(keys) {
      return new Promise(function(resolve) {
        var expK = window.crypto.subtle.exportKey('pkcs8', keys.privateKey)
        expK.then(function(pkcs8) {
          resolve(convertBinaryToPem(pkcs8, "RSA PRIVATE KEY"))
        })
      })
    }

    function exportPemKeys(keys) {
      return new Promise(function(resolve) {
        exportPublicKey(keys).then(function(pubKey) {
          exportPrivateKey(keys).then(function(privKey) {
            resolve({publicKey: pubKey, privateKey: privKey})
          })
        })
      })
    }

    function signData(key, data) {
      return window.crypto.subtle.sign(signAlgorithm, key, data)
    }

    function testVerifySig(pub, sig, data) {
      return crypto.subtle.verify(signAlgorithm, pub, sig, data)
    }

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

    function decryptData(key, data) {
      return crypto.subtle.decrypt(
          {
            name: "RSA-OAEP",
            //iv: vector
          },
          key,
          data
      )
    }

    var signAlgorithm = {
      name: "RSASSA-PKCS1-v1_5",
      hash: {
        name: "SHA-256"
      },
      modulusLength: 2048,
      extractable: false,
      publicExponent: new Uint8Array([1, 0, 1])
    }

    var encryptAlgorithm = {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      extractable: false,
      hash: {
        name: "SHA-256"
      }
    }

    function deriveKey(saltBuf, passphrase) {
      var keyLenBits = 128;
      var kdfname = "PBKDF2";
      var aesname = "AES-CBC"; // AES-CTR is also popular
      // 100 - probably safe even on a browser running from a raspberry pi using pure js ployfill
      // 10000 - no noticeable speed decrease on my MBP
      // 100000 - you can notice
      // 1000000 - annoyingly long
      var iterations = 100; // something a browser on a raspberry pi or old phone could do
      var hashname = "SHA-256";
      var extractable = true;

      console.log('');
      console.log('passphrase', passphrase);
      console.log('salt (hex)', Unibabel.bufferToHex(saltBuf));
      console.log('iterations', iterations);
      console.log('keyLen (bytes)', keyLenBits / 8);
      console.log('digest', hashname);
    
      // First, create a PBKDF2 "key" containing the password
      return crypto.subtle.importKey(
        "raw",
        Unibabel.utf8ToBuffer(passphrase),
        { "name": kdfname },
        false,
        ["deriveKey"]).
      // Derive a key from the password
      then(function(passphraseKey){
        return crypto.subtle.deriveKey(
          { "name": kdfname
          , "salt": saltBuf
          , "iterations": iterations
          , "hash": hashname
          }
        , passphraseKey
          // required to be 128 (or 256) bits
        , { "name": aesname, "length": keyLenBits } // Key we want
        , extractable                               // Extractble
        , [ "encrypt", "decrypt" ]                  // For new key
        );
      }).
      // Export it so we can display it
      then(function(aesKey) {
        return aesKey;
        return crypto.subtle.exportKey("raw", aesKey).then(function (arrbuf) {
          return new Uint8Array(arrbuf);
        });
      }).
      catch(function(err) {
        window.alert("Key derivation failed: " + err.message);
      });
    }

    var scopeSign = ["sign", "verify"]
    var scopeEncrypt = ["encrypt", "decrypt"]

    let encryptKey = false;
    let signKey = false;

    var saltHex = '2618a03369d25a4bf216dd4136aa8a9cec15085a15d34ce9f21812f7b1e66863';
    var saltBuf = Unibabel.hexToBuffer(saltHex);
    var passphrase = 'secret';

    var myIV = localStorage.getItem('myIV')
    if(myIV==null){
      myIV = window.crypto.getRandomValues(new Uint8Array(16));
      localStorage.setItem('myIV',JSON.stringify(myIV));
    }else{
      myIV = new Uint8Array(Object.values(JSON.parse(myIV)));
    }

    async function encryptMessage(publicKey,msg,IV) {
      if(IV == null){
        IV = myIV;
      }
      let enc = new TextEncoder();
      let dec = new TextDecoder("utf-8");
      let encoded = enc.encode(msg);
      let arr = await window.crypto.subtle.encrypt(
        {
          name: "AES-CBC",
          iv: IV
        },
        publicKey,
        encoded
      );
      return dec.decode(arr);
    }

    function separateIvFromData(buf) {
      var iv = new Uint8Array(ivLen);
      var data = new Uint8Array(buf.length - ivLen);
      Array.prototype.forEach.call(buf, function (byte, i) {
        if (i < ivLen) {
          iv[i] = byte;
        } else {
          data[i - ivLen] = byte;
        }
      });
      return { iv: iv, data: data };
    }

    async function decryptMessage(publicKey,msg,IV) {
      //var parts = separateIvFromData(buf);//parts.iv, parts.data
      if(IV == null){
        IV = myIV;
      }
      let enc = new TextEncoder();
      let dec = new TextDecoder("utf-8");
      let buf = enc.encode(msg);
      console.log(buf);
      let arr = await crypto.subtle.decrypt({name: 'AES-CBC', iv: IV}, publicKey, buf)
      console.log(buf);
      return dec.decode(arr);
    }

    if(localStorage.getItem('signKeyS')!=null && localStorage.getItem('encryptKeyS')!=null &&
       localStorage.getItem('signKeyS').indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
       localStorage.getItem('encryptKeyS').indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1){
        importPrivateKey(localStorage.getItem('signKeyS')).then(function(Skey) {
          importPrivateDecryptKey(localStorage.getItem('encryptKeyS')).then(function(Ekey) {
            signKey = Skey;
            encryptKey = Ekey;
            console.log("successfully imported Private Keys")
          })
        });
    }

    async function generateKeys(passwd,func){
      if(
        localStorage.getItem('signKeyS').indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
        localStorage.getItem('encryptKeyS').indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1
      )
      return func(localStorage.getItem("encryptKeyS"),localStorage.getItem("signKeyS"));
      let ekeys = await generateKey(encryptAlgorithm, scopeEncrypt);
        encryptKey = ekeys.privateKey;
        let publicEKey = await exportPublicKey(ekeys)
          localStorage.setItem('encryptKeyP', publicEKey);
        let privateEKey= await exportPrivateKey(ekeys)
          localStorage.setItem('encryptKeyS',privateEKey);
      let skeys = await generateKey(encryptAlgorithm, scopeEncrypt)
        signKey = skeys.privateKey;
        let publicSKey = await exportPublicKey(skeys);
          localStorage.setItem('signKeyP', publicSKey);
        let privateSKey= await exportPrivateKey(skeys);
          localStorage.setItem('signKeyS',privateSKey);
      
      func(privateEKey,privateSKey);
    }

    if(localStorage.getItem('encryptKeyP') == null || localStorage.getItem('encryptKeyS') == null)
      generateKey(encryptAlgorithm, scopeEncrypt).then(function(keys) {
        encryptKey = keys.privateKey;
        exportPublicKey(keys).then((key)=>{
          localStorage.setItem('encryptKeyP', key);
          console.log("PushEncryptKey"+key)
          //socket.emit("PushEncryptKey",key);
        })
        exportPrivateKey(keys).then((key)=>{
          localStorage.setItem('encryptKeyS',key);
        })
      }).catch((e)=>console.log(e.message))
    else{
      let key = localStorage.getItem('encryptKeyP');
      importPublicEncryptKey(key).then((key)=>{
        encryptKey = key;
      })
      console.log("PushEncryptKey"+key)
      //socket.emit("PushEncryptKey",key);
    }

    if(localStorage.getItem('signKeyP') == null || localStorage.getItem('signKeyS') == null)
      generateKey(encryptAlgorithm, scopeEncrypt).then(function(keys) {
        signKey = keys.privateKey;
        exportPublicKey(keys).then((key)=>{
          localStorage.setItem('signKeyP', key);
          console.log("PushEncryptKey"+key)
          //socket.emit("PushEncryptKey",key);
        })
        exportPrivateKey(keys).then((key)=>{
          localStorage.setItem('signKeyS',key);
        })
      }).catch((e)=>console.log(e.message))
    else{
      let key = localStorage.getItem('signKeyP');
      importPublicKey(key).then((key)=>{
        signKey = key;
      })
      console.log("PushSignKey"+key)
      //socket.emit("PushSignKey",key);
    }

    let publicKeys = {};
    /*socket.on("establishEncryption",(name,publicKey)=>{
      console.log("received Key from "+name+":")
      console.log(publicKey)
      importPublicKey(publicKey.sign).then(function(Skey) {
        importPublicEncryptKey(publicKey.encrypt).then(function(Ekey) {
          publicKeys[name] = {encrypt:Ekey,sign:Skey,encryptS:publicKey.encrypt,signS:publicKey.sign}
          console.log(Skey);
          console.log(Ekey);
        })
      })
    });

    socket.on("encryptedDM",(msg)=>{
      if(!publicKeys[msg.from])
        return
      decryptData(encryptKey, msg.msg).then((message)=>{
        message = arrayBufferToText(message)
        crypto.subtle.verify(signAlgorithm,publicKeys[msg.from].sign, msg.signature, msg.msg).then(function(result) {
          if(!result){
            console.log("public Key:")
            console.log(publicKeys[msg.from].sign)
            console.log("signature:")
            console.log(msg.signature)
            console.log("message")
            console.log(msg.msg)
            console.log("decrypted msg")
            console.log(message)
            return alert(msg.from+" send an invalid message!!!")
          }
          if(msg.from==dmName) dm(msg.from,message,msg.uuid,true);
          else{
              addMessageToDB(msg.from,msg.from,message,true,false,msg.uuid);
              if(!(dms.hasOwnProperty(msg.from))){
                dms[msg.from] = [];
              }
              dms[msg.from].push({from:msg.from,msg:message});
            }
          console.log("Signature verified after importing PEM public key:", result)
        })
      });
    })*/
    
};
  
  
  
  
  
  
  

(function () {//Unibabel
  'use strict';
  
  function utf8ToBinaryString(str) {
    var escstr = encodeURIComponent(str);
    // replaces any uri escape sequence, such as %0A,
    // with binary escape, such as 0x0A
    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    });
  
    return binstr;
  }
  
  function utf8ToBuffer(str) {
    var binstr = utf8ToBinaryString(str);
    var buf = binaryStringToBuffer(binstr);
    return buf;
  }
  
  function utf8ToBase64(str) {
    var binstr = utf8ToBinaryString(str);
    return btoa(binstr);
  }
  
  function binaryStringToUtf8(binstr) {
    var escstr = binstr.replace(/(.)/g, function (m, p) {
      var code = p.charCodeAt(0).toString(16).toUpperCase();
      if (code.length < 2) {
        code = '0' + code;
      }
      return '%' + code;
    });
  
    return decodeURIComponent(escstr);
  }
  
  function bufferToUtf8(buf) {
    var binstr = bufferToBinaryString(buf);
  
    return binaryStringToUtf8(binstr);
  }
  
  function base64ToUtf8(b64) {
    var binstr = atob(b64);
  
    return binaryStringToUtf8(binstr);
  }
  
  function bufferToBinaryString(buf) {
    var binstr = Array.prototype.map.call(buf, function (ch) {
      return String.fromCharCode(ch);
    }).join('');
  
    return binstr;
  }
  
  function bufferToBase64(arr) {
    var binstr = bufferToBinaryString(arr);
    return btoa(binstr);
  }
  
  function binaryStringToBuffer(binstr) {
    var buf;
  
    if ('undefined' !== typeof Uint8Array) {
      buf = new Uint8Array(binstr.length);
    } else {
      buf = [];
    }
  
    Array.prototype.forEach.call(binstr, function (ch, i) {
      buf[i] = ch.charCodeAt(0);
    });
  
    return buf;
  }
  
  function base64ToBuffer(base64) {
    var binstr = atob(base64);
    var buf = binaryStringToBuffer(binstr);
    return buf;
  }
  
  window.Unibabel = {
    utf8ToBinaryString: utf8ToBinaryString
  , utf8ToBuffer: utf8ToBuffer
  , utf8ToBase64: utf8ToBase64
  , binaryStringToUtf8: binaryStringToUtf8
  , bufferToUtf8: bufferToUtf8
  , base64ToUtf8: base64ToUtf8
  , bufferToBinaryString: bufferToBinaryString
  , bufferToBase64: bufferToBase64
  , binaryStringToBuffer: binaryStringToBuffer
  , base64ToBuffer: base64ToBuffer
  
  // compat
  , strToUtf8Arr: utf8ToBuffer
  , utf8ArrToStr: bufferToUtf8
  , arrToBase64: bufferToBase64
  , base64ToArr: base64ToBuffer
  };
  
  }());

  (function () {
'use strict';

function bufferToHex(arr) {
  var i;
  var len;
  var hex = '';
  var c;

  for (i = 0, len = arr.length; i < len; i += 1) {
    c = arr[i].toString(16);
    if (c.length < 2) {
      c = '0' + c;
    }
    hex += c;
  }

  return hex;
}

function hexToBuffer(hex) {
  // TODO use Uint8Array or ArrayBuffer or DataView
  var i;
  var byteLen = hex.length / 2;
  var arr;
  var j = 0;

  if (byteLen !== parseInt(byteLen, 10)) {
    throw new Error("Invalid hex length '" + hex.length + "'");
  }

  arr = new Uint8Array(byteLen);

  for (i = 0; i < byteLen; i += 1) {
    arr[i] = parseInt(hex[j] + hex[j + 1], 16);
    j += 2;
  }

  return arr;
}

// Hex Convenience Functions
window.Unibabel.hexToBuffer = hexToBuffer;
window.Unibabel.bufferToHex = bufferToHex;

}());

(function () {//Unibabel Hex
'use strict';

function bufferToHex(arr) {
  var i;
  var len;
  var hex = '';
  var c;

  for (i = 0, len = arr.length; i < len; i += 1) {
    c = arr[i].toString(16);
    if (c.length < 2) {
      c = '0' + c;
    }
    hex += c;
  }

  return hex;
}

function hexToBuffer(hex) {
  // TODO use Uint8Array or ArrayBuffer or DataView
  var i;
  var byteLen = hex.length / 2;
  var arr;
  var j = 0;

  if (byteLen !== parseInt(byteLen, 10)) {
    throw new Error("Invalid hex length '" + hex.length + "'");
  }

  arr = new Uint8Array(byteLen);

  for (i = 0; i < byteLen; i += 1) {
    arr[i] = parseInt(hex[j] + hex[j + 1], 16);
    j += 2;
  }

  return arr;
}

// Hex Convenience Functions
window.Unibabel.hexToBuffer = hexToBuffer;
window.Unibabel.bufferToHex = bufferToHex;

}());