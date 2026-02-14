import { supabase } from "./supabaseClient.js";

/**
 * Returns true if the username is not taken (case-insensitive).
 *
 * Requires profiles.username_lower to exist OR you can change this to use ilike on username.
 */
export async function isUsernameAvailable(username) {
  const u = (username || "").trim();
  if (!u) return false;

  const lower = u.toLowerCase();

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username_lower", lower)
    .maybeSingle();

  if (error) throw error;
  return data === null;
}

/**
 * Returns the logged-in user's profile row or null if not logged in.
 */
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
 * Creates the profile row for the currently logged-in user.
 * Case-insensitive uniqueness is enforced by a UNIQUE index on username_lower.
 */
export async function createMyProfile(username) {
  const u = (username || "").trim();
  if (!u) throw new Error("Username is required");

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Not logged in");

  const lower = u.toLowerCase();

  const { error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      username: u,
      username_lower: lower,
    });

  if (error) {
    // Postgres unique violation
    if (error.code === "23505") {
      throw new Error("Username already taken");
    }
    throw error;
  }
}
