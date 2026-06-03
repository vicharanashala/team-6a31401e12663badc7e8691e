const Question = require('../models/questionModel');
const Answer = require('../models/answerModel');
const Tag = require('../models/tagModel');

// GET ALL QUESTIONS FUNCTION
const getAllQuestions = async (req, res) => {
    try {
        // ALL QUESTIONS, NEWEST FIRST
        const questions = await Question.find()
            .populate('user_id', 'name email')
            .populate('tag_id', 'tag_name')
            .sort({ created_at : -1});

        res.status(200).json({
            success : true,
            count : questions.length,
            data : questions
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// GET QUESTION BY ID FUNCTION
const getQuestionById = async (req, res) => {
    try {
        // FIND QUESTION WITH SPECIFIC ID
        const question = await Question.findById(req.params.id)
            .populate('user_id', 'name email')
            .populate('tag_id', 'tag_name');

        // VALIDATE IF QUESTION IS EMPTY OR NOT    
        if (!question) {
            return res.status(404).json({ 
                success : false,
                message: 'Question not found' 
            });
        }

        res.status(200).json({
            success : true,
            data : question
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// GET QUESTIONS BY USER FUNCTION
const getQuestionsByUser = async (req, res) => {
    try {
        // FIND ALL QUESTIONS POSTED BY SPECIFIC USER
        const questions = await Question.find({ user_id: req.params.userId })
            .populate('tag_id', 'tag_name')
            .sort({ created_at : -1 });

        res.status(200).json({
            success : true,
            count : questions.length,
            data : questions
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};


// GET QUESTIONS BY TAG FUNCTION
const getQuestionsByTag = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.tagId);
        
        // FIND QUESTIONS HAVING THIS TAG
        const questions = await Question.find({ tag_id: req.params.tagId })
            .populate('user_id', 'name email')
            .populate('tag_id', 'tag_name')
            .sort({ created_at : -1 });

        res.status(200).json({
            success : true,
            tag : tag.tag_name || tag_name,
            count : questions.length,
            data : questions
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// CREATE QUESTION FUNCTION
const createQuestion = async (req, res) => {
    try {
        // GET FOLLOWING FROM THE USER
        const { question, tag_id } = req.body;

        // VALIDATE IF QUESTION TEXT IS EMPTY OR NOT
        if(!question || !question.trim()) {
            return res.status(400).json({
                success : false,
                message : 'Question is required'
            });
        }

        // CREATE NEW QUESTION
        const newQuestion = await Question.create({
            question : question.trim(),
            tag_id : tag_id || [],
            user_id : req.user_id,
            up_votes : 0,
            down_votes : 0,
            upvoted_by : [],
            downvoted_by : []
        });

        await newQuestion.populate('user_id', 'name email');
        await newQuestion.populate('tag_id', 'tag_name');

        res.status(201).json({
            success : true,
            message : 'Question posted successfully',
            data : newQuestion
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// UPDATE QUESTION FUNCTION
const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, tag_id } = req.body;

        // FIND QUESTION BY ID 
        const questionDoc = await Question.findById(id);
        if(!questionDoc) {
            return res.status(404).json({
                success : false,
                message : 'Question not found'
            });
        }

        // CHECK WHETHER USER IS AUTHOR OF QUESTION OR ADMIN - ONLY THEY CAN UPDATE QUESTION
        const isAuthor = questionDoc.user_id.toString() === req.user_id;
        const isAdmin = req.user_role === 'admin';

        if(!isAuthor && !isAdmin) {
            return res.status(403).json({
                success : false,
                message : 'User not authorized to update question'
            });
        }

        // UPDATE THE FIELD PROVIDED
        if(question) questionDoc.question = question.trim();
        if(tag_id) questionDoc.tag_id = tag_id;

        // SAVE THE QUESTION IN DATABASE
        questionDoc.updated_at = Date.now();
        await questionDoc.save();

        await questionDoc.populate('user_id', 'name email');
        await questionDoc.populate('tag_id', 'tag_name');

        res.status(200).json({
            success : true,
            message : 'Question Updated successfully',
            data : questionDoc
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// DELETE QUESTION FUNCTION
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        // FIND QUESTION WITH GIVEN ID
        const question = await Question.findById(id);
        if(!question) {
            return res.status(404).json({
                success : false,
                message : 'Question not Found'
            });
        }

        // CHECK WHETHER USER IS AUTHOR OF QUESTION OR ADMIN - ONLY THEY CAN DELETE QUESTION
        const isAuthor = question.user_id.toString() === req.user_id;
        const isAdmin = req.user_role === 'admin';

        if(!isAuthor && !isAdmin) {
            return res.status(403).json({
                success : false,
                message : 'User not authorized to delete'
            });
        }

        // DELETE QUESTION AND ALL ASSOCIATED ANSWERS FROM DATABASE
        await Question.findByIdAndDelete(id);
        await Answer.deleteMany({ question_id : id });

        res.status(200).json({ 
            success : true,
            message: 'Question deleted successfully' 
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// UP VOTE A QUESTION FUNCTION 
const upvoteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user_id;

        // FIND QUESTION BY ID
        const question = await Question.findById(id);
        if(!question) {
            return res.status(404).json({
                success : false,
                message : 'Question not found'
            });
        }

        // PREVENT USER FROM UP VOTING THEIR OWN QUESTION
        if(question.user_id.toString() === userId) {
            return res.status(400).json({
                success : false,
                message : 'You cannot upvote your own question'
            });
        }

        // CHECK WHETHER USER HAVE ALREADY UP VOTED OR NOT
        if(question.upvoted_by && question.upvoted_by.includes(userId)) {
            return res.status(400).json({
                success : false,
                message : 'You have already upvoted this question'
            });
        }

        // UP VOTE AND SAVE IN DATABASE
        let updateOperation = {
            $inc : { up_votes : 1},
            $addToSet : { upvoted_by : userId }
        };

        const upvotedQuestion = await Question.findByIdAndUpdate(
            id,
            updateOperation,
            { new : true}
        );

        res.status(200).json({
            success : true,
            message : 'Question upvoted successfully',
            data : upvotedQuestion.up_votes
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// DOWN VOTE A QUESTION FUNCTION
const downvoteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user_id;

        // FIND QUESTION BY ID
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ 
                success : false,
                message: 'Question not found' 
            });
        }

        // PREVENT USER FROM DOWN VOTING THEIR OWN QUESTION
        if(question.user_id.toString() === userId) {
            return res.status(400).json({
                success : false,
                message : 'You cannot downvote your own question'
            });
        }

        // CHECK WHETHER USER HAVE ALREADY DOWN VOTED OR NOT
        if(question.downvoted_by && question.downvoted_by.includes(userId)) {
            return res.status(400).json({
                success : false,
                message : 'You have already downvoted this question'
            });
        }

        // DOWN VOTE AND SAVE IN DATABASE
        let updateOperation = {
            $inc : { down_votes : 1 },
            $addToSet : { downvoted_by : userId }
        };

        const updatedQuestion = await Question.findByIdAndUpdate(
            id, 
            updateOperation,
            { new : true}
        );

        res.status(200).json({
            success : true,
            message : 'Question down voted successfully',
            data : updatedQuestion.down_votes
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    upvoteQuestion,
    downvoteQuestion,
    getQuestionsByUser,
    getQuestionsByTag
};