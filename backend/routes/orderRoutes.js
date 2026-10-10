const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { orderStatusSchema, checkoutSchema } = require("../validations/schemas");

const {
    createOrder,
    getMyOrders,
    getMyOrder,
    cancelMyOrder,
    getVendorOrders,
    updateOrderStatus,
} = require("../controllers/orderController");

router.use(protect);

router.post("/", authorize("CUSTOMER"), validate(checkoutSchema), createOrder);
router.get("/my-orders", authorize("CUSTOMER"), getMyOrders);
router.patch("/:id/cancel", authorize("CUSTOMER"), cancelMyOrder);
router.get("/vendor", authorize("VENDOR"), getVendorOrders);
router.patch("/:id/status", authorize("VENDOR"), validate(orderStatusSchema), updateOrderStatus);
router.get("/:id", authorize("CUSTOMER"), getMyOrder);

module.exports = router;
