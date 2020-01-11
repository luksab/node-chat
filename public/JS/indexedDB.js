// In the following line, you should include the prefixes of implementations you want to test.
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
// Let us open our database
var DBOpenRequest = indexedDB.open("messages", 1);
// these two event handlers act on the database being opened successfully, or not
DBOpenRequest.onerror = function(event) {
  console.error(event);
};

let db;
DBOpenRequest.onsuccess = function(event) {
  console.log("Database initialised");

  // store the result of opening the database in the db variable. This is used a lot below
  db = DBOpenRequest.result;
  /*if(dmName != "allChat")
    MessageFromDB(dmName);*/
  /*var request = store.get(id); //getting single object by id from object store

  request.onsuccess = function(e) {
      showDetails(e.target.result); // data retreived
      db.close();
  };

  request.onerror = function(e) {
          console.log("Error Getting: ", e);
  };*/
};

// This event handles the event whereby a new version of the database needs to be created
// Either one has not been created before, or a new version number has been submitted via the
// window.indexedDB.open line above
//it is only implemented in recent browsers
DBOpenRequest.onupgradeneeded = function(event) {
  var db = event.target.result;

  db.onerror = function(event) {
    console.error('Error loading database.');
  };

  // Create an objectStore for this database

  let objectStore = db.createObjectStore("messages", { keyPath: "id", autoIncrement:true });

  // define what data items the objectStore will contain
  objectStore.createIndex("chat", "chat", { unique: false });
  objectStore.createIndex("sender", "sender", { unique: false });
  objectStore.createIndex("message", "message", { unique: false });

  console.log('Object store created.');

};

function addMessageToDB(chat, from, msg, encrypted = false, element = false, uuid) {
  try {
    var trans = db.transaction(["messages"], 'readwrite');
    var objectStore = trans.objectStore("messages");
    var request = objectStore.add({ chat: chat, sender: from, message: msg, encrypted: encrypted });
    request.onsuccess = function (event) {
      if (element)
        element.setAttribute("dbid", event.srcElement.result)
      console.log(event.srcElement.result)
    };
    request.onerror = function (event) {
      console.error(event);
    }
  }
  catch (e) { console.error(e) }
}


function MessageFromDB(chat) {
  try {
    var trans = db.transaction(["messages"], 'readwrite');
    var objectStore = trans.objectStore("messages");
    var index = objectStore.index("chat");
    var cursor = index.openCursor()
    cursor.onsuccess = (event) => {
      var cursor = event.target.result;
      if (cursor) {
        if (chat === cursor.value.chat) {
          if (typeof cursor.value.encrypted !== "undefined" && cursor.value.encrypted)
            lines.innerHTML += '<p class="encrypted" dbID="' + cursor.value.id + '"><b>' + cursor.value.sender + '</b>' + cursor.value.message + '</p>';
          else
            lines.innerHTML += '<p dbID="' + cursor.value.id + '" ><b>' + cursor.value.sender + '</b>' + cursor.value.message + '</p>';
          if (cursor.value.message.indexOf("<img") === 0) {
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
        }
        cursor.continue();
      }
      setTimeout(() => lines.scrollTop = lines.scrollHeight, 10);
    }
    cursor.onerror = (e) => console.log(e);
    return true;
  }
  catch (e) { console.log(e); return false; }
}