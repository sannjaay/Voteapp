const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtMiddleware = (req,res,next)=>{
    const header = req.headers.authorization;
    if(!header)return res.status(401).json({error:"Token not found"})
    const token = req.headers.authorization.split(' ')[1];
    if(!token)res.status(401).json({error:"unauthorized"});

    try {
        //jwt token verification
        const response = jwt.verify(token,process.env.JWT_KEY);
        req.user = response;
        next();
    } catch (err) {
        console.log("Error");
        res.status(401).json({error:"unauthorized"});
    }
};
//generating the token
const gToken = (userData)=>{
    return jwt.sign(userData,process.env.JWT_KEY);
}
module.exports= {jwtMiddleware,gToken};