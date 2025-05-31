const express = require('express');
const { createShippingPartner, getAllShippingPartners, getShippingPartnerById, updateShippingPartner, deleteShippingPartner, upload } = require('../../../controllers/Dashboard/website_config/shippingPartnerContoller');
const authMiddleware = require('../../../middleware/authToken');
const router = express.Router();


router.post('/addShippingPartners', upload.fields([
    { name: 'frontAadharPhoto', maxCount: 1 },
    { name: 'backAadharPhoto', maxCount: 1 }
]), createShippingPartner);
router.get('/shippingPartners', getAllShippingPartners);
router.get('/shippingPartnersById/:id', getShippingPartnerById);
router.put('/updateShippingPartners/:id', updateShippingPartner);
router.delete('/deleteShippingPartners/:id', deleteShippingPartner);

module.exports = router;
