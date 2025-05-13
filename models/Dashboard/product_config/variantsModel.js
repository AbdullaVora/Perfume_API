const mongoose = require("mongoose");

const VariantsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Variants name is required"],
            trim: true,
            unique: true,
        },
        parent: {
            type: String,
            default: 'N/A', // If no parent, it's a root Variants
        },
        status: {
            type: Boolean,
            default: true
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Auto-generates createdAt & updatedAt fields
    }
);

// Middleware to auto-update `updatedAt` on save
VariantsSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Variants = mongoose.model("variantsCartesians", VariantsSchema);

module.exports = Variants;
