const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const categoriesRoutes = require("./routes/categories");
const uploadRoutes = require("./routes/upload");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("✅ Notes API with Auth (Prisma + PostgreSQL)");
});

app.use("/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/upload", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Notes app running on port ${PORT}`);
});

module.exports = app;
