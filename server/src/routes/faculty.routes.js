import express from "express";
import {
  getAssignedClasses,
  markAttendance,
  getAttendance,
  enterMarks,
  getMarks,
  getStudentsBySection
} from "../controllers/faculty.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("faculty"));

router.get("/classes", getAssignedClasses);
router.post("/attendance", markAttendance);
router.get("/attendance/:subjectId", getAttendance);
router.post("/marks", enterMarks);
router.get("/marks/:subjectId", getMarks);
router.get("/students/:sectionId", getStudentsBySection);

export default router;
