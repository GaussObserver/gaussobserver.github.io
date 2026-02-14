import { supabase } from "./supabaseClient.js";
import { createMyProfile } from "./profiles.js";
import { updateMyMetadata } from "./auth.js";

/**
 * Run this on the callback page.
 * - Exchange code -> session
 * - Read pending_username from user metadata
 * - Insert into profiles
 * - Set display_name (optional) and clear pending_username
 */
export async function handleAuthCallback({ successRedirect = "/#/" } = {}) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return { ok: false, message: "Missing auth code in URL." };

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return { ok: false, message: exchangeError.message || "Verification failed." };

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return { ok: false, message: userError.message || "Could not read user after verification." };
  if (!user) return { ok: false, message: "No user session after verification." };

  const pendingUsername = user.user_metadata?.pending_username?.trim();

  if (pendingUsername) {
    try {
      await createMyProfile(pendingUsername);

      // Optional: store display_name for convenience + clear pending_username
      await updateMyMetadata({
        display_name: pendingUsername,
        pending_username: null,
      });
    } catch (e) {
      console.error(e);
      // If username is taken due to race, tell the user
      return { ok: false, message: e.message || "Could not create profile." };
    }
  } else {
    // Not fatal, but means we can't create a profile automatically
    console.warn("No pending_username found in user metadata.");
  }

  window.location.href = successRedirect;
  return { ok: true };
}
