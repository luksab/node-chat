'use strict';
document.addEventListener("keydown", (key) => {
  if (key.keyCode == 27) {
    settingsMenu.style.transition = "top 0.3s ease-in-out";
    settingsMenu.style.top = '-200vh';
    setTimeout(() => settingsMenu.style.transition = "top 0s ease-in-out", 500);
    const umenu = document.getElementById("umenu");
    umenu.style.transition = "top 0.3s ease-in-out";
    umenu.style.top = '-200vh';
    setTimeout(() => umenu.style.transition = "top 0s ease-in-out", 500);
  }
});

let swipe_det;
function detectswipe(el, func) {
  swipe_det = new Object();
  swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
  var min_x = 30;  //min x swipe for horizontal swipe
  var max_x = 30;  //max x difference for vertical swipe
  var min_y = 50;  //min y swipe for vertical swipe
  var max_y = 60;  //max y difference for horizontal swipe
  var direc = "";
  let ele = document.getElementById(el);
  ele.addEventListener('touchstart', function (e) {
    var t = e.touches[0];
    swipe_det.sX = t.screenX;
    swipe_det.sY = t.screenY;
  }, { passive: true });
  ele.addEventListener('touchmove', function (e) {
    //e.preventDefault();
    var t = e.touches[0];
    swipe_det.eX = t.screenX;
    swipe_det.eY = t.screenY;
  }, { passive: true });
  ele.addEventListener('touchend', function (e) {
    //horizontal detection
    if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
      if (swipe_det.eX > swipe_det.sX) direc = "r";
      else direc = "l";
    }
    //vertical detection
    else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
      if (swipe_det.eY > swipe_det.sY) direc = "d";
      else direc = "u";
    }

    if (direc != "") {
      if (typeof func == 'function') func(el, direc);
    }
    direc = "";
    swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
  }, { passive: true });
}

detectswipe('chat', (el, d) => (d === 'r') ? cycleNavBar() : false);
detectswipe('mySidenav', (el, d) => (d === 'l') ? cycleNavBar() : false);






var rightClickEvent = 0;

function addFriendEvent(event) {
  if (event.target.innerHTML === "Yes") {
    addFriend(rightClickEvent.target.innerText);
  }
}

function deleteMsgEvent(event) {
  if (event.target.innerHTML === "Yes" && rightClickEvent.rootEl.parentElement.getAttribute("id") === "lines" && rightClickEvent.rootEl.getAttribute("dbid") !== 0) {
    var trans = db.transaction(["messages"], 'readwrite');
    var objectStore = trans.objectStore("messages");
    var index = objectStore.index("chat");

    // Make a request to delete the specified record out of the object store
    console.log(rightClickEvent.rootEl.getAttribute("dbid"))
    let id = parseInt(rightClickEvent.rootEl.getAttribute("dbid"));
    if (id > 0) {
      var objectStoreRequest = objectStore.delete(id);
      objectStoreRequest.onsuccess = function (event) {
        console.log("deleted successfully");
      };
      objectStoreRequest.onerror = function (event) {
        console.log("couldn't delete: " + event);
      };
      rightClickEvent.rootEl.parentElement.removeChild(rightClickEvent.rootEl);
    }
    else {
      message('System', 'Couldn\'t delete message. Reloading might help.');
    }
  }
}
document.addEventListener("click", function (event) {
  document.getElementById("rmenu").className = "hide";
}, false);
if (document.addEventListener) {
  document.addEventListener('contextmenu', function (e) {
    rightClickEvent = e;
    console.log(e.target.parentElement)
    //delete Message code
    let rootEl = e.target.getAttribute("dbid") ? e.target : e.target.parentElement;
    rootEl = rootEl.getAttribute("dbid") ? rootEl : null;
    console.log(e.target.getAttribute("dbid"))
    console.log(rootEl || "Didn't click on a message!")
    if (rootEl && rootEl.parentElement.getAttribute("id") === "lines" && rootEl.getAttribute("dbid") !== 0) {
      e.preventDefault();
      document.getElementById("rmenu").innerHTML = '<ul><li>Do you really want to delete the message?</li><li id="messageToDelete"> </li><li> <div><a class="danger" style="cursor: pointer;">Yes</a></div><div><a style="cursor: pointer;">No</a></div></li></ul>';
      document.getElementById("rmenu").className = "show";
      document.getElementById("rmenu").style.top = mouseY(event) + 'px';
      document.getElementById("rmenu").style.left = mouseX(event) + 'px';
      document.getElementById("rmenu").onclick = deleteMsgEvent;
      if (rootEl.children[1] && rootEl.children[1].tagName === "IMG")
        document.getElementById("messageToDelete").innerHTML = '<b>' + rootEl.children[0].innerHTML + "</b>: Image";
      else
        document.getElementById("messageToDelete").innerHTML = rootEl.innerHTML;
      rightClickEvent.rootEl = rootEl;
    }
    else if (event.target.parentElement.getAttribute("id") === "nicknames" && event.target.tagName === "B") {
      e.preventDefault();
      document.getElementById("rmenu").innerHTML = '<ul><li>Do you want to add ' + event.target.innerText + ' as a friend?</li><li id="messageToDelete"> </li><li> <div><a style="cursor: pointer;">Yes</a></div><div><a style="cursor: pointer;">No</a></div></li></ul>';
      document.getElementById("rmenu").className = "show";
      document.getElementById("rmenu").style.top = mouseY(event) + 'px';
      document.getElementById("rmenu").style.left = mouseX(event) + 'px';
      document.getElementById("rmenu").onclick = addFriendEvent;
      console.log(event.target.innerText);
    }
  }, false);
} else {
  document.attachEvent('oncontextmenu', function () {
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


window.addEventListener('load', (ev)=> {
  contactsSearch.onchange = contactsSearch.onkeyup = contactsSearch.onclick = () => {
    refreshNicks();
    if (contactsSearch.value != "") {
      console.log(nicknames);
      return ws.send(JSON.stringify({ "type": "userSearch", "search": contactsSearch.value }));
    }
  };

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
          window.ws.send(JSON.stringify({ "type": "changeName", "name": document.getElementById("changeNickname").value }))
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

  document.getElementById('send-message').addEventListener(
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
});