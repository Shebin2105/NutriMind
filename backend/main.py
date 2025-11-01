from fastapi import FastAPI, HTTPException, Body, Path, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from sentence_transformers import SentenceTransformer
from typing import List, Optional
from ollama import Client
import bcrypt

# ----------------- Supabase setup -----------------
url = "https://xldrftrxfzzkfngfixse.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZHJmdHJ4Znp6a2ZuZ2ZpeHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU0NjUzMCwiZXhwIjoyMDc2MTIyNTMwfQ.IMhYKFh8iFm71TnKOAZBPnCXwrS8NfmBnO0n7AcdpiQ"
supabase = create_client(url, key)

# ----------------- Embedding model -----------------
model = SentenceTransformer("all-mpnet-base-v2")  # 768-dim embeddings

# ----------------- FastAPI app -----------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Data models -----------------
class Meal(BaseModel):
    name: str
    price: float

class Order(BaseModel):
    customer_name: str
    phone: str
    address: str
    meals: List[Meal]
    total_price: float

class QueryRequest(BaseModel):
    query: str

class LoginRequest(BaseModel):
    email: str
    password: str
    user_type: str

class SignupRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    user_type: str

class ChatRequest(BaseModel):
    message: str

# ----------------- AI assistant -----------------
ollama_client = Client()
SYSTEM_PROMPT = (
    "You are a highly knowledgeable AI assistant specializing in all topics related to food, "
    "meals, recipes, nutrition, diet plans, ingredients, cooking methods, taste, "
    "culinary science, food safety, and meal recommendations. "
    "Answer user queries accurately, providing details when relevant, "
    "including examples, tips, or measurements if necessary. "
    "If a question is unrelated to food, reply politely: "
    "'❌ I can only answer questions related to food, recipes, and nutrition.'"
)

# ----------------- Routes -----------------

# --- Meal Routes ---
@app.get("/meals")#shows all the meals in the db
async def get_all_meals():
    meals = supabase.table("meals").select("*").execute().data or []
    prices = supabase.table("meal_prices").select("*").execute().data or []
    price_map = {p['meal_id']: p['price'] for p in prices}
    for meal in meals:
        meal['price'] = price_map.get(meal['id'], None)
    return meals

@app.get("/meals/{meal_id}")  # fetch single meal details for editing
async def get_meal(meal_id: str):
    try:
        # Fetch meal from 'meals' table
        meal_res = supabase.table("meals").select("*").eq("id", meal_id).execute()
        if not meal_res.data:
            raise HTTPException(status_code=404, detail="Meal not found")
        meal = meal_res.data[0]

        # Fetch price from 'meal_prices' table
        price_res = supabase.table("meal_prices").select("price").eq("meal_id", meal_id).execute()
        if price_res.data:
            meal["price"] = price_res.data[0]["price"]
        else:
            meal["price"] = None

        return meal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/meals") #allows the admin to add meals into the db
async def create_meal(
    name: str = Form(...),
    ingredients: str = Form(...),
    calories: int = Form(...),
    protein: int = Form(...),
    carbs: int = Form(...),
    fats: int = Form(...),
    price: float = Form(...),
    cuisine: Optional[str] = Form(None),
    image: UploadFile = File(None)
):
    try:
        image_url = None
        if image:
            bucket_name = "Meals_Images"
            file_path = f"meals/{image.filename}"
            contents = await image.read()
            res = supabase.storage.from_(bucket_name).upload(file_path, contents, {"upsert": True})
            if res.get("error"):
                raise HTTPException(status_code=500, detail=f"Image upload failed: {res['error']['message']}")
            image_url = supabase.storage.from_(bucket_name).get_public_url(file_path)

        text_to_embed = f"{name}. Ingredients: {ingredients}. Cuisine: {cuisine or ''}"
        embedding = model.encode(text_to_embed).tolist()

        res = supabase.table("meals").insert({
            "name": name,
            "ingredients": ingredients,
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fats": fats,
            "cuisine": cuisine,
            "embedding": embedding,
            "image_url": image_url
        }).execute()

        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create meal")

        meal_id = res.data[0]["id"]
        supabase.table("meal_prices").insert({"meal_id": meal_id, "price": price}).execute()

        return {"message": "Meal added successfully", "meal": res.data[0], "image_url": image_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/meals/{meal_id}") #allows admin to update exisiting meals in the db
async def update_meal(
    meal_id: str = Path(...),
    name: str = Form(...),
    ingredients: str = Form(...),
    calories: int = Form(...),
    protein: int = Form(...),
    carbs: int = Form(...),
    fats: int = Form(...),
    price: float = Form(...),
    cuisine: Optional[str] = Form(None),
    image: UploadFile = File(None)
):
    try:
        image_url = None
        if image:
            bucket_name = "Meals_Images"
            file_path = f"meals/{image.filename}"
            contents = await image.read()
            res = supabase.storage.from_(bucket_name).upload(file_path, contents, {"upsert": True})
            if res.get("error"):
                raise HTTPException(status_code=500, detail=f"Image upload failed: {res['error']['message']}")
            image_url = supabase.storage.from_(bucket_name).get_public_url(file_path)

        text_to_embed = f"{name}. Ingredients: {ingredients}. Cuisine: {cuisine or ''}"
        embedding = model.encode(text_to_embed).tolist()

        res = supabase.table("meals").update({
            "name": name,
            "ingredients": ingredients,
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fats": fats,
            "cuisine": cuisine,
            "embedding": embedding,
            "image_url": image_url
        }).eq("id", meal_id).execute()

        if res.data is None:
            raise HTTPException(status_code=500, detail="Failed to update meal")

        supabase.table("meal_prices").update({"price": price}).eq("meal_id", meal_id).execute()
        return {"message": "Meal updated successfully", "meal": res.data[0], "image_url": image_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/meals/{meal_id}")
async def delete_meal(meal_id: str):
    supabase.table("meal_prices").delete().eq("meal_id", meal_id).execute()
    supabase.table("meals").delete().eq("id", meal_id).execute()
    return {"message": "Meal deleted successfully"}

@app.post("/search")
async def search_meals(req: QueryRequest):
    query_emb = model.encode(req.query).tolist()
    results = supabase.rpc("match_meals", {"query_embedding": query_emb}).execute()
    return results.data

# --- Orders ---
@app.post("/orders")#triggered when user places an order
async def place_order(order: Order):
    total_price = sum(meal.price for meal in order.meals)
    meal_names = [meal.name for meal in order.meals]
    checkout_data = {
        "customer_name": order.customer_name,
        "phone": order.phone,
        "address": order.address,
        "meal_name": ", ".join(meal_names),
        "total_price": total_price
    }
    res = supabase.table("checkout").insert(checkout_data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to place order")
    return {"message": "Order placed successfully", "total_price": total_price}

@app.get("/orders")#shows all the placed orders
async def get_all_orders():
    return supabase.table("checkout").select("*").execute().data or []

# --- Login / Signup ---
@app.post("/login")
async def login_user(data: LoginRequest):
    response = supabase.table("users").select("*").eq("email", data.email).execute()
    if not response.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = response.data[0]
    if not bcrypt.checkpw(data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Login successful", "user": {"email": user["email"], "type": user["role"]}}

@app.post("/signup")
async def signup_user(data: SignupRequest):
    existing = supabase.table("users").select("*").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    response = supabase.table("users").insert({
        "email": data.email,
        "password": hashed_pw,
        "role": data.user_type
    }).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
    return {"message": "Signup successful", "user": {"email": data.email, "type": data.user_type}}

# --- Admin Login / Signup ---
@app.post("/admin-login")
async def admin_login(data: LoginRequest):
    response = supabase.table("users").select("*").eq("email", data.email).execute()
    if not response.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = response.data[0]
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied: not an admin")
    if not bcrypt.checkpw(data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"message": "Admin login successful", "admin": user}

@app.post("/admin-signup")
async def admin_signup(data: SignupRequest):
    existing = supabase.table("users").select("*").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    res = supabase.table("users").insert({
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "password": hashed_pw,
        "role": "admin"
    }).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Admin registration failed")
    return {"message": "Admin registered successfully"}

# --- AI Chat ---
@app.post("/ask")
async def ask_ai(req: ChatRequest):
    user_input = req.message.strip()
    if not user_input:
        raise HTTPException(status_code=422, detail="Message cannot be empty")
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_input}]
        resp = ollama_client.chat(model="gemma2:2b", messages=messages)
        reply = resp.get("message", {}).get("content", "").strip()
        if not reply:
            reply = "🤔 Sorry, I didn't get that. Can you rephrase your question about food?"
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ollama LLM error: {e}")

