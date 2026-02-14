import { supabase } from "./supabaseClient.js";

export async function isUsernameAvailable(username) {
  const u = (username || "").trim();
  if (!u) return false;

  // Best if you have username_lower with a UNIQUE index
  const lower = u.toLowerCase();

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username_lower", lower)
    .maybeSingle();

  if (error) throw error;
  return data === null;
}

export async function getMyProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username, created_at")
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}
