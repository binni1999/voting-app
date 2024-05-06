const express = require('express')
const router = express.Router();

const User = require('./../models/user');
const { generateToken, jwtAuthMiddleware } = require('../jwt');

router.get('/usersList', async (req, res) => {
    const users = await User.find();
    return res.status(200).json({ data: users })
})
//Post route to create a new User 
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const newUser = new User(data);

        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        const token = generateToken(payload);
        res.status(200).json({ response: response, token: token })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" })

    }

})

router.post('/login', async (req, res) => {
    try {
        //Find the user in the database using their
        const { aadharCardNumber, password } = req.body;

        const user = await User.findOne({ aadharCardNumber });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(404).json({ error: 'Invalid username or password' });
        }
        //generate token
        const payload = {
            id: user.id,


        }
        const token = generateToken(payload);
        res.status(200).json({ token })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" })
    }
})

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {

        const userdata = req.user;
        const user = await User.findById(userdata.id);
        res.status(200).json({ user })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" })
    }
})


router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: "Old password did not match" })
        }

        user.password = newPassword;
        await user.save();
        console.log('Password updates');
        res.status(200).json({ message: "Password updated" })


    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" })
    }
})

module.exports = router;