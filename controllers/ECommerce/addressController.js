
const mongoose = require('mongoose');
const addressModel = require('../../models/ECommerce/AddressModel');

// @desc    Get address by user ID
// @route   GET /api/address/user/:userId
// @access  Private
const getAddressByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const address = await addressModel.findOne({ userId });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json(address);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new address
// @route   POST /api/address
// @access  Private
const createAddress = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            addressLine1, 
            addressLine2, 
            city, 
            state, 
            zipCode,
            userId
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !addressLine1 || !city || !state || !zipCode || !userId) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        // Check if user already has an address
        const existingAddress = await addressModel.findOne({ userId });
        if (existingAddress) {
            return res.status(400).json({ message: 'User already has an address. Use update instead.' });
        }

        const newAddress = await addressModel.create({
            firstName,
            lastName,
            addressLine1,
            addressLine2: addressLine2 || '',
            city,
            state,
            zipCode,
            userId
        });

        res.status(201).json(newAddress);
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update address
// @route   PUT /api/address/:id
// @access  Private
const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            firstName, 
            lastName, 
            addressLine1, 
            addressLine2, 
            city, 
            state, 
            zipCode
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid address ID' });
        }

        // Validate required fields
        if (!firstName || !lastName || !addressLine1 || !city || !state || !zipCode) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const updatedAddress = await addressModel.findByIdAndUpdate(
            id,
            {
                firstName,
                lastName,
                addressLine1,
                addressLine2: addressLine2 || '',
                city,
                state,
                zipCode
            },
            { new: true, runValidators: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json(updatedAddress);
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete address
// @route   DELETE /api/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid address ID' });
        }

        const deletedAddress = await addressModel.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAddressByUserId,
    createAddress,
    updateAddress,
    deleteAddress
};