const mongoose = require("mongoose");

const detailsSchema = new mongoose.Schema({
    details: [{
        id: { type: String, required: true },
        title: { type: String, required: true },
        value: { type: String, required: true },
    }],
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    updatedAt: { type: Date, default: Date.now },
});

const detailsModel = mongoose.model("Details", detailsSchema);
module.exports = detailsModel;