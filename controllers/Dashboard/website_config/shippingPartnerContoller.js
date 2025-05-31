const ShippingPartner = require("../../../models/Dashboard/website_config/shippingPartners");
const path = require('path');
const fs = require('fs');
const multer = require('multer');


// Create a new shipping partner
// const createShippingPartner = async (req, res) => {
//     try {
//         const shippingPartner = new ShippingPartner(req.body);
//         await shippingPartner.save();
//         res.status(201).json(shippingPartner);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

// Helper function to handle file upload


// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use absolute path from project root
        const uploadPath = path.resolve('uploads/shipping-partners');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
            console.log('Created upload directory:', uploadPath);
        }

        console.log('Upload destination:', uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
        console.log('Generated filename:', uniqueName);
        cb(null, uniqueName);
    }
});




// const createShippingPartner = async (req, res) => {
//     try {
//         const { partnerName, contactNumber, vehicleNumber } = req.body;
//         console.log("Request body:", req.body);
//         const baseUrl = `${req.protocol}://${req.get('host')}/uploads/shipping-partners/`;

//         const frontAadharPhoto = req.files?.frontAadharPhoto?.[0]?.filename || null;
//         const backAadharPhoto = req.files?.backAadharPhoto?.[0]?.filename || null;

//         const shippingPartnerData = {
//             partnerName,
//             contactNumber,
//             vehicleNumber,
//             frontAadharPhoto: frontAadharPhoto ? baseUrl + frontAadharPhoto : null,
//             backAadharPhoto: backAadharPhoto ? baseUrl + backAadharPhoto : null
//         };

//         const shippingPartner = new ShippingPartner(shippingPartnerData);
//         await shippingPartner.save();
//         res.status(201).json(shippingPartner);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };


// Get all shipping partners

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('File received:', file.originalname, 'Type:', file.mimetype);

        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});


const createShippingPartner = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Files received:', req.files);

        const { partnerName, contactNumber, vehicleNumber } = req.body;

        // Validate required fields
        if (!partnerName || !contactNumber) {
            return res.status(400).json({
                error: 'Partner name and contact number are required'
            });
        }

        // Use relative path for storage in DB
        const basePath = '/uploads/shipping-partners/';

        const shippingPartnerData = {
            partnerName,
            contactNumber,
            vehicleNumber,
            frontAadharPhoto: req.files?.frontAadharPhoto?.[0]
                ? basePath + req.files.frontAadharPhoto[0].filename
                : null,
            backAadharPhoto: req.files?.backAadharPhoto?.[0]
                ? basePath + req.files.backAadharPhoto[0].filename
                : null
        };

        console.log('Shipping partner data:', shippingPartnerData);

        const shippingPartner = new ShippingPartner(shippingPartnerData);
        await shippingPartner.save();

        // Return response with full URLs
        const response = shippingPartner.toObject();
        if (response.frontAadharPhoto) {
            response.frontAadharPhoto = `${req.protocol}://${req.get('host')}${response.frontAadharPhoto}`;
        }
        if (response.backAadharPhoto) {
            response.backAadharPhoto = `${req.protocol}://${req.get('host')}${response.backAadharPhoto}`;
        }

        console.log('Shipping partner created successfully:', response._id);
        res.status(201).json(response);

    } catch (error) {
        console.error('Error creating shipping partner:', error);

        // Clean up uploaded files if database save fails
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                    console.log('Cleaned up file:', file.path);
                }
            });
        }

        res.status(400).json({
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getAllShippingPartners = async (req, res) => {
    try {
        const shippingPartners = await ShippingPartner.find();
        const formatShipping = shippingPartners.map((shipping) => ({
            _id: shipping._id,
            partnerName: shipping.partnerName,
            contactNumber: shipping.contactNumber,
            vehicleNumber: shipping.vehicleNumber,
            frontAadharPhoto: shipping.frontAadharPhoto,
            backAadharPhoto: shipping.backAadharPhoto,
            status: shipping.status,
            updatedAt: shipping.updatedAt,
            isAction: true,
            isShippingPartner: true

        }))
        res.status(200).json(formatShipping);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single shipping partner by ID
const getShippingPartnerById = async (req, res) => {
    try {
        const shippingPartner = await ShippingPartner.findById(req.params.id);
        if (!shippingPartner) {
            return res.status(404).json({ message: 'Shipping partner not found' });
        }
        res.status(200).json(shippingPartner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a shipping partner
const updateShippingPartner = async (req, res) => {
    try {
        const shippingPartner = await ShippingPartner.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!shippingPartner) {
            return res.status(404).json({ message: 'Shipping partner not found' });
        }
        res.status(200).json(shippingPartner);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a shipping partner
// const deleteShippingPartner = async (req, res) => {
//     try {
//         const shippingPartner = await ShippingPartner.findByIdAndDelete(req.params.id);
//         if (!shippingPartner) {
//             return res.status(404).json({ message: 'Shipping partner not found' });
//         }
//         res.status(200).json({ message: 'Shipping partner deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const deleteShippingPartner = async (req, res) => {
    try {
        const partner = await ShippingPartner.findById(req.params.id);
        if (!partner) {
            return res.status(404).json({ error: 'Shipping partner not found' });
        }
        
        // Delete associated files
        [partner.frontAadharPhoto, partner.backAadharPhoto].forEach(photoPath => {
            if (photoPath) {
                const fullPath = path.resolve('.' + photoPath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log('Deleted file:', fullPath);
                }
            }
        });
        
        await ShippingPartner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Shipping partner deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting shipping partner:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createShippingPartner,
    getAllShippingPartners,
    getShippingPartnerById,
    updateShippingPartner,
    deleteShippingPartner,
    upload
};