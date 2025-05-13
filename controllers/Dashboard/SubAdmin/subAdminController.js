const User = require('../../../models/auth/userModel');
const subAdminModel = require('../../../models/Dashboard/SubAdmin/subAdmiModel');
const CryptoJS = require('crypto-js');

// Create a new sub-admin

exports.createSubAdmin = async (req, res) => {
    try {
        const subAdminData = req.body;

        // Check if a sub-admin with the same email already exists
        const existingSubAdmin = await subAdminModel.findOne({ email: subAdminData.email });
        if (existingSubAdmin) {
            return res.status(400).json({ message: 'Sub-admin with this email already exists' });
        }

        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email: subAdminData.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Encrypt the password
        const encryptedPassword = CryptoJS.AES.encrypt(subAdminData.password, process.env.SECRET_KEY).toString();

        // Store data in the User model
        const user = new User({
            name: subAdminData.name,
            email: subAdminData.email,
            mobile: subAdminData.mobile,
            password: encryptedPassword,
            role: 'sub-admin' // Optional: Add a role field if applicable
        });
        await user.save();

        // Store all data in the SubAdmin model
        const subAdmin = new subAdminModel(subAdminData);
        await subAdmin.save();

        res.status(201).json({
            message: 'Sub-admin created successfully',
            subAdmin,
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating sub-admin', error: error.message });
    }
};

// Get all sub-admins
exports.getAllSubAdmins = async (req, res) => {
    try {
        const subAdmins = await subAdminModel.find();
        res.status(200).json({
            message: 'Sub-admins retrieved successfully',
            data: subAdmins
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving sub-admins', error: error.message });
    }
};

// Get a single sub-admin by ID
exports.getSubAdminById = async (req, res) => {
    try {
        const subAdmin = await subAdminModel.findById(req.params.id).select('-password');

        if (!subAdmin) {
            return res.status(404).json({ message: 'Sub-admin not found' });
        }

        res.status(200).json({
            message: 'Sub-admin retrieved successfully',
            data: subAdmin
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving sub-admin', error: error.message });
    }
};

// Update a sub-admin
exports.updateSubAdmin = async (req, res) => {
    try {
        const updates = req.body;
        const subAdmin = await subAdminModel.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!subAdmin) {
            return res.status(404).json({ message: 'Sub-admin not found' });
        }

        res.status(200).json({
            message: 'Sub-admin updated successfully',
            data: subAdmin
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating sub-admin', error: error.message });
    }
};

// Delete a sub-admin
exports.deleteSubAdmin = async (req, res) => {
    try {
        const subAdmin = await subAdminModel.findByIdAndDelete(req.params.id);

        if (!subAdmin) {
            return res.status(404).json({ message: 'Sub-admin not found' });
        }

        const deleteFromUserData = await User.findById({ email: subAdmin.email });
        if (deleteFromUserData) {
            await User.findByIdAndDelete(deleteFromUserData._id);
        }

        res.status(200).json({
            message: 'Sub-admin deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting sub-admin', error: error.message });
    }
};

// Login sub-admin
exports.loginSubAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const subAdmin = await subAdminModel.findOne({ email });

        if (!subAdmin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await subAdminModel.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Remove password from response
        subAdmin.password = undefined;

        res.status(200).json({
            message: 'Login successful',
            data: subAdmin
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};