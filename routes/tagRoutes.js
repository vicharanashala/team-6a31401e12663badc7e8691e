const express = require('express');
const router = express.Router();
const {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} = require('../controllers/tagController');
const { protect, authorize } = require('../middleware/authMiddleware');

// PUBLIC ROUTES
router.get('/', getAllTags);
router.get('/:id', getTagById);

// PROTECTED ROUTES
router.post('/', protect, authorize('admin'), createTag);
router.put('/:id', protect, authorize('admin'), updateTag);
router.delete('/:id', protect, authorize('admin'), deleteTag);

module.exports = router;