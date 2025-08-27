// Inject a slide-in iframe with sidebar.html, reusing it if already present.
let sidebarIframe = null;
let isOpen = false;
let floatingPopup = null;
let selectedText = '';
let isInitialized = false;

// Check if we can run on this page
function canRunOnPage() {
  try {
    // Check if we're on a restricted page
    const restrictedDomains = ['chrome://', 'chrome-extension://', 'moz-extension://'];
    const currentUrl = window.location.href;
    
    return !restrictedDomains.some(domain => currentUrl.startsWith(domain));
  } catch (e) {
    return false;
  }
}

// Safe initialization
function initialize() {
  if (isInitialized || !canRunOnPage()) return;
  
  try {
    setupEventListeners();
    isInitialized = true;
  } catch (e) {
    console.warn('Failed to initialize chatbot extension:', e);
  }
}

function injectSidebar() {
  if (sidebarIframe && document.body.contains(sidebarIframe)) return sidebarIframe;

  try {
    sidebarIframe = document.createElement("iframe");
    sidebarIframe.src = chrome.runtime.getURL("sidebar.html");
    sidebarIframe.style.position = "fixed";
    sidebarIframe.style.top = "0";
    sidebarIframe.style.right = "0";
    sidebarIframe.style.width = "380px";
    sidebarIframe.style.height = "100%";
    sidebarIframe.style.border = "none";
    sidebarIframe.style.zIndex = "2147483647";
    sidebarIframe.style.boxShadow = "0 0 20px rgba(0,0,0,.25)";
    sidebarIframe.style.transition = "transform .25s ease";
    sidebarIframe.style.transform = "translateX(100%)"; // hidden initially

    document.body.appendChild(sidebarIframe);
    return sidebarIframe;
  } catch (e) {
    console.error('Failed to inject sidebar:', e);
    return null;
  }
}

function openSidebar(textToSearch = '') {
  if (!canRunOnPage()) {
    console.warn('Cannot open sidebar on this page');
    return;
  }

  const iframe = injectSidebar();
  if (!iframe) return;

  requestAnimationFrame(() => {
    try {
      sidebarIframe.style.transform = "translateX(0)";
      isOpen = true;
      
      // If we have text to search, send it to sidebar and auto-send
      if (textToSearch) {
        setTimeout(() => {
          sendToSidebar({
            type: "AUTO_SEARCH",
            payload: { text: textToSearch }
          });
        }, 500); // Slightly longer delay for stability
      }
    } catch (e) {
      console.error('Failed to open sidebar:', e);
    }
  });
}

function closeSidebar() {
  if (!sidebarIframe) return;
  try {
    sidebarIframe.style.transform = "translateX(100%)";
    isOpen = false;
  } catch (e) {
    console.error('Failed to close sidebar:', e);
  }
}

function sendToSidebar(message) {
  if (!sidebarIframe?.contentWindow) return;
  try {
    sidebarIframe.contentWindow.postMessage(
      { from: "content-script", ...message },
      "*"
    );
  } catch (e) {
    console.error('Failed to send message to sidebar:', e);
  }
}

// Create floating popup with better error handling
function createFloatingPopup() {
  if (floatingPopup && document.body.contains(floatingPopup)) {
    return floatingPopup;
  }

  try {
    floatingPopup = document.createElement('div');
    floatingPopup.innerHTML = `
      <div id="askBotBtn" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
        user-select: none;
        white-space: nowrap;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: 1px solid rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        🤖 Ask Bot
      </div>
    `;
    
    floatingPopup.style.position = 'absolute';
    floatingPopup.style.zIndex = '2147483646';
    floatingPopup.style.opacity = '0';
    floatingPopup.style.transform = 'scale(0.8)';
    floatingPopup.style.transition = 'all 0.2s ease';
    floatingPopup.style.pointerEvents = 'none';

    // Add hover effects with error handling
    const askBtn = floatingPopup.querySelector('#askBotBtn');
    if (askBtn) {
      askBtn.addEventListener('mouseenter', () => {
        try {
          askBtn.style.transform = 'scale(1.05)';
          askBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
        } catch (e) {
          console.warn('Hover effect error:', e);
        }
      });
      
      askBtn.addEventListener('mouseleave', () => {
        try {
          askBtn.style.transform = 'scale(1)';
          askBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        } catch (e) {
          console.warn('Hover effect error:', e);
        }
      });

      // Handle click
      askBtn.addEventListener('click', (e) => {
        try {
          e.stopPropagation();
          hideFloatingPopup();
          openSidebar(selectedText);
        } catch (error) {
          console.error('Click handler error:', error);
        }
      });
    }

    if (document.body) {
      document.body.appendChild(floatingPopup);
    }
    return floatingPopup;
  } catch (e) {
    console.error('Failed to create floating popup:', e);
    return null;
  }
}

function showFloatingPopup(x, y, text) {
  if (!canRunOnPage() || !text || text.length === 0) return;
  
  selectedText = text;
  const popup = createFloatingPopup();
  if (!popup) return;
  
  try {
    // Position popup near the selection, but ensure it's visible
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Rough popup dimensions (2cm x 1cm ≈ 80px x 40px at 96 DPI)
    const popupWidth = 90;
    const popupHeight = 40;
    
    let posX = Math.max(10, Math.min(x + 10, viewportWidth - popupWidth - 10));
    let posY = y - popupHeight - 10;
    
    // If popup would be above viewport, show it below
    if (posY < 10) {
      posY = y + 20;
    }
    
    popup.style.left = posX + 'px';
    popup.style.top = posY + 'px';
    popup.style.pointerEvents = 'auto';
    popup.style.opacity = '1';
    popup.style.transform = 'scale(1)';
  } catch (e) {
    console.error('Failed to show popup:', e);
  }
}

function hideFloatingPopup() {
  if (!floatingPopup) return;
  try {
    floatingPopup.style.opacity = '0';
    floatingPopup.style.transform = 'scale(0.8)';
    floatingPopup.style.pointerEvents = 'none';
  } catch (e) {
    console.error('Failed to hide popup:', e);
  }
}

// Setup event listeners with error handling
function setupEventListeners() {
  let selectionTimeout;

  // Handle text selection
  document.addEventListener('mouseup', (e) => {
    if (!canRunOnPage()) return;
    
    try {
      clearTimeout(selectionTimeout);
      
      selectionTimeout = setTimeout(() => {
        try {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) {
            hideFloatingPopup();
            return;
          }
          
          const text = selection.toString().trim();
          
          if (text && text.length > 0 && text.length < 1000) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            if (rect.width > 0 && rect.height > 0) {
              showFloatingPopup(
                rect.right + window.scrollX, 
                rect.top + window.scrollY, 
                text
              );
            }
          } else {
            hideFloatingPopup();
          }
        } catch (error) {
          console.warn('Selection handling error:', error);
          hideFloatingPopup();
        }
      }, 100);
    } catch (e) {
      console.warn('Mouseup handler error:', e);
    }
  });

  // Hide popup on various events
  document.addEventListener('mousedown', (e) => {
    try {
      if (!floatingPopup?.contains(e.target)) {
        hideFloatingPopup();
      }
    } catch (error) {
      hideFloatingPopup();
    }
  });

  document.addEventListener('keydown', () => {
    hideFloatingPopup();
  });

  document.addEventListener('scroll', () => {
    hideFloatingPopup();
  });

  // Receive close requests from sidebar
  window.addEventListener("message", (evt) => {
    try {
      if (evt?.data?.type === "CLOSE_SIDEBAR") {
        closeSidebar();
      }
    } catch (e) {
      console.warn('Message handler error:', e);
    }
  });
}

// Listen for background commands (context menu click)
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    try {
      if (msg?.type === "OPEN_SIDEBAR") {
        openSidebar();
        if (msg.payload?.initialText) {
          sendToSidebar({
            type: "PREFILL_TEXT",
            payload: { text: msg.payload.initialText }
          });
        }
      }
    } catch (e) {
      console.error('Runtime message handler error:', e);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Fallback initialization
setTimeout(initialize, 1000);

function sendAutoSearchToSidebar(text) {
  if (sidebarIframe && sidebarIframe.contentWindow) {
    sidebarIframe.contentWindow.postMessage({
      from: "content-script",
      type: "AUTO_SEARCH",
      payload: { text }
    }, "*");
  }
}