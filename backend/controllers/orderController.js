const prisma = require("../config/prisma");
const { Prisma } = require("@prisma/client");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { reserveStock } = require("../services/inventoryService");

const orderInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          images: true
        }
      }
    }
  }
};

const orderId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id)) throw new AppError("Invalid order ID", 400);
  return id;
};

const allowedTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: []
};

const restockOrder = async (tx, items) => {
  for (const item of items) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { status: true }
    });
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stock: { increment: item.quantity },
        ...(product.status === "OUT_OF_STOCK" && { status: "ACTIVE" })
      }
    });
  }
};

const assertTransition = (order, nextStatus) => {
  if (order.status === nextStatus) return;
  if (!allowedTransitions[order.status].includes(nextStatus)) {
    throw new AppError(`Cannot change an order from ${order.status} to ${nextStatus}`, 400);
  }
};

// ==================== CREATE ORDER ====================

const createOrder = asyncHandler(async (req, res) => {
  const order = await prisma.$transaction(
    async (tx) => {
      const cart = await tx.cart.findUnique({
        where: {
          userId: req.user.id
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stock: true,
                  status: true,
                  deleted: true
                }
              }
            }
          }
        }
      });

      if (!cart || !cart.items.length) {
        throw new AppError("Cart is empty", 400);
      }

      // Reserve/decrease stock for every product in the cart
      for (const item of cart.items) {
        try {
          await reserveStock(
            tx,
            item.productId,
            item.quantity
          );
        } catch (error) {
          throw new AppError(
            `${item.product.name} does not have enough available stock`,
            400
          );
        }
      }

      // Calculate total order amount
      const totalAmount = cart.items.reduce(
        (total, item) =>
          total.plus(
            item.product.price.mul(item.quantity)
          ),
        new Prisma.Decimal(0)
      );

      // Create order and order items
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,

          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },

        include: orderInclude
      });

      // Clear cart after successful order creation
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id
        }
      });

      return newOrder;
    },
    {
      timeout: 10000
    }
  );

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order
  });
});

// ==================== GET MY ORDERS ====================

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      userId: req.user.id
    },

    include: orderInclude,

    orderBy: {
      createdAt: "desc"
    }
  });

  res.json({
    success: true,
    count: orders.length,
    orders
  });
});

// ==================== GET MY ORDER ====================

const getMyOrder = asyncHandler(async (req, res) => {
  const id = orderId(req.params.id);

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: req.user.id
    },

    include: orderInclude
  });

  if (!order) {
    throw new AppError(
      "Order not found",
      404
    );
  }

  res.json({
    success: true,
    order
  });
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const id = orderId(req.params.id);
  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findFirst({ where: { id, userId: req.user.id }, include: { items: true } });
    if (!existing) throw new AppError("Order not found", 404);
    assertTransition(existing, "CANCELLED");
    await restockOrder(tx, existing.items);
    return tx.order.update({ where: { id }, data: { status: "CANCELLED" }, include: orderInclude });
  });
  res.json({ success: true, message: "Order cancelled successfully", order });
});

const getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { vendorId: req.user.id } } } },
    include: {
      items: { where: { product: { vendorId: req.user.id } }, include: { product: { select: { id: true, name: true, imageUrl: true, images: true } } } },
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, count: orders.length, orders });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { ...orderInclude, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, count: orders.length, orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const id = orderId(req.params.id);
  const { status } = req.body;
  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id },
      include: { items: { include: { product: { select: { vendorId: true } } } } }
    });
    if (!existing) throw new AppError("Order not found", 404);
    if (req.user.role === "VENDOR" && existing.items.some((item) => item.product.vendorId !== req.user.id)) {
      throw new AppError("Only an administrator can update a multi-vendor order", 403);
    }
    assertTransition(existing, status);
    if (status === "CANCELLED") await restockOrder(tx, existing.items);
    return tx.order.update({ where: { id }, data: { status }, include: orderInclude });
  });
  res.json({ success: true, message: "Order status updated", order });
});

// ==================== EXPORTS ====================

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
  getVendorOrders,
  getAllOrders,
  updateOrderStatus
};
