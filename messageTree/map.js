const helper = require('./helper');
/*
 * Send a message with the four Quick Reply buttons
 *
 */
function sendMapOptionsAsQuickReplies(recipientId) {
  console.log("[sendHelpOptionsAsQuickReplies] Sending help options menu");
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Here is the image:",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Find",
          "payload":"FIND"
        },
        {
          "content_type":"text",
          "title":"Show Store Map",
          "payload":"MAP"
        },
        {
          "content_type":"text",
          "title":"Top 10 Searches",
          "payload":"TOPTEN"
        },
        {
          "content_type":"text",
          "title":"Request Employee",
          "payload":"CALL"
        }
      ]
    }
  };
  helper.callSendAPI(messageData);
}

module.exports = {
  sendMapOptionsAsQuickReplies: sendMapOptionsAsQuickReplies
}
