const express = require('express');
const router = express.Router();
const { addToWishlist, getUserWishlist, removeFromWishlist, checkWishlistItem, allWhish } = require('../../controllers/ECommerce/addToWhishController');
const authMiddleware = require('../../middleware/authToken');

// Apply auth middleware if needed
// router.use(authMiddleware);

// Add to wishlist
router.post('/wish',  addToWishlist);

// Get user's wishlist
router.get('/getWish', allWhish);

router.get('/getWishUser/:userId',  getUserWishlist);

// Remove from wishlist
router.delete('/deleteWish/:id',  removeFromWishlist);

// Check if product is in wishlist
router.get('/check/:userId/:productId',  checkWishlistItem);

module.exports = router;