const mealContainer = document.getElementById("mealContainer");
const searchBtn = document.getElementById("searchBtn");
const queryInput = document.getElementById("queryInput");
const mealStats = document.getElementById("mealStats");
const filterBtns = document.querySelectorAll(".filter-btn");

let allMeals = [];
let currentFilter = "all";

// Render meals with enhanced cards
function renderMeals(meals) {
  mealContainer.innerHTML = "";

  if (meals.length === 0) {
    mealContainer.innerHTML = `
      <div class="no-results">
        <h2>😕 No meals found</h2>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
    updateStats(0);
    return;
  }

  meals.forEach((meal, index) => {
    const card = document.createElement("div");
    card.className = "meal-card";
    card.style.animationDelay = `${index * 0.1}s`;
    
    const imageUrl = meal.image_url 
      ? meal.image_url.replace(/\/w_\d+/, '/w_800').replace(/\/h_\d+/, '/h_800')
      : 'https://via.placeholder.com/800/ffeaa7/78350f?text=🍽️+No+Image';

    let badges = '';
    if (meal.protein >= 30) {
      badges += '<span class="badge high-protein">High Protein</span>';
    }
    if (meal.calories <= 400) {
      badges += '<span class="badge low-calorie">Low Calorie</span>';
    }
    if (meal.cuisine && meal.cuisine.toLowerCase().includes('veg')) {
      badges += '<span class="badge vegetarian">Vegetarian</span>';
    }

    card.innerHTML = `
      <div class="img-container">
        <img src="${imageUrl}" alt="${meal.name}" loading="lazy">
      </div>
      <div class="meal-info">
        <h2>${meal.name}</h2>
        <p class="cuisine">${meal.cuisine || 'International'}</p>
        <div class="nutrition">
          <span>🔥 ${meal.calories} cal</span>
          <span>💪 ${meal.protein}g protein</span>
          <span>🍞 ${meal.carbs || "N/A"}g carbs</span>
          <span>🥑 ${meal.fats || "N/A"}g fats</span>
        </div>
        <div class="badges">
          ${badges}
        </div>
      </div>
    `;

    card.addEventListener("click", () => showMealModal(meal));
    mealContainer.appendChild(card);
  });

  updateStats(meals.length);
}

// Enhanced modal display
function showMealModal(meal) {
  const modal = document.getElementById("mealModal");
  
  const imageUrl = meal.image_url 
    ? meal.image_url.replace(/\/w_\d+/, '/w_800').replace(/\/h_\d+/, '/h_800')
    : 'https://via.placeholder.com/800/ffeaa7/78350f?text=🍽️+No+Image';

  document.getElementById("modalImage").src = imageUrl;
  document.getElementById("modalName").innerText = meal.name || "No name";
  document.getElementById("modalCuisine").innerText = meal.cuisine || "Unknown Cuisine";
  document.getElementById("modalDescription").innerText = meal.description || "A delicious meal perfect for any occasion. Enjoy the rich flavors and nutritious ingredients!";
  document.getElementById("modalCalories").innerText = `${meal.calories || "N/A"} cal`;
  document.getElementById("modalProtein").innerText = `${meal.protein || "N/A"}g`;
  document.getElementById("modalCarbs").innerText = `${meal.carbs || "N/A"}g`;
  document.getElementById("modalFats").innerText = `${meal.fats || "N/A"}g`;

  const cartBtn = document.getElementById("addToCartBtn");
  cartBtn.onclick = () => {
    addToCart(meal);
  }

  const wishlistBtn = document.getElementById("addToWishlistBtn");
  
  wishlistBtn.onclick = () => {
    addToWishlist(meal);
    alert(`${meal.name} added to wishlist! ❤️`);
  }

  modal.style.display = "flex";
  
  const modalContent = modal.querySelector('.modal-content');
  modalContent.style.animation = 'none';
  setTimeout(() => {
    modalContent.style.animation = '';
  }, 10);
}

// Close Modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("mealModal").style.display = "none";
});

// Close modal on outside click
window.addEventListener("click", (event) => {
  const modal = document.getElementById("mealModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Close modal with Escape key
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.getElementById("mealModal").style.display = "none";
  }
});

// Update stats
function updateStats(count) {
  mealStats.textContent = `${count} meal${count !== 1 ? 's' : ''} found`;
}

// Fetch all meals
async function fetchAllMeals() {
  mealContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading delicious meals...</p>
    </div>
  `;
  
  try {
    const res = await fetch("http://localhost:8000/meals");
    if (!res.ok) throw new Error(res.statusText);
    allMeals = await res.json();
    applyFilter(currentFilter);
  } catch (err) {
    mealContainer.innerHTML = `
      <div class="no-results">
        <h2>❌ Error loading meals</h2>
        <p>${err.message}</p>
      </div>
    `;
  }
}

// Search meals
searchBtn.addEventListener("click", async () => {
  const query = queryInput.value.trim();
  
  if (!query) {
    applyFilter(currentFilter);
    return;
  }

  console.log("Searching for:", query);
  mealContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Searching for delicious meals...</p>
    </div>
  `;

  try {
    const res = await fetch("http://localhost:8000/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    console.log("Response status:", res.status);
    if (!res.ok) throw new Error(res.statusText);

    const data = await res.json();
    console.log("Search results:", data);
    allMeals = data;
    applyFilter(currentFilter);

  } catch (err) {
    console.error("Error searching meals:", err.message);
    mealContainer.innerHTML = `
      <div class="no-results">
        <h2>❌ Error searching meals</h2>
        <p>${err.message}</p>
      </div>
    `;
  }
});

// Enter key triggers search
queryInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchBtn.click();
});

// Filter functionality
function applyFilter(filter) {
  currentFilter = filter;
  let filteredMeals = [...allMeals];

  if (filter === "high-protein") {
    filteredMeals = filteredMeals.filter(meal => meal.protein >= 30);
  } else if (filter === "low-calorie") {
    filteredMeals = filteredMeals.filter(meal => meal.calories <= 400);
  }

  renderMeals(filteredMeals);
}

// Filter button listeners
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.getAttribute("data-filter");
    applyFilter(filter);
  });
});
let wishlist = [];
// Add to wishlist
function addToWishlist(meal) {
  if (!wishlist.find(item => item.id === meal.id)) {
    wishlist.push(meal);
  }
  updateWishlistUI();
}

function updateWishlistUI() {
  const wishlistCounter = document.getElementById("wishlistCounter");
  if (wishlistCounter) wishlistCounter.innerText = wishlist.length;
}
// Update cart counter in UI
function updateCartUI() {
  const cartCounter = document.getElementById("cartCounter");
  const selectedMeals = JSON.parse(sessionStorage.getItem("selectedMeals") || "[]");
  if (cartCounter) cartCounter.innerText = selectedMeals.length;
}

// Add meal to cart and redirect
const addToCart = (meal) => {
  const user = sessionStorage.getItem("user");
  if (!user) {
    alert("⚠️ Please login first to place an order");
    window.location.href = "login.html";
    return;
  }

  let selectedMeals = JSON.parse(sessionStorage.getItem("selectedMeals") || "[]");
  selectedMeals.push(meal);
  sessionStorage.setItem("selectedMeals", JSON.stringify(selectedMeals));

  updateCartUI();
  window.location.href = "checkout.html";
}

// Call on page load to initialize cart counter
document.addEventListener("DOMContentLoaded", updateCartUI);



// Initial load
fetchAllMeals();