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
});


// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private

router.get('/:id', auth, async (req, res) => {
    try {
        //pass the params from the url
        const post = await Post.findById(req.params.id);
        //if no post with that id exists
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        //find the post by params id

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        };

        // Check user
        //make sure that the user who deleted the post is the uset who created the post
        //match the post user to loged in user
        //post.user is object, stringify to compare with the req.user.id string
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            });
        };
        //if user match, remove post
        await post.remove();
        res.json({
            msg: 'Post removed'
        });
    } catch (err) {
        console.error(err.message);
        //if the post searched doesn't exist
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            });
        };
        res.status(500).send('Server Error');
    };
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private

//put since updating the post
router.put('/like/:id', auth, async (req, res) => {
    try {
        //find the post by params id
        const post = await Post.findById(req.params.id);

        // Check if post has already been liked by this user
        //iterrate througn the likes array, filter the users, check if the current user exists in the array
        //to check it it's liked at all, check if the lenght of the output is more than 0
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'Post already liked'
            });
        };
        //if the user hasn't liked that post, unshift the user's like in the 'users that liked' array
        post.likes.unshift({
            user: req.user.id
        });
        //save it to the database
        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.messages);
        res.status(500).send();
    };
});


module.exports = router;