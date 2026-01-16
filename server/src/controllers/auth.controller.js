import { supabaseAnon, supabaseAdmin } from "../config/supabase.js";

/**
 * Login user using Supabase Auth
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
      user: data.user,
      session: data.session,
      role: data.user.user_metadata?.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
}

/**
 * Logout user
 */
export async function logout(req, res) {
  try {
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
}

/**
 * Get current logged-in user info
 */
export async function me(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let profile = {
      id: userId,
      email: req.user.email,
      role: userRole,
    };

    // Fetch additional details based on role
    if (userRole === "student") {
      const { data } = await supabaseAdmin
        .from("students")
        .select("*, sections(*, departments(*))")
        .eq("user_id", userId)
        .single();
      
      if (data) {
        profile = { ...profile, ...data };
      }
    } else if (userRole === "faculty") {
      const { data } = await supabaseAdmin
        .from("faculty")
        .select("*, departments(*)")
        .eq("user_id", userId)
        .single();
      
      if (data) {
        profile = { ...profile, ...data };
      }
    }

    res.json({ profile });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}
