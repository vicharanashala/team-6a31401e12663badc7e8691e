const Answer = require('../models/answerModel');
const Question = require('../models/questionModel');




//cleaner ig
const createAnswer = async (req, res) => {
    try {
        const { answer, user_id } = req.body;

        const newAnswer = await Answer.create({
            answer,
            user_id,
            question_id: req.params.questionId
        });

        res.status(201).json(newAnswer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



//with sorting
const getAnswersByQuestion = async (req, res) => {
    try {
        const answers = await Answer.find({
            question_id: req.params.questionId
        }).sort({ up_votes: -1, created_at: -1 });

        res.json(answers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


///later ig
const getAnswerByUser = (req, res) => {
    res.json({ message: "Get answers by user" });
};

// const createAnswer = async (req, res) => {

//     try {

//         const { answer } = req.body;

//         const newAnswer = new Answer({
//             answer,
//             question_id: req.params.questionId
//         });

//         const savedAnswer = await newAnswer.save();

//         res.status(201).json(savedAnswer);

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };


const updateAnswer = async (req, res) => {
    try {
        const answer = await Answer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(answer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// DELETE ANSWER
const deleteAnswer = async (req, res) => {
    try {
        await Answer.findByIdAndDelete(req.params.id);
        res.json({ message: "Answer deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
///testing not done
const acceptAnswer = async (req, res) => {
    try {
        const answer = await Answer.findByIdAndUpdate(
            req.params.id,
            { is_accepted: true },
            { new: true }
        );

        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        res.json(answer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





const upvoteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findByIdAndUpdate(
            req.params.id,
            { $inc: { up_votes: 1 } },
            { new: true }
        );

        res.json(answer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const downvoteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findByIdAndUpdate(
            req.params.id,
            { $inc: { down_votes: 1 } },
            { new: true }
        );

        res.json(answer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




module.exports = {
    getAnswersByQuestion,
    getAnswerByUser,
    createAnswer,
    updateAnswer,
    deleteAnswer,
    acceptAnswer,
    upvoteAnswer,
    downvoteAnswer
};