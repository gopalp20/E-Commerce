const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const {
  checkout,
  changeOrderStatus,
  orderInclude,
} = require("../services/checkoutService");
const orderId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1)
    throw new AppError("Invalid order ID", 400);
  return id;
};
const createOrder = asyncHandler(async (req, res) => {
  const order = await checkout(req.user.id, req.body);
  res.status(201).json({ success: true, order });
});

// ==================== GET MY ORDERS ====================

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      userId: req.user.id,
    },

    include: orderInclude,

    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    count: orders.length,
    orders,
  });
});

// ==================== GET MY ORDER ====================

const getMyOrder = asyncHandler(async (req, res) => {
  const id = orderId(req.params.id);

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: req.user.id,
    },

    include: orderInclude,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  res.json({
    success: true,
    order,
  });
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await changeOrderStatus(
    orderId(req.params.id),
    "CANCELLED",
    req.user,
    true,
  );
  res.json({ success: true, order });
});

const getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { vendorId: req.user.id } } } },
    include: {
      _count: { select: { items: true } },
      items: {
        where: { product: { vendorId: req.user.id } },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              images: { orderBy: [{ position: "asc" }, { id: "asc" }] },
            },
          },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({
    success: true,
    count: orders.length,
    orders: orders.map(({ _count, ...order }) => ({
      ...order,
      canManageStatus: order.items.length === _count.items,
    })),
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: req.validated.query.vendorId
      ? {
          items: {
            some: { product: { vendorId: req.validated.query.vendorId } },
          },
        }
      : {},
    include: {
      ...orderInclude,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, count: orders.length, orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await changeOrderStatus(
    orderId(req.params.id),
    req.body.status,
    req.user,
  );
  res.json({ success: true, order });
});

// ==================== EXPORTS ====================

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
  getVendorOrders,
  getAllOrders,
  updateOrderStatus,
};
