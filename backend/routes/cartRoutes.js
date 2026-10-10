const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { cartItemSchema, cartItemUpdateSchema, cartMergeSchema } = require("../validations/schemas");

const {
    getCart, mergeCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} = require("../controllers/cartController");

// All cart routes require a logged-in customer.
router.use(protect, authorize("CUSTOMER"));

router.get("/", getCart);
router.post("/merge", validate(cartMergeSchema), mergeCart);
router.post("/items", validate(cartItemSchema), addToCart);
router.put("/items/:itemId", validate(cartItemUpdateSchema), updateCartItem);
router.delete("/items/:itemId", removeCartItem);
router.delete("/", clearCart);

module.exports = router;
