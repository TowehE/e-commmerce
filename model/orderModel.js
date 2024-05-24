const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig/ecommerceConfg');
const { userModel } = require('./customerModel');
const { theproductModel } = require('./productModel');

const orderModel = sequelize.define('Orders', {
    userId: {
        type: DataTypes.INTEGER, 
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    }
}, {
    tableName: 'Orders'
});

// orderModel.belongsTo(userModel, { foreignKey: 'userId', as: 'user' });
orderModel.belongsTo(theproductModel, { foreignKey: 'productId', as: 'product' });




module.exports = { orderModel };
