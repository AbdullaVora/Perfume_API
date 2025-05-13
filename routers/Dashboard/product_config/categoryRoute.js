const express = require("express");
const { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } = require("../../../controllers/Dashboard/product_config/categoryController");
const authMiddleware = require("../../../middleware/authToken");
const router = express.Router();

router.post("/addCategories", authMiddleware, createCategory);
router.get("/getCategories", getCategories);
router.get("/getCategoriesId/:id", getCategoryById);
router.put("/updateCategories/:id", authMiddleware, updateCategory);
router.delete("/deleteCategories/:id", authMiddleware, deleteCategory);

module.exports = router;
