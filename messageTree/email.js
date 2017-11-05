const config = require('../config');
const api_key = config.mailGunApiKey;
const domain = config.mailGunDomain;
const email = config.yourEmail;
const dashBotLiveLink = config.yourDashBotLiveLink;
var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

var data = {
  from: 'Mailgun Sandbox <postmaster@sandboxb60c3c16e89b4fa799793afd053b2ba8.mailgun.org>',
  to: email,
  subject: 'Message from Dashbot',
  text: `Customer need your help. Please click the link below to chat with client \n
    ${dashBotLiveLink}`
};

module.exports = function () {
  mailgun.messages().send(data, function (error, body) {
    console.log(body);
  });
}
