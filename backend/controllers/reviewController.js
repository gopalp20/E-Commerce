const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

function id(value) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw new AppError("Invalid ID", 400);
  return n;
}
const reviewInclude = (userId) => ({
  user: { select: { name: true } },
  _count: { select: { votes: true } },
  ...(userId ? { votes: { where: { userId }, select: { userId: true } } } : {}),
});
function serialize(review, userId, privateView = false) {
  const names = review.user.name.trim().split(/\s+/);
  return {
    id: review.id,
    productId: review.productId,
    author: names[0] + (names.length > 1 ? ` ${names.at(-1)[0]}.` : ""),
    rating: review.rating,
    title: review.title,
    body: review.body,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    verifiedPurchase: true,
    helpfulCount: review._count.votes,
    helpful: Boolean(review.votes?.length),
    isOwn: review.userId === userId,
    ...(privateView
      ? { status: review.status, moderationReason: review.moderationReason }
      : {}),
    ...(review.product ? { product: review.product } : {}),
  };
}
async function publicProduct(productId) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deleted: false,
      status: { in: ["ACTIVE", "OUT_OF_STOCK"] },
    },
  });
  if (!product) throw new AppError("Product not found", 404);
  return product;
}
async function purchased(productId, userId) {
  return Boolean(
    await prisma.orderItem.findFirst({
      where: { productId, order: { userId, status: "DELIVERED" } },
      select: { id: true },
    }),
  );
}
async function ownReview(req) {
  const review = await prisma.review.findUnique({
    where: { id: id(req.params.id) },
  });
  if (!review) throw new AppError("Review not found", 404);
  if (review.userId !== req.user.id)
    throw new AppError("You can only change your own review.", 403);
  return review;
}
const sortOrder = {
  newest: [{ createdAt: "desc" }, { id: "desc" }],
  helpful: [
    { votes: { _count: "desc" } },
    { createdAt: "desc" },
    { id: "desc" },
  ],
  highest: [{ rating: "desc" }, { id: "desc" }],
  lowest: [{ rating: "asc" }, { id: "desc" }],
};
exports.listProductReviews = asyncHandler(async (req, res) => {
  const productId = id(req.params.productId);
  await publicProduct(productId);
  const { rating, page, limit, sort } = req.validated.query;
  const published = { productId, status: "PUBLISHED" };
  const where = { ...published, ...(rating ? { rating } : {}) };
  const [rows, total, groups] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      include: reviewInclude(req.user?.id),
      orderBy: sortOrder[sort],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.review.groupBy({
      by: ["rating"],
      where: published,
      _count: { _all: true },
    }),
  ]);
  const distribution = Object.fromEntries(
    [5, 4, 3, 2, 1].map((rating) => [
      rating,
      groups.find((g) => g.rating === rating)?._count._all || 0,
    ]),
  );
  const count = groups.reduce((sum, g) => sum + g._count._all, 0);
  res.json({
    success: true,
    reviews: rows.map((r) => serialize(r, req.user?.id)),
    summary: {
      count,
      average: count
        ? groups.reduce((sum, g) => sum + g.rating * g._count._all, 0) / count
        : null,
      distribution,
    },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
exports.reviewEligibility = asyncHandler(async (req, res) => {
  const productId = id(req.params.productId);
  const product = await publicProduct(productId);
  const [eligible, review] = await Promise.all([
    purchased(productId, req.user.id),
    prisma.review.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
      include: reviewInclude(req.user.id),
    }),
  ]);
  res.json({
    success: true,
    eligible: eligible && product.vendorId !== req.user.id,
    review: review ? serialize(review, req.user.id, true) : null,
  });
});
exports.createReview = asyncHandler(async (req, res) => {
  const productId = id(req.params.productId);
  const product = await publicProduct(productId);
  if (
    product.vendorId === req.user.id ||
    !(await purchased(productId, req.user.id))
  )
    throw new AppError(
      "You can review this product after your order is delivered.",
      403,
    );
  try {
    const review = await prisma.review.create({
      data: { ...req.body, productId, userId: req.user.id },
      include: reviewInclude(req.user.id),
    });
    res
      .status(201)
      .json({ success: true, review: serialize(review, req.user.id, true) });
  } catch (error) {
    if (error.code === "P2002")
      throw new AppError(
        "You already reviewed this product. You can edit your review.",
        409,
      );
    throw error;
  }
});
exports.updateReview = asyncHandler(async (req, res) => {
  const existing = await ownReview(req);
  const review = await prisma.review.update({
    where: { id: existing.id },
    data: req.body,
    include: reviewInclude(req.user.id),
  });
  res.json({ success: true, review: serialize(review, req.user.id, true) });
});
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await ownReview(req);
  await prisma.review.delete({ where: { id: review.id } });
  res.json({ success: true });
});
exports.voteHelpful = asyncHandler(async (req, res) => {
  const reviewId = id(req.params.id),
    userId = req.user.id;
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      status: "PUBLISHED",
      product: { deleted: false, status: { in: ["ACTIVE", "OUT_OF_STOCK"] } },
    },
    select: { userId: true },
  });
  if (!review) throw new AppError("Review not found", 404);
  if (review.userId === userId)
    throw new AppError("You cannot vote on your own review.", 400);
  if (req.body.helpful)
    await prisma.reviewVote.createMany({
      data: [{ reviewId, userId }],
      skipDuplicates: true,
    });
  else await prisma.reviewVote.deleteMany({ where: { reviewId, userId } });
  res.json({
    success: true,
    helpful: req.body.helpful,
    helpfulCount: await prisma.reviewVote.count({ where: { reviewId } }),
  });
});
exports.listWorkspaceReviews = asyncHandler(async (req, res) => {
  const { vendorId, status, rating, page, limit, sort } = req.validated.query;
  const admin = req.user.role === "ADMIN",
    mine = req.user.role === "CUSTOMER";
  const where = {
    ...(mine
      ? { userId: req.user.id }
      : admin
        ? {
            ...(vendorId ? { product: { vendorId } } : {}),
            ...(status ? { status } : {}),
          }
        : { product: { vendorId: req.user.id }, status: "PUBLISHED" }),
    ...(rating ? { rating } : {}),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      orderBy: sortOrder[sort],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        ...reviewInclude(req.user.id),
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            deleted: true,
            status: true,
            vendor: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);
  res.json({
    success: true,
    reviews: rows.map((r) => serialize(r, req.user.id, admin || mine)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
exports.moderateReview = asyncHandler(async (req, res) => {
  const reviewId = id(req.params.id);
  if (
    !(await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    }))
  )
    throw new AppError("Review not found", 404);
  await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: req.body.status,
      moderationReason: req.body.status === "HIDDEN" ? req.body.reason : null,
    },
  });
  res.json({ success: true });
});
