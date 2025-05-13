const mongoose = require('mongoose');

const WhishSchema = new mongoose.Schema({
    userId: {
        type: String, 
    },
    product: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Product',
        required: true
    }
}, { timestamps: true });

const Wish = mongoose.model('Whish', WhishSchema);
module.exports = Wish