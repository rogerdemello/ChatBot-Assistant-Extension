const API_BASE = "http://127.0.0.1:8000";

const $msg = document.getElementById("message");
const $send = document.getElementById("send");
const $chat = document.getElementById("chat");

// Prefill with last selection if available
chrome.runtime.sendMessage({ type: "GET_LAST_SELECTION" }, (res) => {
  if (res?.selectedText) $msg.value = res.selectedText;
});

async function sendMessage() {
  const text = $msg.value.trim();
  if (!text) return;

  $chat.textContent = "Sending...";
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    $chat.textContent = data?.reply ?? "(no reply)";
  } catch (e) {
    console.error(e);
    $chat.textContent = "Failed to reach chatbot API.";
  }
}

$send.addEventListener("click", sendMessage);
$msg.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
