const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
    
    // QUESTION
    question : {
        type : String,
        required : [true, 'FAQ question is required'],
        trim : true,
        unique : true,
        index : true
    },

    // ANSWER
    answer : {
        type : String,
        required : [true, 'FAQ answer is required'],
        trim : true
    },

    // ASSOCIATED TAG
    tag : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
        index : true
    },

    // RELATIONSHIP FIELD - ORIGINAL ID WHEN USER POSTED
    original_question_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Question',
        required : false
    },

    // RELATIONSHIP FIELD - ORIGINAL ID WHEN USER POSTED
    original_answer_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Answer',
        required : false
    }
});
faqSchema.index({ question : 'text' });
faqSchema.index({ tag : 1, question : 1});

module.exports = mongoose.model('FAQ', faqSchema);