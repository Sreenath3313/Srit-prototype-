import { supabaseAdmin } from "../config/supabase.js";

// Get admin statistics (total counts)
export async function getAdminStats(req, res) {
  try {
    console.log("[Stats] Fetching admin statistics...");

    // Get counts in parallel
    const [
      { count: studentsCount, error: studentsError },
      { count: facultyCount, error: facultyError },
      { count: departmentsCount, error: departmentsError },
      { count: subjectsCount, error: subjectsError },
    ] = await Promise.all([
      supabaseAdmin.from("students").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("faculty").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("departments").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("subjects").select("*", { count: "exact", head: true }),
    ]);

    if (studentsError || facultyError || departmentsError || subjectsError) {
      const error = studentsError || facultyError || departmentsError || subjectsError;
      console.error("[Stats] Error fetching counts:", error);
      return res.status(500).json({ error: error.message });
    }

    const stats = {
      totalStudents: studentsCount || 0,
      totalFaculty: facultyCount || 0,
      totalDepartments: departmentsCount || 0,
      totalSubjects: subjectsCount || 0,
    };

    console.log("[Stats] Admin statistics:", stats);
    res.json(stats);
  } catch (err) {
    console.error("[Stats] Unexpected error in getAdminStats:", err);
    res.status(500).json({ error: "Failed to fetch admin statistics" });
  }
}

// Get department-wise statistics
export async function getDepartmentStats(req, res) {
  try {
    console.log("[Stats] Fetching department-wise statistics...");

    // Get all departments with student and faculty counts
    const { data: departments, error: deptError } = await supabaseAdmin
      .from("departments")
      .select("id, name, code");

    if (deptError) {
      console.error("[Stats] Error fetching departments:", deptError);
      return res.status(500).json({ error: deptError.message });
    }

    // For each department, get counts
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        // Get sections for this department first
        const { data: sections } = await supabaseAdmin
          .from("sections")
          .select("id")
          .eq("department_id", dept.id);

        const sectionIds = sections?.map(s => s.id) || [];

        // Count students in these sections
        let studentsCount = 0;
        if (sectionIds.length > 0) {
          const { count } = await supabaseAdmin
            .from("students")
            .select("*", { count: "exact", head: true })
            .in("section_id", sectionIds);
          studentsCount = count || 0;
        }

        // Count faculty in this department
        const { count: facultyCount } = await supabaseAdmin
          .from("faculty")
          .select("*", { count: "exact", head: true })
          .eq("department_id", dept.id);

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          studentsCount: studentsCount,
          facultyCount: facultyCount || 0,
        };
      })
    );

    console.log(`[Stats] Found statistics for ${departmentStats.length} departments`);
    res.json(departmentStats);
  } catch (err) {
    console.error("[Stats] Unexpected error in getDepartmentStats:", err);
    res.status(500).json({ error: "Failed to fetch department statistics" });
  }
}
