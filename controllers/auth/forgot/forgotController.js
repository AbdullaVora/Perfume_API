const nodemailer = require("nodemailer");
const CryptoJS = require('crypto-js');
const User = require("../../../models/auth/userModel");
let checkOtp;

const checkEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!password) {
            checkOtp = generateOTP();
            await sendOTP(email, checkOtp); // Send OTP to the user's email
            return res.status(200).json({ message: "OTP sent to email", email });
        }

        const response = await User.findOne({ email });
        if (response) {
            const decryptedPassword = CryptoJS.AES.decrypt(response.password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

            if (decryptedPassword !== password) {
                return res.status(401).json({ message: 'Invalid credentials' });
            } else {
                return res.status(200).json({ message: "credentials matched", email });
            }

        } else {
            return res.status(404).json({ message: "Email not found" });
        }

    } catch (error) {
        console.error("Error in checkEmail:", error);
        res.status(500).json({ message: error.message });
    }
}

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

const sendOTP = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", // Use your email service provider
            auth: {
                user: "blackmask8866@gmail.com", // Replace with your email
                pass: "lrfv rpou ostm qvgu"
            }
        });

        const mailOptions = {
            from: "FurStore@gmail.com", // Replace with your email
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It is valid for 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
    } catch (error) {
        console.error("Error in sendOTP:", error);
        throw new Error("Failed to send OTP");
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }
        if (checkOtp === otp) {
            return res.status(200).json({ message: "OTP verified successfully" });
        }
        return res.status(400).json({ message: "Invalid OTP" });
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ message: error.message });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and new password are required" });
        }

        const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString();

        const response = await User.findOneAndUpdate({ email }, { password: encryptedPassword }, { new: true });
        if (response) {
            return res.status(200).json({ message: "Password reset successfully" });
        } else {
            return res.status(404).json({ message: "Email not found" });
        }
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { checkEmail, verifyOtp, resetPassword };