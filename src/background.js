function extractMailtoLinks() {
  const anchors = document.querySelectorAll('a[href^="mailto:"]');
  const emails = new Set();
  const mailtoRegex = /^mailto:([^?]+)(\?.*)?$/i;
  
  anchors.forEach(a => {
    const match = a.getAttribute('href').match(mailtoRegex);
    if (match && match[1]) {
      emails.add(decodeURIComponent(match[1].trim()));
    }
  });
  
  return Array.from(emails);
}

function updateBadge(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (!tab?.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }
    
    chrome.scripting.executeScript(
      { target: { tabId: tabId }, func: extractMailtoLinks },
      (results) => {
        const emails = results?.[0]?.result ?? [];
        if (emails.length > 0) {
          chrome.action.setBadgeText({ text: emails.length > 99 ? '99+' : String(emails.length) });
          chrome.action.setBadgeBackgroundColor({ color: '#0066cc' });
        } else {
          chrome.action.setBadgeText({ text: '' });
        }
      }
    );
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab?.active) {
    updateBadge(tabId);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadge(activeInfo.tabId);
});

chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      updateBadge(tabs[0].id);
    }
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      updateBadge(tabs[0].id);
    }
  });
});
