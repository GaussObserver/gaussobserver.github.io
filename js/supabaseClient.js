import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://ozamqhammgvsfklkzwpi.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_7ZuZncG0aI6crq9cXkXQtw_QSZzgiz9";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
