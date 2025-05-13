const Category = require("../../../models/Dashboard/product_config/categoryModel");

// ✅ Create a new category
exports.createCategory = async (req, res) => {
    console.log("Received Data:", req.body); // Debugging log

    try {
        const { name, parent } = req.body;

        // Validate input
        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Check if category name already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category name already exists" });
        }

        // Default parent category to "N/A" if not provided
        const parentCategory = parent && parent.trim() !== "" ? parent : "N/A";

        // Create category
        const category = await Category.create({
            name,
            parent: parentCategory,
        });

        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        console.error("Error creating category:", error); // Debugging log
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Get all categories (optionally filter by parent)
exports.getCategories = async (req, res) => {
    try {
        const parentFilter = req.query.parent ? { parent: req.query.parent } : {};
        const categories = await Category.find(parentFilter);

        const formattedCategories = categories.map((category, index) => ({
            // id: index + 1, // Replace ObjectId with an index-based ID
            _id: category._id,
            name: category.name,
            parent: category.parent,
            updatedAt: category.updatedAt,
            createdAt: category.createdAt,
            isAction: true,
            isCategory: true,
            status: category.status
        }));

        res.status(200).json(formattedCategories);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Get a single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Update a category
exports.updateCategory = async (req, res) => {
    try {
        const { name, parent, status } = req.body;
        console.log(status)

        // Check if category exists
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Check if new name already exists
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ message: "Category name already exists" });
            }
        }

        // Update category
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, parent: parent || null, status, updatedAt: Date.now() },
            { new: true } // Return updated document
        );

        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        await Category.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
