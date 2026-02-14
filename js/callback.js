import { supabase } from "./supabaseClient.js";
import { consumePendingUsername } from "./auth.js";
import { createMyProfile } from "./profiles.js";

/**
 * Call this on your auth callback page/route.
 * It exchanges the URL code for a session.
 * Then it creates the profile row using the pending username (if any).
 */
export async function handleAuthCallback({ successRedirect = "/#/" } = {}) {
    const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

    if (error) {
        console.error(error);
        return { ok: false, message: "Verification link invalid or expired." };
    }

    // After verification, user is logged in => safe to create profile row
    const pendingUsername = consumePendingUsername();
    if (pendingUsername) {
        try {
            await createMyProfile(pendingUsername);
        } catch (e) {
            // If profile already exists or username taken due to a race, you'll see it here.
            console.error(e);
            // You can choose to show a screen asking them to pick a username now.
        }
    }

    window.location.href = successRedirect;
    return { ok: true };
}
