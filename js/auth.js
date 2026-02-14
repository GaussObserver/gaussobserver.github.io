import { supabase } from "./supabaseClient.js";
import { isUsernameAvailable } from "./profiles.js";

/**
 * Start signup and store pending username in user_metadata.
 * This survives email verification even if the email link opens in a different browser/device.
 */
export async function startSignUp(username, email, password) {
  const u = (username || "").trim();
  if (!u) throw new Error("Username required");

  // UX-only check (DB constraint is the real enforcement)
  const available = await isUsernameAvailable(u);
  if (!available) throw new Error("Username already taken");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
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
 * Current auth user or null.
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  // Treat missing session as "logged out"
  if (error && (error.message || "").includes("Auth session missing")) return null;
  if (error) throw error;

  return data.user ?? null;
}

/**
 * Helper to update metadata (used in callback.js).
 */
export async function updateMyMetadata(data) {
  const { error } = await supabase.auth.updateUser({ data });
  if (error) throw error;
}
