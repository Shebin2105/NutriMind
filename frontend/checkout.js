// Checkout Page Script

const mealDetailsDiv = document.getElementById("mealDetails");
const orderForm = document.getElementById("orderForm");
const upiSection = document.getElementById("upiSection");
const upiPaidBtn = document.getElementById("upiPaidBtn");
let upiPaid = false;
let selectedMeals = JSON.parse(sessionStorage.getItem("selectedMeals")) || [];

// ============================
// Load meal details on page load
// ============================
document.addEventListener("DOMContentLoaded", loadMealDetails);

function loadMealDetails() {
  displayMealDetails();
}

// ============================
// Display selected meals
// ============================
function displayMealDetails() {
  if (selectedMeals.length === 0) {
    mealDetailsDiv.innerHTML = `
      <div class="no-results">
        <h2>❌ No meals selected</h2>
        <p>Please select a meal from the menu.</p>
      </div>
    `;
    calculateTotal();
    return;
  }

  mealDetailsDiv.innerHTML = selectedMeals
    .map((meal, index) => {
      const imageUrl = meal.image_url
        ? meal.image_url.replace(/\/w_\d+/, "/w_400").replace(/\/h_\d+/, "/h_400")
        : "https://via.placeholder.com/400/ffeaa7/78350f?text=🍽️";

      return `
        <div class="meal-card">
          <img src="${imageUrl}" alt="${meal.name}" class="meal-image">
          <h3>${meal.name}</h3>
          <p><strong>Cuisine:</strong> ${meal.cuisine || "International"}</p>
          <p><strong>Price:</strong> ₹${meal.price}</p>
          <button class="remove-meal-btn" data-index="${index}">❌ Remove</button>
        </div>
      `;
    })
    .join("");

  // Attach remove handlers
  document.querySelectorAll(".remove-meal-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index);
      removeMeal(idx);
    });
  });

  calculateTotal();
}

// ============================
// Remove selected meal
// ============================
function removeMeal(index) {
  selectedMeals.splice(index, 1);
  sessionStorage.setItem("selectedMeals", JSON.stringify(selectedMeals));
  displayMealDetails();
}

// ============================
// Calculate totals
// ============================
function calculateTotal() {
  const subtotal = selectedMeals.reduce((sum, meal) => sum + (meal.price || 0), 0);
  const deliveryFee = selectedMeals.length > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  document.getElementById("subtotal").innerText = `₹${subtotal.toFixed(2)}`;
  document.getElementById("deliveryFee").innerText = `₹${deliveryFee.toFixed(2)}`;
  document.getElementById("totalAmount").innerText = `₹${total.toFixed(2)}`;
}

// ============================
// Form Validation
// ============================
function validateForm(formData) {
  const errors = {};

  if (!formData.name || formData.name.trim().length < 3)
    errors.name = "Name must be at least 3 characters";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email || !emailRegex.test(formData.email))
    errors.email = "Please enter a valid email address";

  const phoneRegex = /^[0-9]{10}$/;
  if (!formData.phone || !phoneRegex.test(formData.phone))
    errors.phone = "Please enter a valid 10-digit phone number";

  if (!formData.address || formData.address.trim().length < 5)
    errors.address = "Please enter a valid address";

  if (!formData.city || formData.city.trim().length < 2)
    errors.city = "Please enter a valid city";

  const zipcodeRegex = /^[0-9]{6}$/;
  if (!formData.zipcode || !zipcodeRegex.test(formData.zipcode))
    errors.zipcode = "Please enter a valid 6-digit zipcode";

  if (!formData.terms)
    errors.terms = "You must agree to the terms and conditions";

  return errors;
}

// ============================
// Display Validation Errors
// ============================
function displayErrors(errors) {
  document.querySelectorAll(".error-message").forEach(el => el.textContent = "");

  Object.keys(errors).forEach(field => {
    const errorElement = document.getElementById(`${field}Error`);
    if (errorElement) errorElement.textContent = errors[field];
  });
}

// ============================
// Handle UPI Logic
// ============================

// Toggle UPI section
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.value === "upi" && radio.checked) {
      upiSection.style.display = "block";
    } else {
      upiSection.style.display = "none";
    }
  });
});

// Mark payment confirmed
if (upiPaidBtn) {
  upiPaidBtn.addEventListener("click", () => {
    upiPaid = true;
    upiPaidBtn.innerText = "✅ Payment Confirmed";
    upiPaidBtn.disabled = true;
    upiPaidBtn.style.background = "#10b981";
    upiPaidBtn.style.color = "white";
  });
}

// ============================
// Handle Form Submission
// ============================
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (selectedMeals.length === 0) {
    alert("No meals selected");
    return;
  }

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    zipcode: document.getElementById("zipcode").value,
    notes: document.getElementById("notes").value,
    payment: document.querySelector('input[name="payment"]:checked').value,
    terms: document.getElementById("terms").checked
  };

  const errors = validateForm(formData);
  if (Object.keys(errors).length > 0) {
    displayErrors(errors);
    return;
  }
  displayErrors({});

  // 🟢 Require UPI payment confirmation
  if (formData.payment === "upi" && !upiPaid) {
    alert("Please confirm your UPI payment before placing the order.");
    return;
  }

  const paymentMethod = formData.payment;
  const paymentStatus = paymentMethod === "upi" ? (upiPaid ? "Paid" : "Pending") : "Pending";

  const orderData = {
    customer_name: formData.name,
    phone: formData.phone,
    address: `${formData.address}, ${formData.city} - ${formData.zipcode}`,
    meals: selectedMeals.map(meal => ({ name: meal.name, price: meal.price })),
    total_price: selectedMeals.reduce((sum, meal) => sum + (meal.price || 0), 0) + (selectedMeals.length > 0 ? 50 : 0),
    payment_method: paymentMethod,
    payment_status: paymentStatus
  };

  try {
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = "⏳ Processing...";

    const response = await fetch("http://localhost:8000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to place order");

    showSuccessMessage();
    orderForm.reset();
    sessionStorage.removeItem("selectedMeals");
    setTimeout(() => window.location.href = "index.html", 3000);

  } catch (error) {
    console.error("Order error:", error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    const submitBtn = orderForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerText = "🎉 Place Order";
  }
});

// ============================
// Success Message
// ============================
function showSuccessMessage() {
  const successMsg = document.createElement("div");
  successMsg.className = "success-message";
  successMsg.innerHTML = `
    ✅ <strong>Order Placed Successfully!</strong>
    <p>Your meal will be delivered soon. Redirecting...</p>
  `;
  orderForm.parentElement.insertBefore(successMsg, orderForm);
  successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
}
