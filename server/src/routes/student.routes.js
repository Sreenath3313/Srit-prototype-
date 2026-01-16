import express from "express";
import {
  getProfile,
  getAttendance,
  getMarks,
  getTimetable
} from "../controllers/student.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("student"));

router.get("/profile", getProfile);
router.get("/attendance", getAttendance);
router.get("/marks", getMarks);
router.get("/timetable", getTimetable);

export default router;
