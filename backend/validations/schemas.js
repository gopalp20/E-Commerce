const { z } = require("zod");

const positiveInt = z.coerce.number().int().positive();
const productStatus = z.enum(["ACTIVE", "OUT_OF_STOCK", "DRAFT", "ARCHIVED"]);

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const productFields = {
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(1).max(5000),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().url().nullable().optional(),
  categoryId: positiveInt,
  status: productStatus.optional(),
  images: z.array(z.string().url()).max(10).optional(),
};

const createProductSchema = z.object(productFields);
const updateProductSchema = z.object(productFields).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update"
);

const productQuerySchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "oldest", "name_asc", "name_desc"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
}).refine((value) => value.maxPrice === undefined || value.minPrice === undefined || value.maxPrice >= value.minPrice, {
  message: "maxPrice must be greater than or equal to minPrice",
  path: ["maxPrice"],
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
const cartItemSchema = z.object({ productId: positiveInt, quantity: positiveInt.default(1) });
const cartItemUpdateSchema = z.object({ quantity: positiveInt });

module.exports = {
  registerSchema, loginSchema, createProductSchema, updateProductSchema,
  productQuerySchema, categorySchema, cartItemSchema, cartItemUpdateSchema,
};
