module.exports = (err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.code === "P2002") {
    return res.status(400).json({
      error: "Unique constraint violation",
      field: err.meta?.target?. || "unknown",
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expired" });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
};
