
// Create a new banner

const { uploadMedia } = require("../../../helpers/Cloudinary");
const bannerModel = require("../../../models/Dashboard/banner_config/bannerModel");

// Helper to extract public_id from a Cloudinary URL
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const file = parts.pop(); // e.g., banner123.jpg
    const folder = parts.slice(parts.indexOf('upload') + 1).join('/'); // e.g., banners/desktop
    return `${folder}/${file.split('.')[0]}`; // e.g., banners/desktop/banner123
};

// Create a new banner
// exports.createBanner = async (req, res) => {
//     try {
//         const banner = await bannerModel.create(req.body);
//         res.status(201).json({ success: true, data: banner });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

exports.createBanner = async (req, res) => {
    try {
        const { desktopMedia, mobileMedia, ...rest } = req.body;

        // Upload images to Cloudinary
        const desktopMediaUrl = await uploadMedia(desktopMedia, 'banners/desktop');
        const mobileMediaUrl = await uploadMedia(mobileMedia, 'banners/mobile');

        // Build new banner data
        const bannerData = {
            ...rest,
            desktopMedia: desktopMediaUrl,
            mobileMedia: mobileMediaUrl,
        };

        // Store in DB
        const banner = await bannerModel.create(bannerData);

        res.status(201).json(banner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ error: 'Failed to create banner' });
    }
};


// Get all banners
exports.getBanners = async (req, res) => {
    try {
        const banners = await bannerModel.find();
        // Format sliders data
        const formattedBanner = banners.map((banner) => ({
            _id: banner._id,
            name: banner.name,
            desktopMedia: banner.desktopMedia,
            mobileMedia: banner.mobileMedia,
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
// exports.updateBanner = async (req, res) => {
//     try {
//         console.log('Type of body:', typeof req.body);
//         const banner = await bannerModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//         if (!banner) {
//             return res.status(404).json({ success: false, message: "Banner not found" });
//         }
//         res.status(200).json(banner);
//     } catch (error) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// };

exports.updateBanner = async (req, res) => {
    try {
        const { desktopMedia, mobileMedia, ...rest } = req.body;
        const updateData = { ...rest };

        // Handle desktopMedia upload if needed
        if (desktopMedia && desktopMedia.startsWith('data:')) {
            const uploadedDesktop = await uploadMedia(desktopMedia, 'banners/desktop');
            updateData.desktopMedia = uploadedDesktop;
        }

        // Handle mobileMedia upload if needed
        if (mobileMedia && mobileMedia.startsWith('data:')) {
            const uploadedMobile = await uploadMedia(mobileMedia, 'banners/mobile');
            updateData.mobileMedia = uploadedMobile;
        }

        // Perform DB update
        const banner = await bannerModel.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        res.status(200).json(banner);
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};


// Delete a banner by ID
// exports.deleteBanner = async (req, res) => {
//     try {
//         const banner = await bannerModel.findByIdAndDelete(req.params.id);
//         if (!banner) {
//             return res.status(404).json({ success: false, message: "Banner not found" });
//         }
//         res.status(200).json({ success: true, message: "Banner deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


exports.deleteBanner = async (req, res) => {
    try {
        const banner = await bannerModel.findByIdAndDelete(req.params.id);

        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        // Attempt to delete images from Cloudinary
        const publicIdsToDelete = [];

        if (banner.desktopMedia) {
            const publicId = getPublicIdFromUrl(banner.desktopMedia);
            if (publicId) publicIdsToDelete.push(publicId);
        }

        if (banner.mobileMedia) {
            const publicId = getPublicIdFromUrl(banner.mobileMedia);
            if (publicId) publicIdsToDelete.push(publicId);
        }

        // Perform deletion on Cloudinary
        const deletePromises = publicIdsToDelete.map(publicId =>
            cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
        );

        await Promise.all(deletePromises);

        res.status(200).json({ success: true, message: "Banner and associated images deleted successfully" });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};