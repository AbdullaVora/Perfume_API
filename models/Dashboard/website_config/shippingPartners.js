const mongoose = require('mongoose');

const ShippingPartnerSchema = new mongoose.Schema({
    partnerName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    frontAadharPhoto: {
        type: String,
        required: true,
    },
    backAadharPhoto: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

ShippingPartnerSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const ShippingPartner = mongoose.model('ShippingPartner', ShippingPartnerSchema);

module.exports = ShippingPartner;
