const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../dbConfig/ecommerceConfg');
// const {  customerModel } = require('../model/userModel');



const theproductModel = sequelize.define('products', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  quantity: {
    type: DataTypes.INTEGER, 
    allowNull: false,
    defaultValue: 0 
},
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'products'
});

// Method to deduct stock from product
theproductModel.prototype.deductStock = async function(quantityToDeduct) {
  if (this.quantity >= quantityToDeduct) {
    this.quantity -= quantityToDeduct;
    await this.save();
    return true; // Stock deduction successful
  } else {
    return false; // Not enough stock available
  }
};

 sequelize.sync();
module.exports = { theproductModel };
