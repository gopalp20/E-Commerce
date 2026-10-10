const router = require("express").Router();
const { z } = require("zod");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const c = require("../controllers/reviewController");
const query = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(8),
  sort: z.enum(["newest", "helpful", "highest", "lowest"]).default("newest"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  vendorId: z.coerce.number().int().positive().optional(),
  status: z.enum(["PUBLISHED", "HIDDEN"]).optional(),
});
const body = z.object({
  rating: z.number().int().min(1).max(5),
  title: z
    .string()
    .trim()
    .min(3, "Add a title of at least 3 characters.")
    .max(100),
  body: z
    .string()
    .trim()
    .min(20, "Tell us a little more, at least 20 characters.")
    .max(3000),
});
const optionalAuth = (req, res, next) =>
  req.headers.authorization ? protect(req, res, next) : next();
router.get(
  "/product/:productId",
  optionalAuth,
  validate(query, "query"),
  c.listProductReviews,
);
router.get(
  "/product/:productId/me",
  protect,
  authorize("CUSTOMER"),
  c.reviewEligibility,
);
router.post(
  "/product/:productId",
  protect,
  authorize("CUSTOMER"),
  validate(body),
  c.createReview,
);
router.get(
  "/mine",
  protect,
  authorize("CUSTOMER"),
  validate(query, "query"),
  c.listWorkspaceReviews,
);
router.get(
  "/vendor",
  protect,
  authorize("VENDOR"),
  validate(query, "query"),
  c.listWorkspaceReviews,
);
router.get(
  "/admin",
  protect,
  authorize("ADMIN"),
  validate(query, "query"),
  c.listWorkspaceReviews,
);
router.patch(
  "/:id/moderation",
  protect,
  authorize("ADMIN"),
  validate(
    z
      .object({
        status: z.enum(["PUBLISHED", "HIDDEN"]),
        reason: z.string().trim().max(500).optional(),
      })
      .refine((v) => v.status !== "HIDDEN" || v.reason?.length >= 5, {
        message: "Explain why this review is being hidden.",
        path: ["reason"],
      }),
  ),
  c.moderateReview,
);
router.put(
  "/:id/helpful",
  protect,
  authorize("CUSTOMER"),
  validate(z.object({ helpful: z.boolean() })),
  c.voteHelpful,
);
router.put(
  "/:id",
  protect,
  authorize("CUSTOMER"),
  validate(body),
  c.updateReview,
);
router.delete("/:id", protect, authorize("CUSTOMER"), c.deleteReview);
module.exports = router;
