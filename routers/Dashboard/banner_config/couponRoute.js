const express = require("express");
const router = express.Router();
const { createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon } = require("../../../controllers/Dashboard/banner_config/couponController");
const authMiddleware = require("../../../middleware/authToken");

// Routes for coupon CRUD operations
router.post("/addCoupon", authMiddleware, createCoupon);
router.get("/coupons", getAllCoupons);
router.get("/couponsById/:id", getCouponById);
router.put("/updateCoupon/:id", authMiddleware, updateCoupon);
router.delete("/deleteCoupon/:id", authMiddleware, deleteCoupon);

module.exports = router;
