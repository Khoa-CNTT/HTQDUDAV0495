const SibApiV3Sdk = require('sib-api-v3-sdk');

// Initialize the Brevo API client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';

// Email configuration
const emailConfig = {
  defaultSender: {
    email: 'nhatanhkof@gmail.com',
    name: 'Quiz Web Admin'
  },
  apiInstance: new SibApiV3Sdk.TransactionalEmailsApi(),
  // Link expiry times (in milliseconds)
  tokenExpiry: {
    verification: 24 * 60 * 60 * 1000, // 24 hours
    passwordReset: 60 * 60 * 1000 // 1 hour
  }
};

module.exports = emailConfig; 