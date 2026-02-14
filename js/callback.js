import { supabase } from "./supabaseClient.js";
import { createMyProfile } from "./profiles.js";
import { updateMyMetadata } from "./auth.js";

/**
 * Runs on /auth/callback
 * 1) Exchange ?code= for a session
 * 2) Read pending_username from user metadata
 * 3) Insert into profiles
 * 4) Clear pending_username (+ optionally set display_name)
 */
export async function handleAuthCallback({ successRedirect = "/#/" } = {}) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return { ok: false, message: "Missing auth code in URL." };

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return { ok: false, message: exchangeError.message || "Verification failed." };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) return { ok: false, message: userError.message || "Could not read user after verification." };

  const user = userData?.user;
  if (!user) return { ok: false, message: "No user session after verification." };

  const pendingUsername = (user.user_metadata?.pending_username || "").trim();

  if (!pendingUsername) {
    // Not fatal, but means we don't know what username to create.
    // You can redirect to a "pick username" page if you want.
    return { ok: false, message: "No pending username found. Please sign up again." };
  }

  try {
    await createMyProfile(pendingUsername);

    // Optional convenience: store display_name and clear pending_username
    await updateMyMetadata({
      display_name: pendingUsername,
      pending_username: null,
    });
  } catch (e) {
    console.error(e);
    return { ok: false, message: e.message || "Could not create profile." };
  }

  window.location.replace(successRedirect);
  return { ok: true };
}
