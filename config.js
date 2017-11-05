'use strict'

const dotenv = require('dotenv');

// Load env variables
dotenv.config()

const config = {
	appSecret: process.env.APP_SECRET,
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  validationToken: process.env.VALIDATION_TOKEN,
  port: process.env.PORT || 5000,
  dashbot: process.env.DASHBOT_API_KEY,
  mailGunApiKey: process.env.MAIL_GUN_API_KEY,
  mailGunDomain: process.env.MAIL_GUN_DOMAIN,
  yourEmail: process.env.YOUR_OWN_EMAIL,
  yourDashBotLiveLink: process.env.YOUR_DASH_BOT_LIVE_LINK,
}

module.exports = config
