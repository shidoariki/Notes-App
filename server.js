const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken"); // ADD THIS

// Route imports
const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const categoriesRoutes = require("./routes/categories");

// Middleware imports
const errorHandler = require("./middleware/errorHandler");

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware Setup
app.use(cors({
  origin: "*",
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const uploadRoutes = require("./routes/upload");
app.use("/api", uploadRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Notes API with Auth (Prisma + PostgreSQL)");
});

// Auth routes (public)
app.use("/auth", authRoutes);

// PROTECTED API routes (MUST HAVE AUTH)
app.use("/api/notes", authMiddleware, notesRoutes);
app.use("/api/categories", authMiddleware, categoriesRoutes); // ← FIXED

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Notes app running at http://localhost:${PORT}`);
});
