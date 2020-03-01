const express = require('express');
const router = express.Router();
//bringing the middleware
const auth = require('../../middleware/auth');
//bringing the user model
const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public

//to use the middleware is added as a second paramether, will make the route protected 
router.get('/', auth, async (req, res) => {
    //changing the route to return user's data
    try {
        //taking the user model
        const user = await User.findById(req.user.id).select('-password');
        //sending the user as response
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;