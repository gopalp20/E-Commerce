const { z } = require("zod");

const positiveInt = z.coerce.number().int().positive();

const productStatus = z.enum(["ACTIVE", "OUT_OF_STOCK", "DRAFT", "ARCHIVED"]);
const orderStatus = z.enum([
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);
const role = z.enum(["CUSTOMER", "VENDOR", "ADMIN"]);

// ==================== AUTH ====================

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),

  password: z.string().min(1, "Password is required"),
});

// ==================== PRODUCTS ====================

const imageReference = z.union([
  z
    .string()
    .url()
    .refine(
      (value) => /^https?:\/\//.test(value),
      "Use an HTTP or HTTPS image URL",
    ),
  z
    .string()
    .regex(/^\/images\/[a-zA-Z0-9._-]+$/, "Use a local catalogue image"),
  z
    .string()
    .regex(
      /^\/api\/media\/images\/[a-f0-9-]{36}\.webp$/,
      "Use an uploaded product photo",
    ),
]);
const productFields = {
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be at most 200 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Product description is required")
    .max(5000, "Product description must be at most 5000 characters"),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(99999999.99, "Price must be below ₹100,000,000")
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
      "Price can have at most two decimal places",
    ),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),

  imageUrl: imageReference.nullable().optional(),

  categoryId: positiveInt,

  status: productStatus.optional(),

  images: z
    .array(
      z.union([
        imageReference,
        z.object({
          url: imageReference,
          alt: z.string().trim().max(200).default(""),
        }),
      ]),
    )
    .max(10, "Maximum 10 images are allowed")
    .optional(),
  specifications: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Name each product detail").max(60),
        value: z
          .string()
          .trim()
          .min(1, "Enter a value for each product detail")
          .max(500),
      }),
    )
    .max(12, "Use up to 12 product details")
    .optional(),
};

const createProductSchema = z.object(productFields);

const updateProductSchema = z
  .object(productFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update",
  );

// ==================== PRODUCT QUERY ====================

const productQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .min(1, "Search cannot be empty")
      .max(200, "Search must be at most 200 characters")
      .optional(),

    category: z
      .string()
      .trim()
      .min(1, "Category cannot be empty")
      .max(100, "Category must be at most 100 characters")
      .optional(),

    minPrice: z.coerce
      .number()
      .min(0, "Minimum price cannot be negative")
      .optional(),

    maxPrice: z.coerce
      .number()
      .min(0, "Maximum price cannot be negative")
      .optional(),

    availability: z.enum(["in_stock"]).optional(),
    minRating: z.coerce.number().int().min(1).max(5).optional(),
    sort: z
      .enum([
        "price_asc",
        "price_desc",
        "newest",
        "oldest",
        "name_asc",
        "name_desc",
        "rating_desc",
        "best_selling",
      ])
      .default("newest"),

    page: z.coerce
      .number()
      .int("Page must be a whole number")
      .positive("Page must be greater than 0")
      .default(1),

    limit: z.coerce
      .number()
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(12),
  })
  .refine(
    (value) =>
      value.maxPrice === undefined ||
      value.minPrice === undefined ||
      value.maxPrice >= value.minPrice,
    {
      message: "Maximum price must be greater than or equal to minimum price",
      path: ["maxPrice"],
    },
  );

// ==================== CATEGORY ====================

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be at most 100 characters"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can contain only lowercase letters, numbers, and hyphens",
    ),
});

// ==================== CART ====================

const cartItemSchema = z.object({
  productId: positiveInt,

  quantity: positiveInt.default(1),
});

const cartItemUpdateSchema = z.object({
  quantity: positiveInt,
});

// ==================== EXPORTS ====================
const stockUpdateSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
});
const orderStatusSchema = z.object({ status: orderStatus });
const userRoleSchema = z.object({ role });
const adminUserQuerySchema = z.object({
  role: role.optional(),
  search: z.string().trim().min(1).max(100).optional(),
});
const adminVendorQuerySchema = z.object({ vendorId: positiveInt.optional() });
const shippingAddressSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().trim().min(5).max(200),
  line2: z.string().trim().max(200).default(""),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
  country: z.literal("India"),
});
const savedAddressSchema = shippingAddressSchema.extend({
  label: z.string().trim().min(1).max(40).default("Home"),
  isDefault: z.boolean().default(false),
});
const checkoutSchema = z
  .object({
    checkoutKey: z.string().uuid(),
    expectedTotal: z.number().positive(),
    deliveryMethod: z.enum(["STANDARD", "EXPRESS"]),
    shippingAddress: shippingAddressSchema.optional(),
    addressId: positiveInt.optional(),
    saveAddress: z.boolean().default(false),
    addressLabel: z.string().trim().min(1).max(40).default("Home"),
    defaultAddress: z.boolean().default(false),
  })
  .refine(
    (value) => Boolean(value.shippingAddress) !== Boolean(value.addressId),
    {
      message: "Choose a saved address or enter a new delivery address",
      path: ["shippingAddress"],
    },
  );
const cartMergeSchema = z.object({ items: z.array(cartItemSchema).max(50) });

module.exports = {
  savedAddressSchema,
  checkoutSchema,
  cartMergeSchema,
  registerSchema,
  loginSchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  categorySchema,
  cartItemSchema,
  cartItemUpdateSchema,
  stockUpdateSchema,
  orderStatusSchema,
  userRoleSchema,
  adminUserQuerySchema,
  adminVendorQuerySchema,
};
