const { Prisma } = require("@prisma/client");

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const globalErrorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      statusCode = 409;
      message = "A record with this value already exists";
    }
    if (error.code === "P2003") {
      statusCode = 409;
      message = "This record is referenced by other data";
    }
  }

  if (statusCode >= 500) console.error(error);

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal Server Error" : message,
    ...(error.details && { details: error.details }),
  });
};

module.exports = { notFound, globalErrorHandler };
