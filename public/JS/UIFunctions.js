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