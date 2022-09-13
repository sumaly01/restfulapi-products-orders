const mongoose = require('mongoose')


const Product = require('../models/product')


exports.products_get_all = (req,res,next) => {
    Product.find()
            .select('name price _id productImage')// not fetching _v
            .exec()
            .then(docs => {
                const response = {
                    count : docs.length,
                    products : docs.map(doc => {
                        return{
                            name: doc.name,
                            price: doc.price,
                            _id: doc._id,
                            productImage: doc.productImage,
                            //detailed info ko lagi link ni rakheko product ko 
                            request: {
                                type: 'GET',
                                url:'http://localhost:3000/products/' + doc._id
                            }
                        }
                    })
                }
                res.status(200).json(response)
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error : err
                })
            })
}


exports.products_create_product=(req, res, next) => {
    console.log(req.file) //due to the middleware upload.single()
        //product is js object
    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,//front end bata ayeko name ho yo ie from incoming req
      price: req.body.price,
      productImage: req.file.path//path is also populated by multer in console
    });
    product
      .save()//saves to mongodb
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "Created product successfully",
          createdProduct: {
              name: result.name,
              price: result.price,
              _id: result._id,
              //detailed info ko lagi link ni rakheko product ko 
              request: {
                  type: 'GET',
                  url: "http://localhost:3000/products/" + result._id
              }
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
        // res.status(201).json({
    //     message:'Handling POST request to /products',
    //     createdProduct : product
    // })
  }

  exports.products_get_product = (req,res,next) => {
    const id = req.params.productId
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            console.log("from database" + doc)
            if(doc){
                res.status(200).json({
                    product: doc,
                    request: {
                        type:'GET',
                        description: "Get all the products here",
                        url: 'http://localhost:3000/products'
                    }
                })
            }else{
                res.status(404).json({message:'No valid data found'})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error : err})
        })

}

exports.products_update_product = (req,res,next) => {
    const id = req.params.productId
    const updateOps = {}//so that only name or only price or nothing can be patched
    //ops.propName contains name,price
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value
    }
  Product.update({_id : id}, {$set : updateOps})
            .exec()
            .then(result => {
                res.status(200).json({
                    message : "Updated successfully",
                    request : {
                        type:'GET',
                        description: "Get all the products here",
                        url: 'http://localhost:3000/products'
                    }
                })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error : err
                })
            })
}

exports.products_delete_product = (req,res,next) => {
    const id = req.params.productId
    Product.remove({_id : id})
            .exec()
            .then(result => {
                res.status(200).json({
                    message:'Product deleted',
                    request: {
                        type :'POST',
                        description: "You can view items here",
                        url: "http://localhost:3000/products",
                        body:{name: 'String', price: "Number"}
                    }
                })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error : err
                })
            })
  }