'use strict';

const
  bodyParser = require('body-parser'),
  config = require('./config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),
  request = require('request'),
  help = require('./messageTree/help'),
  map = require('./messageTree/map'),
  helper = require('./messageTree/helper');


var app = express();
app.set('port', config.port);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));
var allItems = require('./fakeData/fakeData00.js');

console.log('THIS IS ALL ITEMS ', allItems);

// App Dashboard > Dashboard > click the Show button in the App Secret field
const APP_SECRET = config.appSecret;


// App Dashboard > Webhooks > Edit Subscription > copy whatever random value you decide to use in the Verify Token field
const VALIDATION_TOKEN = config.validationToken;

// App Dashboard > Messenger > Settings > Token Generation > select your page > copy the token that appears
const PAGE_ACCESS_TOKEN = config.pageAccessToken;

// In an early version of this bot, the images were served from the local public/ folder.
// Using an ngrok.io domain to serve images is no longer supported by the Messenger Platform.
// Github Pages provides a simple image hosting solution (and it's free)
const IMG_BASE_PATH = 'https://rodnolan.github.io/posterific-static-images/';

// make sure that everything has been properly configured
if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
  console.error("Missing config values");
  process.exit(1);
}

/*
 * Verify that the request came from Facebook. You should expect a hash of
 * the App Secret from your App Dashboard to be present in the x-hub-signature
 * header field.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // In DEV, log an error. In PROD, throw an error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    console.log("received  %s", signatureHash);
    console.log("exepected %s", expectedHash);
    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}


/*
 * Verify that your validation token matches the one that is sent
 * from the App Dashboard during the webhook verification check.
 * Only then should you respond to the request with the
 * challenge that was sent.
 */
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("[app.get] Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Validation token mismatch.");
    res.sendStatus(403);
  }
});


/*
 * All callbacks from Messenger are POST-ed. All events from all subscription
 * types are sent to the same webhook.
 *
 * Subscribe your app to your page to receive callbacks for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 */
app.post('/webhook', function (req, res) {
  console.log("message received!");
  var data = req.body;
  console.log(JSON.stringify(data));

  if (data.object == 'page') {
    // send back a 200 within 20 seconds to avoid timeouts
    res.sendStatus(200);
    // entries from multiple pages may be batched in one request
    data.entry.forEach(function(pageEntry) {
        // iterate over each messaging event for this page
        pageEntry.messaging.forEach(function(messagingEvent) {
          let propertyNames = Object.keys(messagingEvent);
          console.log("[app.post] Webhook event props: ", propertyNames.join());
          if (messagingEvent.message) {
            processMessageFromPage(messagingEvent);
          } else {
            console.log("[app.post] not prepared to handle this message type.");
          }
        });
      });
  }
});

/*
 * Called when a message is sent to your page.
 *
 */
function processMessageFromPage(event) {
  var senderID = event.sender.id;
  var pageID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("[processMessageFromPage] user (%d) page (%d) timestamp (%d) and message (%s)",
    senderID, pageID, timeOfMessage, JSON.stringify(message));
  // the 'message' object format can vary depending on the kind of message that was received.
  // See: https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
  var messageText = message.text;
  if (messageText) {
    console.log("[processMessageFromPage]: %s", messageText);
    var lowerCaseMsg = messageText.toLowerCase();

    if (allItems.hasOwnProperty(lowerCaseMsg)) {
      var reply = messageText + ' can be found at aisle ' + allItems[lowerCaseMsg];
      sendTextMessage(senderID, reply);
    } else if (lowerCaseMsg.includes('show map')) {
          map.sendMapOptionsAsQuickReplies(senderID);
    } else if (lowerCaseMsg.includes('request employee')) {
          // map.sendMapOptionsAsQuickReplies(senderID);
    } else if (lowerCaseMsg.includes('top 10') || lowerCaseMsg.includes('top ten')) {
          map.sendMapOptionsAsQuickReplies(senderID);
    } else {
      // otherwise, just echo it back to the sender
      help.sendHelpOptionsAsQuickReplies(senderID);
    }
  }
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText // utf-8, 640-character max
    }
  };
  console.log("[sendTextMessage] %s", JSON.stringify(messageData));
  helper.callSendAPI(messageData);
}

/*
 * Start your server
 */
app.listen(app.get('port'), function() {
  console.log('[app.listen] Node app is running on port', app.get('port'));
});

module.exports = app;
