/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

const applicationServerPublicKey = 'BM_12EMi2xCAVhD2tn_gr3DugdW_bYnxtVCJd1qzAZTag5gi-IH97Vetc5sYfr155JiPGceLMVMXy29GmFCES20';
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
};
function addMessageToDB(chat,from,msg,encrypted=false,element=false){
  try{
    var trans = db.transaction(["messages"], 'readwrite');
    var objectStore = trans.objectStore("messages");
    var request = objectStore.add({chat:chat,sender:from,message:msg,encrypted:encrypted});
    request.onsuccess = function(event) {
      if(element)
        element.setAttribute("dbid",event.srcElement.result)
      console.log(event.srcElement.result)
    };   
    request.onerror = function(event) {
        console.error(event);
    }
  }
  catch(e){console.error(e)}
}

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  console.log(event)

  let user = event.notification.body.substring(0,event.notification.body.indexOf(":"));
  let message = event.notification.body.substring(event.notification.body.indexOf(":")+1);
  addMessageToDB(user,user,message);
  const title = 'New dm!!!';
  const options = {
    body: event.data.text(),
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://luksab.de/?'+event.notification.body.substring(0,event.notification.body.indexOf(":")))
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(newSubscription) {
      // TODO: Send to application server
      console.log('[Service Worker] New subscription: ', newSubscription);
    })
  );
});

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/static/index.js',
    '/static/index.css',
    '/static/offline.html',
    '/static/favicon16.png',
    '/static/manifest.json',
    //'/static/favicon16.png',
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
);
  self.skipWaiting();
});


self.addEventListener('message', function (evt) {//JSON messages from main js
  if(evt.data['delete'] === true)
    caches.keys().then(function(names) {
      for (let name of names)
          caches.delete(name);
    });
  console.log('postMessage received', evt.data);
})


self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
);
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  //evt.request.cache = 'default';
  console.log('[ServiceWorker] Fetch', evt.request);
  if (evt.request.mode !== 'navigate' && evt.request.mode !== 'no-cors' && evt.request.mode !== 'cors') {
    // Not a page navigation, bail.
    return;
  }
  console.log('still here');
  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      console.log("Response:",response);
      return response || fetch(evt.request).catch(() => {
        return caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.match('offline.html');
            });
      });
    })
  );
});
