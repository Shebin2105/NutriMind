#  NutriMind

**NutriMind** is an intelligent meal recommendation and management web app that helps users explore, search, and order healthy meals — powered by AI-based natural language understanding and Supabase database integration.

---

##  Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** FastAPI (Python)  
- **Database:** Supabase (PostgreSQL)  
- **AI Integration:** Ollama + Gemma2:2b (LLM model)  
- **Authentication:** Supabase Auth  
- **Deployment:** Local / Cloud (customizable)

---

##  Key Features

-  **Meal Search:** Users can search meals by name, ingredients, or preferences.  
-  **Detailed Meal View:** Displays nutritional info, calories, and ingredients in a modal popup.  
-  **Order Management:** Handles adding, viewing, and storing meal orders in Supabase.  
-  **User Authentication:** Signup & login using Supabase Auth.  
-  **AI Chat Assistant:** Smart chatbot to answer food-related questions using Ollama’s Gemma2:2b model.  
-  **Admin Dashboard:** Manage meals (Add / Edit / Delete) and view analytics like total orders & revenue.

## ⚙️ Setup Instructions

### Clone the Repository
```bash
git clone https://github.com/Shebin2105/NutriMind.git
cd NutriMind
```
### Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend Setup
cd frontend
python -m http.server 8000

###Author

Shebin Chinnaraj Sivakumar
Computer Science Undergraduate, VIT Chennai
🔗 GitHub
 | LinkedIn

### License
This project is licensed under the MIT License — feel free to use and modify for educational or personal use.
