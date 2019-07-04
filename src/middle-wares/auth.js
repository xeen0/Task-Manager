const jwt = require('jsonwebtoken')
const User = require('../db/models/user')

const auth = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        var decoded = jwt.verify(token,process.env.passphrase)
        const user = await User.findOne({"_id":decoded._id,"tokens.token":token})
        if(!user){
            throw new Error()
        }
        req.token = token
        req.user = user 
    
        next()
    }catch(e){
        res.send("Please provide authtentication")
    }
}
module.exports= auth 