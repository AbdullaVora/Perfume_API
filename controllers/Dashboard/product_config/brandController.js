const Brand = require("../../../models/Dashboard/product_config/brandModel");

// Create a new brand
exports.createBrand = async (req, res) => {
  try {
    const brand = await Brand.create(req.body); // Using .create() instead of .save()
    res.status(201).json({ success: true, brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    const formatBrands = brands.map((brand) => ({
      _id: brand._id,
      name: brand.name,
      parent: brand.parent,
      // description: brand.description,
      status: brand.status,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
      isBrand: true,
      isAction: true
    }))
    res.status(200).json(formatBrands);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single brand
exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a brand
exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    res.status(200).json({ success: true, brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    res.status(200).json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
