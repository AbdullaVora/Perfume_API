const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Brand name is required"],
            trim: true,
            unique: true,
        },
        parent: {
            type: String,
            default: 'N/A', // If no parent, it's a root Brand
        },
        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true, // Auto-generates createdAt & updatedAt fields
    }
);

// Middleware to auto-update `updatedAt` on save
BrandSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Brand = mongoose.model("brandCartesians", BrandSchema);

module.exports = Brand;
