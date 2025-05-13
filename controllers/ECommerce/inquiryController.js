const { createInquiryJoi } = require("../../helpers/JoiValidation");
const inquiryModel = require("../../models/ECommerce/inquiryModel");

// Create a new inquiry
exports.createInquiry = async (req, res) => {
    try {
        const { error } = createInquiryJoi.validate(req.body);

        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        const { name, email, number: phone, message } = req.body;

        const inquiry = new inquiryModel({
            name,
            email,
            phone,
            message
        });

        await inquiry.save();

        res.status(200).json({
            success: true,
            message: 'Inquiry submitted successfully',
            data: inquiry
        });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit inquiry'
        });
    }
};

// Get all inquiries (for admin panel)
exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await inquiryModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: inquiries.length,
            data: inquiries
        });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inquiries'
        });
    }
};

// Get single inquiry
exports.getInquiry = async (req, res) => {
    try {
        const inquiry = await inquiryModel.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        console.error('Error fetching inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inquiry'
        });
    }
};

// Update inquiry status (for admin panel)
exports.updateInquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const inquiry = await inquiryModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Inquiry status updated',
            data: inquiry
        });
    } catch (error) {
        console.error('Error updating inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update inquiry'
        });
    }
};

exports.deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params
        const inquiry = await inquiryModel.findByIdAndDelete(id);
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        res.status(200).json({ success: true, message: 'Inquiry deleted' });
    } catch (error) {
        console.error('Error updating inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to Delete inquiry'
        });
    }
}