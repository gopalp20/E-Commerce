const express = require("express");
const dotenv = require("dotenv");

dotenv.config(); 

const prisma = require("./config/prisma");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, globalErrorHandler } = require("./middleware/errorMiddleware");
const app = express();
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products",productRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully!",
  });
});

app.use(notFound);
app.use(globalErrorHandler);


async function start() {
  try {
    const missing = ["DATABASE_URL", "JWT_SECRET", "PORT"].filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
    }
    await prisma.$connect();
    console.log("Database Connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Database Connection Failed");
    console.error(err);
  }
}

start();
