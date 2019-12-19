let isSubscribed = false;
const applicationServerPublicKey = 'BM_12EMi2xCAVhD2tn_gr3DugdW_bYnxtVCJd1qzAZTag5gi-IH97Vetc5sYfr155JiPGceLMVMXy29GmFCES20';
const pushButton = document.querySelector('.pushButton');
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
    pushButton.addEventListener('click', function () {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });
    window.settings["User settings"]["submenu"]["WebPush"]["onclick"] = function () {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    };

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
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
        window.settings["User settings"]["submenu"]["WebPush"]["text"] = 'Push Messaging Blocked.';
        pushButton.disabled = true;
        window.settings["User settings"]["submenu"]["WebPush"]["disabled"] = true;
        updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
        window.settings["User settings"]["submenu"]["WebPush"]["text"] = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
        window.settings["User settings"]["submenu"]["WebPush"]["text"] = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
    window.settings["User settings"]["submenu"]["WebPush"]["disabled"] = false;
}

function updateSubscriptionOnServer(subscription) {
    //TODO: PUSH SUBSCRIPTION
    //window.ws.send(JSON.stringify({"type":"push","subscription":subscription}));
    console.log(JSON.stringify(subscription))
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then(function (subscription) {
            console.log('User is subscribed.');

            updateSubscriptionOnServer(subscription);

            isSubscribed = true;

            updateBtn();
        })
        .catch(function (err) {
            console.error('Failed to subscribe the user: ', err);
            updateBtn();
        });
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .catch(function (error) {
            console.error('Error unsubscribing', error);
        })
        .then(function () {
            updateSubscriptionOnServer(null);

            console.log('User is unsubscribed.');
            isSubscribed = false;

            updateBtn();
        });
}