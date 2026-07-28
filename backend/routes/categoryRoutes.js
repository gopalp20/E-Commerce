
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.post("/", protect, authorize("ADMIN"), createCategory);

router.put("/:id", protect, authorize("ADMIN"), updateCategory);

router.delete("/:id", protect, authorize("ADMIN"), deleteCategory);

router.get("/", getCategories);

router.get("/:id", getCategory);
module.exports = router;