import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import statsRoutes from "./routes/stats.routes.js";

const app = express();

// CORS configuration - CRITICAL FIX
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:8080",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "College ERP API running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/stats", statsRoutes);

// 404 handler - must come before error handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler - must be last
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Accepting requests from ${corsOptions.origin}`);
});
