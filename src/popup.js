const scanBtn = document.getElementById('scanBtn');
const emailList = document.getElementById('emailList');
const emptyState = document.getElementById('emptyState');
const statusBar = document.getElementById('statusBar');
const statusText = document.getElementById('statusText');
const toast = document.getElementById('toast');
const replaceCheck = document.getElementById('replaceCheck');

const TIMEOUT_MS = 2000;

function showToast(msg, duration = 1800) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 220);
  }, duration);
}

function setStatus(msg) {
  statusText.textContent = msg;
  statusBar.classList.remove('hidden');
}

function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

function getInitial(email) {
  return email.charAt(0).toUpperCase();
}

function renderEmails(emails) {
  const rows = emailList.querySelectorAll('.email-row, .list-count');
  rows.forEach(r => r.remove());

  if (emails.length === 0) {
    emptyState.classList.remove('hidden');
    setStatus('No mailto links found on this page.');
    return;
  }

  emptyState.classList.add('hidden');

  const countEl = document.createElement('div');
  countEl.className = 'list-count';
  countEl.textContent = `${emails.length} email${emails.length > 1 ? 's' : ''} found`;
  emailList.appendChild(countEl);

  emails.forEach((email) => {
    const row = document.createElement('div');
    row.className = 'email-row';

    const avatar = document.createElement('div');
    avatar.className = 'email-avatar';
    avatar.textContent = getInitial(email);

    const addr = document.createElement('div');
    addr.className = 'email-address';
    addr.textContent = email;
    addr.title = email;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
      copyToClipboard(email).then(() => {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        showToast(`Copied: ${email}`);
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, TIMEOUT_MS);
      }).catch(() => showToast('Failed to copy.'));
    });

    row.appendChild(avatar);
    row.appendChild(addr);
    row.appendChild(btn);
    emailList.appendChild(row);
  });
}

function updateBadge(emails) {
  if (emails.length > 0) {
    chrome.action.setBadgeText({ text: emails.length > 99 ? '99+' : String(emails.length) });
    chrome.action.setBadgeBackgroundColor({ color: '#0066cc' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function scanPage() {
  scanBtn.classList.add('scanning');
  scanBtn.textContent = 'Scanning…';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      setStatus('Unable to access current tab.');
      resetScanBtn();
      return;
    }

    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, func: extractMailtoLinks },
      (results) => {
        resetScanBtn();
        if (chrome.runtime.lastError) {
          setStatus('Cannot scan this page (restricted URL).');
          return;
        }
        const emails = results?.[0]?.result ?? [];
        renderEmails(emails);
        updateBadge(emails);
        
        if (emails.length > 0) {
          setStatus(`Found ${emails.length} unique email${emails.length > 1 ? 's' : ''}.`);
        }
      }
    );
  });
}

function resetScanBtn() {
  scanBtn.classList.remove('scanning');
  scanBtn.textContent = 'Scan';
}

function extractMailtoLinks() {
  const anchors = document.querySelectorAll('a[href^="mailto:"]');
  const emails = new Set();

  const cleanMailto = (href) => {
    const mailtoRegex = /^mailto:([^?]+)(\?.*)?$/i;
    const match = href.match(mailtoRegex);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
    return null;
  };

  anchors.forEach(a => {
    const email = cleanMailto(a.getAttribute('href'));
    if (email) emails.add(email);
  });

  return Array.from(emails);
}

replaceCheck.addEventListener('change', () => {
  const value = replaceCheck.checked;
  chrome.storage.local.set({ interceptMailto: value });
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'updateSetting', value: value });
    }
  });
});

chrome.storage.local.get('interceptMailto', (data) => {
  replaceCheck.checked = data.interceptMailto !== false;
});

scanBtn.addEventListener('click', scanPage);
scanPage();
