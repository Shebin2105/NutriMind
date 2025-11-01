from supabase import create_client
from sentence_transformers import SentenceTransformer

# --- Same setup as backend ---
url = "https://xldrftrxfzzkfngfixse.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZHJmdHJ4Znp6a2ZuZ2ZpeHNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU0NjUzMCwiZXhwIjoyMDc2MTIyNTMwfQ.IMhYKFh8iFm71TnKOAZBPnCXwrS8NfmBnO0n7AcdpiQ"
supabase = create_client(url, key)
model = SentenceTransformer("all-mpnet-base-v2")

# --- Generate and update missing embeddings ---
def update_missing_embeddings():
    # ✅ Correct filter syntax — must be string "null"
    res = supabase.table("meals").select("*").is_("embedding", "null").execute()
    meals = res.data or []
    print(f"Found {len(meals)} meals without embeddings")

    for meal in meals:
        text = f"{meal['name']}. Ingredients: {meal.get('ingredients', '')}. Cuisine: {meal.get('cuisine', '')}"
        embedding = model.encode(text).tolist()

        supabase.table("meals").update({"embedding": embedding}).eq("id", meal["id"]).execute()
        print(f"✅ Updated embedding for: {meal['name']}")

if __name__ == "__main__":
    update_missing_embeddings()
