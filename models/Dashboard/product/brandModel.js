const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    brandCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Categories", required: true, },
    updatedAt: { type: Date, default: Date.now }
},
    {
        timestamps: true
    }
);

const brandModel = mongoose.model("Brand", brandSchema);
module.exports = brandModel;