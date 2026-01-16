import { supabaseAdmin } from "../config/supabase.js";

// =========================
// DEPARTMENTS
// =========================
export async function createDepartment(req, res) {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: "Name and code required" });
    }

    const { data, error } = await supabaseAdmin
      .from("departments")
      .insert([{ name, code }])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("Server crash:", err);
    res.status(500).json({ error: "Failed to create department" });
  }
}

export async function getDepartments(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from("departments")
      .select("*")
      .order("name");

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
}

export async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: "Name and code required" });
    }

    const { data, error } = await supabaseAdmin
      .from("departments")
      .update({ name, code })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Failed to update department" });
  }
}

export async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("departments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Failed to delete department" });
  }
}

// =========================
// SECTIONS
// =========================
export async function createSection(req, res) {
  try {
    const { department_id, year, name } = req.body;

    if (!department_id || !year || !name) {
      return res.status(400).json({ error: "Department, year and name required" });
    }

    const { data, error } = await supabaseAdmin
      .from("sections")
      .insert([{ 
        department_id, 
        year: parseInt(year), 
        name: String(name) 
      }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create section" });
  }
}

export async function getSections(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from("sections")
      .select("*, departments(id, name, code)")
      .order("year");

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
}

export async function updateSection(req, res) {
  try {
    const { id } = req.params;
    const { department_id, year, name } = req.body;

    if (!department_id || !year || !name) {
      return res.status(400).json({ error: "Department, year and name required" });
    }

    const { data, error } = await supabaseAdmin
      .from("sections")
      .update({ 
        department_id, 
        year: parseInt(year), 
        name: String(name) 
      })
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update section" });
  }
}

export async function deleteSection(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("sections")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete section" });
  }
}

// =========================
// SUBJECTS
// =========================
export async function createSubject(req, res) {
  try {
    const { department_id, semester, name, code } = req.body;

    if (!department_id || !semester || !name || !code) {
      return res.status(400).json({ error: "Department, semester, name and code required" });
    }

    const { data, error } = await supabaseAdmin
      .from("subjects")
      .insert([{ 
        department_id, 
        semester: parseInt(semester), 
        name: String(name), 
        code: String(code) 
      }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create subject" });
  }
}

export async function getSubjects(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from("subjects")
      .select("*, departments(id, name, code)")
      .order("semester");

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
}

export async function updateSubject(req, res) {
  try {
    const { id } = req.params;
    const { department_id, semester, name, code } = req.body;

    if (!department_id || !semester || !name || !code) {
      return res.status(400).json({ error: "Department, semester, name and code required" });
    }

    const { data, error } = await supabaseAdmin
      .from("subjects")
      .update({ 
        department_id, 
        semester: parseInt(semester), 
        name: String(name), 
        code: String(code) 
      })
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update subject" });
  }
}

export async function deleteSubject(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("subjects")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete subject" });
  }
}

// =========================
// STUDENTS
// =========================
export async function createStudent(req, res) {
  try {
    const { roll_no, name, email, password, section_id, admission_year } = req.body;

    if (!roll_no || !name || !email || !password || !admission_year) {
      return res.status(400).json({ error: "Roll no, name, email, password and admission year required" });
    }

    // Create auth user with student role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "student" }
    });

    if (authError) {
      console.error("Auth error:", authError);
      return res.status(500).json({ error: authError.message });
    }

    // Create student record
    const { data, error } = await supabaseAdmin
      .from("students")
      .insert([{ 
        user_id: authData.user.id,
        roll_no: String(roll_no), 
        name: String(name), 
        section_id: section_id || null,
        admission_year: parseInt(admission_year)
      }])
      .select();

    if (error) {
      // Rollback: delete auth user if student creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error("Student creation error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create student" });
  }
}

export async function getStudents(req, res) {
  try {
    const { section_id } = req.query;
    
    let query = supabaseAdmin
      .from("students")
      .select("*, sections(id, name, year, departments(id, name, code))")
      .order("roll_no");
    
    // Filter by section if section_id is provided
    if (section_id) {
      query = query.eq("section_id", section_id);
    }
    
    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
}

export async function updateStudent(req, res) {
  try {
    const { id } = req.params;
    const { roll_no, name, section_id, admission_year } = req.body;

    if (!roll_no || !name || !admission_year) {
      return res.status(400).json({ error: "Roll no, name and admission year required" });
    }

    const { data, error } = await supabaseAdmin
      .from("students")
      .update({ 
        roll_no: String(roll_no), 
        name: String(name), 
        section_id: section_id || null,
        admission_year: parseInt(admission_year)
      })
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update student" });
  }
}

export async function deleteStudent(req, res) {
  try {
    const { id } = req.params;

    // Get student's user_id before deletion
    const { data: student } = await supabaseAdmin
      .from("students")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Delete student record (cascades to related records)
    const { error } = await supabaseAdmin
      .from("students")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    // Delete auth user
    if (student.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(student.user_id);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete student" });
  }
}

// =========================
// FACULTY
// =========================
export async function createFaculty(req, res) {
  try {
    const { employee_id, name, email, password, department_id } = req.body;

    if (!employee_id || !name || !email || !password) {
      return res.status(400).json({ error: "Employee ID, name, email and password required" });
    }

    // Create auth user with faculty role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "faculty" }
    });

    if (authError) {
      console.error("Auth error:", authError);
      return res.status(500).json({ error: authError.message });
    }

    // Create faculty record
    const { data, error } = await supabaseAdmin
      .from("faculty")
      .insert([{ 
        user_id: authData.user.id,
        employee_id: String(employee_id), 
        name: String(name), 
        department_id: department_id || null
      }])
      .select();

    if (error) {
      // Rollback: delete auth user if faculty creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error("Faculty creation error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create faculty" });
  }
}

export async function getFaculty(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from("faculty")
      .select("*, departments(id, name, code)")
      .order("employee_id");

    if (error) return res.status(500).json({ error: error.message });

    // Fetch all timetable entries in a single query
    const { data: timetableData, error: timetableError } = await supabaseAdmin
      .from("timetable")
      .select("faculty_id");

    if (timetableError) {
      console.error("Error fetching timetable data:", timetableError);
      // Continue without timetable counts rather than failing
    }

    // Count timetable entries per faculty
    const timetableCounts = new Map();
    if (timetableData) {
      timetableData.forEach(entry => {
        const count = timetableCounts.get(entry.faculty_id) || 0;
        timetableCounts.set(entry.faculty_id, count + 1);
      });
    }

    // Add timetable counts to faculty data
    const facultyWithAssignments = data.map(fac => {
      const count = timetableCounts.get(fac.id) || 0;
      return {
        ...fac,
        timetable_count: count,
        hasAssignments: count > 0
      };
    });

    res.json(facultyWithAssignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
}

export async function updateFaculty(req, res) {
  try {
    const { id } = req.params;
    const { employee_id, name, department_id } = req.body;

    if (!employee_id || !name) {
      return res.status(400).json({ error: "Employee ID and name required" });
    }

    const { data, error } = await supabaseAdmin
      .from("faculty")
      .update({ 
        employee_id: String(employee_id), 
        name: String(name), 
        department_id: department_id || null
      })
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update faculty" });
  }
}

export async function deleteFaculty(req, res) {
  try {
    const { id } = req.params;

    // Get faculty's user_id before deletion
    const { data: faculty } = await supabaseAdmin
      .from("faculty")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Delete faculty record
    const { error } = await supabaseAdmin
      .from("faculty")
      .delete()
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });

    // Delete auth user
    if (faculty.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(faculty.user_id);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete faculty" });
  }
}
