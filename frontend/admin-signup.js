function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === "password" ? "text" : "password";
  }
  
  // Admin signup handler
  document.getElementById("adminSignupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
  
    if (!name || !email || !password) {
      alert("Please fill in all fields!");
      return;
    }
  
    try {
      const res = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, user_type: "admin" }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        alert(data.detail || "Signup failed.");
        return;
      }
  
      alert("✅ Admin account created successfully!");
      window.location.href = "admin-login.html";
  
    } catch (error) {
      console.error(error);
      alert("Server error. Please try again.");
    }
  });
  