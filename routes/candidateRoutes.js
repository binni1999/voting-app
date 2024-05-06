const express = require('express')
const router = express.Router();
const Candidate = require('./../models/candidate')
const User = require('./../models/user')
const { jwtAuthMiddleware, generateToken } = require('./../jwt')

const checkAdminRole = async (userId) => {

    try {
        const user = await User.findById(userId);
        return user.role === 'admin' ? true : false;
    } catch (err) {
        return false;
    }
}

router.post('/', jwtAuthMiddleware, async (req, res) => {

    try {
        if (await checkAdminRole(req.user.id)) {
            const data = req.body;
            const newCandidate = new Candidate(data);

            const response = await newCandidate.save();
            res.status(201).json({ response: response })
        } else {
            return res.status(403).json({ message: "You are not the admin to create the candidate user" })
        }

    } catch (error) {
        res.status(500).json({ error: "Internal server error " })
    }
})

router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {

        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: "You are not the admin to update the candidate user" })
        const candidateId = req.params.candidateID;
        const updatedCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true,//return the updated document
            runValidators: true
        });
        if (!response)
            return res.status(400).json({ error: "Candidate not found" })
        console.log("Candidate data updated");
        res.status(200).json(response)


    } catch (error) {
        res.status(500).json({ error: "Internal server error " })
    }
})

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: "You are not the admin to delete the candidate user" })
        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);
        if (!response) return res.status(404).json({ error: "No candidate found with the given id" })
        res.status(200).json({ message: 'Deleted Successfully' });
    } catch (error) {
        res.status(500).json({ error: "Internal server error " })
    }
})

//lets start voting 
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    //no admin can vote

    //user can only vote once 
    const candidateID = req.params.candidateID;
    const userID = req.user.id;


    try {
        const candidate = await Candidate.findById(candidateID);
        console.log(candidate);

        if (!candidate) return res.status(400).json({ message: "Candidate not found" })
        const user = await User.findById(userID);
        console.log(user);

        if (!user) return res.status(400).json({ message: "user not found" })

        if (user.isVoted) {
            return res.status(400).json({ message: "You have already voted" })
        }
        if (user.role === 'admin') return res.status(403).json({ message: "Admin is not allowed to vote" })

        candidate.votes.push({ user: userID })
        candidate.voteCount++;
        await candidate.save();

        //update the user document 

        user.isVoted = true;
        await user.save()

        res.status(200).json({ message: "Vote recorded Successfully" })
    } catch (err) {
        res.status(500).json({ error: "Internal server error " })
    }

})

//vote count 
router.get("/vote/count", async (req, res) => {
    try {
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });
        //Map the candidate to only return their name and voteCount 
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })
        return res.status(200).json({ voteRecord })

    } catch (err) {
        res.status(500).json({ error: "Internal server error " })
    }
})

module.exports = router;