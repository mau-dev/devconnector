const express = require('express');
const router = express.Router();

//express validator for authentication
const {
    check,
    validationResult
} = require('express-validator/check');

//bringing the model for the user
const User = require('../../models/user');

//@route    POST api/posts
//@desc      register user
//@access    Public

//adding checks as a second parameter in the route as middleware, from express-validator
router.post(
    '/',
    [
        check('name', 'Name is required')
        .not()
        .isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({
            min: 6
        })

    ],
    async (req, res) => {
        //set errors to validation result in the body, taking the requests from above
        const errors = validationResult(req);
        //check if there are errors return result with array with the response
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        //pulling from request.body
        const {
            name,
            email,
            password
        } = req.body;


        try {
            //see if the user exists
            let user = await User.findOne({
                email
            });

            if (user) {
                res.status(400).json({
                    errors: [{
                        msg: 'User already exists'
                    }]
                });
            }

            //get users gravatar based on email

            //encrypt password

            //return jsonwebtoken


        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server error');
        }


    });

module.exports = router;