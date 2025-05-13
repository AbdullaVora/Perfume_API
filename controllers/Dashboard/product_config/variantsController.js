const Variants = require("../../../models/Dashboard/product_config/variantsModel");

// ✅ Create a new Variants


exports.createVariants = async (req, res) => {
    console.log("Received Data:", req.body);

    try {
        const { name, parent } = req.body;

        // Validate input
        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Variant name is required" });
        }

        // Check if Variant name already exists
        const existingVariant = await Variants.findOne({ name });
        if (existingVariant) {
            return res.status(400).json({ message: "Variant name already exists" });
        }

        // Default parent Variant to "N/A" if not provided
        const parentVariant = parent && parent.trim() !== "" ? parent : "N/A";

        // Create Variant
        const newVariant = await Variants.create({
            name,
            parent: parentVariant,
        });

        res.status(201).json({ message: "Variant created successfully", variant: newVariant });
    } catch (error) {
        console.error("Error creating Variant:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ✅ Get all Variants (optionally filter by parent)
exports.getVariants = async (req, res) => {
    try {
        const parentFilter = req.query.parent ? { parent: req.query.parent } : {};
        const variants = await Variants.find(parentFilter);  // Use lowercase variable name

        const formattedVariants = variants.map((variant, index) => ({
            _id: variant._id,
            name: variant.name,
            parent: variant.parent,
            updatedAt: variant.updatedAt,
            createdAt: variant.createdAt,
            isAction: true,
            isVariant: true,
            status: variant.status
        }));

        res.status(200).json(formattedVariants);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// ✅ Get a single Variants by ID
exports.getVariantsById = async (req, res) => {
    try {
        const Variants = await Variants.findById(req.params.id);
        if (!Variants) {
            return res.status(404).json({ message: "Variants not found" });
        }

        res.status(200).json(Variants);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ Update a Variants
exports.updateVariants = async (req, res) => {
    try {
        const { name, parent, status } = req.body;

        // Check if Variants exists
        const variant = await Variants.findById(req.params.id);
        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }

        // Check if new name already exists
        if (name && name !== variant.name) {
            const existingVariant = await Variants.findOne({ name });
            if (existingVariant) {
                return res.status(400).json({ message: "Variant name already exists" });
            }
        }

        // Update Variants
        const updatedVariant = await Variants.findByIdAndUpdate(
            req.params.id,
            { name, parent: parent || null, status, updatedAt: Date.now() },
            { new: true } // Return updated document
        );

        res.status(200).json({ message: "Variant updated successfully", variant: updatedVariant });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// ✅ Delete a Variants
exports.deleteVariants = async (req, res) => {
    try {
        const variant = await Variants.findById(req.params.id); // Rename retrieved document
        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }

        await variant.deleteOne(); // Use the retrieved document to delete

        res.status(200).json({ message: "Variant deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};