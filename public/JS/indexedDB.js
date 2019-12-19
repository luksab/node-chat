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