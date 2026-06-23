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
const { protect, authorize } = require('../middlewares/authMiddleware');

// PUBLIC ROUTES
router.get('/', getAllFAQs);
router.get('/search', searchFAQs);

// PROTECTED ROUTES
router.get('/admin/ready-questions', protect, authorize('admin'), getQuestionsReadyForFAQ);
router.post('/convert/:questionId', protect, authorize('admin'), convertToFAQ);

// PUBLIC ROUTES
router.get('/:id', getFAQById);

// PROTECTED ROUTES
router.put('/:id', protect, authorize('admin'), updateFAQ);
router.delete('/:id', protect, authorize('admin'), deleteFAQ);



module.exports = router;