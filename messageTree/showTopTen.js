const helper = require('./helper');

function showTopTen(topTenWords, recipientId) {

  let str = '';
  for (let i = 0; i < topTenWords.length; i++) {
    str += `${i + 1}. ${topTenWords[i].word} \n`;
    if (i === 9) break;
  }
  if (str === '') str = 'no search has been made';

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: str // utf-8, 640-character max
    }
  };
  helper.callSendAPI(messageData);
}

module.exports = showTopTen;

