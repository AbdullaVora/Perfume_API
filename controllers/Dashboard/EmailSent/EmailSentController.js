// controllers/emailController.js

const nodemailer = require('nodemailer');
const EmailModal = require('../../../models/Dashboard/EmailSent/EmailSentModal');

// Configure your email transporter (example for Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, text, inquiryId, mobile } = req.body.emailData;
    // console.log("Email data:", to, subject, text, inquiryId);

    // Send email
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to,
      subject,
      text
    };

    const info = await transporter.sendMail(mailOptions);

    // Save to database
    const emailRecord = await EmailModal.create({
      inquiry: inquiryId,
      to,
      subject,
      message: text,
      mobile: mobile,
      status: 'sent',
      messageId: info.messageId
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: emailRecord
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};

exports.getEmails = async (req, res) => {
  try {
    const emails = await EmailModal.find()
    const emailData = emails.map(email => ({
      id: email._id,
      inquiry: email.inquiry,
      to: email.to,
      subject: email.subject,
      message: email.message,
      mobile: email.mobile,
      sentAt: email.createdAt,
      status: email.status,
      isAction: true,
      isEmail: true,
    }));
    res.status(200).json({ emailData, success: true, message: 'Emails fetched successfully' });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emails',
      error: error.message
    });
  }
}
