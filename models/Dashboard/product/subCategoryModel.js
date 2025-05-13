const mongoose = require("mongoose");

const subCategoriesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Categories", required: true, },
    thumbnail: { type: String },
    updatedAt: { type: Date, default: Date.now },
});

const subCategoriesModel = mongoose.model("Subcategories", subCategoriesSchema);
module.exports = subCategoriesModel;