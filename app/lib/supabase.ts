import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vvcvcorhxyvytpggrpic.supabase.co";

const supabaseAnonKey = "sb_publishable_hYxJh5K04tEeLwB0l1M7Jw_7NSHtnSf";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);