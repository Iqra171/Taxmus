import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from curator.gemini_client import run_gemini
from curator.curator_logic import curate
from curator.prompts import CURATOR_PROMPT

app = FastAPI()
print("Starting FastAPI server...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def health():
    return {"status": "ok", "service": "AI Museum Curator API"}

@app.post("/curate")
async def curate_image(image: UploadFile = File(...)):
    print("🔥 BACKEND RECEIVED:", image.filename)
    image_bytes = await image.read()

    raw_output = run_gemini(image_bytes, CURATOR_PROMPT)
    print("🔍 raw_output from Gemini:", raw_output)

    result = curate(image_bytes, raw_output)
    print("✅ final result:", result)

    return result

# class Fruit(BaseModel):
#     name:str

# class Fruits(BaseModel):
#     fruits: List[Fruit] 
    
# app=FastAPI()

# origins  =[
#     "http://localhost:5173"
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# memory_db ={"fruits":[]}

# @app.get("/fruits", response_model=Fruits)
# def get_fruits():
#     return Fruits(fruits=memory_db["fruits"])

# @app.post("/fruits", response_model=Fruit)
# def add_fruit(fruit: Fruit):
#     memory_db["fruits"].append(fruit)
#     return fruit

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
