const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const userResponse = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const createToken = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await prisma.user.findUnique({ where: { email } })) throw new AppError("User already exists.", 409);
  const user = await prisma.user.create({ data: { name, email, password: await bcrypt.hash(password, 10) } });
  res.status(201).json({ success: true, message: "User registered successfully.", token: createToken(user), user: userResponse(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) throw new AppError("Invalid email or password.", 401);
  res.json({ success: true, message: "Login successful.", token: createToken(user), user: userResponse(user) });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
  if (!user) throw new AppError("User not found.", 404);
  res.json({ success: true, user });
});
module.exports = { register, login, getMe };
