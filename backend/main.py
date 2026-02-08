import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from curator.gemini_client import run_gemini
from curator.curator_logic import curate
from curator.prompts import CURATOR_PROMPT

app = FastAPI()
print("Starting FastAPI server...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite
        "http://localhost:3000",   # Create React App
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
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
    print("✅ result type:", type(result))

    # Convert Pydantic model to dict for JSON serialization
    try:
        if hasattr(result, 'model_dump'):  # Pydantic v2
            result_dict = result.model_dump()
        elif hasattr(result, 'dict'):  # Pydantic v1
            result_dict = result.dict()
        else:
            result_dict = result
        
        print("📤 Sending to frontend as dict:", result_dict)
        print("📤 Keys in result:", list(result_dict.keys()) if isinstance(result_dict, dict) else "Not a dict!")
        return result_dict
    except Exception as e:
        print("❌ Error converting result:", e)
        raise

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)