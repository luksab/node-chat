window.onload = ()=>{
  let lines = document.getElementById('lines');
  let dmName;

  const socket = io.connect();
  socket.on('connect', function () {
    $('#chat').addClass('connected');
  });

  socket.on('announcement', function (msg) {
    $('#lines').append($('<p>').append($('<em>').text(msg)));
  });

  socket.on('reload', ()=>location.reload());
  
  socket.on('nicknames', function (nicknames) {
    $('#nicknames').empty().append($('<span>Online: </span>'));
    //var nicknames = document.getElementsByClassName("nicknames");
    for (var i in nicknames) {
      $('#nicknames').append($('<b>').text(nicknames[i]));
    }
  });
  
  document.getElementById('nicknames').addEventListener('click', (ev) =>  {
    const clickedEl = ev.target;
    if(clickedEl.tagName == 'B') {
      const nickName = clickedEl.innerText;
      dmName = nickName;
      console.log(nickName);
      document.getElementById('dm_messages').style.display = 'block';
      document.getElementById('dm_nickname').innerHTML = '<b>'+dmName+'</b>';
    }
  });

  socket.on('user message', message);
  socket.on('user image', image);
  socket.on("dm",(msg)=>console.log(msg.from+': '+msg.msg))//socket.emit('dm', {user: "asd", msg: "ha"});
  socket.on('reconnect', function () {
    //$('#lines').remove();
    socket.emit('nickname', {nick:socket.nickname, passwd:socket.passwd}, (set)=>set ? location.reload():null);
    message('System', 'Reconnected to the server');
  });

  /*socket.on('reconnecting', function () {
    message('System', 'Attempting to re-connect to the server');
  });*/
  socket.on('disconnect', ()=>message('System', 'Disconnected'));

  socket.on('error', function (e) {
    message('System', e ? e : 'A unknown error occurred');
  });

  function message (from, msg) {
    lines.innerHTML += '<p><b>' + from + '</b>' + msg + '</p>';
    setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER);
  }

  function image (from, base64Image) {
    let w = (lines.clientWidth|0)-20;
    lines.innerHTML += '<p><b>' + from + '</b>' + '<img src="' + base64Image + '" width="'+ w +'"/>' + '</p>';
    setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER);
  }
  
  function dm (nick){
      console.log("starting dm to"+nick);
  }

  //
  // dom manipulation code
  //
  $(function () {
    $('#set-nickname').submit(function (ev) {
      socket.nickname = $('#nick').val();
      socket.passwd = $('#passwd').val();
      socket.emit('nickname', {nick:$('#nick').val(), passwd:$('#passwd').val()}, (set) => {
        if (!set) {
          clear();
          document.getElementById('message').disabled = false;
          document.getElementsByClassName("send")[0].disabled = false;
          document.getElementById('imagefile').disabled = false;
          return $('#chat').addClass('nickname-set');
        } $('#nickname-err').css('visibility', 'visible');
      });
      return false;
    });

    $('#send-message').submit(function () {
      message('me', $('#message').val());
      socket.emit('user message', $('#message').val());
      clear();
      $('#lines').get(0).scrollTop = Number.MAX_SAFE_INTEGER;
      return false;
    });

    function clear () {
      $('#message').val('').focus();
    };

    $('#imagefile').bind('change', function(e){
      var data = e.originalEvent.target.files[0];
      var reader = new FileReader();
      reader.onload = function(evt){
        //image(event.target.result);
        const img = new Image();
        img.src = event.target.result;
        const fileName = e.target.files[0].name;
        img.onload = () => {
                const elem = document.createElement('canvas');
                const width = 580;
                const scaleFactor = width / img.width;
                elem.width = width;
                const height = elem.height = img.height * scaleFactor;
                const ctx = elem.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                let imge = elem.toDataURL("image/jpeg", 0.7);//ctx.canvas.toDataURL("image/jpg", 0.1);
                //console.log(imge);
                image('me',imge);
                socket.emit('user image', imge);
            },
        reader.onerror = error => console.log(error);
      };
      reader.readAsDataURL(data);
    });
  });


};
  
  
  
  
  
  
  
  
