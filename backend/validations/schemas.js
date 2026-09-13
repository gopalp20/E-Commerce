const { z } = require("zod");

const positiveInt = z.coerce.number().int().positive();

const productStatus = z.enum([
  "ACTIVE",
  "OUT_OF_STOCK",
  "DRAFT",
  "ARCHIVED"
]);

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
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
});

// ==================== PRODUCTS ====================

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

  price: z
    .coerce
    .number()
    .positive("Price must be greater than 0"),

  stock: z
    .coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),

  imageUrl: z
    .string()
    .url("Image URL must be a valid URL")
    .nullable()
    .optional(),

  categoryId: positiveInt,

  status: productStatus.optional(),

  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .max(10, "Maximum 10 images are allowed")
    .optional()
};

const createProductSchema = z.object(productFields);

const updateProductSchema = z
  .object(productFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update"
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

    minPrice: z
      .coerce
      .number()
      .min(0, "Minimum price cannot be negative")
      .optional(),

    maxPrice: z
      .coerce
      .number()
      .min(0, "Maximum price cannot be negative")
      .optional(),

    sort: z
      .enum([
        "price_asc",
        "price_desc",
        "newest",
        "oldest",
        "name_asc",
        "name_desc"
      ])
      .default("newest"),

    page: z
      .coerce
      .number()
      .int("Page must be a whole number")
      .positive("Page must be greater than 0")
      .default(1),

    limit: z
      .coerce
      .number()
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(12)
  })
  .refine(
    (value) =>
      value.maxPrice === undefined ||
      value.minPrice === undefined ||
      value.maxPrice >= value.minPrice,
    {
      message: "Maximum price must be greater than or equal to minimum price",
      path: ["maxPrice"]
    }
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
      "Slug can contain only lowercase letters, numbers, and hyphens"
    )
});

// ==================== CART ====================

const cartItemSchema = z.object({
  productId: positiveInt,

  quantity: positiveInt.default(1)
});

const cartItemUpdateSchema = z.object({
  quantity: positiveInt
});

// ==================== EXPORTS ====================
const stockUpdateSchema = z.object({
  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be greater than 0")
});
module.exports = {
  registerSchema,
  loginSchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  categorySchema,
  cartItemSchema,
  cartItemUpdateSchema,
  stockUpdateSchema
};