const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return res.status(401).json({ success: false, message: 'Please sign in to continue.' });
  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
  catch { return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' }); }
  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, role: true } });
    if (!user) return res.status(401).json({ success: false, message: 'Account not found. Please sign in again.' });
    req.user = user;
    next();
  } catch (error) { next(error); }
};
