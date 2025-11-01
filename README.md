🍽️ Meal Finder Web App
A smart meal discovery platform built using FastAPI, Supabase, and Vanilla JavaScript.
🚀 Overview

Meal Finder is a web application that allows users to explore, search, and order meals efficiently.
It integrates a FastAPI backend (connected to Supabase for data storage) and a responsive JavaScript frontend.
Admins can manage meals through an Admin Dashboard, while users can browse and order seamlessly.

🧩 Key Features
👥 User Features

Browse all available meals with images and details

Search meals instantly using keyword-based search

View meal details in a responsive popup modal

Place and view orders (connected to Supabase database)

🧑‍💼 Admin Features

Secure admin dashboard to add, edit, and delete meals

Manage orders and update meal details

Real-time updates using Supabase integration

⚙️ Technical Features

FastAPI RESTful API backend

Supabase for storage and authentication

Frontend built with HTML, CSS, and vanilla JS

Modular code with routes for /meals, /search, /orders, /login, and /signup

🏗️ Architecture
Frontend (HTML, CSS, JS)
        │
        ▼
FastAPI Backend (Python)
        │
        ▼
Supabase Database (PostgreSQL + Storage)

🔄 Data Flow:

User searches or selects a meal on the frontend

Request is sent to the FastAPI /search or /meals endpoint

Backend fetches data from Supabase and returns JSON

JavaScript renders results dynamically using modals

🧠 Tech Stack
Component	Technology
Frontend	HTML, CSS, JavaScript
Backend	FastAPI (Python)
Database	Supabase (PostgreSQL)
Authentication	Supabase Auth
Storage	Supabase Storage (for meal images)
Hosting (optional)	GitHub Pages / Render / Vercel
📁 Folder Structure
meal_project/
│
├── backend/
│   ├── main.py                # FastAPI main application
│   ├── routes/
│   │   ├── meals.py
│   │   ├── orders.py
│   │   ├── auth.py
│   ├── supabase_client.py     # Supabase connection setup
│   ├── gen_embed.py           # For generating embeddings (AI search)
│   └── requirements.txt
│
├── frontend/
│   ├── index.html             # User page
│   ├── admin-dashboard.html   # Admin interface
│   ├── admin-dashboard.js     # JS logic for admin
│   ├── admin-dashboard.css
│   ├── style.css
│   └── script.js              # Main JS for user interface
│
└── README.md

⚙️ Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/your-username/meal-finder.git
cd meal-finder

2️⃣ Backend Setup
cd backend
pip install -r requirements.txt


Create a .env file inside /backend:

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_key


Run the backend:

uvicorn main:app --reload

3️⃣ Frontend Setup

Open frontend/index.html in your browser
(or host using VS Code Live Server)

🔗 API Endpoints
Method	Endpoint	Description
GET	/meals	Fetch all meals
GET	/search?query=meal_name	Search meals
POST	/orders	Place an order
POST	/login	User login
POST	/signup	Register user
💻 Example Screens

Home Page: Meal listing with search

Modal Popup: Meal details on click

Admin Dashboard: Add / Edit / Delete meals

Orders Page: Displays user orders

📈 Future Enhancements

AI-based meal recommendations using embeddings

User order history & tracking

Payment gateway integration

Role-based access for admins and users

Dark mode UI and better analytics dashboard

👨‍💻 Developed by

Shebin
Intern @ Patterns Cognitive
Learning Web Development, Databases, and AI Integration
