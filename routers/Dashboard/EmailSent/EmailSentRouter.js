const express = require("express");
const { sendEmail, getEmails, deleteEmail } = require("../../../controllers/Dashboard/EmailSent/EmailSentController");


// Set up the router
const router = express.Router();

router.post("/addInquiryEmail", sendEmail);
router.get("/getInquiryEmails", getEmails);
// router.get("/getInquiryEmails", getBanners);
// router.get("/getInquiryEmailById/:id", getBannerById);
// router.put("/updateInquiryEmail/:id",  updateBanner);
router.delete("/deleteInquiryEmail/:id", deleteEmail);

module.exports = router;
