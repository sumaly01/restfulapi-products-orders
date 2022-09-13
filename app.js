const express = require('express')
const app = express()
const morgan = require('morgan') //middleware
const bodyParser = require('body-parser')
const mongoose =  require('mongoose')
require('dotenv').config()

const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')
const userRoutes = require('./api/routes/user')


mongoose.connect(
    "mongodb+srv://sumaly01:" + 
        process.env.MONGO_ATLAS_PW + 
            "@cluster0.yrwpz.mongodb.net/node-rest-shop?retryWrites=true&w=majority",
            {
               useNewUrlParser: true, useUnifiedTopology: true
            }       
)
mongoose.Promise = global.Promise //to remove depreciation warning

//morgan le route ko next lai call garcha 
app.use(morgan('dev'))
app.use('/uploads',express.static('uploads'))//folder statically or publicly available, but initially not public
//bodyParser le incoming req lai extract garna easy parcha
app.use(bodyParser.urlencoded({extended: false})) //false garyo ki simple bodies matra support garcha parse le
app.use(bodyParser.json())


//CORS- cross origin resource sharing
//local host different ma run huncha client ra server in restful api so access allow garna header append garnu parcha in incoming req
app.use((req,res,next) => {
    //these first two headers are appended to the incoming req
    //* means all
    res.header("Access-Control-Allow-Origin","*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With,Content-Type,Accept,Authorization"
    )
    //browser le OPTIONS dincha
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET')
        return res.status(200).json({})
    }
    next()
})

//middleware
//incoming req has to go through app.use()
// app.use((req,res,next)=> {
//     res.status(200).json({
//         message:'It works'
//     })
// })
app.use('/products',productRoutes)
app.use('/orders',orderRoutes)
app.use('/user',userRoutes)


app.use((req,res,next)=> {
    const error=new Error('Not found')
    error.status=404
    next(error)
})

//jun sukai error ni yo middleware le handle garcha because they throw error
app.use((error,req,res,next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports=app