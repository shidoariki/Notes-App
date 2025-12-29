const express = require("express");
const cors = require("cors");
const path = require("path");

// Route imports
const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const categoriesRoutes = require("./routes/categories");

// Middleware imports
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// ========================
// Middleware Setup
// ========================
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ========================
// Routes
// ========================
const uploadRoutes = require("./routes/upload");
app.use("/api", uploadRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Notes API with Auth (Prisma + SQLite)");
});

// Auth routes (public)
app.use("/auth", authRoutes);

// Protected API routes
app.use("/api/notes", notesRoutes);
app.use("/api/categories", categoriesRoutes);
const uploadRoutes = require("./routes/upload");
app.use("/api", uploadRoutes);

// ========================
// Error Handling
// ========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized error handler (must be last)
app.use(errorHandler);

// ========================
// Start Server
// ========================
app.listen(PORT, () => {
  console.log(`🚀 Notes app with Auth running at http://localhost:${PORT}`);
});
