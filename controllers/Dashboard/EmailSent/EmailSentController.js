// controllers/emailController.js
const EmailModal = require('../../../models/Dashboard/EmailSent/EmailSentModal');
const send = require('../../../utils/email');

const sendEmail = async (req, res) => {
  try {
    const { to, subject, text, inquiryId, mobile } = req.body.emailData;

    const info = await send({ to, subject, text });

    const emailRecord = await EmailModal.create({
      inquiry: inquiryId,
      to,
      subject,
      message: text,
      mobile,
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


const getEmails = async (req, res) => {
  try {
    const emails = await EmailModal.find()
    const emailData = emails.map(email => ({
      id: email._id,
      inquiry: email.inquiry,
      Email: email.to,
      mobile: email.mobile,
      subject: email.subject,
      message: email.message,
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

const updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the email by ID and update its status
    const updatedEmail = await EmailModal.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedEmail) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email updated successfully',
      data: updatedEmail
    });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email',
      error: error.message
    });
  }
}

const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the email by ID and delete it
    const deletedEmail = await EmailModal.findByIdAndDelete(id);

    if (!deletedEmail) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email deleted successfully',
      data: deletedEmail
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete email',
      error: error.message
    });
  }
}

module.exports = {
  sendEmail,
  getEmails,
  updateEmail,
  deleteEmail
};
