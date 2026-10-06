const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { userRoleSchema, adminUserQuerySchema } = require("../validations/schemas");
const { getAdminStats, getUsers, updateUserRole, getAdminProducts } = require("../controllers/adminController");
const { getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const { orderStatusSchema } = require("../validations/schemas");

const router = express.Router();
router.use(protect, authorize("ADMIN"));
router.get("/stats", getAdminStats);
router.get("/users", validate(adminUserQuerySchema, "query"), getUsers);
router.patch("/users/:id/role", validate(userRoleSchema), updateUserRole);
router.get("/products", getAdminProducts);
router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", validate(orderStatusSchema), updateOrderStatus);

module.exports = router;
