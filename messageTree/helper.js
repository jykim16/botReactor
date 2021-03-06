const request = require('request');
const config = require('../config');
const PAGE_ACCESS_TOKEN = config.pageAccessToken;
const dashbot = require('dashbot')(config.dashbot).facebook;

/*
 * Call the Send API. If the call succeeds, the
 * message id is returned in the response.
 *
 */

function callSendAPI(messageData) {
  delete messageData.message.message_type;
  console.log('callSend: ', messageData)
  var requestData = {
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }
  request(requestData, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      dashbot.logOutgoing(requestData, response.body);
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("[callSendAPI] message id %s sent to recipient %s",
          messageId, recipientId);
      } else {
        console.log("[callSendAPI] called Send API for recipient %s",
          recipientId);
      }
    } else {
      console.error("[callSendAPI] Send API call failed", response.statusCode, response.statusMessage, body.error);
    }
  });
}

module.exports = {
  callSendAPI: callSendAPI
}
