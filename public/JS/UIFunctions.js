'use strict';
let lines;

function message(from, msg) {
  lines.innerHTML += '<p><b>' + from + '</b>' + msg + '</p>';
  setTimeout(() => lines.scrollTop = lines.scrollHeight, 10);
}

function cycleNavBar(close) {
  if (!window.matchMedia('(min-width: 800px)').matches) {
    if (document.getElementById("mySidenav").style.width == "25em")
      document.getElementById("mySidenav").style.width = "0";
    else if (!close) {
      document.getElementById("mySidenav").style.width = "25em";
    }
  }
  return false;
}

function openSettings() {
  renderSettings();
  settingsMenu.style.transition = "top 0.3s ease-in-out";
  settingsMenu.style.top = '2.5vh';
  setTimeout(() => settingsMenu.style.transition = "top 0s ease-in-out", 500);
}
function closeSettings(event) {
  //console.log(event)
  if (!event || event.target == settingsMenu) {
    settingsMenu.style.transition = "top 0.3s ease-in-out";
    settingsMenu.style.top = '-200vh';
    setTimeout(() => settingsMenu.style.transition = "top 0s ease-in-out", 500);
  }
}
window.onresize = function (event) {
  if (window.matchMedia('(min-width: 800px)').matches) {
    if (document.getElementById("mySidenav").style.width == "0px")
      document.getElementById("mySidenav").style.width = "25em";
  }
};

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
      string += Object.keys(names).includes(nicks[i].target) ? names[nicks[i].target] : nicks[i].target;
      console.log("asd", nicks[i].target);
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

function dm(from, msg, uuid, encrypted = false, chat = false) {
  console.log(users);
  if (users[from])
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