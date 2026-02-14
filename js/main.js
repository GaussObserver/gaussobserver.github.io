import { startSignUp, logIn, logOut, getCurrentUser } from "./auth.js";

console.log("main.js loaded");

const signupBtn = document.getElementById("signupBtn");
signupBtn?.addEventListener("click", async () => {
  const displayName = document.getElementById("username").value; // reuse your input id
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await startSignUp(displayName, email, password);
    if (result.needsEmailConfirmation) alert("Check your email to confirm your account.");
    else alert("Signed up and logged in!");
  } catch (err) {
    alert(err.message);
  }
});

const loginBtn = document.getElementById("loginBtn");
loginBtn?.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await logIn(email, password);
    alert("Logged in!");
  } catch (err) {
    alert(err.message);
  }
});

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn?.addEventListener("click", async () => {
  await logOut();
  alert("Logged out");
});

(async () => {
  const user = await getCurrentUser();
  console.log("Current user:", user);
  if (user) console.log("Display name:", user.user_metadata?.display_name);
})();
