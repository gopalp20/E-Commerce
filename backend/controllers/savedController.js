const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { serialTransaction } = require("../services/transactionService");
const { withRatings } = require("../services/reviewService");
const publicProduct = (product) =>
  !product.deleted && ["ACTIVE", "OUT_OF_STOCK"].includes(product.status);
function id(value) {
  if (
    !/^[1-9]\d*$/.test(value) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) > 2147483647
  )
    throw new AppError("Invalid product ID", 400);
  return Number(value);
}
const list = asyncHandler(async (req, res) => {
  const saved = await prisma.savedItem.findMany({
    where: { userId: req.user.id },
    orderBy: [{ createdAt: "desc" }, { productId: "desc" }],
    include: {
      product: {
        include: {
          vendor: { select: { id: true, name: true } },
          category: true,
        },
      },
    },
  });
  const rated = await withRatings(
    saved.filter((s) => publicProduct(s.product)).map((s) => s.product),
  );
  const byId = new Map(rated.map((p) => [p.id, p]));
  res.json({
    success: true,
    items: saved.map((s) => ({
      productId: s.productId,
      quantity: s.quantity,
      savedPrice: s.savedPrice,
      savedAt: s.createdAt,
      available: publicProduct(s.product),
      // A withdrawn listing must not expose its current private draft details.
      product: byId.get(s.productId) || {
        id: s.productId,
        name: s.productName,
        imageUrl: s.productImage,
        stock: 0,
        status: "ARCHIVED",
        price: null,
      },
    })),
  });
});
const save = asyncHandler(async (req, res) => {
  const productId = id(req.params.productId),
    userId = req.user.id;
  await serialTransaction(async (tx) => {
    const key = { userId_productId: { userId, productId } };
    const existing = await tx.savedItem.findUnique({ where: key });
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product || !publicProduct(product))
      throw new AppError("This product is no longer available to save.", 404);
    if (!existing && (await tx.savedItem.count({ where: { userId } })) >= 200)
      throw new AppError(
        "Your list has 200 items. Remove an item before saving another.",
        409,
      );
    const cartItem = req.body.fromBag
      ? await tx.cartItem.findFirst({ where: { productId, cart: { userId } } })
      : null;
    if (req.body.fromBag && !cartItem && !existing)
      throw new AppError("This item is no longer in your bag.", 409);
    await tx.savedItem.upsert({
      where: key,
      create: {
        userId,
        productId,
        quantity: cartItem?.quantity || 1,
        savedPrice: product.price,
        productName: product.name,
        productImage: product.imageUrl,
      },
      update: cartItem ? { quantity: cartItem.quantity } : {},
    });
    if (cartItem) await tx.cartItem.delete({ where: { id: cartItem.id } });
  });
  res.json({ success: true });
});
const remove = asyncHandler(async (req, res) => {
  await prisma.savedItem.deleteMany({
    where: { userId: req.user.id, productId: id(req.params.productId) },
  });
  res.json({ success: true });
});
const moveToBag = asyncHandler(async (req, res) => {
  const productId = id(req.params.productId),
    userId = req.user.id;
  await serialTransaction(async (tx) => {
    const key = { userId_productId: { userId, productId } };
    const saved = await tx.savedItem.findUnique({ where: key });
    const existing = await tx.cartItem.findFirst({
      where: { productId, cart: { userId } },
    });
    // A repeated move after a lost response does not add another quantity.
    if (!saved && existing) return;
    if (!saved)
      throw new AppError("This item is no longer in your saved list.", 404);
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (
      !product ||
      !publicProduct(product) ||
      product.status !== "ACTIVE" ||
      product.stock < 1
    )
      throw new AppError(
        "This item is unavailable. We kept it in your saved list.",
        409,
      );
    if (Number(product.price) !== req.body.expectedPrice)
      throw new AppError(
        "The price changed. Refresh your saved items before moving this item.",
        409,
      );
    const quantity = Math.max(existing?.quantity || 0, req.body.quantity);
    if (quantity > product.stock)
      throw new AppError(
        `Only ${product.stock} available. Choose a lower quantity; your saved item is safe.`,
        409,
      );
    const cart = await tx.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    await tx.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity },
    });
    await tx.savedItem.delete({ where: key });
  });
  res.json({ success: true });
});
module.exports = { list, save, remove, moveToBag };
