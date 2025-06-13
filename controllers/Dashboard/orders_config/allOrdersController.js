const express = require('express');
const mongoose = require('mongoose');
const AllOrders = require('../../../models/Dashboard/orders_config/allOrdersModel');
const User = require('../../../models/auth/userModel');
const { orderValidation } = require('../../../helpers/JoiValidation');
const send = require('../../../utils/email');
const sendSMS = require('../../../utils/sms');


// // Create a new order
// const createOrder = async (req, res) => {
//     try {
//         const { firstName, lastName, email, city, state, zipCode } = req.body;

//         // Validate the request body using Joi
//         const { error } = orderValidation.validate({ firstName, lastName, email, city, state, zipCode });

//         if (error) {
//             return res.status(400).json({ success: false, message: error.details[0].message });
//         }

//         const newOrder = new AllOrders(req.body);
//         console.log('New Order:', newOrder);
//         await newOrder.save();
//         return res.status(201).json(newOrder);
//     } catch (error) {
//         return res.status(400).json({ error: error.message });
//     }
// };


// const createOrder = async (req, res) => {
//     try {
//         const { firstName, lastName, email, city, state, zipCode } = req.body;

//         console.log('Request Body:', req.body.email);

//         // Validate the request body using Joi
//         const { error } = orderValidation.validate({ firstName, lastName, email, city, state, zipCode });
//         if (error) {
//             return res.status(400).json({ success: false, message: error.details[0].message });
//         }

//         // Create order instance
//         const newOrder = new AllOrders(req.body);

//         // Save to database first to ensure fields like orderCode, estimatedDeliveryDate are generated
//         const savedOrder = await newOrder.save();

//         console.log('New Order:', savedOrder);

//         // Defensive check: make sure email exists before attempting to send
//         if (!savedOrder.email) {
//             return res.status(400).json({ success: false, message: "Customer email is required to send confirmation." });
//         }

//         // Format date for the email
//         const orderDate = new Date(savedOrder.createdAt || Date.now()).toLocaleDateString();

//         // Send confirmation email
//         await send({
//             to: savedOrder.email,
//             subject: 'Order Confirmation - Thank you for your purchase',
//             text: `Thank you for your order, ${savedOrder.firstName} ${savedOrder.lastName}. Your order code is ${savedOrder.orderCode}.`,
//             html: `
//         <div style="font-family: Arial, sans-serif; color: #333;">
//           <h2>Order Confirmation</h2>
//           <p>Hi <strong>${savedOrder.firstName} ${savedOrder.lastName}</strong>,</p>
//           <p>Thank you for your order!</p>
//           <p>Your order code is <strong>${savedOrder.orderCode}</strong>.</p>
//           <p><strong>Order Date:</strong> ${orderDate}</p>
//           <p><strong>Total Amount:</strong> ₹${savedOrder.total.toFixed(2) || 'N/A'}</p>
//           <p><strong>Expected Delivery:</strong> ${savedOrder.estimatedDeliveryDate || 'N/A'}</p>
//           <p>We’ll email you again once your order ships.</p>
//           <p>Need help? Contact us at <a href="mailto:support@example.com">support@example.com</a> or call +91-1234567890.</p>
//           <p>Thank you for shopping with <strong>YourCompanyName</strong>!</p>
//           <p>— The HQTRADING Team</p>
//           <a href="https://yourcompanywebsite.com">yourcompanywebsite.com</a>
//         </div>
//       `
//         });

//         console.log('New Order:', savedOrder);
//         return res.status(201).json(savedOrder);

//     } catch (error) {
//         console.error('Order creation error:', error);
//         return res.status(500).json({ success: false, error: error.message });
//     }
// };

function sanitizePhoneNumber(number) {
    if (!number) return number;
    // Keep the leading '+' if it exists, then remove all non-digit characters
    const hasPlus = number.startsWith('+');
    const digitsOnly = number.replace(/\D/g, ''); // remove all non-digit chars
    return hasPlus ? `+${digitsOnly}` : digitsOnly;
}




const createOrder = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, city, state, zipCode } = req.body;

        // Validate input
        const { error } = orderValidation.validate({ firstName, lastName, email, city, state, zipCode });
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const newOrder = new AllOrders(req.body);
        const savedOrder = await newOrder.save();
        const orderDate = new Date(savedOrder.createdAt || Date.now()).toLocaleDateString();

        // Add this to your createOrder function after saving the order
        const qrCodeData = JSON.stringify({
            orderId: savedOrder._id,
            orderCode: savedOrder.orderCode
        });

        // Generate QR code as data URL
        const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

        // Update the order with QR code
        savedOrder.qrCode = qrCodeUrl;
        await savedOrder.save();


        // Send email to customer
        if (savedOrder.email) {
            await send({
                to: savedOrder.email,
                subject: 'Order Confirmation - Thank you for your purchase',
                text: `Thank you for your order, ${savedOrder.firstName} ${savedOrder.lastName}. Your order code is ${savedOrder.orderCode}.`,
                html:
                    `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Order Confirmation</h2>
                    <p>Hi <strong>${savedOrder.firstName} ${savedOrder.lastName}</strong>,</p>
                    <p>Thank you for your order!</p>
                    <p>Your order code is <strong>${savedOrder.orderCode}</strong>.</p>
                    <p><strong>Order Date:</strong> ${orderDate}</p>
                    <p><strong>Total Amount:</strong> ₹${savedOrder.total.toFixed(2) || 'N/A'}</p>
                    <p><strong>Expected Delivery:</strong> ${savedOrder.estimatedDeliveryDate || 'N/A'}</p>
                    <p>We’ll email you again once your order ships.</p>
                    <p>Need help? Contact us at <a href="mailto:support@example.com">support@example.com</a> or call +91-1234567890.</p>
                    <p>Thank you for shopping with <strong>YourCompanyName</strong>!</p>
                    <p>— The HQTRADING Team</p>
                    <a href="https://yourcompanywebsite.com">yourcompanywebsite.com</a>
                    </div>
                ` // Your HTML email template
            });
        }

        // Determine customer's phone number for SMS
        let phoneNumber = savedOrder.mobile;

        if (!phoneNumber && savedOrder.email) {
            const user = await User.findOne({ email: savedOrder.email }).select('mobile');
            if (user && user.mobile) phoneNumber = user.mobile;
        }

        phoneNumber = sanitizePhoneNumber(phoneNumber);

        // Send SMS to customer
        // if (phoneNumber) {
        //     const smsMessage = `Hi ${savedOrder.firstName}, your order (${savedOrder.orderCode}) has been placed successfully. Thank you! - HQTrading`;
        //     await sendSMS(phoneNumber, smsMessage);
        // } else {
        //     console.warn('Customer mobile number not found, skipping SMS.');
        // }

        // // === Send Email to Admin ===
        if (process.env.ADMIN_EMAIL) {
            await send({
                to: process.env.ADMIN_EMAIL,
                subject: `New Order Received: ${savedOrder.orderCode}`,
                text: `New order from ${savedOrder.firstName} ${savedOrder.lastName} (${savedOrder.email}). Order Code: ${savedOrder.orderCode}.`,
                html: `
                    <h2>New Order Received</h2>
                    <p><strong>Customer:</strong> ${savedOrder.firstName} ${savedOrder.lastName}</p>
                    <p><strong>Email:</strong> ${savedOrder.email}</p>
                    <p><strong>Order Code:</strong> ${savedOrder.orderCode}</p>
                    <p><strong>City:</strong> ${savedOrder.city}</p>
                    <p><strong>Total Amount:</strong> ₹${savedOrder.totalAmount || 'N/A'}</p>
                    <p><strong>Order Date:</strong> ${new Date(savedOrder.createdAt).toLocaleString()}</p>
                    <p>Check the admin dashboard for more details.</p>
                `
            });
        }

        // // === Send SMS to Admin ===
        // if (process.env.ADMIN_MOBILE) {
        //     const adminSms = `New order placed by ${savedOrder.firstName} ${savedOrder.lastName} (${savedOrder.email}). Order Code: ${savedOrder.orderCode}.`;
        //     await sendSMS(process.env.ADMIN_MOBILE, adminSms);
        // }

        return res.status(201).json({ success: true, data: savedOrder });

    } catch (error) {
        console.error('Order creation error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};


// Get all orders
const getOrders = async (req, res) => {
    try {
        const orders = await AllOrders.find();
        const formatOrder = orders.map((order) => ({
            userId: order.userId,
            _id: order._id,
            orderCode: order?.orderCode,
            orderName: order?.orderName,
            userEmail: order?.email,
            billingDetail: order?.firstName + ' ' + order?.lastName,
            amount: order?.total,
            discount: order?.couponDiscount,
            paymentMethod: order?.paymentMethod,
            transactionID: order?.upiDetails?.upiId || order?.cardDetails?.cardNumber,
            shippingDetail: order?.addressLine1 + ', ' + order?.addressLine2 + ', ' + order?.city + ', ' + order?.state + ', ' + order?.zipCode,
            shippingFees: order?.shippingFee,
            orderStatus: order?.orderStatus,
            updatedAt: order?.updatedAt,
            createdAt: order?.createdAt,
            products: order?.cart || [],
            isAction: true,
            isOrders: true,
        }))

        const orderStatus = orders.map((order) => ({
            _id: order._id,
            orderCode: order?.orderCode,
            userEmail: order?.email,
            products: order?.cart || [],
            orderStatus: order?.orderStatus,
            createdAt: order?.createdAt,
            // updatedAt: order?.updatedAt,
            isAction: true,
            isOrderStatus: true,
            status: order?.status || true
        }))
        console.log(orderStatus)
        res.status(200).json({ orders: formatOrder, orderStatus: orderStatus });
        // res.status(200).json({ orders: orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await AllOrders.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an order by ID
const updateOrder = async (req, res) => {
    try {
        const updatedOrder = await AllOrders.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// // Delete an order by ID
// const deleteOrder = async (req, res) => {
//     try {
//         const deletedOrder = await AllOrders.findByIdAndDelete(req.params.id);
//         if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
//         res.status(200).json({ message: 'Order deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const deleteOrder = async (req, res) => {
    try {
        const productId = req.params.id; // Assuming productId is sent in URL params

        // Find the order containing this product
        const order = await AllOrders.findOne({
            'cart._id': productId
        });


        if (!order) {
            return res.status(404).json({ message: 'Product not found in any order' });
        }

        // Check number of products in the order
        if (order.cart.length > 1) {
            // Remove only the matching product
            order.cart = order.cart.filter(
                product => product._id.toString() !== productId
            );

            await order.save();
            return res.status(200).json({
                message: 'Product removed from order successfully',
                remainingProducts: order.cart.length
            });
        } else {
            // Delete entire order if only one product
            await AllOrders.findByIdAndDelete(order._id);
            return res.status(200).json({
                message: 'Order deleted successfully as it contained only this product'
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: 'Error while processing product deletion'
        });
    }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrder, deleteOrder };