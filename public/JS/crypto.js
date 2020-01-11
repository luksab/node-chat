//Encryption shit
function generateKey(alg, scope) {
    return new Promise(function (resolve) {
        var genkey = crypto.subtle.generateKey(alg, true, scope)
        genkey.then(function (pair) {
            resolve(pair)
        }).catch((e) => console.error(e.message))
    })
}

function arrayBufferToBase64String(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer)
    var byteString = ''
    for (var i = 0; i < byteArray.byteLength; i++) {
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
    for (var i = 0; i < buf.length; i++) {
        bufView[i] = buf.charCodeAt(i)
    }
    return bufView
}

function arrayBufferToText(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer)
    var str = ''
    for (var i = 0; i < byteArray.byteLength; i++) {
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
    for (var i = 0; i < lines.length; i++) {
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
    return new Promise(function (resolve) {
        var importer = crypto.subtle.importKey("spki", convertPemToBinary(pemKey), encryptAlgorithm, true, ["encrypt"])
        importer.then(function (key) {
            resolve(key)
        }).catch((e) => console.log(e.message))
    })
}

function importPublicKey(pemKey) {
    return new Promise(function (resolve) {
        var importer = crypto.subtle.importKey("spki", convertPemToBinary(pemKey), signAlgorithm, true, ["verify"])
        importer.then(function (key) {
            resolve(key)
        })
    })
}

function importPrivateKey(pemKey) {
    return new Promise(function (resolve) {
        var importer = crypto.subtle.importKey("pkcs8", convertPemToBinary(pemKey), signAlgorithm, true, ["sign"])
        importer.then(function (key) {
            resolve(key)
        })
    })
}

function importPrivateDecryptKey(pemKey) {
    return new Promise(function (resolve) {
        var importer = crypto.subtle.importKey("pkcs8", convertPemToBinary(pemKey), encryptAlgorithm, true, ["decrypt"])
        importer.then(function (key) {
            resolve(key)
        })
    })
}

function exportPublicKey(keys) {
    return new Promise(function (resolve) {
        window.crypto.subtle.exportKey('spki', keys.publicKey).
            then(function (spki) {
                resolve(convertBinaryToPem(spki, "RSA PUBLIC KEY"))
            })
    })
}

function exportPrivateKey(keys) {
    return new Promise(function (resolve) {
        var expK = window.crypto.subtle.exportKey('pkcs8', keys.privateKey)
        expK.then(function (pkcs8) {
            resolve(convertBinaryToPem(pkcs8, "RSA PRIVATE KEY"))
        })
    })
}

function exportPemKeys(keys) {
    return new Promise(function (resolve) {
        exportPublicKey(keys).then(function (pubKey) {
            exportPrivateKey(keys).then(function (privKey) {
                resolve({ publicKey: pubKey, privateKey: privKey })
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

function deriveKey(saltBuf, passphrase) {
    var keyLenBits = 128;
    var kdfname = "PBKDF2";
    var aesname = "AES-CBC"; // AES-CTR is also popular
    // 100 - probably safe even on a browser running from a raspberry pi using pure js ployfill
    // 10000 - no noticeable speed decrease on my MBP
    // 100000 - you can notice
    // 1000000 - annoyingly long
    var iterations = 100; // something a browser on a raspberry pi or old phone could do
    var hashname = "SHA-256";
    var extractable = true;

    console.log('');
    console.log('passphrase', passphrase);
    console.log('salt (hex)', Unibabel.bufferToHex(saltBuf));
    console.log('iterations', iterations);
    console.log('keyLen (bytes)', keyLenBits / 8);
    console.log('digest', hashname);

    // First, create a PBKDF2 "key" containing the password
    return crypto.subtle.importKey(
        "raw",
        Unibabel.utf8ToBuffer(passphrase),
        { "name": kdfname },
        false,
        ["deriveKey"]).
        // Derive a key from the password
        then(function (passphraseKey) {
            return crypto.subtle.deriveKey(
                {
                    "name": kdfname
                    , "salt": saltBuf
                    , "iterations": iterations
                    , "hash": hashname
                }
                , passphraseKey
                // required to be 128 (or 256) bits
                , { "name": aesname, "length": keyLenBits } // Key we want
                , extractable                               // Extractble
                , ["encrypt", "decrypt"]                  // For new key
            );
        }).
        // Export it so we can display it
        then(function (aesKey) {
            return aesKey;
            return crypto.subtle.exportKey("raw", aesKey).then(function (arrbuf) {
                return new Uint8Array(arrbuf);
            });
        }).
        catch(function (err) {
            window.alert("Key derivation failed: " + err.message);
        });
}

var scopeSign = ["sign", "verify"]
var scopeEncrypt = ["encrypt", "decrypt"]

let encryptKey = false;
let signKey = false;

var saltHex = '2618a03369d25a4bf216dd4136aa8a9cec15085a15d34ce9f21812f7b1e66863';
var saltBuf;
//var passphrase = 'secret';

var myIV = localStorage.getItem('myIV')
if (myIV == null) {
    myIV = window.crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem('myIV', JSON.stringify(myIV));
} else {
    myIV = new Uint8Array(Object.values(JSON.parse(myIV)));
}

async function encryptMessage(publicKey, msg, IV) {
    if (IV == null) {
        IV = myIV;
    }
    let enc = new TextEncoder();
    let encoded = enc.encode(msg);
    let arr = await window.crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv: IV
        },
        publicKey,
        encoded
    );
    console.log(new Uint8Array(arr))
    return JSON.stringify(Array.from(new Uint8Array(arr)));
}

function separateIvFromData(buf) {
    var iv = new Uint8Array(ivLen);
    var data = new Uint8Array(buf.length - ivLen);
    Array.prototype.forEach.call(buf, function (byte, i) {
        if (i < ivLen) {
            iv[i] = byte;
        } else {
            data[i - ivLen] = byte;
        }
    });
    return { iv: iv, data: data };
}

async function decryptMessage(publicKey, msg, IV) {
    //var parts = separateIvFromData(buf);//parts.iv, parts.data
    if (IV == null) {
        IV = myIV;
    }
    let dec = new TextDecoder("utf-8");
    let buf = new Uint8Array(JSON.parse(msg));
    console.log(buf);
    let arr = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: IV }, publicKey, buf)
    console.log(buf);
    return dec.decode(arr);
}

async function decryptAESData(publicKey, buf, IV) {
    //var parts = separateIvFromData(buf);//parts.iv, parts.data
    if (IV == null) {
        IV = myIV;
    }
    let dec = new TextDecoder("utf-8");
    console.log(buf);
    let arr = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: IV }, publicKey, buf)
    console.log(buf);
    return dec.decode(arr);
}

if (localStorage.getItem('signKeyS') != null && localStorage.getItem('encryptKeyS') != null &&
    localStorage.getItem('signKeyS').indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
    localStorage.getItem('encryptKeyS').indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1) {
    importPrivateKey(localStorage.getItem('signKeyS')).then(function (Skey) {
        importPrivateDecryptKey(localStorage.getItem('encryptKeyS')).then(function (Ekey) {
            signKey = Skey;
            encryptKey = Ekey;
            console.log("successfully imported Private Keys")
        })
    });
}

async function generateKeys(passwd, func) {
    if (
        localStorage.getItem('signKeyS').indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1 &&
        localStorage.getItem('encryptKeyS').indexOf("-----BEGIN RSA PRIVATE KEY-----") !== -1
    )
        return func(localStorage.getItem("encryptKeyS"), localStorage.getItem("signKeyS"));
    let ekeys = await generateKey(encryptAlgorithm, scopeEncrypt);
    encryptKey = ekeys.privateKey;
    let publicEKey = await exportPublicKey(ekeys)
    localStorage.setItem('encryptKeyP', publicEKey);
    let privateEKey = await exportPrivateKey(ekeys)
    localStorage.setItem('encryptKeyS', privateEKey);
    let skeys = await generateKey(encryptAlgorithm, scopeEncrypt)
    signKey = skeys.privateKey;
    let publicSKey = await exportPublicKey(skeys);
    localStorage.setItem('signKeyP', publicSKey);
    let privateSKey = await exportPrivateKey(skeys);
    localStorage.setItem('signKeyS', privateSKey);

    func(privateEKey, privateSKey);
}

if (localStorage.getItem('encryptKeyP') == null || localStorage.getItem('encryptKeyS') == null)
    generateKey(encryptAlgorithm, scopeEncrypt).then(function (keys) {
        encryptKey = keys.privateKey;
        exportPublicKey(keys).then((key) => {
            localStorage.setItem('encryptKeyP', key);
            console.log("PushEncryptKey" + key)
            //socket.emit("PushEncryptKey",key);
        })
        exportPrivateKey(keys).then((key) => {
            localStorage.setItem('encryptKeyS', key);
        })
    }).catch((e) => console.log(e.message))
else {
    let key = localStorage.getItem('encryptKeyP');
    importPublicEncryptKey(key).then((key) => {
        encryptKey = key;
    })
    console.log("PushEncryptKey" + key)
    //socket.emit("PushEncryptKey",key);
}

if (localStorage.getItem('signKeyP') == null || localStorage.getItem('signKeyS') == null)
    generateKey(encryptAlgorithm, scopeEncrypt).then(function (keys) {
        signKey = keys.privateKey;
        exportPublicKey(keys).then((key) => {
            localStorage.setItem('signKeyP', key);
            console.log("PushEncryptKey" + key)
            //socket.emit("PushEncryptKey",key);
        })
        exportPrivateKey(keys).then((key) => {
            localStorage.setItem('signKeyS', key);
        })
    }).catch((e) => console.log(e.message))
else {
    let key = localStorage.getItem('signKeyP');
    importPublicKey(key).then((key) => {
        signKey = key;
    })
    console.log("PushSignKey" + key)
    //socket.emit("PushSignKey",key);
}

let publicKeys = {};