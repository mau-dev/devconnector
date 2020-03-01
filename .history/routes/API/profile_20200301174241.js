const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const {
    check,
    validationResult
} = require('express-validator');
// bring in normalize to give us a proper url, regardless of what user entered
// const normalize = require('normalize-url');

const Profile = require('../../models/Profile');
const User = require('../../models/User');


// @route   GET api/profile/me 
// @desc    Get current users profile
// @access  Private

//bringing the auth middleware to access the private route
router.get('/me', auth, async (req, res) => {
    try {
        //profile variable set to await, to call a model method
        //then taking the Profile model
        //then calling the method populate, to populate with data from the User model
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });
        }
        //if there is profile, send the profile
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private

//bringing the auth middleware and the validation middleware in the square brackets
router.post(
    '/',
    [
        auth,
        [
            //validation middleware to check the required fields
            check('status', 'Status is required')
            .not()
            .isEmpty(),
            check('skills', 'Skills is required')
            .not()
            .isEmpty(),
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }


    });


module.exports = router;