const express = require('express');
const { createPaymentMethod, getAllPaymentMethods, getPaymentMethodById, updatePaymentMethod, deletePaymentMethod } = require('../../../controllers/Dashboard/website_config/paymentMethodController');
const authMiddleware = require('../../../middleware/authToken');
const router = express.Router();


router.post('/addPaymentMethods', authMiddleware, createPaymentMethod);
router.get('/paymentMethods', getAllPaymentMethods);
router.get('/paymentMethodsById/:id', getPaymentMethodById);
router.put('/updatePaymentMethods/:id', authMiddleware, updatePaymentMethod);
router.delete('/deletePaymentMethods/:id', authMiddleware, deletePaymentMethod);

module.exports = router;