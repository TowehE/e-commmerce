//import express
const express = require("express");
const bodyParser = require('body-parser');


//import confg
require("./dbConfig/ecommerceConfg")

require("dotenv").config();

// import routers
const userRouter  = require("./routers/userRouter");
 const productRouter = require("./routers/productRouter");
const cartRouter = require("./routers/cartRouter");
const orderRouter = require("./routers/orderRouter")



// create an app from express module
const app = express();

// use the express middleware
app.use(express.json());

// Middleware
app.use(bodyParser.json());


const port = process.env.port

app.get("/", (req,res)=>{
    res.send("You're welcome to ecommerce API")
})

app.use("/api/v1", userRouter)
app.use("/api/v1", productRouter)
app.use("/api/v1", cartRouter)
app.use("/api/v1", orderRouter)



//listen to  the port
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})


