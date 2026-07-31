
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { categorySchema } = require("../validations/schemas");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.post("/", protect, authorize("ADMIN"), validate(categorySchema), createCategory);

router.put("/:id", protect, authorize("ADMIN"), validate(categorySchema), updateCategory);

router.delete("/:id", protect, authorize("ADMIN"), deleteCategory);

router.get("/", getCategories);

router.get("/:id", getCategory);
module.exports = router;
