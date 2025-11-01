document.addEventListener("DOMContentLoaded", () => {
    const admin = sessionStorage.getItem("admin");
    if (!admin) {
        window.location.href = "admin-login.html";
        return;
    }

    loadMeals();
    loadOrders();
    loadAnalytics();

    // Toggle Add Meal form
    const newBtn = document.getElementById("newAddMealBtn");
    const addMealForm = document.getElementById("addMealForm");
    if (newBtn && addMealForm) {
        newBtn.addEventListener("click", () => {
            addMealForm.style.display = addMealForm.style.display === "none" ? "block" : "none";
        });
    }

    // Handle form submission
    const submitBtn = document.getElementById("submitMeal");
    if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
            const name = document.getElementById("mealName").value.trim();
            const price = parseFloat(document.getElementById("mealPrice").value);
            const ingredients = document.getElementById("mealIngredients").value.trim();
            const calories = parseFloat(document.getElementById("mealCalories").value);
            const protein = parseFloat(document.getElementById("mealProtein").value);
            const carbs = parseFloat(document.getElementById("mealCarbs").value);
            const fats = parseFloat(document.getElementById("mealFats").value);
            const image = document.getElementById("mealImage").files[0];

            if (!name || isNaN(price) || !ingredients || isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fats)) {
                return alert("❌ Please fill all fields correctly.");
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("ingredients", ingredients);
            formData.append("calories", calories);
            formData.append("protein", protein);
            formData.append("carbs", carbs);
            formData.append("fats", fats);
            if (image) formData.append("image", image);

            try {
                const res = await fetch("http://127.0.0.1:8000/meals", {
                    method: "POST",
                    body: formData
                });

                if (!res.ok) {
                    const err = await res.json();
                    return alert("❌ Failed to add meal: " + err.detail);
                }

                alert("✅ Meal added successfully!");
                addMealForm.style.display = "none"; // hide form after submission
                // Clear form inputs
                document.getElementById("mealName").value = "";
                document.getElementById("mealPrice").value = "";
                document.getElementById("mealIngredients").value = "";
                document.getElementById("mealCalories").value = "";
                document.getElementById("mealProtein").value = "";
                document.getElementById("mealCarbs").value = "";
                document.getElementById("mealFats").value = "";
                document.getElementById("mealImage").value = "";

                loadMeals();
                loadAnalytics();
            } catch (err) {
                console.error(err);
                alert("❌ Something went wrong while adding meal.");
            }
        });
    }

    // Tab switching
    const tabs = document.querySelectorAll(".admin-menu li[data-tab]");
    const contents = document.querySelectorAll(".admin-tab-content");
    const pageTitle = document.getElementById("pageTitle");

    const titleMap = {
        "meals": "Meal Management",
        "orders": "Order Management",
        "analytics": "Dashboard & Analytics"
    };

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active-tab"));
            tab.classList.add("active-tab");

            const target = tab.getAttribute("data-tab");
            contents.forEach(c => c.classList.remove("active-tab-content"));
            document.getElementById(target)?.classList.add("active-tab-content");

            if (pageTitle && titleMap[target]) pageTitle.textContent = titleMap[target];

            if (target === "analytics") loadAnalytics();
        });
    });

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
                sessionStorage.removeItem("admin");
                window.location.href = "admin-login.html";
            }
        });
    }
});

// Load meals
async function loadMeals() {
    const mealList = document.getElementById("mealList");
    try {
        const res = await fetch("http://127.0.0.1:8000/meals");
        const meals = await res.json();

        if (!meals || meals.length === 0) {
            mealList.innerHTML = `<p>No meals found. Click "Add New Meal" to create one.</p>`;
            return;
        }

        mealList.innerHTML = meals.map(m => `
            <div class="meal-item">
                <strong>${m.name}</strong> - ₹${m.price || 'N/A'}
                <br>
                Ingredients: ${m.ingredients || 'N/A'}
                <br>
                Calories: ${m.calories || 0} kcal | Protein: ${m.protein || 0}g | Carbs: ${m.carbs || 0}g | Fats: ${m.fats || 0}g
                <br>
                <button onclick="editMeal('${m.id}')">Edit</button>
                <button onclick="deleteMeal('${m.id}')">Delete</button>
            </div>
        `).join("");
    } catch (err) {
        mealList.innerHTML = "❌ Failed to load meals.";
        console.error(err);
    }
}

// Delete meal
async function deleteMeal(mealId) {
    if (!confirm("Delete this meal?")) return;
    try {
        await fetch(`http://127.0.0.1:8000/meals/${mealId}`, { method: "DELETE" });
        loadMeals();
        loadAnalytics();
    } catch (err) {
        alert("❌ Failed to delete meal");
        console.error(err);
    }
}
async function editMeal(mealId) {
    try {
        // Fetch meal details
        const res = await fetch(`http://127.0.0.1:8000/meals/${mealId}`);
        if (!res.ok) throw new Error("Failed to fetch meal");
        const meal = await res.json();

        // Populate form fields
        document.getElementById("mealName").value = meal.name || "";
        document.getElementById("mealPrice").value = meal.price || "";
        document.getElementById("mealIngredients").value = meal.ingredients || "";
        document.getElementById("mealCalories").value = meal.calories || "";
        document.getElementById("mealProtein").value = meal.protein || "";
        document.getElementById("mealCarbs").value = meal.carbs || "";
        document.getElementById("mealFats").value = meal.fats || "";

        // Show the form
        const addMealForm = document.getElementById("addMealForm");
        addMealForm.style.display = "block";

        // Change button text to Update Meal
        const submitBtn = document.getElementById("submitMeal");
        submitBtn.textContent = "Update Meal";

        // Remove previous click handlers
        const newBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newBtn, submitBtn);

        // Add new click handler for update
        newBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            const formData = new FormData(addMealForm);
            const res = await fetch(`http://127.0.0.1:8000/meals/${mealId}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                alert(" Failed to update meal: " + err.detail);
                return;
            }

            alert(" Meal updated successfully!");
            addMealForm.reset();
            addMealForm.style.display = "none";
            newBtn.textContent = "Add Meal";
            loadMeals();
            loadAnalytics();
        });
    } catch (err) {
        console.error(err);
        alert("❌ Failed to load meal for editing.");
    }
}

// Load orders
async function loadOrders() {
    const orderList = document.getElementById("orderList");
    try {
        const res = await fetch("http://127.0.0.1:8000/orders");
        const orders = await res.json();

        if (!orders || orders.length === 0) {
            orderList.innerHTML = `<p>No orders yet.</p>`;
            return;
        }

        orderList.innerHTML = orders.map(o => `
            <div class="order-item">
                <strong>${o.customer_name}</strong> | ${o.meal_name} | ₹${o.total_price} | ${o.phone}
            </div>
        `).join("");
    } catch (err) {
        orderList.innerHTML = "❌ Failed to load orders.";
        console.error(err);
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        const ordersRes = await fetch("http://127.0.0.1:8000/orders");
        const orders = await ordersRes.json();
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0);

        const mealsRes = await fetch("http://127.0.0.1:8000/meals");
        const meals = await mealsRes.json();
        const totalMeals = meals.length;
        const avgOrder = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

        document.getElementById("totalOrders").textContent = totalOrders;
        document.getElementById("totalRevenue").textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById("totalMeals").textContent = totalMeals;
        document.getElementById("avgOrder").textContent = `₹${avgOrder}`;
    } catch (err) {
        console.error(err);
    }
}

// When the Update Meal button is clicked
document.getElementById('updateMealBtn').addEventListener('click', async function () {
    const mealId = document.getElementById('mealId').value;
    const name = document.getElementById('mealName').value;
    const description = document.getElementById('mealDescription').value;
    const price = parseFloat(document.getElementById('mealPrice').value);
    const calories = parseInt(document.getElementById('mealCalories').value);
    const protein = parseInt(document.getElementById('mealProtein').value);
    const carbs = parseInt(document.getElementById('mealCarbs').value);
    const fats = parseInt(document.getElementById('mealFats').value);
    const image = document.getElementById('mealImage').value;
  
    if (!mealId) {
      alert("⚠️ No meal selected for update!");
      return;
    }
  
    const updatedMeal = {
      name,
      description,
      price,
      calories,
      protein,
      carbs,
      fats,
      image
    };
  
    try {
      const res = await fetch(`http://127.0.0.1:8000/meals/${mealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMeal)
      });
  
      if (res.ok) {
        alert("✅ Meal updated successfully!");
        document.getElementById('mealModal').style.display = 'none';
        fetchMeals(); // Refresh meal list
      } else {
        const error = await res.text();
        console.error("❌ Update failed:", error);
        alert("❌ Failed to update meal!");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ An error occurred while updating the meal!");
    }
  });
  