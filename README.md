# 🚀 Chatbot Backend (FastAPI + Google Gemini API)

A lightweight **FastAPI backend** for a chatbot powered by **Google Gemini API**.
This backend is designed to work with browser extensions or frontend clients, supports **conversation memory**, and includes a **testing echo endpoint**.

---

## ✨ Features

✅ REST API endpoints with FastAPI

✅ Google Gemini API integration (`gemini-1.5-flash` by default)

✅ Simple in-memory conversation memory

✅ CORS enabled for browser extensions

✅ Health check and echo endpoints for easy testing


---

## 📂 Project Structure

```
.
├── main.py          # FastAPI app with Gemini API integration
├── requirements.txt # Python dependencies
└── README.md        # Documentation
```

---

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/rogerdemello/ChatBot-Assistant-Extension
cd ChatBot-Assistant-Extension
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Your Google Gemini API Key

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

Then set it in ```.env``` file.

---

## ▶️ Run the Server

```bash
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Your API will be running at:

📍 [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 📡 API Endpoints

| Method | Endpoint     | Description                             |
| ------ | ------------ | --------------------------------------- |
| GET    | `/`          | Root endpoint, server status            |
| GET    | `/health`    | Health check                            |
| POST   | `/chat`      | Chat with Gemini API (memory supported) |
| POST   | `/chat/echo` | Echo message (no Gemini required)       |

---

### 🔹 Example Request

```bash
curl -X POST "http://127.0.0.1:8000/chat" \
-H "Content-Type: application/json" \
-d '{"message": "Hello, how are you?"}'
```

### 🔹 Example Response

```json
{
  "reply": "I'm great! How can I help you today?",
  "model_used": "gemini-1.5-flash",
  "tokens_used": 1000
}
```

---

## 🧠 Conversation Memory

* The app keeps a simple **in-memory conversation history** per user.
* Replace `"default_user"` with a real user/session ID for multi-user support.

---

## 📌 Requirements

* Python 3.9+
* FastAPI
* Uvicorn
* Requests

Install all dependencies:

```bash
pip install fastapi uvicorn requests python-dotenv
```

---

## 🚀 Roadmap

* [ ] Add multi-user chat memory
* [ ] Add persistent storage (Redis/Database)
* [ ] Add authentication for API access
* [ ] Build a simple frontend UI

---

## 📝 License

MIT License. Feel free to use and modify!

---

### 🔥 Quick Tip:

You can auto-generate a `requirements.txt`:

```bash
pip freeze > requirements.txt
```

