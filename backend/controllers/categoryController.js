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
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    include: {
      products: {
        where: { deleted: false, status: { in: ["ACTIVE", "OUT_OF_STOCK"] } },
        select: {
          imageUrl: true,
          images: {
            select: { url: true },
            orderBy: [{ position: "asc" }, { id: "asc" }],
            take: 1,
          },
        },
        orderBy: { id: "asc" },
        take: 1,
      },
      _count: {
        select: {
          products: {
            where: {
              deleted: false,
              status: { in: ["ACTIVE", "OUT_OF_STOCK"] },
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    count: categories.length,
    categories: categories.map(({ products, ...category }) => ({
      ...category,
      imageUrl: products[0]?.imageUrl || products[0]?.images[0]?.url || null,
    })),
  });
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
