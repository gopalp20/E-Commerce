const prisma = require("../config/prisma");

const AppError = require("../utils/AppError");

const asyncHandler = require("../utils/asyncHandler");

const categoryId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id)) throw new AppError("Invalid category ID", 400);
  return id;
};

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategory) {
    throw new AppError("Category already exists", 409);
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
    },
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

const getCategories = asyncHandler(async (req, res) => {
  // Count and cover in one database round trip, rather than fetching nested
  // products and image relations separately over the Neon connection.
  const categories = await prisma.$queryRaw`
    SELECT c.*, jsonb_build_object('products', (
      SELECT COUNT(*)::int FROM "Product" p
      WHERE p."categoryId" = c.id AND p.deleted = false
        AND p.status IN ('ACTIVE', 'OUT_OF_STOCK')
    )) AS "_count", (
      SELECT COALESCE(NULLIF(p."imageUrl", ''), (
        SELECT i.url FROM "ProductImage" i WHERE i."productId" = p.id
        ORDER BY i.position, i.id LIMIT 1
      )) FROM "Product" p
      WHERE p."categoryId" = c.id AND p.deleted = false
        AND p.status IN ('ACTIVE', 'OUT_OF_STOCK')
      ORDER BY p.id LIMIT 1
    ) AS "imageUrl"
    FROM "Category" c ORDER BY c.id
  `;
  res.json({ success: true, count: categories.length, categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId(req.params.id) },
  });

  if (!category) throw new AppError("Category not found", 404);

  res.json({
    success: true,
    category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const id = categoryId(req.params.id);

  if (!(await prisma.category.findUnique({ where: { id } })))
    throw new AppError("Category not found", 404);

  const duplicate = await prisma.category.findFirst({
    where: { slug: req.body.slug, id: { not: id } },
  });
  if (duplicate)
    throw new AppError(
      "That URL name is already used by another category",
      409,
    );

  const category = await prisma.category.update({
    where: { id },
    data: req.body,
  });

  res.json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const id = categoryId(req.params.id);

  if (!(await prisma.category.findUnique({ where: { id } })))
    throw new AppError("Category not found", 404);

  const inUse = () =>
    prisma.product.findFirst({
      where: { categoryId: id },
      select: { id: true },
    });
  const conflict = () =>
    new AppError(
      "Move this category’s products to another category before deleting it, including drafts and archived products.",
      409,
    );
  if (await inUse()) throw conflict();
  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (error.code === "P2003" || (await inUse())) throw conflict();
    throw error;
  }

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
