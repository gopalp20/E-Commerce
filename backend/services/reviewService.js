const prisma = require("../config/prisma");

async function withRatings(products) {
  if (!products.length) return products;
  const ratings = await prisma.review.groupBy({
    by: ["productId"],
    where: {
      productId: { in: products.map((p) => p.id) },
      status: "PUBLISHED",
    },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const byId = new Map(ratings.map((r) => [r.productId, r]));
  return products.map((p) => ({
    ...p,
    ratingAverage: byId.get(p.id)?._avg.rating ?? null,
    reviewCount: byId.get(p.id)?._count._all ?? 0,
  }));
}

module.exports = { withRatings };
