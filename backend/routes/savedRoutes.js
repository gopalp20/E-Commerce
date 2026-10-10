const router = require("express").Router();
const { z } = require("zod");
const validate = require("../middleware/validate");
const controller = require("../controllers/savedController");
router.use(
  require("../middleware/authMiddleware"),
  require("../middleware/authorize")("CUSTOMER"),
);
router.get("/", controller.list);
router.put(
  "/:productId",
  validate(z.object({ fromBag: z.boolean().default(false) }).strict()),
  controller.save,
);
router.delete("/:productId", controller.remove);
router.post(
  "/:productId/bag",
  validate(
    z
      .object({
        quantity: z.number().int().positive().max(2147483647),
        expectedPrice: z.number().nonnegative().finite(),
      })
      .strict(),
  ),
  controller.moveToBag,
);
module.exports = router;
