const mongoose = require("mongoose");
const Wish = require("../../models/ECommerce/whishListModel");

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { userId, product } = req.body;

        // Check if the product is already in the user's wishlist
        const existingWish = await Wish.findOne({ userId, product: product });
        if (existingWish) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        const newWish = new Wish({
            userId,
            product: product
        });

        const savedWish = await newWish.save();
        res.status(201).json(savedWish);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's wishlist
exports.getUserWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        const wishes = await Wish.find({ userId }).populate('product');
        res.json(wishes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.allWhish = async (req, res) => {
    try {
        const wish = await Wish.find().populate('product');
        // console.log(wish)
        res.status(200).json(wish)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { id } = req.params;

        const objectId = new mongoose.Types.ObjectId(id);
        const deletedWish = await Wish.findOneAndDelete({ product: objectId });

        if (!deletedWish) {
            return res.status(404).json({ message: 'Wish item not found' });
        }

        res.json({ message: 'Item removed from wishlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if product is in user's wishlist
exports.checkWishlistItem = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const wishItem = await Wish.findOne({ userId, product: productId });

        if (wishItem) {
            return res.json({ isInWishlist: true, wishItem });
        } else {
            return res.json({ isInWishlist: false });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};