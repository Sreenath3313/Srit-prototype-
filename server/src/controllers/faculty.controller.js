import { supabaseAdmin } from "../config/supabase.js";
import { isValidUUID } from "../utils/validation.js";

// Constants
const MAX_ASSIGNMENTS_TO_CHECK = 10;

// Get classes assigned to faculty
export async function getAssignedClasses(req, res) {
  try {
    // Get faculty ID from auth user
    console.log(`[Faculty] Fetching assigned classes for user_id: ${req.user.id}`);
    
    const { data: faculty, error: facultyError } = await supabaseAdmin
      .from("faculty")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (facultyError) {
      console.error(`[Faculty] Error fetching faculty profile:`, facultyError);
      return res.status(404).json({ error: "Faculty profile not found" });
    }

    if (!faculty) {
      console.warn(`[Faculty] No faculty profile found for user_id: ${req.user.id}`);
      return res.status(404).json({ error: "Faculty profile not found" });
    }

    console.log(`[Faculty] Found faculty_id: ${faculty.id}, fetching assigned classes...`);

    const { data, error } = await supabaseAdmin
      .from("timetable")
      .select(`
        id,
        day,
        period,
        sections(id, name, year, departments(name)),
        subjects(id, name, code)
      `)
      .eq("faculty_id", faculty.id);

    if (error) {
      console.error(`[Faculty] Error fetching timetable for faculty_id ${faculty.id}:`, error);
      return res.status(500).json({ error: error.message });
    }

    // Return empty array instead of error when no classes assigned
    console.log(`[Faculty] Found ${data?.length || 0} assigned classes for faculty_id: ${faculty.id}`);
    res.json(data || []);
  } catch (err) {
    console.error(`[Faculty] Unexpected error in getAssignedClasses:`, err);
    res.status(500).json({ error: "Failed to fetch assigned classes" });
  }
}

// Mark attendance for a class
export async function markAttendance(req, res) {
  try {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "Attendance records required" });
    }

    const { error } = await supabaseAdmin
      .from("attendance")
      .insert(records);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, message: "Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
}

// Get attendance records for a subject
export async function getAttendance(req, res) {
  try {
    const { subjectId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("attendance")
      .select(`
        id,
        date,
        present,
        students(id, roll_no, name)
      `)
      .eq("subject_id", subjectId)
      .order("date", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
}

// Enter or update marks for students
export async function enterMarks(req, res) {
  try {
    const { records } = req.body;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "Mark records required" });
    }

    const { error } = await supabaseAdmin
      .from("marks")
      .upsert(records, { onConflict: "student_id,subject_id" });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, message: "Marks entered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to enter marks" });
  }
}

// Get marks for a subject
export async function getMarks(req, res) {
  try {
    const { subjectId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("marks")
      .select(`
        id,
        internal1,
        internal2,
        external,
        students(id, roll_no, name)
      `)
      .eq("subject_id", subjectId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch marks" });
  }
}

// Get students in a section (for faculty's assigned classes only)
export async function getStudentsBySection(req, res) {
  try {
    const { sectionId } = req.params;
    
    // Validate sectionId is a valid UUID format
    if (!isValidUUID(sectionId)) {
      console.warn(`[Faculty] Invalid sectionId received: ${sectionId}`);
      return res.status(400).json({ 
        error: "Invalid section ID. Please select a valid class from the dropdown." 
      });
    }
    
    console.log(`[Faculty] Fetching students for section ${sectionId} by user ${req.user.id}`);
    
    // Get faculty ID from auth user
    const { data: faculty } = await supabaseAdmin
      .from("faculty")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (!faculty) {
      console.warn(`[Faculty] No faculty profile found for user ${req.user.id}`);
      return res.status(404).json({ error: "Faculty profile not found" });
    }

    console.log(`[Faculty] Faculty ID: ${faculty.id}, checking assignment for section: ${sectionId}`);

    // Verify faculty is assigned to teach this section
    // Check if faculty has ANY timetable entry for this section
    const { data: assignments, error: assignmentError } = await supabaseAdmin
      .from("timetable")
      .select("id, subject_id, section_id")
      .eq("faculty_id", faculty.id)
      .eq("section_id", sectionId)
      .limit(MAX_ASSIGNMENTS_TO_CHECK);

    if (assignmentError) {
      console.error(`[Faculty] Error checking assignment:`, assignmentError);
      return res.status(500).json({ error: assignmentError.message });
    }

    console.log(`[Faculty] Found ${assignments?.length || 0} assignments for section ${sectionId}`);

    if (!assignments || assignments.length === 0) {
      console.warn(`[Faculty] Faculty ${faculty.id} not assigned to section ${sectionId}`);
      console.warn(`[Faculty] This usually means the timetable hasn't been set up correctly`);
      return res.status(403).json({ 
        error: "You are not assigned to teach this section. Please contact your administrator to assign you to this class." 
      });
    }

    console.log(`[Faculty] Verified assignment, fetching students for section ${sectionId}...`);

    // Fetch students in this section
    const { data, error } = await supabaseAdmin
      .from("students")
      .select("id, roll_no, name, section_id, admission_year")
      .eq("section_id", sectionId)
      .order("roll_no");

    if (error) {
      console.error(`[Faculty] Error fetching students:`, error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[Faculty] Loaded ${data?.length || 0} students for section ${sectionId}`);
    res.json(data || []);
  } catch (err) {
    console.error(`[Faculty] Unexpected error in getStudentsBySection:`, err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
}
