import { supabaseAdmin } from "../config/supabase.js";

// Get student profile
export async function getProfile(req, res) {
  try {
    console.log(`[Student] Fetching profile for user_id: ${req.user.id}`);
    
    const { data, error } = await supabaseAdmin
      .from("students")
      .select(`
        *,
        sections(
          id,
          name,
          year,
          departments(id, name, code)
        )
      `)
      .eq("user_id", req.user.id)
      .single();

    if (error) {
      console.error('[Student] Profile fetch error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    if (!data) {
      console.warn(`[Student] No profile found for user_id: ${req.user.id}`);
      return res.status(404).json({ error: "Student profile not found" });
    }
    
    console.log(`[Student] Profile loaded successfully for ${data.name}`);
    res.json(data);
  } catch (err) {
    console.error('[Student] Unexpected error:', err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

// Get student's attendance
export async function getAttendance(req, res) {
  try {
    // Get student ID from auth user
    const { data: student } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const { data, error } = await supabaseAdmin
      .from("attendance")
      .select(`
        id,
        date,
        present,
        subjects(id, name, code)
      `)
      .eq("student_id", student.id)
      .order("date", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
}

// Get student's marks
export async function getMarks(req, res) {
  try {
    // Get student ID from auth user
    const { data: student } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const { data, error } = await supabaseAdmin
      .from("marks")
      .select(`
        id,
        internal1,
        internal2,
        external,
        subjects(id, name, code)
      `)
      .eq("student_id", student.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch marks" });
  }
}

// Get student's timetable
export async function getTimetable(req, res) {
  try {
    // Get student's section
    const { data: student } = await supabaseAdmin
      .from("students")
      .select("section_id")
      .eq("user_id", req.user.id)
      .single();

    if (!student || !student.section_id) {
      return res.status(404).json({ error: "Student section not found" });
    }

    const { data, error } = await supabaseAdmin
      .from("timetable")
      .select(`
        id,
        day,
        period,
        subjects(id, name, code),
        faculty(id, name)
      `)
      .eq("section_id", student.section_id)
      .order("day")
      .order("period");

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch timetable" });
  }
}
