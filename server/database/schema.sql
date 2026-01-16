-- ============================================
-- College ERP System - Database Schema
-- PostgreSQL with Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEPARTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department_id, year, name)
);

-- ============================================
-- SUBJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department_id, code)
);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  roll_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  admission_year INTEGER NOT NULL CHECK (admission_year >= 2000 AND admission_year <= 2100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FACULTY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TIMETABLE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  period INTEGER NOT NULL CHECK (period >= 1 AND period <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section_id, day, period)
);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  present BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, date)
);

-- ============================================
-- MARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  internal1 NUMERIC(5,2) CHECK (internal1 >= 0 AND internal1 <= 100),
  internal2 NUMERIC(5,2) CHECK (internal2 >= 0 AND internal2 <= 100),
  external NUMERIC(5,2) CHECK (external >= 0 AND external <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Departments
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);

-- Sections
CREATE INDEX IF NOT EXISTS idx_sections_department ON sections(department_id);
CREATE INDEX IF NOT EXISTS idx_sections_year ON sections(year);

-- Subjects
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);

-- Students
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);

-- Faculty
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON faculty(department_id);
CREATE INDEX IF NOT EXISTS idx_faculty_employee_id ON faculty(employee_id);

-- Timetable
CREATE INDEX IF NOT EXISTS idx_timetable_section ON timetable(section_id);
CREATE INDEX IF NOT EXISTS idx_timetable_faculty ON timetable(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetable_subject ON timetable(subject_id);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject ON attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Marks
CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_subject ON marks(subject_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (for backend operations)
-- This is automatically handled by Supabase when using service role key

-- Allow authenticated users to read based on their role
-- Note: These policies can be customized based on specific requirements

-- Students can read their own data
CREATE POLICY students_read_own ON students
  FOR SELECT
  USING (auth.uid() = user_id);

-- Faculty can read their own data
CREATE POLICY faculty_read_own ON faculty
  FOR SELECT
  USING (auth.uid() = user_id);

-- Students can read their own attendance
CREATE POLICY attendance_read_own ON attendance
  FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- Students can read their own marks
CREATE POLICY marks_read_own ON marks
  FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

-- ============================================
-- INITIAL SETUP NOTES
-- ============================================

-- To create the first admin user, run the following after setting up Supabase Auth:
-- 1. Create user in Supabase Auth dashboard or via API
-- 2. Set user_metadata: { "role": "admin" }
-- 3. The admin will have full access to all tables via service role

-- Example admin user creation (via Supabase dashboard):
-- Email: admin@college.edu
-- Password: [secure password]
-- user_metadata: { "role": "admin" }

COMMENT ON TABLE departments IS 'Academic departments in the college';
COMMENT ON TABLE sections IS 'Sections within departments organized by year';
COMMENT ON TABLE subjects IS 'Courses/subjects taught in the college';
COMMENT ON TABLE students IS 'Student records linked to auth users';
COMMENT ON TABLE faculty IS 'Faculty records linked to auth users';
COMMENT ON TABLE timetable IS 'Class schedule mapping sections, subjects, and faculty';
COMMENT ON TABLE attendance IS 'Student attendance records';
COMMENT ON TABLE marks IS 'Student marks/grades';
