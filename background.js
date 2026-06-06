chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { action: "toggle-resume-autofill" });
  } catch {
    // Content scripts do not run on browser-internal pages.
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.action !== "open-options") return false;

  chrome.runtime.openOptionsPage(() => {
    sendResponse({ ok: !chrome.runtime.lastError });
  });
  return true;
});
