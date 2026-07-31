const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const publicVendorSelect = { id: true, name: true };
const publicInclude = { vendor: { select: publicVendorSelect }, category: true, images: true };

const ensureProductOwner = async (productId, user) => {
  const product = await prisma.product.findFirst({ where: { id: productId, deleted: false } });
  if (!product) throw new AppError("Product not found", 404);
  if (user.role !== "ADMIN" && product.vendorId !== user.id) throw new AppError("Access denied", 403);
  return product;
};

const createProduct = asyncHandler(async (req, res) => {
  const { images = [], categoryId, imageUrl, ...fields } = req.body;
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new AppError("Category not found", 404);

  const status = fields.status || (fields.stock === 0 ? "OUT_OF_STOCK" : "DRAFT");
  const product = await prisma.product.create({
    data: {
      ...fields, status, imageUrl: imageUrl || images[0] || null,
      vendorId: req.user.id, categoryId,
      images: images.length ? { create: images.map((url) => ({ url })) } : undefined,
    }, include: publicInclude,
  });
  res.status(201).json({ success: true, product });
});

const getMyProducts = asyncHandler(async (req, res) => {
  const where = req.user.role === "ADMIN" ? {} : { vendorId: req.user.id };
  const products = await prisma.product.findMany({ where, include: { category: true, images: true }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, count: products.length, products });
});

const getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page, limit } = req.validated.query;
  const where = { deleted: false, status: "ACTIVE" };
  if (search) where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
  if (category) where.category = /^\d+$/.test(category) ? { id: Number(category) } : { slug: category };
  if (minPrice !== undefined || maxPrice !== undefined) where.price = { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) };

  const orderMap = {
    price_asc: { price: "asc" }, price_desc: { price: "desc" }, newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" }, name_asc: { name: "asc" }, name_desc: { name: "desc" },
  };
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, include: publicInclude, orderBy: orderMap[sort], skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where }),
  ]);
  res.json({ success: true, products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 } });
});

const getProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid product ID", 400);
  const product = await prisma.product.findFirst({ where: { id, deleted: false, status: "ACTIVE" }, include: publicInclude });
  if (!product) throw new AppError("Product not found", 404);
  res.json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid product ID", 400);
  await ensureProductOwner(id, req.user);
  const { images, categoryId, stock, status, imageUrl, ...fields } = req.body;
  if (categoryId !== undefined && !await prisma.category.findUnique({ where: { id: categoryId } })) throw new AppError("Category not found", 404);
  const resolvedStatus = status || (stock === 0 ? "OUT_OF_STOCK" : undefined);
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...fields, ...(stock !== undefined && { stock }), ...(resolvedStatus && { status: resolvedStatus }),
      ...(imageUrl !== undefined && { imageUrl }), ...(categoryId !== undefined && { categoryId }),
      ...(images !== undefined && { images: { deleteMany: {}, create: images.map((url) => ({ url })) }, imageUrl: imageUrl !== undefined ? imageUrl : images[0] || null }),
    }, include: publicInclude,
  });
  res.json({ success: true, message: "Product updated successfully", product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid product ID", 400);
  await ensureProductOwner(id, req.user);
  await prisma.product.update({ where: { id }, data: { deleted: true, deletedAt: new Date(), status: "ARCHIVED" } });
  res.json({ success: true, message: "Product archived successfully" });
});

module.exports = { createProduct, getProducts, getMyProducts, getProduct, updateProduct, deleteProduct };
