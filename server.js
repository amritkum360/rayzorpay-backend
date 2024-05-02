const express = require("express")
const Razorpay = require("razorpay")
const cors = require("cors")
const crypto = require("crypto")
require("dotenv").config()


const app =  express()
const PORT = process.env.PORT;

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())

app.post("/order",async (req, res)=>{
    try{
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_API_SECRET
    })

    const options = req.body
    const order = await razorpay.orders.create(options);

    if(!order){
        return res.status(500).send("Error")
    }

    res.json(order)
} catch(error){
    console.log(error)
    res.status(500).send(error)
}
})


app.post("/order/validate",async(req, res)=>{
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    // order_id + "|" + razorpay_payment_id
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex")
    if(digest !== razorpay_signature){
        return res.status(400).json({msg:"Transaction is not legit!"})
    }

    res.json({
        msg:"success",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
    })
})

app.listen(PORT,()=>{
    console.log("listening on the port", PORT)
})