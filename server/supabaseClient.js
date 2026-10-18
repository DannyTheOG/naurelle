import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
    return Boolean(
        supabaseUrl &&
        supabaseServiceKey &&
        supabaseUrl !== "https://your-project.supabase.co" &&
        supabaseServiceKey !== "your-supabase-service-role-key"
    );
}

let supabaseAdmin = null;

if (isSupabaseConfigured()) {
    try {
        supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        console.log("✅ Supabase Admin Client initialized successfully.");
    } catch (err) {
        console.error("❌ Failed to initialize Supabase Admin Client:", err);
    }
} else {
    console.warn("⚠️  Supabase Admin credentials not configured in environment; running with mock/fallback capabilities.");
}

export { supabaseAdmin };
