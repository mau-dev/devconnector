const express = require('express');
const router = express.Router();
//bringing the gravatar package
const gravatar = require('gravatar');
//bringing bcript for the password encryption
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//to access the secret token from config
const config = require('config');
//express validator for authentication
const {
    check,
    validationResult
} = require('express-validator');


//bringing the model for the user
const User = require('../../models/User');

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

//jwt token
/*we want to return a Jason web token Once user registers
 so that way we can use that token to authenticate
and access protected routes.(from the client)
The second part of the token is the payload
That's the data that we want to send within the token (example the name of the user)
what we want to send as the payload in our case is the I.D. the user's I.D. so that we can identify
which user it is with the token.
That way if we want to let's say update our profile we can easily look at that payload and see which
user it is that's logged in and which user's profile we have to update.

the way that this works is with the Jason Webb token package that we have installed,
we need to first sign it and we pass in our payload back and then we can have a callback or we send a response
back to the client with that token.

And then later on, we need to protect our roots by creating a piece of middleware that will
verify the token.

So if we go down here we can call JWT dot verify with the token that sent in.

It's going to get sent in through the HTTP headers and we can verify it and then either allow the user

to access if it verifies or send back a response if says token is invalid.
*/