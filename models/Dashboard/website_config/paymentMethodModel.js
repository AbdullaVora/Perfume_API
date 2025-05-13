const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
    paymentMethod: {
        type: String,
        required: true
    },
    paymentMode: {
        type: String,
        enum: ['test', 'live'],
        required: true
    },
    testKey: {
        type: String,
        required: function () { return this.mode === 'test'; },
        default: "----"
    },
    liveKey: {
        type: String,
        required: function () { return this.mode === 'live'; },
        default: "----"
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

PaymentMethodSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const PaymentMethod = mongoose.model('PaymentMethod', PaymentMethodSchema);

module.exports = PaymentMethod;