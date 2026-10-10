const { saveAddress, snapshotAddress } = require("./addressService");
const { Prisma } = require("@prisma/client");
const { createHash } = require("node:crypto");
const AppError = require("../utils/AppError");
const { reserveStock } = require("./inventoryService");
const { serialTransaction } = require("./transactionService");

const orderInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          vendorId: true,
          name: true,
          imageUrl: true,
          images: { orderBy: [{ position: "asc" }, { id: "asc" }] },
        },
      },
    },
  },
};
const transitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function deliveryPrice(subtotal, method) {
  return new Prisma.Decimal(
    method === "EXPRESS" ? 299 : subtotal.gte(2500) ? 0 : 149,
  );
}

async function checkout(userId, input) {
  const { checkoutKey, ...details } = input;
  const fingerprint = createHash("sha256")
    .update(JSON.stringify(details))
    .digest("hex");
  return serialTransaction(async (tx) => {
    const previous = await tx.order.findUnique({
      where: { userId_checkoutKey: { userId, checkoutKey } },
      include: orderInclude,
    });
    if (previous) {
      if (previous.checkoutFingerprint !== fingerprint)
        throw new AppError(
          "This checkout has already been submitted with different details. Please start again.",
          409,
        );
      return previous;
    }
    let shippingAddress = input.shippingAddress;
    if (input.addressId) {
      const saved = await tx.address.findFirst({
        where: { id: input.addressId, userId },
      });
      if (!saved)
        throw new AppError(
          "This saved address is no longer available. Choose another address.",
          404,
        );
      shippingAddress = snapshotAddress(saved);
    }
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ position: "asc" }, { id: "asc" }] },
              },
            },
          },
        },
      },
    });
    if (!cart?.items.length) throw new AppError("Your bag is empty.", 400);
    const subtotal = cart.items.reduce(
      (total, item) => total.plus(item.product.price.mul(item.quantity)),
      new Prisma.Decimal(0),
    );
    const shippingAmount = deliveryPrice(subtotal, input.deliveryMethod);
    const totalAmount = subtotal.plus(shippingAmount);
    if (!totalAmount.equals(new Prisma.Decimal(input.expectedTotal)))
      throw new AppError(
        "A price has changed. Refresh your bag and review the new total before placing your order.",
        409,
      );
    for (const item of cart.items)
      await reserveStock(tx, item.productId, item.quantity);
    if (input.saveAddress && !input.addressId) {
      await saveAddress(tx, userId, {
        ...shippingAddress,
        label: input.addressLabel,
        isDefault: input.defaultAddress,
      });
    }
    const order = await tx.order.create({
      data: {
        userId,
        checkoutKey,
        checkoutFingerprint: fingerprint,
        subtotal,
        shippingAmount,
        totalAmount,
        shippingAddress,
        deliveryMethod: input.deliveryMethod,
        paymentMethod: "COD",
        currency: "INR",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            productName: item.product.name,
            productImage:
              item.product.imageUrl || item.product.images[0]?.url || null,
          })),
        },
      },
      include: orderInclude,
    });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  });
}

async function changeOrderStatus(id, status, user, customer = false) {
  return serialTransaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order || (customer && order.userId !== user.id))
      throw new AppError("Order not found.", 404);
    if (
      user.role === "VENDOR" &&
      order.items.some((item) => item.product.vendorId !== user.id)
    )
      throw new AppError(
        "Only an administrator can update a multi-vendor order.",
        403,
      );
    // A retry of a successful transition must have no additional side effects.
    if (order.status === status)
      return tx.order.findUnique({ where: { id }, include: orderInclude });
    if (!transitions[order.status]?.includes(status))
      throw new AppError(
        `Cannot change an order from ${order.status} to ${status}.`,
        400,
      );
    await tx.order.update({ where: { id }, data: { status } });
    if (status === "CANCELLED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            ...(item.product.status === "OUT_OF_STOCK" &&
              !item.product.deleted && { status: "ACTIVE" }),
          },
        });
      }
    }
    return tx.order.findUnique({ where: { id }, include: orderInclude });
  });
}
module.exports = { checkout, changeOrderStatus, orderInclude, deliveryPrice };
