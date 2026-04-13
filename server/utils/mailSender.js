const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const mailSender = async (email, title, body) => {
  try {
    const sender = {
      email: process.env.MAIL_USER,
      name: "EduSpace",
    };

    const receivers = [
      {
        email: email,
      },
    ];

    const response = await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: title,
      htmlContent: body,
    });

    console.log("Email sent successfully");
    return response;

  } catch (error) {
    console.error("Brevo Error:", error.response?.text || error.message);
    throw error;
  }
};

module.exports = mailSender;