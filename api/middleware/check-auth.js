const jwt= require('jsonwebtoken')

module.exports = (req,res,next) => {
    try{
        const token=req.headers.authorization.split(" ")[1]
        console.log(token)
        const decoded = jwt.verify(/*req.body.token*/token,process.env.JWT_KEY)
        req.userData = decoded //adding new field to req
        next()
    }catch(error){
        return res.status(401).json({
            message:'Auth failed'
        })
    }
    
}