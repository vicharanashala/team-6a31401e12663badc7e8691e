const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    tag_name : {
        type : String,
        required : [true, 'Tag name is required'],
        unique : true,
        trim : true,
        lowercase : true,
        minlength : [5, 'Tag name must be atleast 5 characters'],
        maxlength : [20, 'Tag name cannot exceed 20 characters'],
        index : true
    }
});

module.exports = mongoose.model('Tag', tagSchema);