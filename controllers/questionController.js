//CREATE CURD APIS 
const Question = require('../models/questionModel');

const getAllQuestions = async (req, res) => {
    try {

        const questions = await Question.find()
            .populate('user_id', 'name')
            .populate('tag_id', 'tag_name');

        res.json(questions);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json(question);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//cleaner one
const createQuestion = async (req, res) => {
    try {
        const { question, user_id, tag_id } = req.body;

        const newQuestion = await Question.create({
            question,
            user_id,
            tag_id
        });

        res.status(201).json(newQuestion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// const createQuestion = async (req, res) => {

//     try {

//         const { question } = req.body;

//         const newQuestion = new Question({
//             question
//         });

//         const savedQuestion = await newQuestion.save();

//         res.status(201).json(savedQuestion);

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// UPDATE QUESTION
const updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(question);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE QUESTION
const deleteQuestion = async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: "Question deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
////from this didnt test

const upvoteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { $inc: { up_votes: 1 } },
            { new: true }
        );

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const downvoteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { $inc: { down_votes: 1 } },
            { new: true }
        );

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// const upvoteQuestion = async (req, res) => {
//     try {
//         const question = await Question.findByIdAndUpdate(
//             req.params.id,
//             { $inc: { up_votes: 1 } },
//             { new: true }
//         );

//         if (!question) {
//             return res.status(404).json({ message: "Question not found" });
//         }

//         res.json(question);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// const downvoteQuestion = async (req, res) => {
//     try {
//         const question = await Question.findByIdAndUpdate(
//             req.params.id,
//             { $inc: { down_votes: 1 } },
//             { new: true }
//         );

//         if (!question) {
//             return res.status(404).json({ message: "Question not found" });
//         }

//         res.json(question);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

const getQuestionsByUser = async (req, res) => {
    try {
        const questions = await Question.find({
            user_id: req.params.userId
        });

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuestionsByTag = async (req, res) => {
    try {
        const questions = await Question.find({
            tag_id: req.params.tagId
        });

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

///till here
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