const express = require('express');
const router = express.Router();

// @route    GET api/profile
//@desc      Test route
//@access    Public

//public route that we don't need token for
router.get('/', (req, res) => res.send('Profile note'));

module.exports = router;