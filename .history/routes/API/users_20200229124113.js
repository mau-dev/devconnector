const express = require('express');
const router = express.Router();

//@route    POST api/posts
//@desc      register user
//@access    Public

//public route that we don't need token for
router.post('/', (req, res) => {
    console.log(req.body)
    res.send('User note');
});

module.exports = router;