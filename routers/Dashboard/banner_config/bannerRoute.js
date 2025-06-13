const express = require("express");
const mongoose = require("mongoose");
const { createBanner, getBanners, getBannerById, updateBanner, deleteBanner } = require("../../../controllers/Dashboard/banner_config/bannerContoller");
const authMiddleware = require("../../../middleware/authToken");

// Set up the router
const router = express.Router();

router.post("/addBanner",  createBanner);
router.get("/banners", getBanners);
router.get("/bannerById/:id", getBannerById);
router.put("/updateBanner/:id",  updateBanner);
router.delete("/deleteBanner/:id", deleteBanner);

module.exports = router;
