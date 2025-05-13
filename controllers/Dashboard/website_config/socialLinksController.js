const SocialLink = require("../../../models/Dashboard/website_config/socialLinksModel");

// Create a new social link
exports.createSocialLink = async (req, res) => {
    try {
        const socialLink = new SocialLink(req.body);
        await socialLink.save();
        res.status(201).json(socialLink);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all social links
exports.getAllSocialLinks = async (req, res) => {
    try {
        const socialLinks = await SocialLink.find();
        const formatData = socialLinks.map((social) => ({
            _id: social._id,
            icon: social.icon,
            name: social.name,
            link: social.link,
            updatedAt: social.updatedAt,
            status: social.status,
            isAction: true,
            isSocial: true,
        }))
        res.status(200).json(formatData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single social link by ID
exports.getSocialLinkById = async (req, res) => {
    try {
        const socialLink = await SocialLink.findById(req.params.id);
        if (!socialLink) {
            return res.status(404).json({ message: 'Social link not found' });
        }
        res.status(200).json(socialLink);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a social link
exports.updateSocialLink = async (req, res) => {
    try {
        const socialLink = await SocialLink.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!socialLink) {
            return res.status(404).json({ message: 'Social link not found' });
        }
        res.status(200).json(socialLink);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a social link
exports.deleteSocialLink = async (req, res) => {
    try {
        const socialLink = await SocialLink.findByIdAndDelete(req.params.id);
        if (!socialLink) {
            return res.status(404).json({ message: 'Social link not found' });
        }
        res.status(200).json({ message: 'Social link deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
