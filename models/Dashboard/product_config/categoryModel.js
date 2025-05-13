const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            unique: true,
        },
        parent: {
            type: String,
            default: 'N/A', // If no parent, it's a root category
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
CategorySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Category = mongoose.model("categoriesCartesians", CategorySchema);

module.exports = Category;
