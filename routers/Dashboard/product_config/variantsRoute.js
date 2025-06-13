const express = require("express");
const { createVariants, getVariants, getVariantsById, updateVariants, deleteVariants } = require("../../../controllers/Dashboard/product_config/variantsController");
const authMiddleware = require("../../../middleware/authToken");
const router = express.Router();

router.post("/addVariants",  createVariants);
router.get("/getVariants", getVariants);
router.get("/getVariantsId/:id", getVariantsById);
router.put("/updateVariants/:id",  updateVariants);
router.delete("/deleteVariants/:id",  deleteVariants);

module.exports = router;
