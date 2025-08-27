# Chatbot Sidebar Assistant


- Highlight text → Right-click → Ask Chatbot → Chat opens in a sidebar with follow-up ability.
- Backend: FastAPI server running locally.


## Steps
1. Install Python, `pip install fastapi uvicorn transformers`.
2. Run backend: `uvicorn chat:app --reload --host 0.0.0.0 --port 8000`.
3. Load extension via `chrome://extensions` → Load unpacked.
4. Select text → Ask Chatbot.


## Notes
- Replace the model in `chat.py` with any HuggingFace model.
- You can deploy the FastAPI backend to a server and update the URL in `sidebar.js`.