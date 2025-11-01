// Login Page Script

// Tab switching
function switchTab(tab) {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const forms = document.querySelectorAll(".auth-form");
  
    // Remove active class
    tabBtns.forEach(btn => btn.classList.remove("active"));
    forms.forEach(form => form.classList.remove("active-form"));
  
    // Add active class
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
    document.getElementById(`${tab}Form`).classList.add("active-form");
  
    // Clear errors
    document.querySelectorAll(".error-message").forEach(el => {
      el.textContent = "";
    });
  }
  
  // Tab button listeners
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn.getAttribute("data-tab"));
    });
  });
  
  // Toggle password visibility
  function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }
  }
  
  // ===================================
  // LOGIN FORM VALIDATION & SUBMISSION
  // ===================================
  
  const loginForm = document.getElementById("loginForm");
  
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const userType = document.querySelector('input[name="userType"]:checked').value;
  
    // Validate email/password as before...
    const errors = validateLogin(email, password);
    if (Object.keys(errors).length > 0) {
      displayLoginErrors(errors);
      return;
    }
  
    try {
      const submitBtn = loginForm.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.innerText = "⏳ Signing in...";
    
      const response = await fetch("http://127.0.0.1:8000/login", {
      
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, user_type: userType }),
      });
    
      const result = await response.json();
    
      if (!response.ok) throw new Error(result.detail || "Login failed");
    
      // Store session and redirect
      sessionStorage.setItem("user", JSON.stringify(result.user));
    
      if (result.user.type === "admin") {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "index.html";
      }
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      const submitBtn = loginForm.querySelector("button[type='submit']");
      submitBtn.disabled = false;
      submitBtn.innerText = "Sign In 🚀";
    }
  });

  function validateLogin(email, password) {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!email || !emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }
  
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
  
    return errors;
  }
  
  function displayLoginErrors(errors) {
    if (errors.email) {
      document.getElementById("loginEmailError").textContent = errors.email;
    }
    if (errors.password) {
      document.getElementById("loginPasswordError").textContent = errors.password;
    }
  }
  
  // ===================================
  // SIGNUP FORM VALIDATION & SUBMISSION
  // ===================================
  
  const signupForm = document.getElementById("signupForm");
  
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const phone = document.getElementById("signupPhone").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const terms = document.getElementById("termsCheckbox").checked;
    const userType = document.querySelector('input[name="signupUserType"]:checked')?.value || "customer";
  
    const errors = validateSignup(name, email, phone, password, confirmPassword, terms);
    if (Object.keys(errors).length > 0) {
      displaySignupErrors(errors);
      return;
    }
  
    document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
  
    try {
      const submitBtn = signupForm.querySelector("button[type='submit']");
      submitBtn.disabled = true;
      submitBtn.innerText = "⏳ Creating account...";
  
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, user_type: userType })
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || "Signup failed");
  
      sessionStorage.setItem("user", JSON.stringify(result.user));
      alert("✅ Account created successfully!");
      window.location.href = userType === "admin" ? "admin-dashboard.html" : "index.html";
  
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      const submitBtn = signupForm.querySelector("button[type='submit']");
      submitBtn.disabled = false;
      submitBtn.innerText = "Create Account 🎊";
    }
  });
  
  
  function validateSignup(name, email, phone, password, confirmPassword, terms) {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
  
    if (!name || name.length < 3) {
      errors.name = "Name must be at least 3 characters";
    }
  
    if (!email || !emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }
  
    if (!phone || !phoneRegex.test(phone)) {
      errors.phone = "Phone must be 10 digits";
    }
  
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
  
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
  
    if (!terms) {
      errors.terms = "You must agree to the terms and conditions";
    }
  
    return errors;
  }
  
  function displaySignupErrors(errors) {
    if (errors.name) {
      document.getElementById("signupNameError").textContent = errors.name;
    }
    if (errors.email) {
      document.getElementById("signupEmailError").textContent = errors.email;
    }
    if (errors.phone) {
      document.getElementById("signupPhoneError").textContent = errors.phone;
    }
    if (errors.password) {
      document.getElementById("signupPasswordError").textContent = errors.password;
    }
    if (errors.confirmPassword) {
      document.getElementById("confirmPasswordError").textContent = errors.confirmPassword;
    }
    if (errors.terms) {
      document.getElementById("termsError").textContent = errors.terms;
    }
  }
  
  // ===================================
  // PAGE INITIALIZATION
  // ===================================
  
  document.addEventListener("DOMContentLoaded", () => {
    // Check if user already logged in
    const user = sessionStorage.getItem("user");
    if (user) {
      // Redirect to main page if already logged in
      // window.location.href = "index.html";
    }
  
    // Add animation delay to forms
    document.querySelectorAll(".auth-form").forEach((form, index) => {
      form.style.animationDelay = `${0.3 + index * 0.2}s`;
    });
  });