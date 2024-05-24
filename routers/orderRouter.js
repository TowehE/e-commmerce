const express = require('express');
const router = express.Router();
const {
     createOrder, 
     orderFromCart,
    getAllOrder,
    getOneOrder,
    updateOrder,
    deleteOrder
 } = require('../controller/orderController');
const { authenticate } = require('../middlewear/authentication');

// Create an order
router.post('/orders', authenticate, createOrder);

// Create an order from cart
router.post('/cartorder/:cartId', authenticate, orderFromCart);

//get all order
router.get("/allorder" , authenticate, getAllOrder)

//get a particular order
router.get("/yourorder/:orderId" , authenticate, getOneOrder)


//update order
router.put("/updateorder/:orderId" , authenticate, updateOrder)

//delete order
router.delete("/deleteorder/:orderId" , authenticate, deleteOrder)

module.exports = router;



