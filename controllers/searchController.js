const Question = require("../models/questionModel");
const { pipeline } = require("@xenova/transformers");

let embedder;

// load model once
const loadModel = async () => {
    if (!embedder) {
        embedder = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }
};

// cosine similarity
const cosineSimilarity = (a, b) => {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

// SEARCH QUESTIONS
const searchQuestions = async (req, res) => {
    try {
        await loadModel();

        const { query } = req.body;

        const queryEmbedding = await embedder(query, { pooling: "mean", normalize: true });

        const questions = await Question.find();

        let results = [];

        for (let q of questions) {
            const qEmbedding = await embedder(q.question, { pooling: "mean", normalize: true });

            const score = cosineSimilarity(
                Array.from(queryEmbedding.data),
                Array.from(qEmbedding.data)
            );

            results.push({
                question: q,
                score
            });
        }

        results.sort((a, b) => b.score - a.score);

        res.json(results.slice(0, 5));

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    searchQuestions
};