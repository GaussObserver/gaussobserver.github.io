import { supabase } from "./supabaseClient.js";
import { isUsernameAvailable } from "./profiles.js";

/**
 * Starts sign-up with email+password.
 *
 * We store the requested username in auth metadata as `pending_username`
 * so the callback page can create the row in `profiles` after email verification.
 */
export async function startSignUp(username, email, password) {
  const u = (username || "").trim();
  if (!u) throw new Error("Username required");

  // UX check only (DB unique constraint is the real enforcement)
  const available = await isUsernameAvailable(u);
  if (!available) throw new Error("Username already taken");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Store requested username so it persists through email verification
      data: { pending_username: u },
      emailRedirectTo: "https://gaussobserver.github.io/auth/callback",
    },
  });

  if (error) throw error;

  return {
    user: data.user ?? null,
    session: data.session ?? null,
    needsEmailConfirmation: data.session === null,
  };
}

export async function logIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Returns the current auth user or null.
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  // Treat missing session as "logged out", not fatal
  if (error && (error.message || "").includes("Auth session missing")) return null;
  if (error) throw error;

  return data.user ?? null;
}

/**
 * Optionally set/clear metadata after verification.
 * (We use this in callback.js to remove pending_username and set display_name.)
 */
export async function updateMyMetadata(data) {
  const { error } = await supabase.auth.updateUser({ data });
  if (error) throw error;
}
