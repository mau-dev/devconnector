const jwt = require('jsonwebtoken');
const config = require('config');


//since moddleware, takes request, response and next
//has access to the request response cycle, 
//next is a callback that we have to run to move to the next piece of middleware
module.exports = function (req, res, next) {
    //get token from the http header
    //when we send request to a protected route is sent to the header
    const token = req.header('x-auth-token');

    //check if no token
    if (!token) {
        return res.status(401).json({
            msg: 'No token, authorisation denied'
        });
    }
    //verify token
    try {
        //decoding the token, with jwt.verify()
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        //taking the request object and assigning value to user
        //setting the req.user to the decoded value which has user in the payload
        //then we can use rec.user in our protected routes
        req.user = decoded.user;
        next();
    } catch (err) {
        //will run if token is not valid
        res.status(401).json({
            msg: 'Token is not valid'
        });

    }

};