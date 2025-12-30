const express = require("express");
const authMiddleware = require("../middleware/auth");
const noteController = require("../controllers/noteController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", noteController.getNotes);
router.post("/", noteController.createNote);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);

module.exports = router;
