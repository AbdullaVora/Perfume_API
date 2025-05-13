const mongoose = require("mongoose");

const additionalSchema = new mongoose.Schema({
    additional: [{
        id: { type: String, required: true },
        title: { type: String, required: true },
        value: { type: String, required: true },
    }],
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    updatedAt: { type: Date, default: Date.now },
});

const additionalModel = mongoose.model("Additional", additionalSchema);
module.exports = additionalModel;