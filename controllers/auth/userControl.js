const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');
const User = require('../../models/auth/userModel');
const jwt = require('jsonwebtoken');
const { login, register, profileValidation, updateUserValidation } = require('../../helpers/JoiValidation');

dotenv.config();

const loginUser = async (req, res) => {
    try {
        // console.log(req.body)
        const { error } = login.validate(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, mobile, password } = req.body;

        if (!email && !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Check if at least one identifier is provided
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Build the query based on provided identifier
        const query = email ? { email } : { mobile };
        // console.log(query);
        // Check if user exists
        const user = await User.findOne(query);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Decrypt stored password
        const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

        if (decryptedPassword !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: "24h" });

        res.status(200).json({ message: 'Login successful', token, name: user.name, id: user._id, email: user.email, mobile: user.mobile });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const registerUser = async (req, res) => {
    try {

        const { error } = register.validate(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { name, email, mobile, password } = req.body;

        // Build the query based on provided identifier
        const query = email ? { email } : { mobile };

        if (!email && !password && !mobile && name) {
            return res.status(400).json({ message: "All Fileds Are Required" });
        }

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        if (!mobile) {
            return res.status(400).json({ message: 'Mobile is required' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Check if at least one identifier is provided
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne(query);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Encrypt password
        const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString();

        // Create new user
        const newUser = new User({
            name,
            mobile,
            email,
            password: encryptedPassword
        });

        // Save user to database
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.SECRET_KEY, { expiresIn: "24h" });

        // Send response with token and email
        res.status(200).json({ message: "User registered successfully", name, token, id: newUser._id, email: newUser.email });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        const formatData = users.map((user) => ({
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            role: user.role,
            password: user.password,
            createdAt: user.createdAt,
            isAction: user.isAction || true,
            isUser: user.isUser || true,
            status: user.status
        }))
        if (!users) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json(formatData);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

const updateUsers = async (req, res) => {
    try {
        const { id } = req.params
        const { name, mobile, email, status } = req.body
        // const { error } = updateUserValidation.validate({ name, email, phone });
        // if (error) {
        //     return res.status(400).json({ message: error.details[0].message });
        // }
        console.log(req.body)
        // const { name, email, mobile } = req.body
        let users
        if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
            users = await User.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
        } else {
            users = await User.findByIdAndUpdate(id, { name: name, email: email, mobile: mobile }, { new: true });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUsers = async (req, res) => {
    try {
        const { id } = req.params
        const users = await User.findByIdAndDelete(id);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

module.exports = { loginUser, registerUser, getUsers, updateUsers, deleteUsers };
