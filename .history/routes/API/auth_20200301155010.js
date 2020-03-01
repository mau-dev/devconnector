const express = require('express');
const router = express.Router();
//bringing the middleware
const auth = require('../../middleware/auth');

// @route   GET api/auth
// @desc    Test route
// @access  Public

//to use the middleware is added as a second paramether, will make the route protected 
router.get('/', auth, (req, res) => res.send('Auth route'));

module.exports = router;