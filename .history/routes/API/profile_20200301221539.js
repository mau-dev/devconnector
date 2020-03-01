const express = require('express');
//the request package for the github request
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
// @desc    Get profile by user ID (not profile id)
// @access  Public

//since public no auth middleware needed
router.get('/user/:user_id', async (req, res) => {
    try {
        //create var profile, by getting profile model with findOne method
        //find by user, the id comes frm the URL params '/user/:user_id'
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({
            msg: 'Profile not found'
        });

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectID') {
            //if the id doesnt exist, return this insted the Server error msg
            return res.status(400).json({
                msg: 'Profile not found'
            });
        }
        res.status(500).send('Server error');
    }
});


// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private

//since ptivate, auth middleware needed
router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users posts

        //Remove profile
        //from one from the profile model pass the user, the object ID
        await Profile.findOneAndRemove({
            user: req.user.id
        });

        //Remove user
        //cause dealing with the user model, use "_id" cause "user" is field in the model
        await User.findOneAndRemove({
            _id: req.user.id
        });
        res.json({
            msg: 'User deleted'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route   PUT api/profile/experience
// @desc    add profile experience
// @access  Private

//since ptivate, auth middleware needed, also validation middleware to check required fields
router.put('/experience',
    [
        auth,
        [
            //need validation 
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),

        ]
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        //get the experience body data with destructuring the req.body
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        //will create an object with the data the user submits
        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };
        //even though experience is embeded array in the profile model
        //result will get the experience array with it's own id 
        //in document database like mongoDB this kind of structure can be in one collection
        //rather than having to separate experience in separate table with relations
        try {
            //fetch the profile we want to add the experience
            //find by the user field and match by the user token
            const profile = await Profile.findOne({
                user: req.user.id
            });
            //take  the experience as an array, unshift, like push in the array with the most recent coming first
            profile.experience.unshift(newExp);
            //save to the profile
            await profile.save();
            //return the whole profile
            res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });


// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

//in order to delete experience we're need to add the I.D. from the experience from our put request.
//that's the exp_id
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        //getting the profile by the user ID
        //
        const profile = await Profile.findOne({
            user: req.user.id
        });
        //get the remove index, to find the correct experience index to remove
        //match the params to the item from the mapped array
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        //take the profile we have as RemoveIndex, 
        //splice the profile.experiences array by removing the removeIndex(the wanted index that matches the params)
        profile.experience.splice(removeIndex, 1);

        await foundProfile.save();

        //resavig the profile with the modified array
        res.json(profile);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Server error'
        });
    }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    [
        auth,
        [
            check('school', 'School is required')
            .not()
            .isEmpty(),
            check('degree', 'Degree is required')
            .not()
            .isEmpty(),
            check('fieldofstudy', 'Field of study is required')
            .not()
            .isEmpty(),
            check('from', 'From date is required and needs to be from the past')
            .not()
            .isEmpty()
            .custom((value, {
                req
            }) => req.body.to ? value < req.body.to : true)
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        };

        try {
            const profile = await Profile.findOne({
                user: req.user.id
            });

            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });

        // Get the remove index
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    };
});

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  Public

// take a GitHub username and make a request to our back end and 
//then make a request to the get hub API to get the repositories of the user.
//clientID and github secret are set in congig

router.get('/github/:username', (req, res) => {
    try {
        //construct an options object
        //then plug it in the request package
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {
                'user-agent': 'node.js'
            }
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode !== 200) {
                return res.status(404).json({
                    msg: 'No Github profile found'
                });
            };
            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



module.exports = router;