const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
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
        // sliderLink: {
        //     type: String,
        //     required: true,
        // },
        description: {
            type: String,
        },
        title: {
            type: String,
        },
        price: {
            type: String,
        },
        subTitle: {
            type: String,
        },
        forPage: {
            type: String,
            required: true,
        },
        forSection: {
            type: String,
            required: true,
        },
        publisherName: {
            type: String
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const sliderModel = mongoose.model("Slider", sliderSchema);

module.exports = sliderModel;