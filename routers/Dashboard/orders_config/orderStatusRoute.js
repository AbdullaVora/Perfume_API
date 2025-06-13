const express = require('express');
const router = express.Router();
const { createOrderStatus, getAllOrderStatuses, getOrderStatusById, updateOrderStatus, deleteOrderStatus, getOrderById } = require('../../../controllers/Dashboard/orders_config/orderStatusContoller');
const authMiddleware = require('../../../middleware/authToken');

router.post('/addOrderStatus', createOrderStatus);
router.get('/orderStatus', getAllOrderStatuses);
router.get('/orderStatusById/:id', getOrderById);
router.put('/updateOrderStatus/:id', updateOrderStatus);
router.delete('/deleteOrderStatus/:id', deleteOrderStatus);

module.exports = router;
