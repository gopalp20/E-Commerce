const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const cartInclude = { items: { include: { product: { select: { id: true, name: true, price: true, stock: true, imageUrl: true, images: true, status: true } } } } };
const itemId = (value) => { const id = Number(value); if (!Number.isInteger(id)) throw new AppError("Invalid cart item ID", 400); return id; };

const getCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: cartInclude });
  res.json({ success: true, cart: cart || { items: [] } });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await prisma.product.findFirst({ where: { id: productId, deleted: false, status: "ACTIVE" } });
  if (!product) throw new AppError("Product is not currently available", 404);
  if (product.stock < quantity) throw new AppError(`Only ${product.stock} item(s) available in stock`, 400);
  const cart = await prisma.cart.upsert({ where: { userId: req.user.id }, update: {}, create: { userId: req.user.id } });
  const existing = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } });
  const newQuantity = (existing?.quantity || 0) + quantity;
  if (newQuantity > product.stock) throw new AppError(`Only ${product.stock} item(s) available in stock`, 400);
  const cartItem = existing ? await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQuantity } }) : await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
  res.status(200).json({ success: true, message: "Product added to cart", cartItem });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const id = itemId(req.params.itemId);
  const { quantity } = req.body;
  const cartItem = await prisma.cartItem.findFirst({ where: { id, cart: { userId: req.user.id } }, include: { product: true } });
  if (!cartItem) throw new AppError("Cart item not found", 404);
  if (cartItem.product.deleted || cartItem.product.status !== "ACTIVE" || quantity > cartItem.product.stock) throw new AppError(`Only ${cartItem.product.stock} item(s) available in stock`, 400);
  const updatedItem = await prisma.cartItem.update({ where: { id }, data: { quantity } });
  res.json({ success: true, message: "Cart item updated", cartItem: updatedItem });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const id = itemId(req.params.itemId);
  const cartItem = await prisma.cartItem.findFirst({ where: { id, cart: { userId: req.user.id } } });
  if (!cartItem) throw new AppError("Cart item not found", 404);
  await prisma.cartItem.delete({ where: { id } });
  res.json({ success: true, message: "Item removed from cart" });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (!cart) return res.json({ success: true, message: "Cart is already empty" });
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ success: true, message: "Cart cleared successfully" });
});
module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
