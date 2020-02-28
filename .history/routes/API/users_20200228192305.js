const express = require('express');
const router = express.Router();

// @route    GET api/posts
//@desc      Test route
//@access    Public

//public route that we don't need token for
router.get('/', (req, res) => res.send('User note'));

module.exports = router;