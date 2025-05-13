const express = require("express");
const { createVariants, getVariants, getVariantsById, updateVariants, deleteVariants } = require("../../../controllers/Dashboard/product_config/variantsController");
const authMiddleware = require("../../../middleware/authToken");
const router = express.Router();

router.post("/addVariants", authMiddleware, createVariants);
router.get("/getVariants", getVariants);
router.get("/getVariantsId/:id", getVariantsById);
router.put("/updateVariants/:id", authMiddleware, updateVariants);
router.delete("/deleteVariants/:id", authMiddleware, deleteVariants);

module.exports = router;
