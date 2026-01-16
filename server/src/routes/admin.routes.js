import express from "express";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  createSection,
  getSections,
  updateSection,
  deleteSection,
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  createFaculty,
  getFaculty,
  updateFaculty,
  deleteFaculty,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Apply auth and role middleware to all admin routes
router.use(requireAuth);
router.use(requireRole("admin"));

// =========================
// DEPARTMENTS
// =========================
router.post("/departments", createDepartment);
router.get("/departments", getDepartments);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// =========================
// SECTIONS
// =========================
router.post("/sections", createSection);
router.get("/sections", getSections);
router.put("/sections/:id", updateSection);
router.delete("/sections/:id", deleteSection);

// =========================
// SUBJECTS
// =========================
router.post("/subjects", createSubject);
router.get("/subjects", getSubjects);
router.put("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

// =========================
// STUDENTS
// =========================
router.post("/students", createStudent);
router.get("/students", getStudents);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

// =========================
// FACULTY
// =========================
router.post("/faculty", createFaculty);
router.get("/faculty", getFaculty);
router.put("/faculty/:id", updateFaculty);
router.delete("/faculty/:id", deleteFaculty);

export default router;
