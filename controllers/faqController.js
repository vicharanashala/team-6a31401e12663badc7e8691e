const Question = require('../models/questionModel');
const Answer = require('../models/answerModel');
const FAQ = require('../models/faqModel');
const Tag = require('../models/tagModel');

// GET ALL FAQs FUCNTION
const getAllFAQs = async (req, res) => {
    try {
        //FETCH FAQs FROM DATABASE - SORT ACCORDING TO TAG 
        const faqs = await FAQ.find()
            .select('question answer tag')
            .sort({tag : 1, question : 1});

        // ALL UNIQUE TAGS
        const uniqueTags = [...new Set(faqs.map(faq => faq.tag))];

        res.status(200).json({
            success : true,
            count : faqs.length,
            tags : uniqueTags,
            data : faqs
        });
    } catch (err) {
        res.status(500).json({ 
            success : false,
            message: err.message 
        });
    }
};

// SEARCH FAQs FUNCTION
const searchFAQs = async (req, res) => {
    try {
        const { q, tag } = req.query;
        let query = {};

        // TEXT SEARCH FILTER
        if(q && q.trim()) {
            query.$text = { $search : q.trim() };
        }

        // TAG FILTER
        if(tag && tag.trim()) {
            query.tag = tag.trim().toLowerCase();
        }

        // EXECUTE SEARCH
        const faqs = await FAQ.find(query)
            .select('question answer tag')
            .sort({ tag : 1, question : 1});

        const resultTags = [...new Set(faqs.map(faq => faq.tag))];

        res.status(200).json({
            success : true,
            searchQuery : q || null,
            tagFilter : tag || null,
            count : faqs.length,
            tags : resultTags,
            data : faqs
        });
    } catch (err) {
        res.status(500).json({
            success : false,
            message : err.message
        });
    }
};

// GET FAQ BY ID FUNCTION
const getFAQById = async (req, res) => {
    try {
        // GET FAQ FROM DATABASE
        const faq = await FAQ.findById(req.params.id)
            .select('question answer tag original_question_id original_answer_id')

        // CHECK IF FAQ IS EMPTY
        if(!faq) {
            return res.status(404).json({
                success : false,
                message : 'FAQ not found'
            });
        }

        res.status(200).json({
            success : true,
            data : faq
        });
    } catch (err) {
        res.status(500).json({
            success : false,
            message : err.message
        });
    }
};

// CONVERT QUESTION TO FAQ FUNCTION
const convertToFAQ = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { tag } = req.body;
        const question = await Question.findById(questionId);

        // VALIDATE QUESTION EXISTS
        if(!question) {
            return res.status(404).json({
                success : false,
                message : 'Question not found'
            });
        }

        // CHECK IF QUESTION ALREADY CONVERTED
        const existingFAQ = await FAQ.findOne({ original_question_id : questionId });
        if(existingFAQ) {
            return res.status(400).json({
                success : false,
                message : 'This question is already an FAQ'
            });
        }

        // FIND BEST ANSWER
        const bestAnswer = await Answer.findOne({ question_id : questionId })
            .sort({ up_votes : -1});

        // VALIDATE ANSWER EXISTS
        if(!bestAnswer) {
            return res.status(400).json({
                success : false,
                message : 'Cannot convert to FAQ as there are no answers for this question'
            });
        }

        const MIN_UPVOTES = parseInt(process.env.MIN_UPVOTES_FOR_FAQ) || 10;

        // VALIDATE ANSWER HAS MINIMUM UPVOTES
        if(bestAnswer.up_votes < MIN_UPVOTES) {
            return res.status(400).json({
                success : false,
                message : `Cannot convert to FAQ as the best answer does not have the minimum required upvotes (${MIN_UPVOTES})`,    
                currentVotes : bestAnswer.up_votes,
                threshold : MIN_UPVOTES
            });
        }

        const finalTag = tag || question.tag || 'general'

        // CREATE NEW FAQ
        const newFAQ = await FAQ.create({
            question : question.title,
            answer : bestAnswer.answer,
            tag : finalTag.toLowerCase(),
            original_question_id : question._id,
            original_answer_id : bestAnswer._id,
        });

        // MARK QUESTION AS CONVERTED
        await Question.findByIdAndUpdate(questionId, { 
            isConvertedToFAQ : true,
        });

        res.status(201).json({
            success : true,
            message : 'Question successfully converted to FAQ',
            data : {
                id : newFAQ._id,
                question : newFAQ.question,
                answer : newFAQ.answer,
                tag : newFAQ.tag
            }
        });
    } catch (err) {
        res.status(500).json({
            success : false,    
            message : err.message
        });
    }
};

// UPDATE FAQ FUNCTION
const updateFAQ = async (req, res) => {
    try {
        // FIND FAQ BY ID 
        const { id } = req.params;
        const { question, answer, tag } = req.body;
        const faq = await FAQ.findById(id);

        // VALIDATE IF FAQ PRESENT OR NOT
        if(!faq) {
            return res.status(404).json({
                success : false,
                message : 'FAQ not found'
            });
        }

        // UPDATE ONLY FIELD PROVIDED
        if(question && question !== faq.question) {
            faq.question = question;
        }

        if(answer && answer !== faq.answer) {
            faq.answer = answer;
        }

        if(tag && tag !== faq.tag) {
            faq.tag = tag.toLowerCase();
        }

        // SAVE THE CHANGES
        await faq.save();

        res.status(200).json({
            success : true,
            data : {
                id : faq._id,
                question : faq.question,
                answer : faq.answer,
                tag : faq.tag
            }
        });
    } catch (err) {
        res.status(500).json({
            success : false,
            message : err.message
        });
    }
};

// DELETE FAQ FUNCTION
const deleteFAQ = async (req, res) => {
    try {
        // FIND THE FAQ BY ID
        const { id } = req.params;
        const faq = await FAQ.findById(id);

        // VALIDATE WHETHER FAQ PRESENT OR NOT
        if(!faq) {
            return res.status(404).json({
                success : false,
                message : 'FAQ not found'
            });
        }

        // MARK QUESTION AS CONVERTED TO FAQ
        if(faq.original_question_id) {
            await Question.findByIdAndUpdate(faq.original_question_id, {
                isConvertedToFAQ : false,
            });
        }

        // DELETE THE FAQ FROM DATABASE
        await FAQ.findByIdAndDelete(id);

        res.status(200).json({
            success : true,
            message : 'FAQ deleted successfully',
        });
    } catch (err) {
        res.status(500).json({
            success : false,    
            message : err.message
        });
    }
};

// GET QUESTIONS READY FOR FAQ CONVERSION FUNCTION - USED TO CHECK WHICH QUESTIONS CAN BE CONVERTED TO FAQ
const getQuestionsReadyForFAQ = async (req, res) => {
    try {
        const MIN_UPVOTES = parseInt(process.env.MIN_UPVOTES_FOR_FAQ) || 10;

        const questions = await Question.aggregate([
            {   // EXCLUDE ALREADY CONVERTED QUESTIONS
                $match : {
                    isConvertedToFAQ : { $ne : true }
                }
            },
            {   // JOIN ANSWERS
                $lookup : {
                    from : 'answers',
                    localField : '_id',
                    foreignField : 'question_id',
                    as : 'answers'
                }
            },
            {   // ONLY QUESTION WITH AT LEAST ONE ANSWER
                $match : {
                    'answers.0' : { $exists : true }
                }
            },
            {   // CALCULATE BEST ANSWER VOTES
                $addFields : { bestAnswerVotes : { $max : '$answers.up_votes' } }
            },
            {   // FILTER BY THRESHOLD
                $match : { bestAnswerVotes : { $gte : MIN_UPVOTES } }
            },
            {   // SHOW IN DECREASING ORDER
                $sort : { bestAnswerVotes : -1 }
            },
            {   // RETURN REQUIRED FIELDS
                $project : {
                    _id : 1,
                    title : 1,
                    tag : 1,
                    totalAnswers : { $size : '$answers' },
                    bestAnswerVotes : 1,
                }
            }
        ]);

        res.status(200).json({
            success : true,
            threshold : MIN_UPVOTES,
            count : questions.length,
            data : questions,
        });
    } catch (err) {
        res.status(500).json({
            success : false,
            message : err.message
        });
    }
};

module.exports = {
    getAllFAQs,
    searchFAQs,
    getFAQById,
    convertToFAQ,
    updateFAQ,
    deleteFAQ,
    getQuestionsReadyForFAQ
};