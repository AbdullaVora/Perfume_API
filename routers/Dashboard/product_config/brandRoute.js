const express = require("express");
const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} = require("../../../controllers/Dashboard/product_config/brandController");

const router = express.Router();

router.post("/addBrand", createBrand);
router.get("/brands", getBrands);
router.get("//brandById:id", getBrand);
router.put("/updateBrand/:id", updateBrand);
router.delete("/deleteBrand/:id", deleteBrand);

module.exports = router;
