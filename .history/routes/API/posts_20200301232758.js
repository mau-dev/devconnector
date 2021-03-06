const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/posts
// @desc    Test route
// @access  Public
// router.get('/', (req, res) => res.send('Posts route'));


// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
    '/',
    [
        auth,
        [
            check('text', 'Text is required')
            .not()
            .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            //take user model
            const user = await User.findById(req.user.id).select('-password');

            //object for new post
            //text comes from the body
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });

            const post = await newPost.save();

            res.json(post);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get('/', auth, async (req, res) => {
    try {
        //take posts from the post model
        //and sort by date from the most recent
        const posts = await Post.find().sort({
            date: -1
        });

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;