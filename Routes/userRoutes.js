const express = require('express');
const router = express.Router();
const User = require("../models/user");
const {jwtMiddleware,gToken} = require('../jwt')
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the User data

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // Save the new User to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = gToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract aadhar and password from request body
        const {aadhar, password} = req.body;

        // Find the user by aadhar
        const user = await User.findOne({aadhar: aadhar});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // generate Token 
        const payload = {
            id: user.id
        }
        const token = gToken(payload);

        // resturn token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
router.put('/profile/password',async(req,res)=>{
    try {
       const Userid = req.user;
       const{currentPassword, newPassword}=req.body;
       const user = await User.findById(Userid);

       if(!(await user.comparePassword(currentPassword))){
        return res.status(401).json({error:"unauthorized"});
       }
       //updating the password
       user.password = newPassword;
       await user.save();
       console.log("password updated :)");
       res.status(200).json(response);
    }catch (error) {
    console.log("error");
    res.status(500).json({error:'Internal server error'}); 
    }
});

module.exports= router;