const config = require('../config');
const dashBotLiveLink = config.yourDashBotLiveLink;

// Twilio Credentials
const accountSid = config.twilioAccountSid;
const authToken = config.twilioAuthToken;

const to = config.twilioToPhoneNum;
const from = config.twilioFromPhoneNum;

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);


module.exports = function () {
  client.messages
    .create({
      // to: '+13143153242',
      // from: '+13143092712',
      to,
      from,
      body: `Customer need your help. Please click the link below to chat with client \n
      ${dashBotLiveLink}`,
    })
    .then((message) => console.log('msg:', message.sid))
    .catch((err) => console.log('err', err));
}
  