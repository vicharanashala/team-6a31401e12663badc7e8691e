const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    
    // QUESTION TEXT
    title : {
        type : String,
        required : [true, 'Question title is required'],
        trim : true,
        unique : true,
        minlength : [10, 'Title must be atleast 10 characters long'],
        maxlength : [500, 'Title cannot exceed 500 characters'],
        index : true
    },
    
    description: {
        type: String,
        trim: true,
        default: '',
        maxlength: [800, 'Description cannot exceed 800 characters']
    },

    // USER ID - WHO POSTED QUESTION
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index : true
    },

    // TAG ID 
    tag_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: [true, 'tag is required'],
        index : true
    },

    // VOTES COUNT 
    up_votes : {
        type : Number,
        default : 0,
        min : 0
    },
    down_votes : {
        type : Number,
        default : 0,
        min : 0
    }, 

    // UPVOTED AND DOWNVOTED ARRAYS
    upvoted_by : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],
    downvoted_by : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],

    // USED TO CHECK WHETHER QUESTION PROMOTED TO FAQ OR NOT
    isConvertedToFAQ : {
        type : Boolean,
        default : false,
        index : true
    },

    // TIME STAMPS
    created_at : {
        type : Date,
        default : Date.now,
        immutable : true,
    },
    updated_at : {
        type : Date,
        default : Date.now
    }

});

questionSchema.index({ created_at : -1 });
questionSchema.index({ user_id : 1, created_at : -1 });
questionSchema.index({ tag_id : 1, created_at : -1 });
questionSchema.index({ isConvertedToFAQ : 1, up_votes : -1 });

questionSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Question', questionSchema);
