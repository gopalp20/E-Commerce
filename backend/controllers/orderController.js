const prisma = require("../config/prisma");
const { Prisma } = require("@prisma/client");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { reserveStock } = require("../services/inventoryService");

const orderInclude = { items: { include: { product: { select: { id: true, name: true, imageUrl: true, images: true } } } } };

const createOrder = asyncHandler(async (req, res) => {
  const order = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({ where: { userId: req.user.id }, include: { items: { include: { product: { select: { id: true, name: true, price: true, stock: true, status: true, deleted: true } } } } } });
    if (!cart || !cart.items.length) throw new AppError("Cart is empty", 400);

    for (const item of cart.items) {
      try { await reserveStock(tx, item.productId, item.quantity); }
      catch (error) { throw new AppError(`${item.product.name} does not have enough available stock`, 400); }
    }
    const totalAmount = cart.items.reduce((total, item) => total.plus(item.product.price.mul(item.quantity)), new Prisma.Decimal(0));
    const newOrder = await tx.order.create({ data: { userId: req.user.id, totalAmount, items: { create: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.product.price })) } }, include: orderInclude });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return newOrder;
  });
  res.status(201).json({ success: true, message: "Order placed successfully", order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({ where: { userId: req.user.id }, include: orderInclude, orderBy: { createdAt: "desc" } });
  res.json({ success: true, count: orders.length, orders });
});

const getMyOrder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid order ID", 400);
  const order = await prisma.order.findFirst({ where: { id, userId: req.user.id }, include: orderInclude });
  if (!order) throw new AppError("Order not found", 404);
  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getMyOrder };
