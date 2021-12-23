// Use the web-push library to hide the implementation details of the communication
// between the application server and the push service.
// For details, see https://tools.ietf.org/html/draft-ietf-webpush-protocol and
// https://tools.ietf.org/html/draft-ietf-webpush-encryption.
const webPush = require('web-push');
const router = require('express').Router();
let subscriptions = []
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY "+
    "environment variables. You can use the following ones:");
  console.log(webPush.generateVAPIDKeys());
  return;
}
// Set the keys used for encrypting the push messages.
webPush.setVapidDetails(
  'https://dardasha.herokuapp.com/',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

  router.get('/vapidPublicKey', function(req, res) {
    res.send(process.env.VAPID_PUBLIC_KEY);
  });

  router.post( '/register', function(req, res) {
    // A real world application would store the subscription info.
    if(!subscriptions.some(s=> s.endpoint == req.body.subscription.endpoint))
    subscriptions.push(req.body.subscription);
    console.log(subscriptions);
    res.sendStatus(201);
  });

  router.post( '/sendNotification', function(req, res) {
  
      Promise.all(subscriptions.map(subscription => webPush.sendNotification(subscription,JSON.stringify( req.body.payload )|| '{title:"",body:""}')))
      .then(function() {
        res.sendStatus(201);
      })
      .catch(function(error) {
        res.sendStatus(500);
        console.log(error);
      });
  });

  module.exports = router;