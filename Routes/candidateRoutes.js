const express = require('express');
const router = express.Router();
const User = require("../models/user");
const Candidate = require("../models/candidate");
const {jwtMiddleware,gToken} = require('../jwt')

const checkAdminRole = async(Userid)=>{
    try {
        const user = await User.findById(Userid);
        return user.role ==='admin';
    } catch (err) {
        return false;
    }
};
//creates a candidate

router.post('/',jwtMiddleware ,async (req, res) =>{

    try{
        if(!await checkAdminRole(req.user.id)){
            return res.status(403).json({message:"You Should be an Admin to do this operation"})
        }
        const data = req.body // Assuming the request body contains the candidate data

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new User to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})
router.put('/:candidateid',jwtMiddleware ,async(req,res)=>{
    try {
        if(!await checkAdminRole(req.user.id)){
           return res.status(403).json({message:"You Should be an Admin to do this operation"})
        }
        const candidateid= req.params.candidateid;
        const data= req.body;
        const response = await Person.findByIdAndUpdate(candidateid,data,{
        new:true,
        runValidators:true
    })
    if(!response){
        res.status(404).json("Candidate Not found");
    }
    res.status(200).json(response);
    console.log("Candidate Data updated");
    }catch (error) {
    console.log("error");
    res.status(500).json({error:'Internal server error'}); 
    }
});
router.delete('/:candidateid',jwtMiddleware ,async(req,res)=>{
    try {
        if(! await checkAdminRole(req.user.id)){
           return res.status(403).json({message:"You Should be an Admin to do this operation"})
        }
        const candidateid= req.params.candidateid;
        const response = await Person.findByIdAndDelete(candidateid)
    if(!response){
        res.status(404).json("Candidate Not found");
    }
    res.status(200).json(response);
    console.log("Candidate Data updated");
    }catch (error) {
    console.log("error");
    res.status(500).json({error:'Internal server error'}); 
    }
});
//this starts voting
router.post('/vote/:candidateid', jwtMiddleware,async (req,res)=>{
    candidateid= req.params.candidateid,
    userid = req.user.id;
    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateid);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userid);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }
        // Update the Candidate document to record the vote
        candidate.votes.push({user: userid})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }

});
// vote count 
router.get('/vote/count', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.get('/candidate',async (req,res)=>{
    try {
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
module.exports= router;