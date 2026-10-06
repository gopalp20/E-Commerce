const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const userId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id)) throw new AppError("Invalid user ID", 400);
  return id;
};

const getAdminStats = asyncHandler(async (req, res) => {
  const [users, vendors, products, categories, orders, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.product.count({ where: { deleted: false } }),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true }
    })
  ]);

  res.json({
    success: true,
    stats: { totalUsers: users, totalVendors: vendors, totalProducts: products, totalCategories: categories, totalOrders: orders, totalRevenue: revenue._sum.totalAmount || 0 }
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.role) where.role = req.query.role;
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: "insensitive" } },
      { email: { contains: req.query.search, mode: "insensitive" } }
    ];
  }
  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, vendorRequest: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, count: users.length, users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const id = userId(req.params.id);
  if (id === req.user.id && req.body.role !== "ADMIN") {
    throw new AppError("Administrators cannot remove their own admin role", 400);
  }
  const user = await prisma.user.update({
    where: { id },
    data: { role: req.body.role, vendorRequest: req.body.role === "VENDOR" ? false : undefined },
    select: { id: true, name: true, email: true, role: true, vendorRequest: true, createdAt: true }
  });
  res.json({ success: true, message: "User role updated", user });
});

const getAdminProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    include: { vendor: { select: { id: true, name: true, email: true } }, category: true, images: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, count: products.length, products });
});

module.exports = { getAdminStats, getUsers, updateUserRole, getAdminProducts };
