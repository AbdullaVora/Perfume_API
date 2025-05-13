const express = require('express');
const router = express.Router();
const { addToWishlist, getUserWishlist, removeFromWishlist, checkWishlistItem, allWhish } = require('../../controllers/ECommerce/addToWhishController');
const authMiddleware = require('../../middleware/authToken');

// Apply auth middleware if needed
// router.use(authMiddleware);

// Add to wishlist
router.post('/wish', authMiddleware, addToWishlist);

// Get user's wishlist
router.get('/getWish', allWhish);

router.get('/getWishUser/:userId', authMiddleware, getUserWishlist);

// Remove from wishlist
router.delete('/deleteWish/:id', authMiddleware, removeFromWishlist);

// Check if product is in wishlist
router.get('/check/:userId/:productId', authMiddleware, checkWishlistItem);

module.exports = router;