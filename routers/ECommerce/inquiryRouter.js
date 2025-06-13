const express = require('express');
const { createInquiry, getInquiries, getInquiry, updateInquiryStatus, deleteInquiry } = require('../../controllers/ECommerce/inquiryController');
const authMiddleware = require('../../middleware/authToken');

const router = express.Router();

// E-commerce inquiry endpoint
router.post('/inquiry',  createInquiry);

// Admin routes (protected)
router.get('/inquiries', getInquiries);
router.get('/inquiries/:id', getInquiry);
router.put('/inquiriyStatus/:id',  updateInquiryStatus);
router.delete('/deleteInquiry/:id',  deleteInquiry)

module.exports = router;