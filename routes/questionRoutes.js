const express = require('express');
const router = express.Router();
const {
  getAllQuestions,
  getQuestionById,
  getQuestionsByUser,
  getQuestionsByTag,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  upvoteQuestion,
  downvoteQuestion
} = require('../controllers/questionController');
const { protect } = require('../middlewares/authMiddleware');

// PUBLIC ROUTES
router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);
router.get('/user/:userId', getQuestionsByUser);
router.get('/tags/:tagId', getQuestionsByTag);

// PROTECTED ROUTES
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);
router.put('/:id/upvote', protect, upvoteQuestion);
router.put('/:id/downvote', protect, downvoteQuestion);

module.exports = router;