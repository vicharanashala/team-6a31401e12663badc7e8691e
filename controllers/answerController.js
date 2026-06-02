const Answer = require('../models/answerModel');
const Question = require('../models/questionModel');

//CREATE ANSWER FUNCTION
const createAnswer = async (req, res) => {
    try {
        const { answer } = req.body;

        // VALIDATE INPUT - PREVENT EMPTY ANSWERS
        if(!answer || answer.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Answer cannot be empty'
            });
        }

        // CHECK IF QUESTION EXISTS BEFORE CREATING ANSWER
        const question = await Question.findById(req.params.questionId);
        if(!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // CREATE ANSWER IN DATABASE
        const newAnswer = await Answer.create({
            answer,
            user_id : req.user_id,
            question_id: req.params.questionId
        });

        res.status(201).json({
            success : true,
            data : newAnswer
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message: error.message
        });
    }
};

//GET ANSWERS BY QUESTION ID FUNCTION
const getAnswersByQuestion = async (req, res) => {
    
    // FIND ALL ANSWERS FOR THIS QUESTION
    try { 
        const answers = await Answer.find({
            question_id: req.params.questionId
        })
        .populate('user_id', 'username')
        .sort({ up_votes: -1, created_at: -1 });

        res.status(200).json({
            success : true,
            count : answers.length,
            data : answers
        });
    } catch (error) {
        res.status(500).json({ 
            success : false,
            message: error.message 
        });
    }
};


// GET ANSWERS BY USER ID FUNCTION
const getAnswersByUser = async (req, res) => {
    
    // FIND ALL ANSWERS BY THIS USER
    try {
        const answers = await Answer.find({
            user_id : req.params.userId
        })
        .populate('question_id', 'title')
        .sort({ created_at: -1 });

        res.status(200).json({
            success : true,
            count : answers.length,
            data : answers
        });
    } catch (error) {
        res.status(500).json({
            success : false,
            message: error.message
        });
    }
};

// UPDATE ANSWER FUNCTION
const updateAnswer = async (req, res) => {
    try {
        // FIRST FIND THE ANSWER
        const answer = await Answer.findById( req.params.id );

        // CHECK IF ANSWER EXISTS
        if(!answer) {
            return res.status(404).json({
                success : false,
                message : 'Answer not found'
            });
        }

        // CHECK IF USER IS OWNER OF ANSWER OR ADMIN - ONLY THEY CAN UPDATE
        if(answer.user_id.toString() !== req.user_id && req.user_role !== 'admin') {
            return res.status(403).json({
                success : false,
                message : 'User not authorized to update this answer'
            });
        }

        const updateData = {
            ...req.body,
            updated_at: Date.now() 
        };

        // UPDATE ANSWER 
        const updatedAnswer = await Answer.findByIdAndUpdate(
            req.params.id,
            updateData,
            {new : true, 
            runValidators : true}
        );

        res.status(200).json({
            success : true,
            data : updatedAnswer
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// DELETE ANSWER FUNCTION
const deleteAnswer = async (req, res) => {
    try {
        // FIRST FIND THE ANSWER
        const answer = await Answer.findById(req.params.id);

        // CHECK IF ANSWER EXISTS
        if(!answer) {
            return res.status(404).json({
                success : false,
                message : 'Answer not found'
            });
        }

        // CHECK IF USER IS OWNER OF ANSWER OR ADMIN - ONLY THEY CAN DELETE
        if(answer.user_id.to_String() !== req.user_id && req.user_role !== 'admin') {
            return res.status(403).json({
                success : false,
                message : 'User not authorized to delete this answer'
            });
        }

        // DELETE ANSWER
        await Answer.findByIdAndDelete(req.params.id);

        res.status(200).json({ 
            success : true,
            message: 'Answer deleted' 
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// NEED TO DISCUSS WHETHER FUNCTION IS NEEDED OR NOT

// // ACCEPT ANSWER FUNCTION
// const acceptAnswer = async (req, res) => {
//     try {
//         // FIRST FIND THE ANSWER
//         const answer = await Answer.findById(req.params.id);

//         // CHECK IF ANSWER EXISTS
//         if(!answer) {
//             return res.status(404).json({ 
//                 success : false,
//                 message: 'Answer not found' 
//             });
//         }

//         // FIND THE QUESTION TO WHICH THIS ANSWER BELONGS
//         const question = await Question.findById(answer.question_id);

//         // CHECK IF USER IS OWNER OF QUESTION OR ADMIN - ONLY THEY CAN ACCEPT ANSWER
//         if(question.user_id.to_String() !== req.user_id && req.user_role !== 'admin') {
//             return res.status(403).json({
//                 success : false,
//                 message : 'User not authorized to accept this answer'
//             });
//         }

//         // FIRST UNACCEPT ANY PREVIOUSLY ACCEPTED ANSWER FOR THIS QUESTION
//         await Answer.updateMany(
//             { question_id: answer.question_id },
//             {is_accepted: false }
//         );

//         // THEN ACCEPT THIS ANSWER
//         const updatedAnswer = await Answer.findByIdAndUpdate(
//             req.params.id,
//             { is_accepted: true },
//             { new: true }
//         );

//         res.status(200).json({
//             success : true,
//             data : updatedAnswer
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success : false,
//             message: error.message 
//         });
//     }
// };

// UPVOTE ANSWER FUNCTION
const upvoteAnswer = async (req, res) => {
    try {
        // FIRST FIND THE ANSWER
        const answer = await Answer.findById(req.params.id);

        // CHECK IF ANSWER EXISTS
        if(!answer) {
            return res.status(404).json({
                success : false,
                message : 'Answer not found'
            });
        }

        // CHECK IF USER HAS ALREADY UPVOTED THIS ANSWER
        if(answer.upvoted_by && answer.upvoted_by.includes(req.user_id)) {
            return res.status(400).json({
                success : false,
                message : 'You have already upvoted this answer'
            });
        }

        // INCREMENT UPVOTE COUNT 
        const updatedAnswer = await Answer.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { up_votes: 1 },
                $addToSet: { upvoted_by: req.user_id }
            },
            { new: true }
        );

        res.status(200).json({
            success : true,
            data : updatedAnswer
        });
    } catch (error) {
        res.status(500).json({ 
            success : false,
            message: error.message 
        });
    }
};

// DOWNVOTE ANSWER FUNCTION
const downvoteAnswer = async (req, res) => {
    try {
        // FIRST FIND THE ANSWER
        const answer = await Answer.findById(req.params.id);

        // CHECK IF ANSWER EXISTS
        if(!answer) {
            return res.status(404).json({
                success : false,
                message : 'Answer not found'
            });
        }

        // CHECK IF USER HAS ALREADY DOWNVOTED THIS ANSWER
        if(answer.downvoted_by && answer.downvoted_by.includes(req.user_id)) {
            return res.status(400).json({
                success : false,
                message : 'You have already downvoted this answer'
            });
        }

        // INCREMENT DOWNVOTE COUNT
        const updatedAnswer = await Answer.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { down_votes: 1 },
                $addToSet: { downvoted_by: req.user_id }
            },
            { new: true }
        );

        res.status(200).json({
            success : true,
            data : updatedAnswer
        });
    } catch (error) {
        res.status(500).json({ 
            success : false,
            message: error.message 
        });
    }
};

module.exports = {
    getAnswersByQuestion,
    getAnswersByUser,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    //acceptAnswer,
    upvoteAnswer,
    downvoteAnswer
};