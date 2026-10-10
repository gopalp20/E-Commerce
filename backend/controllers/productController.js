const { withRatings } = require("../services/reviewService");
const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { increaseStock } = require("../services/inventoryService");
const { resolveProductStatus } = require("../services/productStatusService");

const {
  galleryFromInput,
  validateGallery,
  imageOrder,
} = require("../services/productGalleryService");

const publicVendorSelect = {
  id: true,
  name: true,
};

const publicInclude = {
  vendor: {
    select: publicVendorSelect,
  },
  category: true,
  images: { orderBy: imageOrder },
};

// ==================== ENSURE PRODUCT OWNER ====================

const ensureProductOwner = async (productId, user) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deleted: false,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (user.role !== "ADMIN" && product.vendorId !== user.id) {
    throw new AppError("Access denied", 403);
  }

  return product;
};

// ==================== INCREASE PRODUCT STOCK ====================

const increaseProductStock = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new AppError("Invalid product ID", 400);
  }

  const { quantity } = req.body;

  // Make sure the product belongs to the logged-in vendor
  const product = await prisma.product.findFirst({
    where: {
      id,
      vendorId: req.user.id,
      deleted: false,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Use inventory service to increase stock
  const updatedProduct = await increaseStock(prisma, id, quantity);

  res.json({
    success: true,
    message: "Stock increased successfully",
    product: updatedProduct,
  });
});

// ==================== CREATE PRODUCT ====================

const createProduct = asyncHandler(async (req, res) => {
  const { images, categoryId, imageUrl, ...fields } = req.body;

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const status = resolveProductStatus({
    currentStatus: "ACTIVE",
    stock: fields.stock,
    requestedStatus: fields.status || "ACTIVE",
  });

  const gallery = galleryFromInput({ images, imageUrl });
  await validateGallery(gallery, [req.user.id]);
  if (["ACTIVE", "OUT_OF_STOCK"].includes(status) && !gallery.length)
    throw new AppError(
      "Add a product photo before publishing, or save as a draft.",
      400,
    );

  const product = await prisma.product.create({
    data: {
      ...fields,
      status,
      imageUrl: gallery[0]?.url || null,
      vendorId: req.user.id,
      categoryId,

      images: gallery.length
        ? {
            create: gallery.map((image, position) => ({ ...image, position })),
          }
        : undefined,
    },

    include: publicInclude,
  });

  res.status(201).json({
    success: true,
    product,
  });
});

// ==================== GET MY PRODUCTS ====================

const getMyProducts = asyncHandler(async (req, res) => {
  const where =
    req.user.role === "ADMIN"
      ? {}
      : {
          vendorId: req.user.id,
        };

  const products = await prisma.product.findMany({
    where,

    include: {
      category: true,
      images: { orderBy: imageOrder },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    count: products.length,
    products,
  });
});

// ==================== GET OUT OF STOCK PRODUCTS ====================

const getOutOfStockProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      vendorId: req.user.id,
      stock: 0,
      deleted: false,
    },

    include: {
      category: true,
      images: { orderBy: imageOrder },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    success: true,
    count: products.length,
    products,
  });
});

// ==================== GET PRODUCTS ====================

const getProducts = asyncHandler(async (req, res) => {
  const result = await require("../services/catalogueService").catalogue(req.validated.query);
  res.json({ success: true, ...result });
});

// ==================== GET SINGLE PRODUCT ====================

const getProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new AppError("Invalid product ID", 400);
  }

  const product = await prisma.product.findFirst({
    where: {
      id,
      deleted: false,
      status: { in: ["ACTIVE", "OUT_OF_STOCK"] },
    },

    include: publicInclude,
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.json({
    success: true,
    product: (await withRatings([product]))[0],
  });
});

// ==================== UPDATE PRODUCT ====================

const updateProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new AppError("Invalid product ID", 400);
  }

  await ensureProductOwner(id, req.user);

  const { images, categoryId, stock, status, imageUrl, ...fields } = req.body;

  if (
    categoryId !== undefined &&
    !(await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    }))
  ) {
    throw new AppError("Category not found", 404);
  }

  const currentProduct = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: imageOrder } },
  });
  const gallery = galleryFromInput({ images, imageUrl }, currentProduct);
  if (gallery !== undefined)
    await validateGallery(gallery, [req.user.id, currentProduct.vendorId]);
  const resolvedStock = stock === undefined ? currentProduct.stock : stock;
  const resolvedStatus = resolveProductStatus({
    currentStatus: currentProduct.status,
    stock: resolvedStock,
    requestedStatus: status,
  });

  if (
    ["ACTIVE", "OUT_OF_STOCK"].includes(
      resolvedStatus || currentProduct.status,
    ) &&
    !(gallery === undefined
      ? currentProduct.imageUrl || currentProduct.images.length
      : gallery.length)
  )
    throw new AppError(
      "Add a product photo before publishing, or save as a draft.",
      400,
    );

  const product = await prisma.product.update({
    where: {
      id,
    },

    data: {
      ...fields,

      ...(stock !== undefined && {
        stock,
      }),

      ...(resolvedStatus && {
        status: resolvedStatus,
      }),

      ...(categoryId !== undefined && {
        categoryId,
      }),

      ...(gallery !== undefined && {
        images: {
          deleteMany: {},

          create: gallery.map((image, position) => ({ ...image, position })),
        },

        imageUrl: gallery[0]?.url || null,
      }),
    },

    include: publicInclude,
  });

  res.json({
    success: true,

    message: "Product updated successfully",

    product,
  });
});

// ==================== DELETE PRODUCT ====================

const deleteProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    throw new AppError("Invalid product ID", 400);
  }

  await ensureProductOwner(id, req.user);

  await prisma.product.update({
    where: {
      id,
    },

    data: {
      deleted: true,
      deletedAt: new Date(),
      status: "ARCHIVED",
    },
  });

  res.json({
    success: true,

    message: "Product archived successfully",
  });
});

// ==================== EXPORTS ====================

const restoreProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError("Invalid product ID", 400);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError("Product not found", 404);
  if (req.user.role !== "ADMIN" && product.vendorId !== req.user.id)
    throw new AppError("Access denied", 403);
  if (!product.deleted && product.status !== "ARCHIVED")
    throw new AppError("This product is not archived.", 409);
  const restored = await prisma.product.update({
    where: { id },
    data: {
      deleted: false,
      deletedAt: null,
      status: "DRAFT",
    },
    include: publicInclude,
  });
  res.json({
    success: true,
    product: restored,
    message: "Product restored as a draft",
  });
});

module.exports = {
  createProduct,
  getProducts,
  getMyProducts,
  getOutOfStockProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  increaseProductStock,
};
