const Question = require("../models/questionModel");
const Answer = require("../models/answerModel");

// GET FULL FAQ DATA
const getFAQ = async (req, res) => {
    try {
        const questions = await Question.find() //get all question stored in the DB
            .populate("user_id", "name")
            .populate("tag_id", "tag_name");

        const faqs = await Promise.all(
            questions.map(async (q) => {//fetches the answer (related ones)
                const answers = await Answer.find({
                    question_id: q._id
                }).sort({ up_votes: -1 });//in descending order that is highest votes comes first

                return {
                    question: q,
                    answers
                };
            })
        );

        res.json(faqs);//send it

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getFAQ
};