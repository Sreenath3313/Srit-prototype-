import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Debug (you can remove later)
console.log("SUPABASE_URL FROM ENV =", process.env.SUPABASE_URL);

// Safety checks
if (!process.env.SUPABASE_URL) {
  throw new Error("❌ SUPABASE_URL is missing in .env file");
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("❌ SUPABASE_ANON_KEY is missing in .env file");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("❌ SUPABASE_SERVICE_ROLE_KEY is missing in .env file");
}

// Admin client (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Public client
export const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
