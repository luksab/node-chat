'use strict';
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
var rightClickEvent = 0;
var settingsMenu = document.querySelector('#settingsMenu');
function openSettings() {
  renderSettings();
  settingsMenu.style.transition = "top 0.3s ease-in-out";
  settingsMenu.style.top = '2.5vh';
  setTimeout(() => settingsMenu.style.transition = "top 0s ease-in-out", 500);
}
function closeSettings(event) {
  //console.log(event)
  if (event.target == settingsMenu) {
    settingsMenu.style.transition = "top 0.3s ease-in-out";
    settingsMenu.style.top = '-200vh';
    setTimeout(() => settingsMenu.style.transition = "top 0s ease-in-out", 500);
  }
}
