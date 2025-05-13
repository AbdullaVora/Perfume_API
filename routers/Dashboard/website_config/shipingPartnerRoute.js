const express = require('express');
const { createShippingPartner, getAllShippingPartners, getShippingPartnerById, updateShippingPartner, deleteShippingPartner } = require('../../../controllers/Dashboard/website_config/shippingPartnerContoller');
const authMiddleware = require('../../../middleware/authToken');
const router = express.Router();


router.post('/addShippingPartners', authMiddleware, createShippingPartner);
router.get('/shippingPartners', getAllShippingPartners);
router.get('/shippingPartnersById/:id', getShippingPartnerById);
router.put('/updateShippingPartners/:id', authMiddleware, updateShippingPartner);
router.delete('/deleteShippingPartners/:id', authMiddleware, deleteShippingPartner);

module.exports = router;
