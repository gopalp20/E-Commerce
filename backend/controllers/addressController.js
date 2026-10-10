const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { serialTransaction } = require("../services/transactionService");
const { saveAddress, snapshotAddress } = require("../services/addressService");
const idOf = (value) => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1)
    throw new AppError("Invalid address ID", 400);
  return id;
};
const ownedAddress = async (tx, userId, id) => {
  const address = await tx.address.findFirst({ where: { id, userId } });
  if (!address) throw new AppError("Address not found.", 404);
  return address;
};
exports.getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  res.json({ success: true, addresses });
});
exports.createAddress = asyncHandler(async (req, res) => {
  const address = await serialTransaction((tx) =>
    saveAddress(tx, req.user.id, req.body),
  );
  res.status(201).json({ success: true, address });
});
exports.updateAddress = asyncHandler(async (req, res) => {
  const address = await serialTransaction(async (tx) => {
    const existing = await ownedAddress(tx, req.user.id, idOf(req.params.id));
    const isDefault = existing.isDefault || req.body.isDefault;
    if (isDefault)
      await tx.address.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false },
      });
    return tx.address.update({
      where: { id: existing.id },
      data: { ...snapshotAddress(req.body), label: req.body.label, isDefault },
    });
  });
  res.json({ success: true, address });
});
exports.makeDefault = asyncHandler(async (req, res) => {
  const address = await serialTransaction(async (tx) => {
    const existing = await ownedAddress(tx, req.user.id, idOf(req.params.id));
    await tx.address.updateMany({
      where: { userId: req.user.id, isDefault: true },
      data: { isDefault: false },
    });
    return tx.address.update({
      where: { id: existing.id },
      data: { isDefault: true },
    });
  });
  res.json({ success: true, address });
});
exports.deleteAddress = asyncHandler(async (req, res) => {
  await serialTransaction(async (tx) => {
    const address = await ownedAddress(tx, req.user.id, idOf(req.params.id));
    await tx.address.delete({ where: { id: address.id } });
    if (address.isDefault) {
      const next = await tx.address.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: "asc" },
      });
      if (next)
        await tx.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
    }
  });
  res.json({ success: true });
});
