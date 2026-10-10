const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const { imageOrder } = require("./productGalleryService");

// Aggregate before pagination, so ratings and sales rank the entire matching
// collection. Values are bound parameters; sort fragments are a closed map.
async function catalogue(query) {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    availability,
    minRating,
    sort,
    page,
    limit,
  } = query;
  const clauses = [
    Prisma.sql`p."deleted" = false AND p."status" IN ('ACTIVE', 'OUT_OF_STOCK')`,
  ];
  if (search) {
    const term = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
    clauses.push(
      Prisma.sql`(p."name" ILIKE ${term} OR p."description" ILIKE ${term})`,
    );
  }
  if (category)
    clauses.push(
      /^\d+$/.test(category) &&
        Number.isSafeInteger(Number(category)) &&
        Number(category) <= 2147483647
        ? Prisma.sql`p."categoryId" = ${Number(category)}`
        : Prisma.sql`c."slug" = ${category}`,
    );
  if (minPrice !== undefined)
    clauses.push(Prisma.sql`p."price" >= ${minPrice}`);
  if (maxPrice !== undefined)
    clauses.push(Prisma.sql`p."price" <= ${maxPrice}`);
  if (availability)
    clauses.push(Prisma.sql`p."status" = 'ACTIVE' AND p."stock" > 0`);
  if (minRating) clauses.push(Prisma.sql`r.average >= ${minRating}`);
  const orders = {
    newest: Prisma.sql`p."createdAt" DESC, p.id DESC`,
    oldest: Prisma.sql`p."createdAt" ASC, p.id ASC`,
    price_asc: Prisma.sql`p.price ASC, p.id ASC`,
    price_desc: Prisma.sql`p.price DESC, p.id ASC`,
    name_asc: Prisma.sql`p.name ASC, p.id ASC`,
    name_desc: Prisma.sql`p.name DESC, p.id ASC`,
    rating_desc: Prisma.sql`r.average DESC NULLS LAST, r.count DESC NULLS LAST, p.id DESC`,
    best_selling: Prisma.sql`COALESCE(s.units, 0) DESC, p."createdAt" DESC, p.id DESC`,
  };
  const from = Prisma.sql`FROM "Product" p JOIN "Category" c ON c.id = p."categoryId"
    LEFT JOIN (SELECT "productId", AVG(rating) AS average, COUNT(*)::int AS count FROM "Review" WHERE status = 'PUBLISHED' GROUP BY "productId") r ON r."productId" = p.id
    ${
      sort === "best_selling"
        ? Prisma.sql`LEFT JOIN (
      SELECT i."productId", SUM(i.quantity) AS units FROM "OrderItem" i JOIN "Order" o ON o.id = i."orderId"
      WHERE o.status = 'DELIVERED' GROUP BY i."productId"
    ) s ON s."productId" = p.id`
        : Prisma.empty
    }
    WHERE ${Prisma.join(clauses, " AND ")}`;
  return prisma.$transaction(
    async (tx) => {
      const [count] = await tx.$queryRaw(
        Prisma.sql`SELECT COUNT(*)::int AS total ${from}`,
      );
      const ranked =
        await tx.$queryRaw(Prisma.sql`SELECT p.id, r.average::float AS "ratingAverage", COALESCE(r.count, 0) AS "reviewCount" ${from}
      ORDER BY ${orders[sort]} LIMIT ${limit} OFFSET ${(page - 1) * limit}`);
      const rows = ranked.length
        ? await tx.product.findMany({
            where: { id: { in: ranked.map((p) => p.id) } },
            include: {
              category: true,
              vendor: { select: { id: true, name: true } },
              images: { orderBy: imageOrder },
            },
          })
        : [];
      const byId = new Map(rows.map((p) => [p.id, p]));
      return {
        products: ranked.map((p) => ({
          ...byId.get(p.id),
          ratingAverage: p.ratingAverage,
          reviewCount: p.reviewCount,
        })),
        pagination: {
          page,
          limit,
          total: count.total,
          totalPages: Math.ceil(count.total / limit),
          hasNextPage: page * limit < count.total,
          hasPreviousPage: page > 1,
        },
      };
    },
    { isolationLevel: "RepeatableRead" },
  );
}
module.exports = { catalogue };
