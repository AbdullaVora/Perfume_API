const couponModel = require("../../../models/Dashboard/banner_config/couponModel");

// Create a new coupon
exports.createCoupon = async (req, res) => {
    try {
        console.log(req.body);
        const coupon = await couponModel.create(req.body);
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find();

        const formattedCoupons = coupons.map((coupon) => ({
            _id: coupon._id,
            name: coupon.name,
            Type: coupon.type,
            Value: coupon.value,
            minAmount: coupon.min_amount,
            dateDetail: coupon.dateDetail,
            timeDetail: coupon.timeDetail || null,
            daysActive: coupon.daysActive,
            // maxUsage: coupon.maxUsage,
            updatedAt: coupon.updatedAt,
            status: coupon.status, // Default status if not provided
            isAction: true,
            isCoupon: true,
        }));

        res.status(200).json(formattedCoupons);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get a single coupon by ID
exports.getCouponById = async (req, res) => {
    try {
        const coupon = await couponModel.findById(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a coupon
exports.updateCoupon = async (req, res) => {
    try {
        console.log(req.params.id)
        console.log(req.body)
        const coupon = await couponModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return updated document
            runValidators: true, // Ensure validations are run
        });
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.status(200).json(coupon);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await couponModel.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.status(200).json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
