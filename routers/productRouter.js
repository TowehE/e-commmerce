const express = require('express');

const router = express.Router();

const {
     addProduct, 
    getAProducts,
    getAllProducts,
    getProductsByBrand,
    updateBrand,
    updateProduct,
    deleteProduct
   } = require('../controller/productController');
const { authenticate } = require('../middlewear/authentication');



//endpoint to add product 
router.post('/addproduct',authenticate ,addProduct);


//endpoint to get a product
router.get('/getProduct/:productId',authenticate ,getAProducts);


//endpoint to get all product
router.get('/allproduct',authenticate ,getAllProducts);


//endpoint to get a product by brand name
router.get('/productname/:brand',authenticate ,getProductsByBrand);

// endpoint to update brand name for all products
router.put('/updatebrand/:oldBrand', authenticate, updateBrand);

// endpoint to update product
router.put('/updateproduct/:productId', authenticate, updateProduct);

// endpoint to delete product
router.delete('/deleteproduct/:productId', authenticate, deleteProduct);

module.exports = router;


