'use strict';

const bodyParser = require('body-parser'),
	config = require('./config'),
	crypto = require('crypto'),
	express = require('express'),
	https = require('https'),
	request = require('request'),
	help = require('./messageTree/help'),
	map = require('./messageTree/map'),
	helper = require('./messageTree/helper');
const dashbot = require('dashbot')(config.dashbot).facebook;
const { Wit, log } = require('node-wit');
const client = new Wit({
	accessToken: 'RYYRXU4TYL7NOTASBBAM46WSQDH5MFTZ',
	logger: new log.Logger(log.DEBUG) // optional
});
var countWord = {};
var userState = {};

const showTopTen = require('./messageTree/showTopTen');
const emailToMySelf = require('./messageTree/email');
const sendTextWithTwilio = require('./messageTree/sendTextWithTwilio');
var topTenWords = [];

var app = express();
app.set('port', config.port);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));
var allItems = require('./fakeData/fakeData00.js');
var brands = require('./fakeData/brandItems.js');
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
	console.error('Missing config values');
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
	var signature = req.headers['x-hub-signature'];
  console.log(req.headers, req.body)
	if (!signature) {
		// In DEV, log an error. In PROD, throw an error.
		console.error("Couldn't validate the signature.");
	} else {
		var elements = signature.split('=');
		var method = elements[0];
		var signatureHash = elements[1];

		var expectedHash = crypto
			.createHmac('sha1', APP_SECRET)
			.update(buf)
			.digest('hex');

		console.log('received  %s', signatureHash);
		console.log('exepected %s', expectedHash);
		if (signatureHash != expectedHash) {
			throw new Error("Couldn't validate the request signature.");
		}
	}
}

var pausedUsers = {};
app.post('/pause', function(req, res) {
  console.log('pause: ', req.body)
	const userId = req.body.userId;
	const paused = req.body.paused;
	pausedUsers[userId] = paused;
	res.status(200).send('ok');
});

/*
 * Verify that your validation token matches the one that is sent
 * from the App Dashboard during the webhook verification check.
 * Only then should you respond to the request with the
 * challenge that was sent.
 */
app.get('/webhook', function(req, res) {
	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
		console.log('[app.get] Validating webhook');
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error('Failed validation. Validation token mismatch.');
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
app.post('/webhook', function(req, res) {
	dashbot.logIncoming(req.body);
	console.log('message received!');
	var data = req.body;
	console.log(JSON.stringify(data));
	dashbot.logIncoming(req.body);
  if (data.text) {
    sendTextMessage(data.userId, data.text);
  }
	if (data.object == 'page') {
		// send back a 200 within 20 seconds to avoid timeouts
		res.sendStatus(200);
		// entries from multiple pages may be batched in one request
		data.entry.forEach(function(pageEntry) {
			// iterate over each messaging event for this page
			pageEntry.messaging.forEach(function(messagingEvent) {
				if (!pausedUsers[messagingEvent.sender.id]) {
					//handle message if session is not paused for this userId
					let propertyNames = Object.keys(messagingEvent);
					console.log('[app.post] Webhook event props: ', propertyNames.join());
					console.log(messagingEvent);
					if (userState[messagingEvent.sender.id]) {
						console.log('state is: ', userState[messagingEvent.sender.id]);
						if (userState[messagingEvent.sender.id] === 'FIND') {
							messagingEvent.message.text = 'Where is ' + messagingEvent.message.text;
							processMessageFromPage(messagingEvent);
						} else if (userState[messagingEvent.sender.id] === 'Map') {
						}
						delete userState[messagingEvent.sender.id];
					} else if (messagingEvent.message.quick_reply) {
						if (messagingEvent.message.quick_reply.payload.includes(',')) {
							processMessageFromPage(messagingEvent, messagingEvent.message.quick_reply.payload);
						} else if (messagingEvent.message.quick_reply.payload === 'FIND') {
							userState[messagingEvent.sender.id] = messagingEvent.message.quick_reply.payload;
							sendTextMessage(messagingEvent.sender.id, 'What would you like to find?');
						} else if (messagingEvent.message.quick_reply.payload === 'MAP') {
							map.sendMapOptionsAsQuickReplies(messagingEvent.sender.id);
						} else if (messagingEvent.message.quick_reply.payload === 'TOPTEN') {
						} else if (messagingEvent.message.quick_reply.payload === 'CALL') {
              emailToMySelf();
              sendTextWithTwilio("A customer needs your help. Please click the link below to chat with client");
							sendTextMessage(messagingEvent.sender.id, 'A target representative has been notified.');
						}
						console.log('quick reply: ', messagingEvent.message.quick_reply);
					} else if (messagingEvent.message) {
						processMessageFromPage(messagingEvent);
					} else {
						console.log('[app.post] not prepared to handle this message type.');
					}
				}
			});
		});
	}
});

function aisleFound(search, senderID, messageText) {
	var lowerCaseSearch = search.toLowerCase();
	console.log('im here ', allItems[lowerCaseSearch]);
	if (messageText) {
		var reply = messageText + ' ' + search + ' can be found at aisle ' + allItems[lowerCaseSearch];
	} else {
		var reply = search + ' can be found at aisle ' + allItems[lowerCaseSearch];
	}
	sendTextMessage(senderID, reply);
}

function createSearchOptions(categories, senderID, search) {
	return categories.map(function(category) {
		var lowerCaseSearch = category.toLowerCase();
		var reply = search + ',' + category;
		return {
			content_type: 'text',
			title: category,
			payload: search + ',' + category
		};
	});
}

function specifySearch(categories, senderID, recipientID, search) {
	var options = createSearchOptions(categories, senderID, search);
	console.log('THESE ARE OPTIONS ', options);
	var messageData = {
		recipient: {
			id: senderID
		},
		message: {
			text: 'We found these options that may match',
			message_type: 'specify',
			quick_replies: options
		}
	};
	helper.callSendAPI(messageData);
}

/*
 * Called when a message is sent to your page.
 *
 */
function processMessageFromPage(event, payload) {
	var senderID = event.sender.id;
	var pageID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log(
		'[processMessageFromPage] user (%d) page (%d) timestamp (%d) and message (%s)',
		senderID,
		pageID,
		timeOfMessage,
		JSON.stringify(message)
	);
	// the 'message' object format can vary depending on the kind of message that was received.
	// See: https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
	var messageText = message.text;

	if (payload) {
		var payloadSplit = payload.split(',');
		var lowerCaseSearch = payloadSplit[1].toLowerCase();
		var reply = payloadSplit[0] + ' ' + payloadSplit[1] + ' can be found at aisle ' + allItems[lowerCaseSearch];
		sendTextMessage(senderID, reply);
	} else if (messageText) {
		console.log('[processMessageFromPage]: %s', messageText);
		var lowerCaseMsg = messageText.toLowerCase();
		if (brands.hasOwnProperty(lowerCaseMsg)) {
			var category = brands[lowerCaseMsg].categories;
			if (category.length === 1) {
				aisleFound(category[0], senderID, messageText);
			} else {
				specifySearch(category, senderID, pageID, messageText);
			}
		} else {
			// otherwise, just echo it back to the sender
			client
				.message(messageText, {})
				.then(data => {
					console.log('data content in product:', data.entities.intent[0]);
					let intent = data.entities.intent[0].value;
					let subject = data.entities.message_subject[0].value;

					console.log('------------------');
					console.log(intent, subject);
					console.log('------------------');

					if (intent === 'find product') {
						if (allItems.hasOwnProperty(subject)) {
							var reply = subject + ' can be found at aisle ' + allItems[subject];
							sendTextMessage(senderID, reply);
						} else {
							var reply =
								"I can't seem to find that item. Let me try to get a target representative to help you!";
              sendTextMessage(senderID, reply);
              emailToMySelf();
              sendTextWithTwilio("A customer cannot find an item. Please click the link below to chat with client");

							//employee.sendEmployeeOptionsAsQuickReplies(senderID);
						}
					} else if (intent === 'show map') {
						map.sendMapOptionsAsQuickReplies(senderID);
					} else if (intent === 'talk to employee') {

            sendTextMessage(senderID, 'A target representative has been notified.');
						//employee.sendEmployeeOptionsAsQuickReplies(senderID);
						emailToMySelf();
            sendTextWithTwilio("A customer would like to speak with you. Please click the link below to chat with client");
					} else if (intent === 'get help') {
						help.sendHelpOptionsAsQuickReplies(senderID);
					} else if (intent === 'top 10' || intent === 'top ten') {
						showTopTen(topTenWords, senderID);
					} else {
						help.sendHelpOptionsAsQuickReplies(senderID);
					}

					// Related to top ten words //////////////////////////////////////
					if (intent !== 'top ten') {
						if (intent === 'find product') {
							if (countWord[subject] === undefined) countWord[subject] = 1;
							else countWord[subject] += 1;
						} else {
							if (countWord[intent] === undefined) countWord[intent] = 1;
							else countWord[intent] += 1;
						}
					}

					topTenWords = Object.keys(countWord).map(key => {
						let val = countWord[key];
						return { word: key, count: val };
					});

					topTenWords.sort((a, b) => {
						return b.count - a.count;
					});
					///////////////////////////////////////////////////////////////
				})
				.catch(err => {
					console.log('err:', err);
					help.sendHelpOptionsAsQuickReplies(senderID);
				});
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
	console.log('[sendTextMessage] %s', JSON.stringify(messageData));
	helper.callSendAPI(messageData);
}

/*
 * Start your server
 */
app.listen(app.get('port'), function() {
	console.log('[app.listen] Node app is running on port', app.get('port'));
});

module.exports = app;
