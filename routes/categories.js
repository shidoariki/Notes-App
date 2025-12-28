const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All category routes require authentication
router.use(authMiddleware);

// GET all categories for user
router.get('/', categoryController.getCategories);

// POST create new category
router.post('/', categoryController.createCategory);

module.exports = router;
