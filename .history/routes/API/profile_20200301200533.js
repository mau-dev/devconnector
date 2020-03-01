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
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        //pulling from req.body
        const {
            company,
            location,
            website,
            bio,
            skills,
            status,
            githubusername,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook
        } = req.body;

        //to check if all of the above were added before we try to submit to the db

        //build profile object
        const profileFields = {};
        //this one pulling from user
        profileFields.user = req.user.id;
        //adding each field
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map((skill) => skill.trim());
        }

        //build social object, then do checks
        //if we don't initialise like this will return undefined
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        // console.log(profileFields.social.twitter);

        //once we have the objects initialised
        //update and insert the profile in the detabase
        try {
            //taking the profile model, find by user id
            let profile = await Profile.findOne({
                user: req.user.id
            });
            //if there is profile just update
            if (profile) {
                //update profile if exists
                profile = await Profile.findOneAndUpdate(
                    //find by user
                    {
                        user: req.user.id
                    },
                    //set the profile fields
                    {
                        $set: profileFields
                    },
                    //adding object with new set to true
                    {
                        new: true
                    }
                );
                //return the entire updated profile
                return res.json(profile);
            }
            //create
            //if profile not found, create new  profile
            //taking the same profile variable, setting to new profile instance, passing the profile fields
            //profile instance created from the profile model
            profile = new Profile(profileFields);

            //then save the profile
            await profile.save();
            //return profile
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }

        // res.send('Hello');
    }
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

//since public no auth middleware needed
router.get('/', async (req, res) => {
    try {
        //create var profiles, by getting profile model with find method
        //populate from the user collection, to get the fields for name and avatar
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

//since public no auth middleware needed
router.get('/user/:user_id', async (req, res) => {
    try {
        //create var profile, by getting profile model with findOne method
        //find by user, the id comes frm the URL params '/user/:user_id'
        const profile = await Profile.findOne(user: req.params.user_id).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({
            msg: 'There is no profile for this user'
        });

        res.json(profiles);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
module.exports = router;