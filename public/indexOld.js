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

window.onload = ()=>{    
  let lines = document.getElementById('lines');
  let dm_lines=document.getElementById('dm_lines');
  let dmName, dms={};
  let isSubscribed = false;
  let swRegistration = null;
  const applicationServerPublicKey = 'BM_12EMi2xCAVhD2tn_gr3DugdW_bYnxtVCJd1qzAZTag5gi-IH97Vetc5sYfr155JiPGceLMVMXy29GmFCES20';
  const pushButton = document.querySelector('.js-push-btn');

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
  
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
      console.log('Failed to subscribe the user: ', err);
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
      console.log('Error unsubscribing', error);
    })
    .then(function() {
      updateSubscriptionOnServer(null);
  
      console.log('User is unsubscribed.');
      isSubscribed = false;
  
      updateBtn();
    });
  }








  const socket = io.connect();
  socket.on('connect', function () {
    $('#chat').addClass('connected');
    
    if(localStorage.getItem('name') !== null && localStorage.getItem('passwd') !== null){
        console.log("Trying to login using saved Userdata")
        socket.emit('nickname', {nick:localStorage.getItem('name'), passwd:localStorage.getItem('passwd')}, (set) => {
                if (!set) {
                message('System', 'Reconnected to the server with localStorage');
                document.getElementById('message').disabled = false;
                document.getElementsByClassName("send")[0].disabled = false;
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
  
  socket.on('nicknames', function (nicknames) {
    $('#nicknames').empty().append($('<span>Online: </span>'));
    //var nicknames = document.getElementsByClassName("nicknames");
    for (var i in nicknames) {
      $('#nicknames').append($('<b>').text(nicknames[i]));
    }
  });
  
  document.getElementById('nicknames').addEventListener('click', (ev) =>  {
    const clickedEl = ev.target;
    if(clickedEl.tagName == 'B' && clickedEl.innerText !== localStorage.getItem('name')) {
      const nickName = clickedEl.innerText;
      dmName = nickName;
      document.getElementById('dm_chat').style.display = 'block';
      dm_lines.innerHTML = '';
      if(dms[dmName] != null)
        for(el of dms[dmName])
            dm_lines.innerHTML += '<p><b>' + dmName + '</b>' + el + '</p>';
      document.getElementById('dm_nickname').innerHTML = '<b onclick="document.getElementById(\'dm_chat\').style.display = \'none\';">'+dmName+'</b>';
    }
  });
  
  $('#dm_send-message').submit(function (ev) {
      ev.preventDefault();
      dm('me', $('#dm_message').val());
      console.log('dm',dmName , $('#dm_message').val());
      socket.emit('dm',{user: dmName , msg:$('#dm_message').val()});
      $('#dm_message').val('').focus();
      $('#dm_lines').get(0).scrollTop = Number.MAX_SAFE_INTEGER;
      return false;
  });
  
  function dm (from, msg) {
    if(dms[from] == null)
        dms[from] = [];
    dms[from].push(msg);
    dm_lines.innerHTML += '<p><b>' + from + '</b>' + msg + '</p>';
    setTimeout(()=>dm_lines.scrollTop = Number.MAX_SAFE_INTEGER);
  }

  socket.on('user message', message);
  socket.on('user image', image);
  socket.on("dm",(msg)=>dm(msg.from,msg.msg))
  socket.on('reconnect', function () {
    //$('#lines').remove();
    socket.emit('nickname', {nick:localStorage.getItem('name'), passwd:localStorage.getItem('passwd')},(set) => {
        if (!set) {
          clear();
          document.getElementById('message').disabled = false;
          document.getElementsByClassName("send")[0].disabled = false;
          document.getElementById('imagefile').disabled = false;
          return $('#chat').addClass('nickname-set');}
        location.reload();
        });
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
    lines.innerHTML += '<p><b>' + from + '</b>' + '<img background-image src="' + base64Image + '" width="'+ w +'"/>' + '</p>';
    setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER);
  }
  function imageCanvas (from, canvas) {
    let w = (lines.clientWidth|0)-20;
    let p = document.createElement("p");
    let b = document.createElement("b");
    p.appendChild(b);
    b.appendChild(document.createTextNode(""+from));
    canvas.style = "width :"+w;
    p.appendChild(canvas);
    lines.appendChild(p)
    //lines.innerHTML += '<p><b>' + from + '</b>' + '<img background-image src="' + base64Image + '" width="'+ w +'"/>' + '</p>';
    setTimeout(()=>lines.scrollTop = Number.MAX_SAFE_INTEGER);
  }

  //
  // dom manipulation code
  //
  $(function () {
    $('#set-nickname').submit(function (ev) {
      localStorage.setItem('name', $('#nick').val());
      localStorage.setItem('passwd', $('#passwd').val());
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
        reduceFileSize(this.files[0], 500*1024, 600, Infinity, 0.7, blob => {
            image('me',blob);
            socket.emit('user image', blob);
        });
    });
    //var dataURL, filename;
    $("#message").pasteImageReader(function(results) {
        console.log(results.dataURL.type);
        console.log(results);
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
            imageCanvas('me',canvas);
            socket.emit('user image', blob);
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
    /*
    encode message in a form we can use for the encrypt operation.
    */
    function getMessageEncoding(message) {
        let enc = new TextEncoder();
        return enc.encode(message);
    }

    async function encrypt(secretKey) {
        const ciphertextValue = document.querySelector(".ecdh .ciphertext-value");
        ciphertextValue.textContent = "";
        const decryptedValue = document.querySelector(".ecdh .decrypted-value");
        decryptedValue.textContent = "";

        iv = window.crypto.getRandomValues(new Uint8Array(12));
        let encoded = getMessageEncoding();

        ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        secretKey,
        encoded
        );

        let buffer = new Uint8Array(ciphertext, 0, 5);
        ciphertextValue.classList.add("fade-in");
        ciphertextValue.addEventListener("animationend", () => {
        ciphertextValue.classList.remove("fade-in");
        });
        ciphertextValue.textContent = `${buffer}...[${ciphertext.byteLength} bytes total]`;
    }

    /*
    Decrypt the message using the secret key.
    If the ciphertext was decrypted successfully,
    update the "decryptedValue" box with the decrypted value.
    If there was an error decrypting,
    update the "decryptedValue" box with an error message.
    */
    async function decrypt(secretKey) {
        const decryptedValue = document.querySelector(".ecdh .decrypted-value");
        decryptedValue.textContent = "";
        decryptedValue.classList.remove("error");

        try {
        let decrypted = await window.crypto.subtle.decrypt(
            {
            name: "AES-GCM",
            iv: iv
            },
            secretKey,
            ciphertext
        );

        let dec = new TextDecoder();
        decryptedValue.classList.add("fade-in");
        decryptedValue.addEventListener("animationend", () => {
            decryptedValue.classList.remove("fade-in");
        });
        decryptedValue.textContent = dec.decode(decrypted);
        } catch (e) {
        decryptedValue.classList.add("error");
        decryptedValue.textContent = "*** Decryption error ***";
        }
    }
        
        
    /*
    Derive an AES key, given:
    - our ECDH private key
    - their ECDH public key
    */
    function deriveSecretKey(privateKey, publicKey) {
    return window.crypto.subtle.deriveKey(
        {
        name: "ECDH",
        public: publicKey
        },
        privateKey,
        {
        name: "AES-GCM",
        length: 256
        },
        false,
        ["encrypt", "decrypt"]
    );
    }

    let EDCHKeyPair;
    window.crypto.subtle.generateKey(
        {
        name: "ECDH",
        namedCurve: "P-384"
        },
        false,
        ["deriveKey"]
    ).then((newEDCHKeyPair)=>{
        EDCHKeyPair = newEDCHKeyPair;
        window.crypto.subtle.exportKey("jwk",EDCHKeyPair.publicKey)
        .then((keyData)=>{
            socket.emit('establishEncryption',keyData)
        })
        .catch(function(err){
            console.error(err);
        });
      });
    
    let publicKeys = {};
    socket.on("establishEncryption",(name,publicKey)=>{
        window.crypto.subtle.importKey("jwk",publicKey,{name: "ECDH",namedCurve: "P-384",},false,["deriveKey"])
        .then(function(publicKey){
            console.log(publicKey);
            publicKeys[name]=publicKey;
            deriveSecretKey(EDCHKeyPair.privateKey, publicKey)
            .then((secretK)=>{
                console.log(secretK);
            })
        })
        
    });
    
};
  
  
  
  
  
  
  
