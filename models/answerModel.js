const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
{
    answer: {
        type: String,
        required: true
    },

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },

    up_votes: {
        type: Number,
        default: 0
    }

},
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model("Answer", answerSchema);