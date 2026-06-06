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

  const params = new URLSearchParams();
  if (message.group) params.set("group", String(message.group));
  if (message.path) params.set("path", String(message.path));

  if (params.toString()) {
    chrome.tabs.create({ url: chrome.runtime.getURL(`options.html?${params.toString()}`) }, () => {
      sendResponse({ ok: !chrome.runtime.lastError });
    });
    return true;
  }

  chrome.runtime.openOptionsPage(() => {
    sendResponse({ ok: !chrome.runtime.lastError });
  });
  return true;
});
