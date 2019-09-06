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
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  // DON'T use "var indexedDB = ..." if you're not in a function.
  // Moreover, you may need references to some window.IDB* objects:
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
  // Let us open our database
  var DBOpenRequest = window.indexedDB.open("messages", 1);
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

    objectStore = db.createObjectStore("messages", { keyPath: "id", autoIncrement:true });

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
  let allChat = [], nicknames=[];
  let isSubscribed = false;
  let swRegistration = null;
  const applicationServerPublicKey = 'BM_12EMi2xCAVhD2tn_gr3DugdW_bYnxtVCJd1qzAZTag5gi-IH97Vetc5sYfr155JiPGceLMVMXy29GmFCES20';
  const pushButton = document.querySelector('.settbtn');

  if ('serviceWorker' in navigator && 'PushManager' in window) {
  
    navigator.serviceWorker.register('/static/service-worker.js')
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
    socket.emit('push', subscription)
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

  document.getElementById('Logout').addEventListener('click',()=>{
    try{
      unsubscribeUser();
    }catch(e){}
    localStorage.clear();
    location.reload();
    return false;
  });



  let rightClickEvent;

  function deleteMsg(event){
    if(event.path[0].innerHTML === "Yes" && rightClickEvent.rootEl.parentElement.getAttribute("id") === "lines" && rightClickEvent.rootEl.getAttribute("dbid") !== 0){
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
      let rootEl = e.path.find((el)=>{
        //console.log(el.tagName)
        /*if(el.getAttribute)
          return el.getAttribute("dbid") > 0*/
        return el.tagName === "P";
      });
      console.log(rootEl || "Didn't click on a message!")
      if(rootEl && rootEl.parentElement.getAttribute("id") === "lines" && rootEl.getAttribute("dbid") !== 0){
        e.preventDefault();
        document.getElementById("rmenu").innerHTML='<ul><li>Do you really want to delete the message?</li><li id="messageToDelete"> </li><li> <div><a class="danger" style="cursor: pointer;">Yes</a></div><div><a style="cursor: pointer;">No</a></div></li></ul>';
        document.getElementById("rmenu").className = "show";
        document.getElementById("rmenu").style.top = mouseY(event) + 'px';
        document.getElementById("rmenu").style.left = mouseX(event) + 'px';
        document.getElementById("rmenu").onclick = deleteMsg;
        if(rootEl.children[1] && rootEl.children[1].tagName === "IMG")
          document.getElementById("messageToDelete").innerHTML = '<b>'+rootEl.children[0].innerHTML+"</b>: Image";
        else
          document.getElementById("messageToDelete").innerHTML = rootEl.innerHTML;
        rightClickEvent = e;
        rightClickEvent.rootEl = rootEl;
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






  const socket = io.connect();
  socket.on('connect', function () {
    $('#chat').addClass('connected');
    
    if(localStorage.getItem('name') !== null && localStorage.getItem('passwd') !== null){
        socket.emit('nickname', {nick:localStorage.getItem('name'), passwd:localStorage.getItem('passwd')}, (set) => {
                if (!set) {
                message('System', 'Reconnected to the server with localStorage');
                document.getElementById('message').disabled = false;
                document.getElementById('imagefile').disabled = false;
                return $('#chat').addClass('nickname-set');
                } //localStorage.clear();
            });
    }
  });

  socket.on('announcement', function (msg) {
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
  
  document.getElementById('nicknames').addEventListener('click', (ev) =>  {
    const clickedEl = ev.target;
    if(clickedEl.tagName == 'B' && clickedEl.innerText !== localStorage.getItem('name')) {
      cycleNavBar()
      const nickName = clickedEl.innerText;
      dmName = nickName;
      if(dmName !== "allChat")
        socket.emit("getKey",dmName);
      document.getElementsByTagName('span')[1].innerText = "☰ "+((dmName==="allChat")?"Cool Chat":dmName);
      lines.innerHTML = '';
      if(dmName === "allChat")
          for(el of allChat)
            lines.innerHTML += '<p><b>' + el.from + '</b>' + el.msg + '</p>';
      else if(!MessageFromDB(dmName) && dms[dmName] != null)
        for(let el of dms[dmName])
          lines.innerHTML += '<p><b>' + el.from + '</b>' + el.msg + '</p>';
      setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER,10);
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
            }
          }
          cursor.continue();
        }
        setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER,10);
      }
      cursor.onerror = (e)=>console.log(e);
      return true;
    }
    catch(e){console.log(e);return false;}
  }
  
  function addMessageToDB(chat,from,msg,encrypted=false,element=false){
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
  
  function dm (from, msg, encrypted=false) {
    if(!(dms.hasOwnProperty(dmName))){
        dms[dmName] = [];
    }
    dms[dmName].push({from:from,msg:msg,encrypted:encrypted});
    if(encrypted)
      lines.innerHTML += '<p class="encrypted"><b>' + from + '</b>' + msg + '</p>';
    else
      lines.innerHTML += '<p><b>' + from + '</b>' + msg + '</p>';
    addMessageToDB(dmName,from,msg,encrypted,lines.children[lines.children.length-1]);
    if(msg.indexOf("<img") === 0){
      const img = lines.children[lines.children.length-1].children[1];
      img.removeAttribute("height");
      img.removeAttribute("width");
      const w = (lines.clientWidth|0)-20, h = (lines.clientHeight|0)-20;
      if(w<h)
        img.width = w;
      else
        img.height = h;
    }
    setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER,10);
  }

  //Todo: dm Pics, delete message typing, fix AllChat inreliablity
  socket.on('user message', (from,msg)=>AllChat(from,msg));
  socket.on('user image', image);
  socket.on("dm",(msg)=>{
      if(msg.from==dmName) dm(msg.from,msg.msg);
      else{
          addMessageToDB(msg.from,msg.from,msg.msg);
          if(!(dms.hasOwnProperty(msg.from))){
            dms[msg.from] = [];
          }
          dms[msg.from].push({from:msg.from,msg:msg.msg});
        }
    })
  socket.on('reconnect', function () {
    //$('#lines').remove();
    socket.emit('nickname', {nick:localStorage.getItem('name'), passwd:localStorage.getItem('passwd')},(set) => {
        if (!set) {
          $('#message').val('').focus();
          document.getElementById('message').disabled = false;
          document.getElementById('imagefile').disabled = false;
          return $('#chat').addClass('nickname-set');
        }
        unsubscribeUser()
        location.reload();
        });
    message('System', 'Reconnected to the server');
  });

  socket.on("dmImage",(msg)=>{
    let w = (lines.clientWidth|0)-20;
    let h = (lines.clientHeight|0)-20;
    if(msg.from==dmName){
      if(w<h)
        dm(msg.from,'<img background-image src="' + msg.msg + '" width="'+ w +'"/>');
      else
        dm(msg.from,'<img background-image src="' + msg.msg + '" height="'+ h +'"/>');}
    else{
        addMessageToDB(msg.from,msg.from,'<img background-image src="' + msg.msg + '" width="'+ w +'"/>');
        if(!(dms.hasOwnProperty(msg.from))){
          dms[msg.from] = [];
        }
        dms[msg.from].push({from:msg.from,msg:'<img background-image src="' + msg.msg + '" width="'+ w +'"/>'});
      }
  })
  

  /*socket.on('reconnecting', function () {
    message('System', 'Attempting to re-connect to the server');
  });*/
  socket.on('disconnect', ()=>message('System', 'Disconnected'));

  socket.on('error', function (e) {
    message('System', e ? e : 'A unknown error occurred');
  });

  function AllChat(from, msg) {
      allChat.push({from:from, msg:msg});
      if(dmName == "allChat"){
          lines.innerHTML += '<p><b>' + from + '</b>' + msg + '</p>';
          setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER,10);
      }
  }
  
  function message (from, msg) {
    lines.innerHTML += '<p><b>' + from + '</b>' + msg + '</p>';
    setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER,10);
  }

  function image (from, base64Image) {
    let w = (lines.clientWidth|0)-20;
    //lines.innerHTML += '<p><b>' + from + '</b>' + '<img background-image src="' + base64Image + '" width="'+ w +'"/>' + '</p>';
    let h = (lines.clientHeight|0)-20;
    if(w<h)
      dm("me",'<img background-image src="' + base64Image + '" width="'+ w +'"/>',false)
    else
      dm("me",'<img background-image src="' + base64Image + '" height="'+ h +'"/>',false)
    //setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER);
  }
  
  
  contactsSearch.onchange = contactsSearch.onkeyup = contactsSearch.onclick = ()=>{
    if(contactsSearch.value != ""){
        nicks = fuzzysort.go(contactsSearch.value,Object.values(nicknames),{threshold: -999});
        $('#nicknames').empty().append($('<span>Online: </span>'));
        $('#nicknames').append($('<b>').text("allChat"));
        //var nicknames = document.getElementsByClassName("nicknames");
        for (var i in nicks) {
            $('#nicknames').append($((nicks[i].target===localStorage.getItem('name'))?'<b style="background: coral">':'<b>').text(nicks[i].target));
            $('#nicknames').append($('<b>').text());
        }
        return;
    }
    $('#nicknames').empty().append($('<span>Online: </span>'));
    $('#nicknames').append($('<b>').text("allChat"));
    //var nicknames = document.getElementsByClassName("nicknames");
    for (var i in nicknames) {
        $('#nicknames').append($((nicknames[i]===localStorage.getItem('name'))?'<b style="background: coral">':'<b>').text(nicknames[i]));
    }
  };
  //
  // dom manipulation code
  //
  $(function () {
    document.getElementById('register').onclick = function () {
      localStorage.setItem('name', $('#nick').val());
      localStorage.setItem('passwd', $('#passwd').val());
      socket.emit('nickname', {nick:$('#nick').val(), passwd:$('#passwd').val()}, (set) => {
        if (!set) {
          $('#message').val('').focus();
          document.getElementById('message').disabled = false;
          document.getElementById('imagefile').disabled = false;
          return $('#chat').addClass('nickname-set');
        } $('#nickname-err').css('visibility', 'visible');
      });
      return false;
    }

    $('#send-message').submit(function (e) {
      e.preventDefault();
      if(dmName){
        if(publicKeys[dmName])
          encryptData(publicKeys[dmName].encrypt, $('#message').val()).then((encyptedData)=>{
            signData(signKey, encyptedData).then((SignedTest)=>{
              dm('me', $('#message').val(), true);
              console.log("sending Encrypted MSG");
              socket.emit("encryptedDM",{user:dmName,msg:encyptedData,signature:SignedTest});
              $('#message').val('').focus();
              $('#lines').get(0).scrollTop = Number.MAX_SAFE_INTEGER;
            })
          })
        else{
          dm('me', $('#message').val());
          socket.emit('dm',{user: dmName , msg:$('#message').val()});
          $('#message').val('').focus();
          $('#lines').get(0).scrollTop = Number.MAX_SAFE_INTEGER;
        }
        return false;
      }
      alert("No dm")
      message('me', $('#message').val());
      socket.emit('user message', $('#message').val());
      $('#message').val('').focus();
      $('#lines').get(0).scrollTop = Number.MAX_SAFE_INTEGER;
      return false;
    });
    
    
    
    $('#imagefile').bind('change', function(e){
        reduceFileSize(this.files[0], 500*1024, 600, Infinity, 0.7, blob => {
            image('me',blob);
            socket.emit('dmImage', {user: dmName,msg: blob});
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
        reduceFileSize(file, 500*1024, 600, Infinity, 0.7, (blob,canvas) => {
            image('me',blob);
            socket.emit('dmImage', {user: dmName,msg: blob});
        });
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

        function reduceFileSize(file, acceptFileSize, maxWidth, maxHeight, quality, callback) {
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
        }).catch((e)=>console.log(e.message))
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

    var scopeSign = ["sign", "verify"]
    var scopeEncrypt = ["encrypt", "decrypt"]

    let encryptKey = false;
    let signKey = false;

    if(localStorage.getItem('signKeyS')!=null && localStorage.getItem('encryptKeyS')!=null){
      importPrivateKey(localStorage.getItem('signKeyS')).then(function(Skey) {
        importPrivateDecryptKey(localStorage.getItem('encryptKeyS')).then(function(Ekey) {
          signKey = Skey;
          encryptKey = Ekey;
          console.log("successfully imported Private Keys")
        })
      });
    }

    
    if(localStorage.getItem('encryptKeyP') == null || localStorage.getItem('encryptKeyS') == null)
      generateKey(encryptAlgorithm, scopeEncrypt).then(function(keys) {
        encryptKey = keys.privateKey;
        exportPublicKey(keys).then((key)=>{
          localStorage.setItem('encryptKeyP', key);
          console.log("PushEncryptKey"+key)
          socket.emit("PushEncryptKey",key);
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
      socket.emit("PushEncryptKey",key);
    }

    if(localStorage.getItem('signKeyP') == null || localStorage.getItem('signKeyS') == null)
      generateKey(encryptAlgorithm, scopeEncrypt).then(function(keys) {
        signKey = keys.privateKey;
        exportPublicKey(keys).then((key)=>{
          localStorage.setItem('signKeyP', key);
          console.log("PushEncryptKey"+key)
          socket.emit("PushEncryptKey",key);
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
      socket.emit("PushSignKey",key);
    }
    
    let publicKeys = {};
    socket.on("establishEncryption",(name,publicKey)=>{
      console.log("received Key from "+name+":")
      console.log(publicKey)
      importPublicKey(publicKey.sign).then(function(Skey) {
        importPublicEncryptKey(publicKey.encrypt).then(function(Ekey) {
          publicKeys[name] = {encrypt:Ekey,sign:Skey}
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
          if(msg.from==dmName) dm(msg.from,message,true);
          else{
              addMessageToDB(msg.from,msg.from,message,true);
              if(!(dms.hasOwnProperty(msg.from))){
                dms[msg.from] = [];
              }
              dms[msg.from].push({from:msg.from,msg:message});
            }
          console.log("Signature verified after importing PEM public key:", result)
        })
      });
    })
    
};
  
  
  
  
  
  
  
