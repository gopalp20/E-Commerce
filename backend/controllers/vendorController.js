const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const idOf = (value) => { const id = Number(value); if (!Number.isInteger(id)) throw new AppError("Invalid user ID", 400); return id; };

const applyVendor = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user || user.role !== "CUSTOMER") throw new AppError("Only customers can apply", 400);
  if (user.vendorRequest) throw new AppError("Vendor request already submitted", 400);
  await prisma.user.update({ where: { id: user.id }, data: { vendorRequest: true } });
  res.json({ success: true, message: "Vendor request submitted successfully" });
});
const getVendorRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.user.findMany({ where: { vendorRequest: true, role: "CUSTOMER" }, select: { id: true, name: true, email: true, role: true } });
  res.json({ success: true, requests });
});
const approveVendor = asyncHandler(async (req, res) => {
  const id = idOf(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  if (!user.vendorRequest) throw new AppError("No pending vendor request", 400);
  const updatedUser = await prisma.user.update({ where: { id }, data: { role: "VENDOR", vendorRequest: false } });
  res.json({ success: true, message: "Vendor approved successfully", user: updatedUser });
});
module.exports = { applyVendor, getVendorRequests, approveVendor };
