const express = require('express');
const router = express.Router();
//bringing the middleware
const auth = require('../../middleware/auth');
//bringing the user model
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
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
                return res
                    .status(400)
                    .json({
                        //to get the same type of errors on the client side
                        errors: [{
                            msg: 'User already exists'
                        }]
                    });
            }

            //get users gravatar based on email
            //passing the user's email into  a method to get it
            const avatar = gravatar.url(email, {
                //passing options
                //size of the string up to 200 char
                s: '200',
                //passing raiting, set to PG (restrict inappropreate photos) 
                r: 'pg',
                //setting default immage if none
                d: 'mm'

            });

            //just creating a user instancce
            //for further saving to the db, call user.save()
            user = new User({
                name,
                email,
                avatar,
                password
            });

            //encrypt password

            //salt before encryption, with getting a promise from bcrypt.json
            //put await before everything that returns a promise
            const salt = await bcrypt.genSalt(10);
            //hash the password, taking the plain password and the salt
            user.password = await bcrypt.hash(password, salt);

            //save the user to the db 
            await user.save();
            console.log('saved to database')
            //the response I will get in postmen after successfull registration
            // res.send('User registered');
            //return jsonwebtoken
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