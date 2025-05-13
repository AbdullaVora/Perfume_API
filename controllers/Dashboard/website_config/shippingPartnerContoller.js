const ShippingPartner = require("../../../models/Dashboard/website_config/shippingPartners");


// Create a new shipping partner
exports.createShippingPartner = async (req, res) => {
    try {
        const shippingPartner = new ShippingPartner(req.body);
        await shippingPartner.save();
        res.status(201).json(shippingPartner);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all shipping partners
exports.getAllShippingPartners = async (req, res) => {
    try {
        const shippingPartners = await ShippingPartner.find();
        const formatShipping = shippingPartners.map((shipping) => ({
            _id: shipping._id,
            partnerName: shipping.partnerName,
            loginId: shipping.loginId,
            password: shipping.password,
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
exports.getShippingPartnerById = async (req, res) => {
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
exports.updateShippingPartner = async (req, res) => {
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
exports.deleteShippingPartner = async (req, res) => {
    try {
        const shippingPartner = await ShippingPartner.findByIdAndDelete(req.params.id);
        if (!shippingPartner) {
            return res.status(404).json({ message: 'Shipping partner not found' });
        }
        res.status(200).json({ message: 'Shipping partner deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
