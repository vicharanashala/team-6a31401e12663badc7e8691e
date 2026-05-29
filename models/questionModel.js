const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
{
    question: {
        type: String,
        required: true
    },

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    tag_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
        required: true
    }

},
{
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

module.exports = mongoose.model("Question", questionSchema);