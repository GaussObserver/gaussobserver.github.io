import { supabase } from "./supabaseClient.js";
import { consumePendingUsername } from "./auth.js";
import { createMyProfile } from "./profiles.js";

export async function handleAuthCallback({ successRedirect = "/#/" } = {}) {
  // Supabase puts the auth code in the query string (location.search),
  // even if you're using a hash route.
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  // If there's no code, we're not on a real callback hit.
  if (!code) return { ok: true, skipped: true };

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(error);
    return { ok: false, message: error.message || "Verification link invalid or expired." };
  }

  const pendingUsername = consumePendingUsername();
  if (pendingUsername) {
    try {
      await createMyProfile(pendingUsername);
    } catch (e) {
      console.error(e);
    }
  }

  // Clean URL: remove ?code=... from address bar (optional but nice)
  window.history.replaceState({}, document.title, "/#/");

  window.location.href = successRedirect;
  return { ok: true };
}
