# Database Schema Documentation

This document describes the database schema for the College Management System.

## Overview

The system uses **PostgreSQL** via **Supabase** as the database backend. The schema is designed to support:
- Department and section management
- Student and faculty records
- Class scheduling (timetable)
- Attendance tracking
- Marks/grades management

## Tables

### 1. departments

Stores information about academic departments in the college.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique department identifier |
| name | TEXT | UNIQUE, NOT NULL | Department name (e.g., "Computer Science Engineering") |
| code | TEXT | UNIQUE, NOT NULL | Department code (e.g., "CSE") |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_departments_name` on `name`
- `idx_departments_code` on `code`

### 2. sections

Stores class sections within departments, organized by year.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique section identifier |
| department_id | UUID | FOREIGN KEY → departments(id) | Department this section belongs to |
| year | INTEGER | CHECK (year >= 1 AND year <= 4) | Academic year (1-4) |
| name | TEXT | NOT NULL | Section name (e.g., "A", "B") |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Constraints:**
- UNIQUE(department_id, year, name) - One section per department-year-name combination

**Indexes:**
- `idx_sections_department` on `department_id`
- `idx_sections_year` on `year`

### 3. subjects

Stores course subjects taught in the college.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique subject identifier |
| department_id | UUID | FOREIGN KEY → departments(id) | Department offering this subject |
| semester | INTEGER | CHECK (semester >= 1 AND semester <= 8) | Semester number (1-8) |
| name | TEXT | NOT NULL | Subject name |
| code | TEXT | NOT NULL | Subject code |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Constraints:**
- UNIQUE(department_id, code) - Each subject code is unique per department

**Indexes:**
- `idx_subjects_department` on `department_id`
- `idx_subjects_semester` on `semester`
- `idx_subjects_code` on `code`

### 4. students

Stores student records linked to authentication users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique student identifier |
| user_id | UUID | FOREIGN KEY → auth.users(id) | Link to auth user |
| roll_no | TEXT | UNIQUE, NOT NULL | Student roll number |
| name | TEXT | NOT NULL | Student name |
| section_id | UUID | FOREIGN KEY → sections(id) | Section student belongs to |
| admission_year | INTEGER | CHECK (admission_year >= 2000 AND admission_year <= 2100) | Year of admission |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_students_user_id` on `user_id`
- `idx_students_section` on `section_id`
- `idx_students_roll_no` on `roll_no`

### 5. faculty

Stores faculty records linked to authentication users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique faculty identifier |
| user_id | UUID | FOREIGN KEY → auth.users(id) | Link to auth user |
| employee_id | TEXT | UNIQUE, NOT NULL | Employee ID |
| name | TEXT | NOT NULL | Faculty name |
| department_id | UUID | FOREIGN KEY → departments(id) | Department faculty belongs to |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Indexes:**
- `idx_faculty_user_id` on `user_id`
- `idx_faculty_department` on `department_id`
- `idx_faculty_employee_id` on `employee_id`

### 6. timetable

Stores class schedules mapping sections, subjects, and faculty to specific time slots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique timetable entry identifier |
| section_id | UUID | FOREIGN KEY → sections(id) | Section for this class |
| subject_id | UUID | FOREIGN KEY → subjects(id) | Subject being taught |
| faculty_id | UUID | FOREIGN KEY → faculty(id) | Faculty teaching the class |
| day | TEXT | CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')) | Day of the week |
| period | INTEGER | CHECK (period >= 1 AND period <= 8) | Period number (1-8) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Constraints:**
- UNIQUE(section_id, day, period) - One class per section per time slot

**Indexes:**
- `idx_timetable_section` on `section_id`
- `idx_timetable_faculty` on `faculty_id`
- `idx_timetable_subject` on `subject_id`

### 7. attendance

Stores student attendance records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique attendance record identifier |
| student_id | UUID | FOREIGN KEY → students(id) | Student this record is for |
| subject_id | UUID | FOREIGN KEY → subjects(id) | Subject for which attendance is marked |
| date | DATE | NOT NULL | Date of attendance |
| present | BOOLEAN | NOT NULL | Whether student was present |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Constraints:**
- UNIQUE(student_id, subject_id, date) - One attendance record per student per subject per day

**Indexes:**
- `idx_attendance_student` on `student_id`
- `idx_attendance_subject` on `subject_id`
- `idx_attendance_date` on `date`

### 8. marks

Stores student marks/grades.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique marks record identifier |
| student_id | UUID | FOREIGN KEY → students(id) | Student this record is for |
| subject_id | UUID | FOREIGN KEY → subjects(id) | Subject for which marks are entered |
| internal1 | NUMERIC(5,2) | CHECK (internal1 >= 0 AND internal1 <= 100) | First internal exam marks |
| internal2 | NUMERIC(5,2) | CHECK (internal2 >= 0 AND internal2 <= 100) | Second internal exam marks |
| external | NUMERIC(5,2) | CHECK (external >= 0 AND external <= 100) | External/final exam marks |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |

**Constraints:**
- UNIQUE(student_id, subject_id) - One marks record per student per subject

**Indexes:**
- `idx_marks_student` on `student_id`
- `idx_marks_subject` on `subject_id`

## Row Level Security (RLS)

The database uses Row Level Security to ensure data access is properly controlled:

### Enabled on all tables
- All tables have RLS enabled
- Service role (backend) bypasses RLS automatically

### Student Policies
- Students can read their own student record
- Students can read their own attendance records
- Students can read their own marks

### Faculty Policies
- Faculty can read their own faculty record
- Faculty can read/write attendance for their assigned classes
- Faculty can read/write marks for their assigned subjects

### Admin Access
- Admins use the service role key which bypasses RLS
- Full access to all tables via backend API

## Entity Relationships

```
departments (1) ──< (many) sections
departments (1) ──< (many) subjects
departments (1) ──< (many) faculty

sections (1) ──< (many) students
sections (1) ──< (many) timetable

subjects (1) ──< (many) timetable
subjects (1) ──< (many) attendance
subjects (1) ──< (many) marks

faculty (1) ──< (many) timetable

students (1) ──< (many) attendance
students (1) ──< (many) marks

auth.users (1) ──< (1) students
auth.users (1) ──< (1) faculty
```

## Setup Instructions

1. Create a new Supabase project
2. Run the SQL script from `schema.sql` in the SQL Editor
3. Enable Email Authentication in Auth settings
4. Tables and indexes will be created automatically
5. RLS policies will be enabled

## Migrations

To modify the schema:
1. Create a new SQL migration file
2. Test it in a development environment
3. Apply it to production via Supabase SQL Editor
4. Document the changes here

## Best Practices

1. **Always use UUIDs** for primary keys
2. **Use foreign keys** to maintain referential integrity
3. **Add indexes** on frequently queried columns
4. **Use constraints** to ensure data validity
5. **Enable RLS** for security
6. **Document changes** when modifying schema

## Sample Queries

### Get all students in a section
```sql
SELECT s.*, sec.name as section_name, d.name as department_name
FROM students s
JOIN sections sec ON s.section_id = sec.id
JOIN departments d ON sec.department_id = d.id
WHERE sec.id = 'section-uuid-here';
```

### Get faculty timetable
```sql
SELECT t.day, t.period, sub.name as subject, sec.name as section, d.name as department
FROM timetable t
JOIN subjects sub ON t.subject_id = sub.id
JOIN sections sec ON t.section_id = sec.id
JOIN departments d ON sec.department_id = d.id
WHERE t.faculty_id = 'faculty-uuid-here'
ORDER BY t.day, t.period;
```

### Calculate student attendance percentage
```sql
SELECT 
  sub.name as subject,
  COUNT(*) as total_classes,
  SUM(CASE WHEN a.present THEN 1 ELSE 0 END) as attended,
  CASE 
    WHEN COUNT(*) > 0 THEN ROUND(SUM(CASE WHEN a.present THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2)
    ELSE 0 
  END as percentage
FROM attendance a
JOIN subjects sub ON a.subject_id = sub.id
WHERE a.student_id = 'student-uuid-here'
GROUP BY sub.name;
```

**Note**: The CASE statement prevents division by zero when no attendance records exist.
