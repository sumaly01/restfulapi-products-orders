const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User= require('../models/user')

exports.user_signup = (req,res,next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length >= 1){
                return res.status(422).json({
                    message:"MAil exists"
                })
            }else{//email doesn't exist already
                bcrypt.hash(req.body.password, 10,(err,hash) => {
                    if(err){
                        return res.status(500).json({
                            error:err
                        })
                    }else{
                       const user= new User({
                           _id: new mongoose.Types.ObjectId(),
                           email: req.body.email,
                           password: hash
                       })
                       user.save()
                           .then(result => {
                               console.log(result)
                               res.status(201).json({
                                   message:"User created"
                               })
                           })
                           .catch(err => {
                               console.log(err)
                               res.status(500).json({
                                   error:err
                               })
                           })
                    } 
               })
            }
        })
        // .catch()
}

exports.user_login = (req,res,next) => {
    User   
        .find({email : req.body.email})
        .exec()
        .then(user => { //user is array, null if no user found
            if(user.length < 1){
                return res.status(401).json({ //401 means unauthroized
                    message: "Auth failed"
                })
            }
            //(err,res) is callback func and is done here just in case comparison fails
            bcrypt.compare(req.body.password,user[0].password,(err,result) => {
                if(err){
                    return res.status(401).json({ //401 means unauthroized
                        message: "Auth failed"
                    })
                }
                if(result){//pw correct
                    //first configuration is payload that we want to pass to client
                    const token = jwt.sign(
                        {
                        email: user[0].email,
                        userId: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn:"1h"
                        }
                        //callback not used as fourth parameter hence becomes
                        )
                    return res.status(200).json({
                        message:'Auth successful',
                        token: token
                    })
                }
                //if pw is incorrect
                res.status(401).json({ 
                    message: "Auth failed"
                })
            })

        })
        .catch(err => {
        console.log(err)
        res.status(500).json({
            error : err
        })
    })
}

exports.user_delete = (req,res,next) => {
    User.remove({_id : req.params.userId})
        .exec()
        .then(result => {
            console.log(result)
            res.status(200).json({
                message: 'Successfully deleted user'
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error : err
            })
        })
}