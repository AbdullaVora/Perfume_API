const Cart = require("../../models/ECommerce/addToCartModel");
const mongoose = require('mongoose');

// Add item to cart

exports.addToCart = async (req, res) => {
    try {
        console.log("triger")
        console.log(req.body);
        const { userId, product, quantity, variant } = req.body;
        

        // Check if item already exists in cart with the same variant
        let query = { userId, product: product };

        // Add variant check to query if it exists
        if (variant) {
            query['variant.data'] = { $exists: true };
        } else {
            // If no variant provided, find items without variants
            query.variant = null;
        }

        let cartItem = await Cart.findOne(query);

        // If variant exists, further verify that it's the exact same variant
        if (cartItem && variant) {
            const cartVariantKey = cartItem.variant?.data
                ? cartItem.variant.data.map(v => `${v.label}:${v.value}`).sort().join('|')
                : '';

            const newVariantKey = variant.data
                ? variant.data.map(v => `${v.label}:${v.value}`).sort().join('|')
                : '';

            // If variants don't match, treat as new item
            if (cartVariantKey !== newVariantKey) {
                cartItem = null;
            }
        }


        cartItem = await Cart.create({
            userId,
            product: new mongoose.Types.ObjectId(product),
            quantity,
            variant,
        });
        // if (cartItem) {
        //     // Update existing item
        //     cartItem.quantity += quantity;
        //     await cartItem.save();
        // } else {
        //     // Create new cart item using create() instead of save()
        // }
        const finalCart = await Cart.findById(cartItem._id).populate('product');
        res.status(200).json(finalCart);

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
    }
};
// Get all cart items for a user
exports.getCartItems = async (req, res) => {
    try {
        const { userId } = req.params;

        const cartItems = await Cart.find({ userId }).populate('product')
            .sort({ createdAt: -1 });

        res.status(200).json(cartItems);
    } catch (error) {
        console.error('Get cart items error:', error);
        res.status(500).json({ message: 'Failed to fetch cart items', error: error.message });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.params, req.body)
        const { quantity } = req.body;

        const cartItem = await Cart.findById(id);

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        const finalCart = await Cart.findById(cartItem._id).populate('product');
        res.status(200).json(finalCart);
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({ message: 'Failed to update cart item', error: error.message });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await Cart.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

        await Cart.deleteMany({ userId });

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ message: 'Failed to clear cart', error: error.message });
    }
};

exports.allCarts = async (req, res) => {
    try {
        const cart = await Cart.find().populate('product');
        // console.log(cart)
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get all carts', error: error.message })
    }
}