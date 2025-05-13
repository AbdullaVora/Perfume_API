const sliderModel = require("../../../models/Dashboard/banner_config/sliderModel");

// Create a new slider
exports.createSlider = async (req, res) => {
    try {
        const slider = new sliderModel(req.body);
        await slider.save();
        res.status(201).json({ success: true, data: slider });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all sliders
exports.getAllSliders = async (req, res) => {
    try {
        const sliders = await sliderModel.find();

        // Format sliders data
        const formattedSliders = sliders.map((slider) => ({
            _id: slider._id,
            name: slider.name,
            image: slider.image,
            relatedTo: slider.relatedTo,
            sliderCategory: slider.category,
            sliderSubcategory: slider.subcategory,
            forPage: slider.forPage,
            forSection: slider.forSection,
            title: slider.title,
            subTitle: slider.subTitle,
            publisherName: slider.publisherName,
            price: slider.price,
            brand: slider.brand,
            sliderLink: slider.sliderLink,
            description: slider.description,
            updatedAt: slider.updatedAt,
            // createdAt: slider.createdAt,
            status: slider.status,
            isAction: true,
            isSlider: true,
        }));

        res.status(200).json(formattedSliders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get a single slider by ID
exports.getSliderById = async (req, res) => {
    try {
        const slider = await sliderModel.findById(req.params.id);
        if (!slider) {
            return res.status(404).json({ success: false, message: "Slider not found" });
        }
        res.status(200).json({ success: true, data: slider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a slider by ID
exports.updateSlider = async (req, res) => {
    try {
        const { name, relatedTo, category, brand, subcategory, forPage, publisherName, forSection, title, subTitle, price, description, status, sliderLink, image } = req.body;

        // Check if the slider exists
        const slider = await sliderModel.findById(req.params.id);
        if (!slider) {
            return res.status(404).json({ success: false, message: "Slider not found" });
        }

        // Check if a slider with the same name already exists (optional)
        if (name && name !== slider.name) {
            const existingSlider = await sliderModel.findOne({ name });
            if (existingSlider) {
                return res.status(400).json({ success: false, message: "Slider name already exists" });
            }
        }

        // Update slider
        slider.name = name || slider.name;
        slider.relatedTo = relatedTo || slider.relatedTo;
        slider.category = category || slider.category;
        slider.subcategory = subcategory || slider.subcategory;
        slider.forPage = forPage || slider.forPage;
        slider.forSection = forSection || slider.forSection;
        slider.title = title || slider.title;
        slider.subTitle = subTitle || slider.subTitle;
        slider.price = price || slider.price;
        slider.description = description || slider.description;
        slider.brand = brand || slider.brand;
        slider.sliderLink = sliderLink || slider.sliderLink;
        slider.publisherName = publisherName || slider.publisherName;
        slider.image = image || slider.image;
        slider.status = status;
        slider.updatedAt = Date.now();

        await slider.save();

        res.status(200).json(slider);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Delete a slider by ID
exports.deleteSlider = async (req, res) => {
    try {
        const slider = await sliderModel.findByIdAndDelete(req.params.id);
        if (!slider) {
            return res.status(404).json({ success: false, message: "Slider not found" });
        }
        res.status(200).json({ success: true, message: "Slider deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
