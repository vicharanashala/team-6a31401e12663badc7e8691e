const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// PUBLIC ROUTES
router.get('/:id', getUserById);

// PROTECTED ROUTES
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.get('/:id/stats', protect, getUserStats);

module.exports = router;