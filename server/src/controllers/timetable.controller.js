import { supabaseAdmin } from "../config/supabase.js";

// Get all timetable entries
export async function getAllTimetable(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from("timetable")
      .select("*, sections(*, departments(*)), subjects(*), faculty(*)")
      .order("day")
      .order("period");

    if (error) {
      console.error("[Timetable] Error fetching all timetable:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error("[Timetable] Unexpected error in getAllTimetable:", err);
    res.status(500).json({ error: "Failed to fetch timetable" });
  }
}

// Get timetable by section
export async function getTimetableBySection(req, res) {
  try {
    const { sectionId } = req.params;

    const { data, error } = await supabaseAdmin
      .from("timetable")
      .select("*, subjects(*), faculty(*)")
      .eq("section_id", sectionId)
      .order("day")
      .order("period");

    if (error) {
      console.error(`[Timetable] Error fetching timetable for section ${sectionId}:`, error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error("[Timetable] Unexpected error in getTimetableBySection:", err);
    res.status(500).json({ error: "Failed to fetch timetable" });
  }
}

// Check for timetable conflicts
async function checkTimetableConflict(section_id, day, period, excludeId = null) {
  const query = supabaseAdmin
    .from("timetable")
    .select("id")
    .eq("section_id", section_id)
    .eq("day", day)
    .eq("period", period);

  if (excludeId) {
    query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Timetable] Error checking conflict:", error);
    throw new Error("Failed to check timetable conflict");
  }

  return data && data.length > 0;
}

// Create timetable entry
export async function createTimetable(req, res) {
  try {
    const { section_id, subject_id, faculty_id, day, period } = req.body;

    // Validation
    if (!section_id || !subject_id || !faculty_id || !day || !period) {
      return res.status(400).json({ 
        error: "All fields are required: section_id, subject_id, faculty_id, day, period" 
      });
    }

    // Check for conflicts (same section, day, and period)
    const hasConflict = await checkTimetableConflict(section_id, day, period);
    if (hasConflict) {
      return res.status(400).json({ 
        error: "Timetable conflict: This section already has a class scheduled for this day and period" 
      });
    }

    console.log(`[Timetable] Creating entry: section=${section_id}, subject=${subject_id}, faculty=${faculty_id}, day=${day}, period=${period}`);

    const { data, error } = await supabaseAdmin
      .from("timetable")
      .insert([{ section_id, subject_id, faculty_id, day, period }])
      .select("*, sections(*), subjects(*), faculty(*)")
      .single();

    if (error) {
      console.error("[Timetable] Error creating timetable:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[Timetable] Successfully created entry with id: ${data.id}`);
    res.json(data);
  } catch (err) {
    console.error("[Timetable] Unexpected error in createTimetable:", err);
    res.status(500).json({ error: "Failed to create timetable entry" });
  }
}

// Update timetable entry
export async function updateTimetable(req, res) {
  try {
    const { id } = req.params;
    const { section_id, subject_id, faculty_id, day, period } = req.body;

    // If updating schedule details, check for conflicts
    if (section_id && day && period) {
      const hasConflict = await checkTimetableConflict(section_id, day, period, id);
      if (hasConflict) {
        return res.status(400).json({ 
          error: "Timetable conflict: This section already has a class scheduled for this day and period" 
        });
      }
    }

    console.log(`[Timetable] Updating entry ${id}`);

    const updateData = {};
    if (section_id) updateData.section_id = section_id;
    if (subject_id) updateData.subject_id = subject_id;
    if (faculty_id) updateData.faculty_id = faculty_id;
    if (day) updateData.day = day;
    if (typeof period === 'number') updateData.period = period;

    const { data, error } = await supabaseAdmin
      .from("timetable")
      .update(updateData)
      .eq("id", id)
      .select("*, sections(*), subjects(*), faculty(*)")
      .single();

    if (error) {
      console.error(`[Timetable] Error updating timetable ${id}:`, error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[Timetable] Successfully updated entry ${id}`);
    res.json(data);
  } catch (err) {
    console.error("[Timetable] Unexpected error in updateTimetable:", err);
    res.status(500).json({ error: "Failed to update timetable entry" });
  }
}

// Delete timetable entry
export async function deleteTimetable(req, res) {
  try {
    const { id } = req.params;

    console.log(`[Timetable] Deleting entry ${id}`);

    const { error } = await supabaseAdmin
      .from("timetable")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`[Timetable] Error deleting timetable ${id}:`, error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[Timetable] Successfully deleted entry ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[Timetable] Unexpected error in deleteTimetable:", err);
    res.status(500).json({ error: "Failed to delete timetable entry" });
  }
}
