const { orderValidation } = require("../../../helpers/JoiValidation");
const AllOrders = require("../../../models/Dashboard/orders_config/allOrdersModel");
const orderStatus = require("../../../models/Dashboard/orders_config/orderStatusModel");
const productModel = require("../../../models/Dashboard/product/productModel");

// Create a new order status
exports.createOrderStatus = async (req, res) => {
    try {
        // console.log(req.body);
        const order = await orderStatus.create(req.body);
        // console.log(order);
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all order statuses
exports.getAllOrderStatuses = async (req, res) => {
    try {
        const orders = await orderStatus.find();

        console.log(orders)

        // Format the response similar to your coupon format
        const formattedOrders = orders.map((order) => ({
            _id: order._id,
            orderCode: order.orderCode,
            orderName: order.orderName,
            orderStatus: order.orderStatus,
            status: order.status, // Default status if not provided
            updatedAt: order.updatedAt,
            isAction: true,
            isOrderStatus: true, // Similar to isCoupon in your example
        }));

        res.status(200).json(formattedOrders);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get a single order status by ID
exports.getOrderStatusById = async (req, res) => {
    try {
        const order = await orderStatus.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order status not found' });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update an order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderCode, orderName, orderStatus, isDeleted } = req.body;
        const { id } = req.params
        console.log(req.params);
        console.log("Update Order Status ID:", id);

        // console.log(req.body)
        // console.log(id)


        // Find the order first
        const order = await AllOrders.findOne({
            $or: [
                { _id: id },
                { 'cart._id': id }
            ]
        });
        console.log(id)
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Update only the 'name' field in cart, keeping other details intact
        if (orderName) {
            const namesArray = orderName.split(',').map(name => name.trim());

            order.cart.forEach((item, index) => {
                if (namesArray[index]) {
                    item.name = namesArray[index]; // Update only the name field
                }
            });
        }

        // if (typeof isDeleted !== 'undefined') {
        //     for (const item of order.cart) {
        //         // const productId = item.product._id || item.product;
        //         // await productModel.findByIdAndUpdate(productId, { isDeleted });
        //         if (typeof isDeleted !== 'undefined') {
        //             order.cart.forEach((item) => {
        //                 item.isDeleted = isDeleted;
        //             });

        //             // Let Mongoose know we changed nested data
        //             order.markModified('cart');
        //         }

        //     }
        // }

        if (typeof isDeleted !== 'undefined') {
            // Find the index of the item with matching id
            const itemIndex = order.cart.findIndex(item => item.id === id);

            if (itemIndex !== -1) { // If item exists
                // Update isDeleted for only the matched item
                order.cart[itemIndex].isDeleted = isDeleted;

                // Notify Mongoose of the nested change
                order.markModified('cart');
            } else {
                console.error("Cart item not found with id:", id);
            }
        }

        // if (orderStatus) {
        //     for (const item of order.cart) {
        //         order.cart.forEach((item) => {
        //             const cart = item.find((data) => data._id == id);
        //             cart.orderStatus = orderStatus || "Cancelled";
        //         });
        //         // Let Mongoose know we changed nested data
        //         order.markModified('cart');
        //     }
        // }

        if (orderStatus) {
            console.log(orderStatus)
            const cartItem = order.cart.find((item) => item._id == id);
            console.log(cartItem)
            if (cartItem) {
                cartItem.orderStatus = orderStatus || "Cancelled";
                // Let Mongoose know we changed nested data
                order.markModified('cart');
            }
        }


        // Update other fields
        // order.orderCode = orderCode || order.orderCode;

        // Save the updated order
        const updatedOrder = await order.save();

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Delete an order status
exports.deleteOrderStatus = async (req, res) => {
    try {
        console.log(req.params.id)
        const order = await AllOrders.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order status not found' });
        }
        res.status(200).json({ success: true, message: 'Order status deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get order by ID (matches either main order ID or cart item ID)
exports.getOrderById = async (req, res) => {
    try {
        console.log(req.params)
        const { id } = req.params;
        console.log("Order ID:", id);

        // Search for order where either:
        // 1. The main order _id matches
        // 2. Any cart item _id matches
        const order = await AllOrders.findOne({
            orderCode: id
            // $or: [
            //     // { _id: id },
            //     { 'orderCode': id }
            // ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // If we matched by cart item ID, find the specific cart item
        let matchedItem = null;
        if (!order._id.equals(id)) {
            matchedItem = order.cart.find(item => item._id.equals(id));
        }

        // Format the response
        const response = {
            success: true,
            data: {
                order: {
                    _id: order._id,
                    orderCode: order.orderCode,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                    // Include other order fields you need
                },
                // Include the specific cart item if we matched by item ID
                ...(matchedItem && { cartItem: matchedItem })
            }
        };

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};