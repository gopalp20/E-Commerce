const prisma = require("../config/prisma");

// Serializable transactions protect checkout and cancellation against concurrent writes.
async function serialTransaction(work) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await prisma.$transaction(work, {
        isolationLevel: "Serializable",
        timeout: 15000,
      });
    } catch (error) {
      if (!["P2034", "P2002"].includes(error.code) || attempt === 3)
        throw error;
    }
  }
}
module.exports = { serialTransaction };
