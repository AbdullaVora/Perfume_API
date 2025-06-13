const express = require('express');
const { createPaymentMethod, getAllPaymentMethods, getPaymentMethodById, updatePaymentMethod, deletePaymentMethod } = require('../../../controllers/Dashboard/website_config/paymentMethodController');
const authMiddleware = require('../../../middleware/authToken');
const router = express.Router();


router.post('/addPaymentMethods',  createPaymentMethod);
router.get('/paymentMethods', getAllPaymentMethods);
router.get('/paymentMethodsById/:id', getPaymentMethodById);
router.put('/updatePaymentMethods/:id',  updatePaymentMethod);
router.delete('/deletePaymentMethods/:id',  deletePaymentMethod);

module.exports = router;