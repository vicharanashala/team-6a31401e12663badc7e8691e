const express = require('express');
const router = express.Router();
const {
  getAnswersByQuestion,
  getAnswersByUser,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  //acceptAnswer,
  upvoteAnswer,
  downvoteAnswer
} = require('../controllers/answerController');
const { protect } = require('../middlewares/authMiddleware');

// PUBLIC ROUTES
router.get('/question/:questionId', getAnswersByQuestion);
router.get('/user/:userId', getAnswersByUser);

// PROTECTED ROUTES
router.post('/:questionId', protect, createAnswer);
router.put('/:id', protect, updateAnswer);
router.delete('/:id', protect, deleteAnswer);
//router.put('/:id/accept', protect, acceptAnswer);
router.put('/:id/upvote', protect, upvoteAnswer);
router.put('/:id/downvote', protect, downvoteAnswer);

module.exports = router;