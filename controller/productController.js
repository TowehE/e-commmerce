const {theproductModel} = require("../model/productModel")
const { customerModel } = require("../model/customerModel")
const { Sequelize, sequelize, Op } = require('sequelize');

//function to create a product  
exports.addProduct = async (req,res) =>{
    try{
    const {name, price, description, brand, quantity} = req.body

    const userId = req.user.userId;


    const user = await customerModel.findByPk( userId,
        { include: 'products' });
        
    if (!user) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

        const product = await theproductModel.create({
            name,
            price,
            description,
            brand,
            quantity ,
            userId
        });


        console.log("Created Product:", product)
       
        res.status(201).json({
            message: `${name} has added to product successfully`,
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                brand: product.brand,
                userId: product.userId,
                quantity: product.quantity
            }
        });

    } catch (err) {
        console.error("Error:", err); // Debug log
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
};


//functiom to get all products
exports.getAProducts = async (req, res) =>{
     try{
        // find user
        const userId = req.user.userId;
    
        const user = await customerModel.findByPk( userId,
            { include: 'products' });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        
        const productId = req.params.productId;

        const product = await theproductModel.findByPk(
            productId, {
            attributes: ['id', 'name']
        });

        if (!product) {
            return res.status(404).json({
                message: "Empty product list"
            })
        }
        return res.status(200).json({
            message: `${product.name} product with id ${productId} found`,
            data: product
        })

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}

//functioon to get a product

exports.getAllProducts = async (req, res) => {
    try {
        
        // Find the user by userId 
        const userId = req.user.userId;

        const user = await customerModel.findByPk(userId, { include: 'products' });

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Get all products associated with the user
        const products = user.products;

        if (!products || products.length === 0) {
            return res.status(404).json({
                message: 'Empty product list'
            });
        }

        return res.status(200).json({
            message: 'All Products found ',
            data: products
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
}

// get a product by brand name
exports.getProductsByBrand = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await customerModel.findByPk(userId, { include: 'products' });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const brand = req.params.brand; 
        const products = await theproductModel.findAll({
            where: { brand: brand }, 
            attributes: ['id', 'brand'] 
        });

        if (!products || products.length === 0) {
            return res.status(404).json({
                message: "No products found for the given brand"
            });
        }

        return res.status(200).json({
            message: `Products by brand ${brand} found`,
            data: products
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
}


//endpoint to update a product
exports.updateBrand = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await customerModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const oldBrand = req.params.oldBrand; 
        const newBrand = req.body.newBrand; 

        // Update brand for all products
        const updatedProducts = await theproductModel.update(
            { brand: newBrand },
            { where: { brand: oldBrand } }
        );

        if (updatedProducts[0] === 0) { 
            return res.status(404).json({
                message: `No products found for brand: ${oldBrand}`
            });
        }

        return res.status(200).json({
            message: `Brand updated to ${newBrand} for ${updatedProducts[0]} products`,
            data: {
                newBrand: newBrand
            }
            
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
}


//function to update a particular product
exports.updateProduct = async (req, res) => {
    try {

        //find and get user id
        const userId = req.user.userId
        const user = await customerModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        //find the product by id
        const productId = req.params.productId
        const product = await theproductModel.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: "product not found"
            })
        }

        const productData = {
            name: req.body.name || product.name,
            brand: req.body.brand || product.brand,
            description: req.body.description || product.description,
            price: req.body.price || product.price

        }

        // Update the product
        await product.update(productData);

        return res.status(200).json({
            message: "product updated successfully",
            data: productData,
        })

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};




//function to delete a product
exports.deleteProduct = async(req,res) =>{
    try {
        //find user and get Id
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);
        if(!user){
            return res.status(404).json({
                message : "User not found"
            });
        }

        const productId = req.params.productId;
        const productToDelete = await theproductModel.findByPk(productId);
        if(!productToDelete){
            return res.status(404).json({
                message : "Product not found"
            });
        }

        const productName = productToDelete.name;

        // Delete product
        await productToDelete.destroy();

        return res.status(200).json({
            message: `${productName} deleted successfully`
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};
