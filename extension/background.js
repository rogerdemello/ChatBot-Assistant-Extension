// Helper to safely send a message to a tab, ensuring content script is injected
async function sendMessageToTab(tabId, msg) {
  try {
    // Try to inject content.js first
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  } catch (err) {
    console.warn("Injection might have failed (restricted page):", err);
  }

  // Try sending message
  try {
    if (tab && typeof tab.id === "number" && tab.id >= 0) {
  chrome.tabs.sendMessage(tab.id, {
    type: "OPEN_SIDEBAR",
    payload: { initialText: selectedText }
  });
}
  } catch (err) {
    console.error("Could not send message to content script:", err);
  }
}

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchInChatbot",
    title: 'Ask Chatbot: "%s"',
    contexts: ["selection"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || info.menuItemId !== "searchInChatbot") return;

  const selectedText = info.selectionText || "";
  await chrome.storage.local.set({ selectedText });

  // Try messaging this tab
  await sendMessageToTab(tab.id, {
    type: "OPEN_SIDEBAR",
    payload: { initialText: selectedText }
  });
});

// Allow popup to request last selected text
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "GET_LAST_SELECTION") {
    chrome.storage.local.get("selectedText").then((res) => {
      sendResponse({ selectedText: res.selectedText || "" });
    });
    return true; // keep channel open
  }
});
