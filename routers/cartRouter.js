const express = require('express');

const router = express.Router();

const {
       addToCart, 
       getCart,
         getAllCart,
         updateCartQuantity,
         deleteCartProduct
  
   } = require('../controller/cartController');
const { authenticate } = require('../middlewear/authentication');



//endpoint to add to cart
router.post('/addtocart/:productId', authenticate, addToCart);


//endpoint to get cart
router.get('/getOne/:productId', authenticate, getCart);


//endpoint to get cart
router.get('/getCart/', authenticate, getAllCart);

//endpoint to update cart
router.put('/updateCart/:productId', authenticate, updateCartQuantity);


//endpoint to delete a product fromc cart
router.delete('/deletecart/:productId', authenticate, deleteCartProduct);


module.exports = router;
