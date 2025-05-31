const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    inquiry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inquiry',
        required: true
    },
    to: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent'
    },
    messageId: {
        type: String
    }
}, { timestamps: true });

const EmailModal = mongoose.model('Email', emailSchema);
module.exports = EmailModal;
