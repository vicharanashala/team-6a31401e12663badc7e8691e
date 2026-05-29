const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
{
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },

    best_answer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
        required: true
    }

},
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model("FAQ", faqSchema);