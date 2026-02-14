import { supabase } from "./supabaseClient.js";
import { consumePendingDisplayName, setMyDisplayName } from "./auth.js";

/**
 * Run this on the callback page.
 * Exchanges the code for a session, then writes display_name into user metadata.
export async function handleAuthCallback({ successRedirect = "/#/" } = {}) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (!code) {
    return { ok: false, message: "Missing auth code in URL." };
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error(error);
    return { ok: false, message: error.message || "Verification failed." };
  }

  const pending = consumePendingDisplayName();
  if (pending) {
    try {
      await setMyDisplayName(pending);
    } catch (e) {
      console.error(e);
      // Not fatal — user is verified/logged in; display name can be set later.
    }
  }

  // Optional: clean up the URL
  window.history.replaceState({}, document.title, "/auth/callback");

  window.location.href = successRedirect;
  return { ok: true };
}
*/
export async function handleAuthCallback({ successRedirect = "/#/" } = {}) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return { ok: false, message: "Missing auth code in URL." };

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return { ok: false, message: error.message || "Verification failed." };

  window.location.href = successRedirect;
  return { ok: true };
}

