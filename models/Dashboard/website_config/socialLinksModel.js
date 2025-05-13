const mongoose = require('mongoose');

const SocialLinkSchema = new mongoose.Schema({
    icon: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

SocialLinkSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const SocialLink = mongoose.model('SocialLinks', SocialLinkSchema);

module.exports = SocialLink;