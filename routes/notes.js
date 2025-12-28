const express = require('express');
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All note routes require authentication
router.use(authMiddleware);

// GET all notes (with optional search and category filter)
router.get('/', noteController.getNotes);

// POST create new note
router.post('/', noteController.createNote);

// PUT update note by id
router.put('/:id', noteController.updateNote);

// DELETE note by id
router.delete('/:id', noteController.deleteNote);

module.exports = router;
