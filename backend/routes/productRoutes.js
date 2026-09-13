const express = require("express");
const router = express.Router();


const {
  createProduct,
  getProducts,
  getMyProducts,
  getOutOfStockProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  increaseProductStock
} = require("../controllers/productController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  stockUpdateSchema
} = require("../validations/schemas");

// Public Routes
router.get("/", validate(productQuerySchema, "query"), getProducts);
router.get(
  "/my-products/out-of-stock",
  protect,
  authorize("VENDOR"),
  getOutOfStockProducts
);
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
    authorize("VENDOR"),
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
router.patch(
  "/:id/stock",
  protect,
  authorize("VENDOR"),
  validate(stockUpdateSchema),
  increaseProductStock
);
module.exports = router;







