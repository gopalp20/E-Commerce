const AppError = require("../utils/AppError");

const decreaseStock = async (tx, productId, quantity) => {
  const result = await tx.product.updateMany({
    where: { id: productId, deleted: false, status: "ACTIVE", stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });

  if (result.count === 0) {
    throw new AppError("Product is unavailable or does not have enough stock", 400);
  }

  const product = await tx.product.findUnique({ where: { id: productId }, select: { stock: true } });
  if (product.stock === 0) {
    await tx.product.update({ where: { id: productId }, data: { status: "OUT_OF_STOCK" } });
  }
};

const increaseStock = async (tx, productId, quantity) => {
  const product = await tx.product.findFirst({ where: { id: productId, deleted: false } });
  if (!product) throw new AppError("Product not found", 404);

  return tx.product.update({
    where: { id: productId },
    data: { stock: { increment: quantity }, status: product.status === "OUT_OF_STOCK" ? "ACTIVE" : product.status },
  });
};

// Reservation is an atomic conditional decrement, suitable for checkout transactions.
const reserveStock = decreaseStock;

module.exports = { increaseStock, decreaseStock, reserveStock };
