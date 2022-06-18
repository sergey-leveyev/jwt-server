const nodemailer = require("nodemailer");
require("dotenv").config();

const smtpTransport = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

module.exports.sendActivationMail = async (to, link, password) => {
  let sendResult = await smtpTransport.sendMail({
    from: "sargey7@gmail.com",
    to,
    subject: "Activate an account in " + process.env.API_URL,
    text: "welcom to weolcom we welcom you so place fill wolcom",
    html: `
          <div>
            <h1>To activate the account, click on :</h1>
            <<a href="${link}">${link}</a>
          </div>
          `,
  });

  console.log(sendResult);
};
