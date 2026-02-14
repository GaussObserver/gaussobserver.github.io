import { startSignUp, logIn, logOut, getCurrentUser } from "./auth.js";

console.log("main.js loaded");

const signupBtn = document.getElementById("signupBtn");
signupBtn?.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const result = await startSignUp(username, email, password);
    if (result.needsEmailConfirmation) alert("Check your email to confirm your account.");
    else alert("Signed up and logged in!");
  } catch (err) {
    alert(err.message);
  }
});

// login/logout unchanged...
