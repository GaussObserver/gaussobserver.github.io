import { supabase } from "./supabaseClient.js";
import { isUsernameAvailable } from "./profiles.js";

const PENDING_USERNAME_KEY = "pending_username";

/**
 * Starts sign-up with email+password, and stores username locally
 * so it can be written after email confirmation.
 *
 * IMPORTANT:
 * With "Confirm email" enabled, data.session may be null.
 */
export async function startSignUp(username, email, password) {
    const u = (username || "").trim();
    if (!u) throw new Error("Username required");

    // UX check (not the real guardrail; DB unique constraint is)
    const available = await isUsernameAvailable(u);
    if (!available) throw new Error("Username already taken");

    // Store username temporarily until email verification completes
    localStorage.setItem(PENDING_USERNAME_KEY, u);

    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: "https://gaussobserver.github.io/#/auth/callback" }
    })

    if (error) throw error;

    // If confirm-email is enabled, session is often null here.
    return {
        user: data.user ?? null,
        session: data.session ?? null,
        needsEmailConfirmation: data.session === null,
    };
}

/**
 * Login with email + password.
 */
export async function logIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data.user;
}

/**
 * Logs out current user.
 */
export async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Returns the current auth user or null.
 */
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user ?? null;
}

/**
 * Subscribe to auth changes (SIGNED_IN / SIGNED_OUT etc.)
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

/**
 * Used by callback.js to retrieve and clear the username saved during signup.
 */
export function consumePendingUsername() {
    const u = localStorage.getItem(PENDING_USERNAME_KEY);
    if (u) localStorage.removeItem(PENDING_USERNAME_KEY);
    return u;
}
