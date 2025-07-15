// service worker
chrome.action.onClicked.addListener(tab => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content_script.js"]
  });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "videoUrls") {
    for (let u of msg.urls) {
      let full = new URL(u, sender.tab.url).href;
      chrome.downloads.download({ url: full });
    }
  }
});
