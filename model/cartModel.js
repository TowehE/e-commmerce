const { DataTypes } = require('sequelize');
const {theproductModel} = require("../model/productModel")
const { sequelize } = require('../dbConfig/ecommerceConfg');
const {userModel} = require('./customerModel')
const { v4: uuidv4 } = require("uuid")

const cartModel = sequelize.define('Carts', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
cartId: {
  type: DataTypes.STRING,
  allowNull: false,
  defaultValue: () => uuidv4()
  },

  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
},{
  sequelize,
  tableName: 'Carts'
});

// referencing the association
cartModel.belongsTo(theproductModel, { foreignKey: 'productId', as: 'product' });

sequelize.sync();

// Export cartModel without association
module.exports = { cartModel };















