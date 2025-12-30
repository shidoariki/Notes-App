const express = require("express");
const authMiddleware = require("../middleware/auth");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", categoryController.getCategories);
router.post("/", categoryController.createCategory);

module.exports = router;
