
// Create a new banner

const { uploadImage } = require("../../../helpers/Cloudinary");
const bannerModel = require("../../../models/Dashboard/banner_config/bannerModel");

// Create a new banner
exports.createBanner = async (req, res) => {
    try {
        const banner = await bannerModel.create(req.body);
        res.status(201).json({ success: true, data: banner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// exports.createBanner = async (req, res) => {
//     try {
//         const { desktopImage, mobileImage, ...rest } = req.body;

//         // First, create the banner without the image URLs
//         const banner = await bannerModel.create(rest);

//         // Then, upload the images in parallel
//         const [uploadedThumbnail, uploadedMain] = await Promise.all([
//             uploadImage(desktopImage),
//             uploadImage(mobileImage),
//         ]);

//         // Update the banner with uploaded image URLs
//         banner.desktopImage = uploadedThumbnail;
//         banner.mobileImage = uploadedMain;
//         await banner.save();

//         res.status(201).json({ success: true, data: banner });
//     } catch (error) {
//         console.error('Banner creation error:', error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


// Get all banners
exports.getBanners = async (req, res) => {
    try {
        const banners = await bannerModel.find();
        // Format sliders data
        const formattedBanner = banners.map((banner) => ({
            _id: banner._id,
            name: banner.name,
            desktopImage: banner.desktopImage,
            mobileImage: banner.mobileImage,
            forPage: banner.forPage,
            forSection: banner.forSection,
            relatedTo: banner.relatedTo,
            bannerCategory: banner.category,
            bannerSubcategory: banner.subcategory,
            description: banner.description || '',
            brand: banner.brand,
            // bannerLink: banner.bannerLink,
            updatedAt: banner.updatedAt,
            // createdAt: slider.createdAt,
            status: banner.status,
            isAction: true,
            isBanner: true,
        }));

        res.status(200).json(formattedBanner);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single banner by ID
exports.getBannerById = async (req, res) => {
    try {
        const banner = await bannerModel.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }
        res.status(200).json({ success: true, data: banner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a banner by ID
exports.updateBanner = async (req, res) => {
    try {
        console.log('Type of body:', typeof req.body);
        const banner = await bannerModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }
        res.status(200).json(banner);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// exports.updateBanner = async (req, res) => {
//     try {
//         const { desktopImage, mobileImage, ...rest } = req.body;

//         const banner = await bannerModel.findById(req.params.id);
//         if (!banner) {
//             return res.status(404).json({ success: false, message: "Banner not found" });
//         }

//         // Handle image uploads if they are provided
//         if (desktopImage) {
//             banner.desktopImage = await uploadImage(desktopImage);
//         }
//         if (mobileImage) {
//             banner.mobileImage = await uploadImage(mobileImage);
//         }

//         // Update other fields
//         Object.assign(banner, rest);
//         await banner.save();

//         res.status(200).json({ success: true, data: banner });
//     } catch (error) {
//         console.error('Banner update error:', error);
//         res.status(400).json({ success: false, message: error.message });
//     }
// };


// Delete a banner by ID
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await bannerModel.findByIdAndDelete(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }
        res.status(200).json({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
