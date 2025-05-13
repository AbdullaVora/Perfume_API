const express = require('express');
const mongoose = require('mongoose');
const AllOrders = require('../../../models/Dashboard/orders_config/allOrdersModel');
const User = require('../../../models/auth/userModel');
const { orderValidation } = require('../../../helpers/JoiValidation');


// Create a new order
const createOrder = async (req, res) => {
    try {
        const { firstName, lastName, email, city, state, zipCode } = req.body;

        // Validate the request body using Joi
        const { error } = orderValidation.validate({ firstName, lastName, email, city, state, zipCode });

        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const newOrder = new AllOrders(req.body);
        console.log('New Order:', newOrder);
        await newOrder.save();
        return res.status(201).json(newOrder);
    } catch (error) {
        return res.status(400).json({ error: error.message });
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
            discount: order?.discount,
            paymentMethod: order?.paymentMethod,
            transactionID: order?.upiDetails?.upiId || order?.cardDetails?.cardNumber,
            shippingDetail: order?.address + ', ' + order?.city + ', ' + order?.state + ', ' + order?.zipCode,
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
