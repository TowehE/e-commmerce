const { customerModel} = require('../model/customerModel');

const jwt = require('jsonwebtoken');
require('dotenv').config();



const authenticate = async (req, res, next) => {
    try {
        const hasAuthorization = req.headers.authorization;
        if (!hasAuthorization) {
            return res.status(400).json({
                message: 'Invalid authorization',
            })
        }
        const token = hasAuthorization.split(" ")[1];
        if (!token) {
            return res.status(404).json({
                message: "Token not found",
            });
        }
      
        
        const decodeToken = jwt.verify(token, process.env.secret);
   
      
        const user = await customerModel.findByPk(decodeToken.userId);
      

        if (!user) {
            return res.status(404).json({
                message: "Not authorized: User not found",
            });
        }


        req.user = decodeToken;
        next();

    } catch (error) {
        console.error('Authentication Error:', error);
        if (error instanceof jwt.TokenExpiredError){
            return res.status(401).json({
                message: 'Session expired, please login again',
            });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: 'Invalid token',
            })
        } else {
            return res.status(500).json({
                message: "Authentication " + error.message
            });
        }
    }
};









module.exports = {
    authenticate,
   

}