const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    metaKeywords: { type: String, required: true },
    skuCode: { type: String, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    images: [{ type: String }],
    videos: [{ type: String }],
    thumbnail: { type: String },
    main: { type: String },
    forPage: { type: String, required: true },
    forSection: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Categories" },
    brandCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Categories" },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategories" },
    description: { type: String },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    mainDiscount: { type: Number, default: 0 },
    stockManagement: { type: Boolean },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.ObjectId, ref: "Details" },
    variants: { type: mongoose.Schema.Types.ObjectId, ref: "Variants" },
    additional: { type: mongoose.Schema.Types.ObjectId, ref: "Additional" },
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);