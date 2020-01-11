'use strict';
let nicknames = [];
let names = {/*ID:name */ };
let ids = {/*name:ID */ };
let users = {/*
  "ID1":{
    "keys":{"encrypt":"Key1","sign":"Key2"},
    "name": "[name]"
  }
  ,"ID2":{}*/};


window.onload = () => {
  console.log("load");
  /*var unibabel = document.createElement("script");
  unibabel.async = true;
  unibabel.src = "/JS/unibabel.js";
  unibabel.onload = ()=>{console.log("unibabel loaded")};
  document.getElementsByTagName("head")[0].appendChild(unibabel);*/
  //initImage();
  localStorage.setItem('name', localStorage.getItem('name') || "me");

  lines = document.getElementById('lines'), contactsSearch = document.getElementById('contactsSearch');
  let dmName = location.search.substring(1) ? location.search.substring(1) : "allChat", dms = {};
  if (dmName != "allChat") {
    document.getElementsByTagName('span')[0].innerText = "☰ " + ((dmName === "allChat") ? "Cool Chat" : dmName);
  }

  //const isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0));

  wsConnect();

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
  })*/

};