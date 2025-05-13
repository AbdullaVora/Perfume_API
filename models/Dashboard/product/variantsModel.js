const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    variants: [{
        id: { type: String },
        data: [{
            label: { type: String },
            value: { type: String },
            _id: false
        }],
        _id: false,
        mrp: { type: Number },
        price: { type: Number },
        stock: { type: Number },
    }],
    updatedAt: { type: Date, default: Date.now },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "" }
})

const variantsModel = mongoose.model('Variants', variantSchema);
module.exports = variantsModel;