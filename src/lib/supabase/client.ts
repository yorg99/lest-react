import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://cpbydyuhyjfjoizzdgyt.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwYnlkeXVoeWpmam9penpkZ3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Nzc5MTAsImV4cCI6MjA5MDM1MzkxMH0.E2IJv6mtnxsOi2AtN7igG3zGvzQ1ZbJ5_J03Bng-GKs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
