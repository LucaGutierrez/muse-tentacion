/* ===========================
   CONEXIÓN CON SUPABASE
=========================== */

const SUPABASE_URL =
    "https://sawsneidzpovlqnnirti.supabase.co";

const SUPABASE_PUBLIC_KEY =
    "sb_publishable_kLWVNRFOTKld9A51sAWG-g_FVFScEia";

const clienteSupabase = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLIC_KEY
);