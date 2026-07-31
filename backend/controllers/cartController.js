const prisma = require("../config/prisma");

// GET /api/cart
const getCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: {
                userId: req.user.id,
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
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            cart: cart || { items: [] },
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// POST /api/cart/items
const addToCart = async (req, res) => {
    try {
        const productId = Number(req.body.productId);
        const quantity = req.body.quantity === undefined
            ? 1
            : Number(req.body.quantity);

        if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid productId and quantity are required",
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (product.stock < 1) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock",
            });
        }

        // Create the customer's cart only when they add their first product.
        const cart = await prisma.cart.upsert({
            where: {
                userId: req.user.id,
            },
            update: {},
            create: {
                userId: req.user.id,
            },
        });

        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });

        const newQuantity = (existingItem?.quantity || 0) + quantity;

        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} item(s) available in stock`,
            });
        }

        const cartItem = existingItem
            ? await prisma.cartItem.update({
                where: {
                    id: existingItem.id,
                },
                data: {
                    quantity: newQuantity,
                },
            })
            : await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });

        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cartItem,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// PUT /api/cart/items/:itemId
const updateCartItem = async (req, res) => {
    try {
        const itemId = Number(req.params.itemId);
        const quantity = Number(req.body.quantity);

        if (!Number.isInteger(itemId) || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Valid itemId and quantity are required",
            });
        }

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: {
                    userId: req.user.id,
                },
            },
            include: {
                product: true,
            },
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        if (quantity > cartItem.product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${cartItem.product.stock} item(s) available in stock`,
            });
        }

        const updatedItem = await prisma.cartItem.update({
            where: {
                id: itemId,
            },
            data: {
                quantity,
            },
        });

        res.status(200).json({
            success: true,
            message: "Cart item updated",
            cartItem: updatedItem,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// DELETE /api/cart/items/:itemId
const removeCartItem = async (req, res) => {
    try {
        const itemId = Number(req.params.itemId);

        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cart: {
                    userId: req.user.id,
                },
            },
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found",
            });
        }

        await prisma.cartItem.delete({
            where: {
                id: itemId,
            },
        });

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: {
                userId: req.user.id,
            },
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is already empty",
            });
        }

        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};