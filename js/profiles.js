import { supabase } from "./supabaseClient.js";

/**
 * Case-insensitive availability check.
 * Prefers `username_lower` if present; falls back to ilike on `username`.
 */
export async function isUsernameAvailable(username) {
  const u = (username || "").trim();
  if (!u) return false;

  const lower = u.toLowerCase();

  // Try username_lower first (best if you have a UNIQUE index on it)
  {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("username_lower", lower)
      .maybeSingle();

    if (!error) return data === null;

    // If the column doesn't exist, fall through to ilike
    const msg = String(error.message || "");
    if (!msg.toLowerCase().includes("username_lower")) throw error;
  }

  // Fallback: case-insensitive match using ilike (exact match if no wildcards)
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .ilike("username", u)
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

/**
 * Create the currently logged-in user's profile row.
 * Attempts to write username_lower if the column exists.
 */
export async function createMyProfile(username) {
  const u = (username || "").trim();
  if (!u) throw new Error("Username is required");

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not logged in");

  const lower = u.toLowerCase();

  // Try inserting with username_lower first
  {
    const { error } = await supabase
      .from("profiles")
      .insert({ user_id: user.id, username: u, username_lower: lower });

    if (!error) return;

    // Unique violation => username taken
    if (error.code === "23505") throw new Error("Username already taken");

    // If username_lower column doesn't exist, try without it
    const msg = String(error.message || "");
    if (!msg.toLowerCase().includes("username_lower")) throw error;
  }

  // Fallback insert without username_lower
  const { error } = await supabase
    .from("profiles")
    .insert({ user_id: user.id, username: u });

  if (error) {
    if (error.code === "23505") throw new Error("Username already taken");
    throw error;
  }
}
