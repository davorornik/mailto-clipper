const MAILTO_REGEX = /^mailto:([^?]+)(\?.*)?$/i;

function extractMailtoLinks() {
  try {
    const anchors = document.querySelectorAll('a[href^="mailto:"]');
    if (!anchors.length) return [];
    
    const emails = new Set();
    anchors.forEach(a => {
      try {
        const match = a.getAttribute('href').match(MAILTO_REGEX);
        if (match && match[1]) {
          emails.add(decodeURIComponent(match[1].trim()));
        }
      } catch (e) {}
    });
    return Array.from(emails);
  } catch (e) {
    return [];
  }
}

const badgeApi = chrome.action || chrome.browserAction;

function updateBadge(tabId) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
      if (badgeApi) badgeApi.setBadgeText({ text: '' });
      return;
    }
    
    if (tab.id !== tabId) {
      if (badgeApi) badgeApi.setBadgeText({ text: '' });
      return;
    }
    
    chrome.scripting.executeScript(
      { target: { tabId: tabId }, func: extractMailtoLinks },
      (results) => {
        try {
          const emails = results?.[0]?.result ?? [];
          if (emails.length > 0) {
            if (badgeApi) {
              badgeApi.setBadgeText({ text: emails.length > 99 ? '99+' : String(emails.length) });
              badgeApi.setBadgeBackgroundColor({ color: '#0066cc' });
            }
          } else {
            if (badgeApi) badgeApi.setBadgeText({ text: '' });
          }
        } catch (e) {
          if (badgeApi) badgeApi.setBadgeText({ text: '' });
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
    if (tabs[0]?.id) updateBadge(tabs[0].id);
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) updateBadge(tabs[0].id);
  });
});
