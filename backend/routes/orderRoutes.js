const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const {
    createOrder,
    getMyOrders,
    getMyOrder,
} = require("../controllers/orderController");

// Customer-only order routes.
router.use(protect, authorize("CUSTOMER"));

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getMyOrder);

module.exports = router;