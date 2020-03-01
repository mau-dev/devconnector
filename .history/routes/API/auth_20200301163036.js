const express = require('express');
const router = express.Router();
//bringing the middleware
const auth = require('../../middleware/auth');
//bringing the user model
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator');

// @route   GET api/auth
// @desc    Get user by token
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

//@route    POST api/auth
//@desc      Authenticate user & get token
//@access    Public


router.post(
    '/',
    [

        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Password is required'
        ).exists()

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
            email,
            password
        } = req.body;

        try {
            //see if the user exists
            let user = await User.findOne({
                email
            });
            //if there is not a user send errror
            if (!user) {
                return res
                    .status(400)
                    .json({
                        //to get the same type of errors on the client side
                        errors: [{
                            msg: 'Invalid credentials'
                        }]
                    });
            }

            //match the found user with the password
            //byctiot has a method called compare which takes plain text password and encrypted password
            //and tells if there is a match
            //compare returns a promisse

            //takes password(the plain text password user enters on login) and the encrypted password from the database(user.oassword)
            const isMatch = await bcrypt.compare(password, user.password);

            //if not match return invalid credentials as well
            if (!isMatch) {
                return res
                    .status(400)
                    .json({
                        //to get the same type of errors on the client side
                        errors: [{
                            msg: 'Invalid credentials'
                        }]
                    });

            }


            //the payload, object with a user, 
            const payload = {
                user: {
                    id: user.id
                }
            };
            //sign the token,passing the payload and the secret
            //expiration is optional
            //in the callback we either get an error or the token
            //if no error, we send the token back to the client
            jwt.sign(
                payload,
                config.get('jwtSecret'), {
                    expiresIn: 3600000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token
                    });
                }
            );

        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server error');
        }


    });

module.exports = router;