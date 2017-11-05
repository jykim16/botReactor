const helper = require('./helper');
/*
 * Send a message with the four Quick Reply buttons
 *
 */
function sendMapOptionsAsQuickReplies(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'Image',
        payload: { url: 'http://blackfridaymagazine.com/wp-content/uploads/2013/11/1884.jpg' }
      }
    }
  };
  helper.callSendAPI(messageData);
}

module.exports = {
  sendMapOptionsAsQuickReplies: sendMapOptionsAsQuickReplies
}
