const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        forPage: {
            type: String,
            required: true,
        },
        forSection: {
            type: String,
            required: true,
        },
        desktopMedia: {
            type: String,
            required: true,
        },
        mobileMedia: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        relatedTo: {
            type: String,
        },
        category: {
            type: String,
        },
        subcategory: {
            type: String,
        },
        brand: {
            type: String
        },
        status: {
            type: Boolean,
            default: true,
        },
        bannerLink: {
            type: String,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const bannerModel = mongoose.model("banner", bannerSchema);

module.exports = bannerModel;