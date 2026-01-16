import express from "express";
import {
  getAdminStats,
  getDepartmentStats,
} from "../controllers/stats.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Apply auth and role middleware to all stats routes
router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/admin", getAdminStats);
router.get("/departments", getDepartmentStats);

export default router;
