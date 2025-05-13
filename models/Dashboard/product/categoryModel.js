const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, },
    thumbnail: { type: String },
    updatedAt: { type: Date, default: Date.now },
});

const categoriesModel = mongoose.model("Categories", categoriesSchema);
module.exports = categoriesModel;