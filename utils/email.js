const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const send = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to,
    subject,
    text,
    html,
  });
};

module.exports = send;
