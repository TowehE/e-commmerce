const { orderModel } = require('../model/orderModel');
const { theproductModel } = require('../model/productModel');
const { customerModel } = require('../model/customerModel');
const {cartModel} = require('../model/cartModel');
const stripe = require('stripe')(process.env.stripe_secret_key)
require('dotenv').config()


// function for payment processing  
const processPayment = async (userId, amount) => {
    //  payment processing logic
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const paymentSuccessful = true;
            if (paymentSuccessful) {
                resolve({ 
                    status: 'success', 
                transactionId: 'txn_123456'
             });
            } else {
                reject(new Error('Payment failed'));
            }
        }, 1000); 
    });
};

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const productId = req.body.productId;
        const product = await theproductModel.findByPk(productId);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const quantity = req.body.quantity;

       
        // Check if there is enough stock available
        if (quantity > product.dataValues.quantity) {
            return res.status(400).json({
                message: 'Not enough products available in stock'
            });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                message: 'Invalid quantity'
            });
        }

        // Calculate total price
        const totalPrice = product.dataValues.price * quantity;

        // Create order
        const order = await orderModel.create({
            userId: userId,
            productId: productId,
            quantity: quantity,
            totalPrice: totalPrice,
            status: "pending"
        });

        
        // Deduct stock from product
        const stockDeductionSuccess = await product.deductStock(quantity);
        
        if (!stockDeductionSuccess) {
            return res.status(400).json({
                 message: 'Failed to deduct stock from product'
                 });
        }
        // Update product stock
        product.dataValues.quantity -= quantity;
        await product.update({ quantity: product.dataValues.quantity });


        
        //Process payment
        try {
            const paymentResult = await processPayment(userId, totalPrice);
            

            // Update order status to 'completed' after successful payment
            order.status = 'completed';
            order.transactionId = paymentResult.transactionId; 
            await order.save();

            // remove item from cart
            await cartModel.destroy({
                where: {
                    userId: userId,
                    productId: productId
                }
            });
        return res.status(200).json({
            message: 'Order created successfully',
            data: order,
            paymentResult
        });
    } catch (paymentError) {
        //  Handle payment failure
        // Optionally, revert stock update here if needed
        return res.status(400).json({
            message: 'Payment processing failed: ' + paymentError.message
        });
    }

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
};


//function to get order from cart
exports.orderFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const cartId = req.params.cartId;
        const cartI = await cartModel.findByPk(cartId);
        if (!cartI) {
            return res.status(404).json({
                message: 'cartId not found'
            });
        }

        const cartItems = await cartModel.findAll({
            where: {
                userId: userId,
                cartId: cartId
            },
            include: [
                { model: theproductModel, as: 'product' }
            ]
        });

        
        // get the user cart items
        const cartGoods = await cartModel.findAll({
            where: {
                userId: userId,
                cartId: cartId
            },
            include: [
                { model: theproductModel, as: 'product' }
            ]
        });
        if (!cartGoods) {
            return res.status(404).json({
                message: 'Cart is empty'
            });
        }

        // Iterate through cart items to create order for each
        const orders = [];
        const errors = [];
        for (const cartItem of cartGoods) {
            const productId = cartItem.productId;
            const product = cartItem.product;
            const quantity = cartItem.quantity;
            const totalPrice = product.price * quantity;

            // Check if quantity requested exceeds available stock
            if (quantity > product.stock) {
                errors.push(`Not enough stock available for product "${product.name}"`);
                continue
            }

              

            // Create order
            const order = await orderModel.create({
                userId: userId,
                productId: productId,
                quantity: quantity,
                totalPrice: totalPrice
            });

            // Update product stock
            product.stock -= quantity;
            await product.save();

            // Add order to list
            orders.push(order);
        }

        // Clear the user's cart
        await cartModel.destroy({
            where: {
                userId: userId
            }
        });

        let message = 'Orders created successfully';
        if (errors.length > 0) {
            message += `, but some products could not be ordered due to insufficient stock: ${errors.join(', ')}`;
        }

        return res.status(200).json({
            message: message,
            data: orders
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
};


//get a order
exports.getAllOrder = async (req, res) => {
    try {
        //find user by userId
        const userId = req.user.userId;

        const user = await customerModel.findByPk(userId);

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        //get order
        const order = await orderModel.findAll({
            where:{
                userId :userId,

            }, 
            include:[
                {model : theproductModel, as: 'product',
                attributes: ['name', 'price'],
            }
            ],
            attributes: ['quantity', 'totalPrice', 'status'], 
        })
        
      
        if (order.length === 0) {
            return res.status(404).json({
                message: 'No orders found for this user'
            });
        }

        return res.status(200).json({
            message: 'Here is your order',
            data: order
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
}



// Get a particular order by ID
exports.getOneOrder = async (req, res) => {
    try {
        //find user by Id
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);

     
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

     //find order by ID
        const orderId = req.params.orderId;

        
        if (!orderId) {
            return res.status(404).json({
                message: 'Order is not found'
            });
        }
      

        const order = await orderModel.findOne({
            where: {
                id: orderId,
                userId: userId,
            },
            include: [
                {
                    model: theproductModel,
                    as: 'product',
                    attributes: ['name', 'price'], 
                }
            ],
            attributes: ['quantity', 'totalPrice', 'status'], 
        });

        // Check if order exists
        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            message: `Order for ${order.product.name} retrieved successfully`,
            data: order
        });



    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
}

//update a order
exports.updateOrder = async (req, res) => {
    try {
      
        //find and get user id
        const userId = req.user.userId
        const user = await customerModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

          //find the order by id
          const orderId = req.params.orderId
          const order = await orderModel.findByPk(orderId);
          if (!order) {
              return res.status(404).json({
                  message: "order not found"
              })
          }
          const orderData = {
            quantity: req.body.quantity || order.quantity,

        }

        // Update the order
        await order.update(orderData);
        
        // find the product associated with the order
        const product = await theproductModel.findByPk(order.productId);


        return res.status(200).json({
            message: "Your order has been updated successfully",
            data: {
                name: product.name,
                price: product.price,
                quantity: orderData.quantity,
                totalPrice: product.price * orderData.quantity,
                status: order.status
            }
        })

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
}


//delete a order
exports.deleteOrder = async(req,res) =>{
    try {
        //find user and get Id
        const userId = req.user.userId;
        const user = await customerModel.findByPk(userId);
        if(!user){
            return res.status(404).json({
                message : "User not found"
            });
        }

        const orderId = req.params.orderId;
        const orderToDelete = await orderModel.findByPk(orderId);
        if(!orderToDelete){
            return res.status(404).json({
                message : "Order not found"
            });
        }
     // Get the name of the associated product
     const product = await theproductModel.findByPk(orderToDelete.productId);

     // Delete the order
     await orderToDelete.destroy();

     return res.status(200).json({
         message: `${product.name} order deleted successfully`
     });


    } catch (err) {
       
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
}


//function to process payment
exports.payment = async(req,res) =>{
    try {
           //find user and get Id
           const userId = req.user.userId;
           const user = await customerModel.findByPk(userId);
           if(!user){
               return res.status(404).json({
                   message : "User not found"
               });
           }
           
           //find order and ger orderId
           const orderId = req.params.orderId;

           // Fetch the order from the database
           const order = await orderModel.findByPk(orderId);
           if (!order) {
               return res.status(404).json({
                 message: "Order not found" 
                });
           }

              // Update order status to "delivered"
        order.status = "delivered";
        await order.save();

        // token and amount in the request body
        const { amount, currency, source, description} = req.body;

        // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: source,
        description,
        confirm: true,
      });

        // If the charge is successful
        return res.status(200).json({

            message: 'Payment processed successfully',
             paymentIntent,

        });

    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error: ' + err.message
        });
    }
}