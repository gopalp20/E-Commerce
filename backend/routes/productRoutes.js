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
const validate = require("../middleware/validate");
const { createProductSchema, updateProductSchema, productQuerySchema } = require("../validations/schemas");

// Public Routes
router.get("/", validate(productQuerySchema, "query"), getProducts);
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
    validate(createProductSchema), createProduct
);

// Owner or Admin Routes
router.put(
    "/:id",
    protect,
     authorize("ADMIN", "VENDOR"),
    validate(updateProductSchema), updateProduct
);
router.delete(
    "/:id",
    protect,
    authorize("ADMIN", "VENDOR"),
    deleteProduct
);

module.exports = router;
