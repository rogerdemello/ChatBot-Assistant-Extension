from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import requests
from dotenv import load_dotenv

# ------------------------------
# Load Gemini API Key
# ------------------------------
GEMINI_CONFIGURED = bool(GEMINI_API_KEY)

# ------------------------------
# FastAPI App Initialization
# ------------------------------
app = FastAPI(
    title="Chatbot Backend",
    description="Backend for browser extension chatbot with Google Gemini API integration",
    version="2.1.0"
)

# Enable CORS (allow extension access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔒 Restrict this to extension URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Request/Response Models
# ------------------------------
class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "gemini-1.5-flash"
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

class ChatResponse(BaseModel):
    reply: str
    model_used: str
    tokens_used: Optional[int] = None

# ------------------------------
# Simple In-Memory Chat Memory
# ------------------------------
chat_memory = {}

# ------------------------------
# Health Check Endpoints
# ------------------------------
@app.get("/")
def root():
    return {
        "message": "🚀 FastAPI ChatBot Server running",
        "gemini_configured": GEMINI_CONFIGURED
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "gemini_configured": GEMINI_CONFIGURED}

# ------------------------------
# Echo Endpoint (No Gemini Required)
# ------------------------------
@app.post("/chat/echo", response_model=ChatResponse)
def chat_echo(req: ChatRequest):
    """Simple echo endpoint for quick testing."""
    return ChatResponse(
        reply=f"🤖 Echo: {req.message}",
        model_used="echo",
        tokens_used=0
    )

# ------------------------------
# Main Chat Endpoint with Memory
# ------------------------------
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint that integrates with Gemini and maintains memory."""
    if not GEMINI_CONFIGURED:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key not configured. Please set GEMINI_API_KEY."
        )

    try:
        user_id = "default_user"  # Later, replace with session/user ID
        chat_history = chat_memory.get(user_id, [])

        # Add user message to chat history
        chat_history.append({"role": "user", "content": request.message})

        # Build Gemini payload with chat history
        gemini_payload = {
            "contents": [
                {"role": "user", "parts": [{"text": msg["content"]}]}
                for msg in chat_history
            ],
            "generationConfig": {
                "maxOutputTokens": request.max_tokens,
                "temperature": request.temperature,
            }
        }

        # Gemini API call
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{request.model}:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, headers=headers, json=gemini_payload)

        if response.status_code != 200:
            print(f"Gemini API Error: {response.text}")
            raise HTTPException(status_code=502, detail=f"Gemini API error ({response.status_code})")

        data = response.json()
        reply = data["candidates"][0]["content"]["parts"][0]["text"]

        # Save model's reply to history
        chat_history.append({"role": "model", "content": reply})
        chat_memory[user_id] = chat_history

        return ChatResponse(
            reply=reply,
            model_used=request.model,
            tokens_used=request.max_tokens
        )

    except Exception as e:
        print(f"Error in /chat: {e}")
        raise HTTPException(status_code=502, detail="Bad Gateway")

# ------------------------------
# Run Command
# ------------------------------
# Use this command to start:
# python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
