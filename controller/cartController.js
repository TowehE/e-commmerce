const { cartModel } = require('../model/cartModel');
const { theproductModel } = require('../model/productModel')
const { customerModel } = require('../model/customerModel')
const { v4: uuidv4 } = require('uuid')
const { sequelize } = require('../dbConfig/ecommerceConfg')


exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const productId = req.params.productId;
        const product = await theproductModel.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const availabilityQuantity = req.body.quantity || 1;

        // Check if requested quantity exceeds available stock
        if (availabilityQuantity > product.quantity) {
            console.log(product)
            return res.status(400).json({
                message: 'Insufficient product',
                availableQuantity: product.quantity
            });
        }
        const quantity = req.body.quantity || 1;

        // Check if the user has an existing cart
        let cart = await cartModel.findOne({
            where: {
                userId: userId
            }
        });


        // If the user does not have a cart, create a new one
        if (!cart) {
            cart = await cartModel.create({
                userId: userId,
                productId: productId,
                quantity: quantity
            });
        } else {
            const existingCartItem = await cartModel.findOne({
                where: {
                    cartId: cart.cartId,
                    productId: productId
                }
            });

            if (existingCartItem) {
                // If the product is already in the cart, update the quantity
                existingCartItem.quantity += availabilityQuantity;
                await existingCartItem.save();
            } else {
                // If the product is not in the cart, add it
                await cartModel.create({
                    userId: userId,
                    cartId: cart.cartId,
                    productId: productId,
                    quantity: availabilityQuantity
                });
            }
        }
        
        // Fetch updated cart with all products
        const updatedCart = await cartModel.findOne({
            where: {
                cartId: cart.cartId
            },
        }
    );
     

        return res.status(200).json({
            message: `${product.name} added to cart successfully with ${quantity} quantity`,
            productId: productId,
            quantity: quantity,
            data: updatedCart,
        });

     

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
};

//function to get a particular cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found'

            });
        }

        const productId = req.params.productId;

        // Find user's cart item for the specified product
        const cart = await cartModel.findOne({
            where: {
                userId: userId,
                productId: productId
            },
            include: [
                { model: theproductModel, as: 'product' }
            ]
        });

        if (!cart) {
            return res.status(404).json({
                message: 'Product not found in cart'
            });
        }

        return res.status(200).json({
            message: 'Cart details fetched successfully',
            data: cart
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
};



// function to get cart
exports.getAllCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // const productId = req.params.productId

        const carts = await cartModel.findAll({
            where: {
                userId: userId,
                // productId: productId
            },
            include: [
                { model: theproductModel, as: 'product' }
            ]
        });

        if (!carts || carts.length === 0) {
            return res.status(404).json({
                message: 'Cart is empty'
            });
        }

        return res.status(200).json({
            message: 'Cart details fetched successfully',
            data: carts
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
};

//update a cart     

exports.updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const productId = req.params.productId;
        const product = await theproductModel.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

     
        const cart = await cartModel.findOne({
            where: {
                userId: userId,
                productId: productId
            }
        });

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }
     

        const newQuantity = {
            quantity: req.body.quantity || cart.quantity
        }

        await cart.update(newQuantity)

             // Update the quantity
            //  cart.quantity = newQuantity;
            //  const updatedCart = await cart.save();
     
             if (!newQuantity) {
                 return res.status(500).json({
                     message: 'Failed to update cart quantity'
                 });
             }

        return res.status(200).json({
            message: 'Cart item quantity updated successfully',
            data: newQuantity,
            productId : productId
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
};

// function to delete a cart
exports.deleteCartProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const productId = req.params.productId;
        const product = await theproductModel.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const cart = await cartModel.findOne({
            where: {
                userId: userId,
                productId: productId
            }
        });

        if (!cart) {
            return res.status(404).json({
                message: 'Cart product not found'
            });
        }

        // Delete the cart product
        await cart.destroy();

        return res.status(200).json({
            message: 'Cart product deleted successfully'
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
};
