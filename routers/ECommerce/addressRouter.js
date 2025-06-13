const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/ECommerce/addressController');

// Get address by user ID
router.get('/user/:userId', addressController.getAddressByUserId);

// Create new address
router.post('/', addressController.createAddress);

// Update address
router.put('/:id', addressController.updateAddress);

// Delete address
router.delete('/:id', addressController.deleteAddress);

module.exports = router;