const API_BASE = "http://127.0.0.1:8000";

const $msgs = document.getElementById("chat-messages");
const $input = document.getElementById("chat-input");
const $send = document.getElementById("sendBtn");
const $close = document.getElementById("closeBtn");

// UX helpers
function addMsg(text, who = "assistant") {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  $msgs.appendChild(div);
  $msgs.scrollTop = $msgs.scrollHeight;
}

function addTypingIndicator() {
  const div = document.createElement("div");
  div.className = "msg assistant typing";
  div.innerHTML = `
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  div.id = "typing-indicator";
  $msgs.appendChild(div);
  $msgs.scrollTop = $msgs.scrollHeight;
  return div;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}

async function talk(text) {
  addMsg(text, "user");
  const typingIndicator = addTypingIndicator();
  
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    
    removeTypingIndicator();
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    addMsg(data?.reply ?? "(no reply)", "assistant");
  } catch (e) {
    console.error(e);
    removeTypingIndicator();
    addMsg("❌ Failed to reach chatbot API. Please check if the server is running.", "assistant");
  }
}

function onSend() {
  const text = $input.value.trim();
  if (!text) return;
  $input.value = "";
  talk(text);
}

$send.addEventListener("click", onSend);
$input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
});

$close.addEventListener("click", () => {
  // Ask content-script to hide the iframe
  window.parent.postMessage({ type: "CLOSE_SIDEBAR" }, "*");
});

// Receive messages from content.js
window.addEventListener("message", (evt) => {
  if (evt?.data?.from !== "content-script") return;
  
  const { type, payload } = evt.data;
  
  switch (type) {
    case "PREFILL_TEXT":
      // Just prefill the input without sending
      const txt = payload?.text || "";
      if (txt) {
        $input.value = txt;
        // Focus on input for user to review before sending
        $input.focus();
      }
      break;
      
    case "AUTO_SEARCH":
      // Auto-send the selected text as a search query
      const searchText = payload?.text || "";
      if (searchText) {
        // Show a quick "Searching..." message
        addMsg(`🔍 Searching: "${searchText.length > 50 ? searchText.substring(0, 50) + '...' : searchText}"`, "system");
        
        // Show the text briefly in the input
        $input.value = searchText;
        
        // Immediately send the message automatically
        setTimeout(() => {
          talk(searchText);
          $input.value = ""; // Clear input after sending
        }, 100);
      }
      break;
  }
});

// Auto-focus input when sidebar opens
window.addEventListener('focus', () => {
  setTimeout(() => $input.focus(), 100);
});

// ...existing code...

function sendAutoSearchToSidebar(text) {
  if (!sidebarIframe) return;
  sidebarIframe.contentWindow.postMessage({
    from: "content-script",
    type: "AUTO_SEARCH",
    payload: { text }
  }, "*");
}

// When you want to auto-search (e.g., after context menu or popup)
sendAutoSearchToSidebar(selectedText);

// ...existing code...