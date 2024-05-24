const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig/ecommerceConfg'); 
const {theproductModel} = require("./productModel")
const {orderModel} = require("./orderModel")
const {cartModel} = require("./cartModel")

const customerModel = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    newCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, 
{
    tableName: 'Users' 
});
// Define associations
customerModel.hasMany(theproductModel, { foreignKey: 'userId', as: 'products' });
customerModel.hasOne(cartModel, { foreignKey: 'userId', as: 'cart' });
customerModel.hasMany(orderModel, { foreignKey: 'userId', as: 'orders' });



module.exports = { customerModel };