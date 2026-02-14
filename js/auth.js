import { supabase } from "./supabaseClient.js";

const PENDING_DISPLAY_NAME_KEY = "pending_display_name";

/**
 * Starts sign-up with email+password.
 * Stores display name locally so we can write it after verification.
 */
export async function startSignUp(displayName, email, password) {
  const dn = (displayName || "").trim();
  if (!dn) throw new Error("Display name required");

  localStorage.setItem(PENDING_DISPLAY_NAME_KEY, dn);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // IMPORTANT: Prefer a real path callback (see below)
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

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  // Treat missing session as "logged out", not fatal
  if (error && (error.message || "").includes("Auth session missing")) return null;
  if (error) throw error;

  return data.user ?? null;
}

export function consumePendingDisplayName() {
  const dn = localStorage.getItem(PENDING_DISPLAY_NAME_KEY);
  if (dn) localStorage.removeItem(PENDING_DISPLAY_NAME_KEY);
  return dn;
}

export async function setMyDisplayName(displayName) {
  const dn = (displayName || "").trim();
  if (!dn) return;

  const { error } = await supabase.auth.updateUser({
    data: { display_name: dn },
  });
  if (error) throw error;
}
