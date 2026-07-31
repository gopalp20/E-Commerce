const prisma = require("../config/prisma");
const { Prisma } = require("@prisma/client");

// POST /api/orders
// Creates an order from the logged-in customer's cart.
const createOrder = async (req, res) => {
    try {
        const order = await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findUnique({
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
                                },
                            },
                        },
                    },
                },
            });

            if (!cart || cart.items.length === 0) {
                const error = new Error("Cart is empty");
                error.statusCode = 400;
                throw error;
            }

            // Check stock and reduce it.
            for (const item of cart.items) {
                const updatedProduct = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        stock: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

                if (updatedProduct.count === 0) {
                    const error = new Error(
                        `${item.product.name} does not have enough stock`
                    );
                    error.statusCode = 400;
                    throw error;
                }
            }

            const totalAmount = cart.items.reduce(
                (total, item) =>
                    total.plus(item.product.price.mul(item.quantity)),
                new Prisma.Decimal(0)
            );

            const newOrder = await tx.order.create({
                data: {
                    userId: req.user.id,
                    totalAmount,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrl: true,
                                },
                            },
                        },
                    },
                },
            });

            // Cart becomes empty after a successful checkout.
            await tx.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                },
            });

            return newOrder;
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.log(error);

        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal Server Error",
        });
    }
};

// GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
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
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// GET /api/orders/:id
const getMyOrder = async (req, res) => {
    try {
        const orderId = Number(req.params.id);

        if (!Number.isInteger(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: req.user.id,
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            order,
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
    createOrder,
    getMyOrders,
    getMyOrder,
};