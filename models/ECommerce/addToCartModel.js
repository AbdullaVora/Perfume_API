const mongoose = require('mongoose');

const VariantDataSchema = new mongoose.Schema({
    label: String,
    value: String
}, { _id: false });

const VariantSchema = new mongoose.Schema({
    id: String,
    data: [VariantDataSchema]
}, { _id: false });

const CartSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    variant: {
        type: VariantSchema,
        default: null
    },

}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart