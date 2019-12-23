const wsConnect = () => {
    if (!navigator.onLine) {
        window.setTimeout(wsConnect, 500);
    }
    if (location.href === "http://localhost:8000/") {
        window.ws = new WebSocket("ws://localhost:8000/index.html");
    }
    else
        window.ws = new WebSocket("wss://luksab.de/websocket/index.html:8000");
    window.ws.onopen = async function () {
        $('#chat').addClass('connected');
        document.getElementById('register').disabled = false;

        const passwd = $('#passwd').val();
        if (localStorage.getItem("encryptKeyS").indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
            localStorage.getItem("signKeyS").indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
            localStorage.getItem("uid") != null) {
            document.getElementById('register').value = "Login";
            let privateEKey = await importPrivateDecryptKey(localStorage.getItem("encryptKeyS"));
            let privateSKey = await importPrivateDecryptKey(localStorage.getItem("signKeyS"));
            const toSend = {
                "type": "login",
                "uid": parseInt(localStorage.getItem("uid"), 10).toString(32),
            }
            console.log(toSend);
            return window.ws.send(JSON.stringify(toSend));
        }
    };
    window.ws.onmessage = async (message) => {
        console.log(message);
        let msg = JSON.parse(message.data);
        console.log(msg);
        switch (msg["type"]) {
            case "dm": {
                dm(msg.from, msg.msg, msg.uuid);
                break;
            } case "whois": {
                console.log("name", msg["name"]);
                ids[msg["name"]] = false;
                users[msg["uid"]] = { "uid": msg["uid"] };
                if (msg["name"]) {
                    names[msg["uid"]] = msg["name"];
                    ids[msg["name"]] = msg["uid"];
                    users[msg["uid"]] = { "uid": msg["uid"], "name": msg["name"] };
                }
                if (msg["name"] && !nicknames.includes(msg["name"]))
                    nicknames.push(msg["name"])
                break;
            } case "error": {
                console.error(msg["msg"]);
                $('#chat').removeClass('nickname-set');
                document.getElementById('register').disabled = false;
                $('#nickname-err').css('visibility', 'visible');
                document.getElementById('nickname-err').innerHTML = msg["msg"];
                if (msg["code"] === "no uid") {
                    localStorage.removeItem("uid");
                }
                break;
            } case "uid": {
                let uid = parseInt(msg["uid"], 32);
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
                console.log("from", FromBase64(msg["rS"]));
                let privateKey = await importPrivateDecryptKey(localStorage.getItem("encryptKeyS"));
                let randomMessage = await decryptData(privateKey, FromBase64(msg["rS"]));
                console.log(uid);
                window.ws.uid = uid;
                users[uid] = { "uid": uid, "name": "me" };
                console.log(randomMessage);
                console.log(arrayBufferToText(randomMessage));
                window.ws.send(JSON.stringify({ "type": "randomMsg", "randomMsg": arrayBufferToText(randomMessage) }));
                break;
            } case "succsess": {
                if (msg["succsess"]) {
                    window.ws.send(JSON.stringify({ "type": "myFriends" }));
                    refreshNicks();
                    localStorage.setItem("uid", ws.uid);
                    $('#message').val('').focus();
                    document.getElementById('message').disabled = false;
                    document.getElementById('imagefile').disabled = false;
                    return $('#chat').addClass('nickname-set');
                } $('#nickname-err').css('visibility', 'visible');
                break;
            } case "search": {
                if (msg["name"])
                    nicknames.push(msg["name"]);
                else
                    nicknames.push(msg["uid"]);
                const nickSet = new Set(nicknames);
                nicknames = [...nickSet];
                refreshNicks();
                break;
            } case "key": {
                publicKeys[msg["uid"]] = msg["keys"];
                break;
            } case "changeName": {
                users[ws.uid]["name"] = msg["name"];
                nicknames = nicknames.filter(e => e != localStorage.getItem("name"));
                localStorage.setItem("name", msg["name"]);
                nicknames.push(msg["name"]);
                refreshNicks();
                break;
            } case "friends": {
                if (msg["friends"] != [])
                    nicknames.push(...msg["friends"]);
                const nickSet = new Set(nicknames);
                nicknames = [...nickSet];
                refreshNicks();
                msg["friends"].forEach((uid) => window.ws.send(JSON.stringify({ "type": "whois", "uid": parseInt(uid) })));
                break;
            } default:
                console.log("Message from Server:", msg);
                break;
        }
    };
    window.ws.onclose = () => {
        $('#chat').removeClass('connected');
        document.getElementById('message').disabled = true;
        document.getElementById('imagefile').disabled = true;
        document.getElementById('register').disabled = true;
        console.log("reconnect");
        window.setTimeout(wsConnect, 500);
    }
    window.ws.onerror = (e) => {
        console.error(e.message);
        window.ws.close();
    }
};