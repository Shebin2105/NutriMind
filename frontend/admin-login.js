function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === "password" ? "text" : "password";
  }
  
  // Admin login handler
  document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
  
    if (!email || !password) {
      alert("Please fill in all fields!");
      return;
    }
  
    try {
      const res = await fetch("http://127.0.0.1:8000/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, user_type: "admin" }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        alert(data.detail || "Invalid credentials.");
        return;
      }
  
      // Store admin details
      sessionStorage.setItem("admin", JSON.stringify(data.admin));
      alert("✅ Admin login successful!");
      window.location.href = "admin-dashboard.html";
  
    } catch (error) {
      console.error(error);
      alert("Server error. Please try again.");
    }
  });
  