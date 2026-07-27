const express = require("express");
const dotenv = require("dotenv");

dotenv.config(); 

const prisma = require("./config/prisma");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());


app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully!",
  });
});
async function start() {
  try {
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