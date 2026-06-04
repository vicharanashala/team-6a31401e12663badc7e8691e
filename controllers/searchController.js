const FAQ = require('../models/faqModel');

const searchFAQs = async (req, res) => {
    try {
        const { q, tag, limit = 10 } = req.query;

        // SEARCH FILTER
        let filter = {};

        // SEARCH TEXT PROVIDED - SIMPLE KEYWORD MATCHING, CASE INSENSITIVE
        if(q && q.trim()) {
            filter.question = {
                $regex : q.trim(),
                $options : 'i'
            };
        }

        // ADD TAG IF PROVIDED
        if(tag && tag.trim()) {
            filter.tag = tag.trim().toLowerCase();
        }

        // EXECUTE SEARCH - RETURN ALPHABETICALLY
        const faqs = await FAQ.find(filter)
            .select('question answer tag')
            .sort({ question : 1 })
            .limit(parseInt(limit));

        // CALCULATE RELEVANCE SCORE
        const resultsWithScore = faqs.map(faq => {
            let score = 0;

            if(q && q.trim()) {
                const searchTerm = q.trim().toLowerCase();
                const questionText = faq.question.toLowerCase();

                // EXACT MATCH GET HIGHEST SCORE
                if(questionText === searchTerm) {
                    score = 100;
                }

                // CONTAINS PHRASE GET HIGH SCORE
                else if(questionText.includes(searchTerm)) {
                    score = 80;
                }

                // NOW WORD-BY-WORD MATCHING
                else {
                    const words = searchTerm.split(' ');
                    let matchCount = 0;
                    words.forEach(word => {
                        if(questionText.includes(word)) {
                            matchCount++;
                        }
                    });
                    score = (matchCount / words.length) * 60;
                }
            } else {
                score = 50;
            }
            return {
                ...faq.toObject(),
                relevance_score : Math.round(score)
            };
        });

        // SORT BY RELEVANCE SCORE
        resultsWithScore.sort((a, b) => b.relevance_score - a.relevance_score);

        res.status(200).json({
            success : true,
            searchQuery : q || null,
            tagFilter : tag || null,
            count : resultsWithScore.length,
            data : resultsWithScore
        });
    } catch (err) {
        res.status(500).json({
            success : false,
            message : err.message
        });
    }
};

module.exports = { searchFAQs };