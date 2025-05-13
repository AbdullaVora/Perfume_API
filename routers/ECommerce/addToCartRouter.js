const express = require('express');
const { addToCart, getCartItems, updateCartItem, removeFromCart, clearCart, allCarts } = require('../../controllers/ECommerce/addToCartController');
const authMiddleware = require('../../middleware/authToken');
const router = express.Router();


router.post('/cart', authMiddleware, addToCart);
router.get('/getCart', allCarts);
router.get('/getCartUser/:userId', authMiddleware, getCartItems);
router.put('/updateCart/:id', authMiddleware, updateCartItem);
router.delete('/removeCart/:id', authMiddleware, removeFromCart);
router.delete('/clear/:userId', authMiddleware, clearCart);

module.exports = router;