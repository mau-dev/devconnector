const express = require('express');
const router = express.Router();

//express validator for authentication
const {
    check,
    validationResult
} = require('express-validator/check');

const User = require

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
    (req, res) => {
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

        //see if the user exists

        //get users gravatar based on email

        //encrypt password

        //return jsonwebtoken

        res.send('User note');
    });

module.exports = router;