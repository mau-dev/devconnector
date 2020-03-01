const mongoose = require('mongoose');
//the mongoose schema saved as Schema var
const Schema = mongoose.Schema;


const PostSchema = new Schema({
    //reference to the user model
    user: {
        //connect users to post
        /*special field type, which is an object I.D. 
        to connect it to an I.D. which is in this in the user model.*/
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    likes: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        text: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now
        }

    }],
    date: {
        type: Date,
        default: Date.now
    }

});

module.exports = Post = mongoose.model('post', PostSchema);