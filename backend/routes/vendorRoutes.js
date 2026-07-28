const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const {
    applyVendor,
    getVendorRequests,
    approveVendor
} = require("../controllers/vendorController");

// Customer
router.post("/apply", protect, applyVendor);

// Admin
router.get(
    "/requests",
    protect,
    authorize("ADMIN"),
    getVendorRequests
);

router.patch(
    "/approve/:id",
    protect,
    authorize("ADMIN"),
    approveVendor
);

module.exports = router;