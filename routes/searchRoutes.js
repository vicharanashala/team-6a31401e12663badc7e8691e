const express = require('express');
const router = express.Router();
const { searchFAQs } = require('../controllers/searchController');
router.get('/', searchFAQs)
module.exports = router;