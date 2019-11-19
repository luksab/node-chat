const webpush = require('web-push');

const pushSubscription = {"endpoint":"https://fcm.googleapis.com/fcm/send/e6evpzda_Jo:APA91bHfmJzz52ZstkuJdxw1Sd-_W408vDYBWXvLAIwVWA2TZgtrcb-67vV9IdVsQLoPv2zug0z8MoZ3MxruXSVeRzQJ6y1bnnUP2zBKHwlXquwQmYkbGy6SQoYLAN2DLo1HmiPtD2ZH","expirationTime":null,"keys":{"p256dh":"BEDYrQjURkg8bchRwXuXnDmsSmOcyi8Lk4LCVijDFlEOaQmABKfowUpGaVnkm6fs6DzITW5fkCJLo6SIW19O4eY","auth":"RLcz41PxV2vWQnn2dw8Lbg"}}
;

const payload = 'Hiii';

const options = {
gcmAPIKey: 'AIzaSyBWa36ejVuHV90FgaCrPdS8ajaHn4d4Au8',
vapidDetails: {
    subject: 'https://luksab.de',
    publicKey: 'BM_12EMi2xCAVhD2tn_gr3DugdW_bYnxtVCJd1qzAZTag5gi-IH97Vetc5sYfr155JiPGceLMVMXy29GmFCES20',
    privateKey: 'IU8b2h7qG0qh_it2zHs9iSa3439J-PZrr_RS4N_q2Gs'
},headers: {}
}
console.log("sending")
webpush.sendNotification(
pushSubscription,
payload,
options
);
console.log("send")