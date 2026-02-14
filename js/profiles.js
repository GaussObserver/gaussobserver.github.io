import { supabase } from "./supabaseClient.js";

/**
 * Returns true if the username is not taken.
 */
export async function isUsernameAvailable(username) {
    const u = (username || "").trim();
    if (!u) return false;

    const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", u)
        .maybeSingle();

    if (error) throw error;
    return data === null;
}

/**
 * Returns the logged-in user's profile row { user_id, username, created_at }
 * or null if not logged in.
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
 * (Call this after email confirmation / after login.)
 */
export async function createMyProfile(username) {
    const u = (username || "").trim();
    if (!u) throw new Error("Username is required");

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("Not logged in");

    const { error } = await supabase
        .from("profiles")
        .insert({ user_id: user.id, username: u });

    if (error) throw error;
}
