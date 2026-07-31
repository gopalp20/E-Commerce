const express = require("express");
const router = express.Router();

const {
    createProduct,
    getProducts,
    getMyProducts,
    getProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// Public Routes
router.get("/", getProducts);
router.get(
    "/my-products",
    protect,
    authorize("VENDOR", "ADMIN"),
    getMyProducts
);
router.get("/:id", getProduct);

// Vendor & Admin Routes
router.post(
    "/",
    protect,
    authorize("ADMIN", "VENDOR"),
    createProduct
);

// Owner or Admin Routes
router.put(
    "/:id",
    protect,
     authorize("ADMIN", "VENDOR"),
    updateProduct
);
router.delete(
    "/:id",
    protect,
    authorize("ADMIN", "VENDOR"),
    deleteProduct
);

module.exports = router;