const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();


// Product controller
const { getAllProducts, getProductById, getProductBySlug, updateProduct, deleteProduct, createProduct } = require('../../../controllers/Dashboard/product/productContoller');
const authMiddleware = require('../../../middleware/authToken');


// Public routes - added directly to the server
router.post('/addProduct',  createProduct)
router.get('/products', getAllProducts);
router.put('/updateProduct/:id', updateProduct);
router.get('/IdpProduct/:id', getProductById);
router.get('/api/product/slug/:slug', getProductBySlug);
router.delete('/deleteProduct/:id', deleteProduct);

module.exports = router;