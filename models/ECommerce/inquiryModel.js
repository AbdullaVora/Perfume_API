const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/.+\@.+\..+/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        minlength: [50, 'Message should be at least 50 characters long']
    },
    status: {
        type: String,
        enum: ['new', 'process', 'resolved'],
        default: 'new'
    },
    isAction: {
        type: Boolean,
        default: true
    },
    isInquiry: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);