const express = require("express");
const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const {
  notFound,
  globalErrorHandler,
} = require("./middleware/errorMiddleware");
const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/addresses", require("./routes/addressRoutes"));
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/media", require("./routes/mediaRoutes"));
app.use("/api/vendor", vendorRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/saved", require("./routes/savedRoutes"));
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

module.exports = app;
