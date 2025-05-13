const express = require("express")
const router = express.Router()
const { checkEmail, verifyOtp, resetPassword } = require("../../controllers/auth/forgot/forgotController");

router.post("/forgot", checkEmail);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;