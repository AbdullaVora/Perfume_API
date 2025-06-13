const express = require('express');
const { createSocialLink, getAllSocialLinks, getSocialLinkById, updateSocialLink, deleteSocialLink } = require('../../../controllers/Dashboard/website_config/socialLinksController');
const authMiddleware = require('../../../middleware/authToken');
const router = express.Router();

router.post('/addSocialLinks',  createSocialLink);
router.get('/sociallinks', getAllSocialLinks);
router.get('/socialLinksById/:id', getSocialLinkById);
router.put('/updateSocialLinks/:id',  updateSocialLink);
router.delete('/deleteSocialLinks/:id',  deleteSocialLink);

module.exports = router;
