const TIMEOUT_MS = 2000;
const MAILTO_REGEX = /^mailto:([^?]+)(\?.*)?$/i;

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        const mailLinks = node.matches('a[href^="mailto:"]') 
          ? [node] 
          : node.querySelectorAll('a[href^="mailto:"]');

        mailLinks.forEach(link => {
          link.style.cursor = 'copy';
          link.title = chrome.i18n.getMessage('click_to_copy');
        });
      }
    });
  }
});

function cleanMailto(href) {
  const match = href.match(MAILTO_REGEX);
  if (match && match[1]) {
    return decodeURIComponent(match[1].trim());
  }
  return null;
}

function getEmails() {
  const anchors = document.querySelectorAll('a[href^="mailto:"]');
  const emails = new Set();
  anchors.forEach(a => {
    const email = cleanMailto(a.getAttribute('href'));
    if (email) emails.add(email);
  });
  return Array.from(emails);
}

async function copyEmail(e, link) {
  const email = cleanMailto(link.href);
  if (!email) return;

  if (window.interceptMailto) {
    e.preventDefault();
    e.stopPropagation();
  }

  try {
    await navigator.clipboard.writeText(email);
    if (window.interceptMailto) {
      const originalText = link.innerText;
      link.innerText = chrome.i18n.getMessage('copied');
      setTimeout(() => link.innerText = originalText, TIMEOUT_MS);
    }
  } catch (err) {
    console.error('Clipboard access denied:', err.message);
  }
}

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
  getEmails().forEach(link => {
    link.style.cursor = 'copy';
    link.title = chrome.i18n.getMessage('click_to_copy');
  });
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="mailto:"]');
  if (link) copyEmail(e, link);
}, true);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.interceptMailto) window.interceptMailto = changes.interceptMailto.newValue;
});

chrome.storage.local.get('interceptMailto', (data) => {
  window.interceptMailto = data.interceptMailto !== false;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'updateSetting') window.interceptMailto = msg.value;
  if (msg.action === 'getEmails') {
    const emails = getEmails();
    chrome.storage.local.set({ [`cache_${location.href}`]: emails });
    return emails;
  }
});
