const prisma = require("../config/prisma");

const AppError = require("../utils/AppError");

const asyncHandler = require("../utils/asyncHandler");

const categoryId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id))
    throw new AppError("Invalid category ID", 400);
  return id;
};

const createCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  const existingCategory = await prisma.category.findUnique({
    where: { slug }
  });

  if (existingCategory) {
    throw new AppError("Category already exists", 409);
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug
    }
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" }
  });

  res.json({
    success: true,
    count: categories.length,
    categories
  });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId(req.params.id) }
  });

  if (!category)
    throw new AppError("Category not found", 404);

  res.json({
    success: true,
    category
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const id = categoryId(req.params.id);

  if (!await prisma.category.findUnique({ where: { id } }))
    throw new AppError("Category not found", 404);

  const category = await prisma.category.update({
    where: { id },
    data: req.body
  });

  res.json({
    success: true,
    message: "Category updated successfully",
    category
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const id = categoryId(req.params.id);

  if (!await prisma.category.findUnique({ where: { id } }))
    throw new AppError("Category not found", 404);

  await prisma.category.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: "Category deleted successfully"
  });
});

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
};