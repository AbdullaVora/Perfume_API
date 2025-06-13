const express = require("express");
const router = express.Router();
const { createSlider, getAllSliders, getSliderById, updateSlider, deleteSlider } = require("../../../controllers/Dashboard/banner_config/sliderContoller");
const authMiddleware = require("../../../middleware/authToken");

// Define slider routes
router.post("/addSlider",  createSlider); // Create a new slider
router.get("/sliders", getAllSliders); // Get all sliders
router.get("/slidersById/:id", getSliderById); // Get a slider by ID
router.put("/updateSlider/:id",  updateSlider); // Update a slider by ID
router.delete("/deleteSlider/:id",  deleteSlider); // Delete a slider by ID

module.exports = router;