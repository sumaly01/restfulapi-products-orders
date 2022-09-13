const express = require('express')
const router = express.Router()
const multer = require('multer')
const checkAuth= require('../middleware/check-auth')
const ProductsController = require('../controllers/products')

//how files get stored
const storage = multer.diskStorage({
    //cb bhaneko callback
    destination: function(req,file,cb){
        cb(null,'./uploads/')
    },
    filename: function(req,file,cb){
        // cb(null,new Date().toISOString() + file.originalname)
        // cb(null, Date.now() + file.originalname);//for windows
        cb(null, new Date().toISOString().replace(/:/g, '-')+ file.originalname);//for windows
    }
})

//our own function
//mimetype is populated by multer itself in console
const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true)
    }else{
        cb(null,false) //doesnt store the file
    }
}

const upload = multer({
    storage : storage,
    limits: {
        fileSize: 1024*1024*5 //file ko size
    },
    fileFilter : fileFilter
})//initialize

const Product = require('../models/product')

//no need to put return since euta route le euta matra res pathaira cha
router.get('/',ProductsController.products_get_all)


//multer accesses both req.body and req.file
//productImage will hold the parsed file
router.post("/",checkAuth,upload.single('productImage'),ProductsController.products_create_product);
  

router.get('/:productId',ProductsController.products_get_product )

//updating
router.patch('/:productId',checkAuth,ProductsController.products_update_product)

router.delete("/:productId",checkAuth,ProductsController.products_delete_product)

module.exports=router



