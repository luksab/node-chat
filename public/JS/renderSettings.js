'use strict';
window.settings = {
  "example": { hoverText: "This is just an example...", color: "default", "onclick": (e) => { alert("You clicked the example :)"); } },
  "User settings": {
    "submenu": {
      "WebPush": { class: "pushButton" },
      "Logout": { hoverText: "log out", confirm: true, "onclick": () => { localStorage.clear(); location.reload(); } },
      "Reload": { hoverText: "reload page", confirm: true, "onclick": () => { location.reload(); } },
      "DeleteMe": { hoverText: "Delete my user", text: "Delete my user", style: "color: red;", confirm: true, "onclick": () => { window.ws.send(JSON.stringify({ "type": "deleteMe", "sure": "yes" })); localStorage.clear(); location.reload(); } },
    }
  },
};
var settingsMenu = document.querySelector('#settingsMenu');
function renderSettings(settings) {
  if (settings == null) {
    settings = window.settings;
  }
  let settingsElement = document.getElementById("settingsMenu").children[0];
  settingsElement.innerHTML = "";
  for (let setting in settings) {
    console.log("rendering setting", setting);
    var newA = document.createElement("a");
    newA.href = "javascript:void(0)";
    if ("text" in settings[setting])
      newA.appendChild(document.createTextNode(settings[setting]["text"]));
    else
      newA.appendChild(document.createTextNode(setting));
    if (settings[setting].onclick) {
      newA.onclick = settings[setting].onclick;
    }
    if ("submenu" in settings[setting]) {
      newA.onclick = () => renderSettings(settings[setting]["submenu"]);
    }
    if ("hoverText" in settings[setting]) {
      newA.title = settings[setting]["hoverText"];
    }
    if ("class" in settings[setting]) {
      newA.classList.add(settings[setting]["class"]);
    }
    if ("disabled" in settings[setting]) {
      newA.disabled = settings[setting]["disabled"];
    }
    if ("style" in settings[setting]) {
      newA.style = settings[setting]["style"];
    }
    settingsElement.appendChild(newA);
  }
}
