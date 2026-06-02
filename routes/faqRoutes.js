const express = require('express');
const router = express.Router();
const {
  getAllFAQs,
  getFAQById,
  searchFAQs,
  convertToFAQ,
  updateFAQ,
  deleteFAQ,
  getQuestionsReadyForFAQ,
} = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/authMiddleware');

// PUBLIC ROUTES
router.get('/', getAllFAQs);
router.get('/:id', getFAQById);
router.get('/search', searchFAQs);

// PROTECTED ROUTES
router.put('/:id', protect, authorize('admin'), updateFAQ);
router.delete('/:id', protect, authorize('admin'), deleteFAQ);
router.post('/convert/:questionId', protect, authorize('admin'), convertToFAQ);
router.get('/admin/ready-questions', protect, authorize('admin'), getQuestionsReadyForFAQ);

module.exports = router;