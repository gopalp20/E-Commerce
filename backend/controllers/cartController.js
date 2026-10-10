const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const cartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          imageUrl: true,
          images: { orderBy: [{ position: "asc" }, { id: "asc" }] },
          status: true,
        },
      },
    },
  },
};

const itemId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id)) {
    throw new AppError("Invalid cart item ID", 400);
  }
  return id;
};

const getCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: cartInclude,
  });

  res.json({
    success: true,
    cart: cart || { items: [] },
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cartItem = await serialTransaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: productId,
        deleted: false,
        status: { in: ["ACTIVE", "OUT_OF_STOCK"] },
      },
    });

    if (!product) {
      throw new AppError("Product is not currently available", 404);
    }

    if (product.status === "OUT_OF_STOCK" || product.stock === 0) {
      throw new AppError("This product is currently sold out.", 400);
    }

    if (product.stock < quantity) {
      throw new AppError(
        `Only ${product.stock} item(s) available in stock`,
        400,
      );
    }

    const cart = await tx.cart.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id },
    });

    const existing = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    const newQuantity = (existing?.quantity || 0) + quantity;

    if (newQuantity > product.stock) {
      throw new AppError(
        `Only ${product.stock} item(s) available in stock`,
        400,
      );
    }

    return existing
      ? await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQuantity },
        })
      : await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
  });

  res.status(200).json({
    success: true,
    message: "Product added to cart",
    cartItem,
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const id = itemId(req.params.itemId);
  const { quantity } = req.body;

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id,
      cart: {
        userId: req.user.id,
      },
    },
    include: {
      product: true,
    },
  });

  if (!cartItem) {
    throw new AppError("Cart item not found", 404);
  }

  if (
    cartItem.product.deleted ||
    cartItem.product.status !== "ACTIVE" ||
    quantity > cartItem.product.stock
  ) {
    throw new AppError(
      `Only ${cartItem.product.stock} item(s) available in stock`,
      400,
    );
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });

  res.json({
    success: true,
    message: "Cart item updated",
    cartItem: updatedItem,
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const id = itemId(req.params.itemId);

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id,
      cart: {
        userId: req.user.id,
      },
    },
  });

  if (!cartItem) {
    throw new AppError("Cart item not found", 404);
  }

  await prisma.cartItem.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: "Item removed from cart",
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });

  if (!cart) {
    return res.json({
      success: true,
      message: "Cart is already empty",
    });
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  res.json({
    success: true,
    message: "Cart cleared successfully",
  });
});

const { serialTransaction } = require("../services/transactionService");
const mergeCart = asyncHandler(async (req, res) => {
  const cart = await serialTransaction(async (tx) => {
    const cart = await tx.cart.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id },
    });
    for (const item of req.body.items) {
      const product = await tx.product.findFirst({
        where: { id: item.productId, deleted: false, status: "ACTIVE" },
      });
      if (!product || item.quantity > product.stock)
        throw new AppError(
          "An item in your saved bag is unavailable. Update your bag to continue.",
          409,
        );
      const key = {
        cartId_productId: { cartId: cart.id, productId: item.productId },
      };
      const existing = await tx.cartItem.findUnique({ where: key });
      // Merging by maximum quantity is repeatable after a lost response, without doubling items.
      const quantity = Math.max(existing?.quantity || 0, item.quantity);
      if (quantity > product.stock)
        throw new AppError(
          "Stock changed. Update the quantity in your bag.",
          409,
        );
      await tx.cartItem.upsert({
        where: key,
        create: { cartId: cart.id, productId: item.productId, quantity },
        update: { quantity },
      });
    }
    return tx.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
  });
  res.json({ success: true, cart });
});

module.exports = {
  mergeCart,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
