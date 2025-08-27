# Chatbot Extension for Chrome

A lightweight **Chrome Extension** that connects to a **FastAPI backend** powered by **Google Gemini 2.5 Flash**.  
This extension allows users to chat with a Gemini-powered assistant directly from their browser.

---

## Features

- Chat with **Google Gemini 2.5 Flash** from any webpage
- Simple, minimal popup UI
- Sidebar integration for extended conversation view
- Communicates securely with a FastAPI backend
- Easy-to-install and lightweight

---

## Project Structure

```

CHATBOTEXTENSION/
├── backend/                  # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── extension/                # Chrome extension source
│   ├── manifest.json         # Extension configuration
│   ├── background.js         # Handles extension background tasks
│   ├── content.js            # Injected script for webpages
│   ├── popup.html            # Popup window
│   ├── popup.js              # Popup script
│   ├── sidebar.html          # Sidebar UI
│   ├── sidebar.js            # Sidebar script
│   ├── styles.css            # Styles for popup & sidebar
│   └── icons/                # Extension icons
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── README.md
└── .gitignore

````

---

## Setup Instructions

### 1. Run the Backend
1. Follow the backend setup in [backend/README.md](../backend/README.md).  
2. Start the server on `http://127.0.0.1:8000`.

---

### 2. Load the Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer Mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `extension/` folder from this project.

---

### 3. Use the Extension
- Click the **chatbot icon** in your Chrome toolbar.
- Start chatting with Gemini through the popup.
- Use the sidebar for longer conversation history.

---

## Manifest Overview

The `manifest.json` configures the extension:
```json
{
  "manifest_version": 3,
  "name": "Chatbot Assistant",
  "description": "A Chrome extension powered by Google Gemini 2.5 Flash.",
  "version": "1.0",
  "permissions": ["activeTab", "storage", "scripting"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
````

---

## Tech Stack

* **Frontend (Extension)**: HTML, CSS, JavaScript
* **Backend**: FastAPI (Python)
* **AI Model**: Google Gemini 2.5 Flash
* **Browser**: Chrome (Manifest V3)

---

## Roadmap

* [ ] Add dark mode to popup and sidebar
* [ ] Add persistent chat history
* [ ] Add support for multiple AI models
* [ ] Publish to Chrome Web Store

---

## License

This project is licensed under the **MIT License**.


