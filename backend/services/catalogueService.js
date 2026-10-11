const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");

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
  // One SQL statement gives the count, ranking and gallery the same snapshot.
  // An interactive transaction used to keep a connection across nine remote
  // round trips, often exceeding Prisma's five-second transaction deadline.
  const [result] = await prisma.$queryRaw(Prisma.sql`
    WITH matching AS (
      SELECT p.id, r.average::float AS "ratingAverage", COALESCE(r.count, 0) AS "reviewCount",
        ROW_NUMBER() OVER (ORDER BY ${orders[sort]}) AS position
      ${from}
    ), selected AS (
      SELECT * FROM matching ORDER BY position
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    )
    SELECT (SELECT COUNT(*)::int FROM matching) AS total,
      COALESCE((SELECT jsonb_agg(
        to_jsonb(p) || jsonb_build_object(
          'price', p.price::text,
          'category', to_jsonb(c),
          'vendor', jsonb_build_object('id', v.id, 'name', v.name),
          'images', COALESCE((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.position, i.id)
            FROM "ProductImage" i WHERE i."productId" = p.id), '[]'::jsonb),
          'ratingAverage', selected."ratingAverage",
          'reviewCount', selected."reviewCount"
        ) ORDER BY selected.position
      ) FROM selected
        JOIN "Product" p ON p.id = selected.id
        JOIN "Category" c ON c.id = p."categoryId"
        JOIN "User" v ON v.id = p."vendorId"), '[]'::jsonb) AS products
  `);
  // PostgreSQL JSON timestamps have no zone; Prisma stores these fields as UTC.
  const dates = (row) => {
    for (const field of ["createdAt", "updatedAt", "deletedAt"])
      if (row[field]) row[field] = new Date(row[field] + "Z").toISOString();
    return row;
  };
  return {
    products: result.products.map((product) => ({
      ...dates(product),
      price: new Prisma.Decimal(product.price).toJSON(),
      category: dates(product.category),
      images: product.images.map(dates),
    })),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      hasNextPage: page * limit < result.total,
      hasPreviousPage: page > 1,
    },
  };
}
module.exports = { catalogue };
