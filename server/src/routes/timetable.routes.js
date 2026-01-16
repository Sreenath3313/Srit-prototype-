import express from "express";
import {
  getAllTimetable,
  getTimetableBySection,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from "../controllers/timetable.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Apply auth middleware to all timetable routes
router.use(requireAuth);

// Admin-only routes for timetable management
router.post("/", requireRole("admin"), createTimetable);
router.put("/:id", requireRole("admin"), updateTimetable);
router.delete("/:id", requireRole("admin"), deleteTimetable);

// Read routes accessible to all authenticated users
router.get("/", getAllTimetable);
router.get("/section/:sectionId", getTimetableBySection);

export default router;
