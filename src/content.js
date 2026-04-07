window.browser = (function () {
  return window.msBrowser || window.browser || window.chrome;
})();

function cleanMailto(href) {
  const mailtoRegex = /^mailto:([^?]+)(\?.*)?$/i;
  const match = href.match(mailtoRegex);
  if (match && match[1]) {
    return decodeURIComponent(match[1].trim());
  }
  return null;
}

const TIMEOUT_MS = 2000;

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
    console.error('Clipboard access denied', err);
  }
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        const mailLinks = node.matches('a[href^="mailto:"]') 
          ? [node] 
          : node.querySelectorAll('a[href^="mailto:"]');

        mailLinks.forEach(link => {
          link.style.cursor = 'copy';
          link.title = "Click to copy email address";
        });
      }
    });
  }
});

if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="mailto:"]');
  if (link) {
    copyEmail(e, link);
  }
}, true);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.interceptMailto) window.interceptMailto = changes.interceptMailto.newValue;
});

chrome.storage.local.get('interceptMailto', (data) => {
  window.interceptMailto = data.interceptMailto === false ? false : true;
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'updateSetting') {
    window.interceptMailto = msg.value;
  }
});
