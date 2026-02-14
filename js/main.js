import { startSignUp, logIn, logOut, getCurrentUser } from "./auth.js";

console.log("main.js loaded");

// SIGN UP
const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const result = await startSignUp(username, email, password);

      if (result.needsEmailConfirmation) {
        alert("Check your email to confirm your account.");
      } else {
        alert("Signed up and logged in!");
      }
    } catch (err) {
      alert(err.message);
    }
  });
}

// LOG IN
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await logIn(email, password);
      alert("Logged in!");
    } catch (err) {
      alert(err.message);
    }
  });
}

// LOG OUT
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await logOut();
    alert("Logged out");
  });
}

// OPTIONAL: check on page load
(async () => {
  const user = await getCurrentUser();
  console.log("Current user:", user);
})();
