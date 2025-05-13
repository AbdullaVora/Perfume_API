const PaymentMethod = require("../../../models/Dashboard/website_config/paymentMethodModel");


// Create a new payment method
exports.createPaymentMethod = async (req, res) => {
    try {
        const paymentMethod = PaymentMethod.create(req.body);
        res.status(201).json(paymentMethod);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all payment methods
exports.getAllPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.find();
        console.log(paymentMethods); // Logs the array of payment methods

        const formattedPayments = paymentMethods.map((paymentMethod) => ({
            _id: paymentMethod._id,
            paymentMethod: paymentMethod.paymentMethod,
            paymentMode: paymentMethod.paymentMode,
            testKey: paymentMethod.testKey || "----",
            liveKey: paymentMethod.liveKey || "----",
            status: paymentMethod.status,
            updatedAt: paymentMethod.updatedAt,
            isAction: true,
            isPayment: true,
        }));

        res.status(200).json(formattedPayments); // Send the array of formatted objects
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get a single payment method by ID
exports.getPaymentMethodById = async (req, res) => {
    try {
        const paymentMethod = await PaymentMethod.findById(req.params.id);
        if (!paymentMethod) {
            return res.status(404).json({ message: 'Payment method not found' });
        }

        const formattedPayments = paymentMethods.map((paymentMethod) => ({
            _id: paymentMethod._id,
            paymentMethod: paymentMethod.paymentMethod,
            paymentMode: paymentMethod.paymentMode,
            testKey: paymentMethod.testKey || "----",
            liveKey: paymentMethod.liveKey || "----",
            status: paymentMethod.status,
            updatedAt: paymentMethod.updatedAt,
            isAction: true,
            isPayment: true,
        }));
        res.status(200).json(formatPayment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a payment method
exports.updatePaymentMethod = async (req, res) => {
    try {
        const paymentMethod = await PaymentMethod.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!paymentMethod) {
            return res.status(404).json({ message: 'Payment method not found' });
        }
        res.status(200).json(paymentMethod);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a payment method
exports.deletePaymentMethod = async (req, res) => {
    try {
        const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);
        if (!paymentMethod) {
            return res.status(404).json({ message: 'Payment method not found' });
        }
        res.status(200).json({ message: 'Payment method deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
