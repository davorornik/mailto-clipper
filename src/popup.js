const scanBtn = document.getElementById('scanBtn');
const emailList = document.getElementById('emailList');
const emptyState = document.getElementById('emptyState');
const statusBar = document.getElementById('statusBar');
const statusText = document.getElementById('statusText');
const toast = document.getElementById('toast');
const replaceCheck = document.getElementById('replaceCheck');

const TIMEOUT_MS = 2000;
const MAILTO_REGEX = /^mailto:([^?]+)(\?.*)?$/i;

function i18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
  });
}

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

function renderEmails(emails) {
  emailList.querySelectorAll('.email-row, .list-count').forEach(r => r.remove());

  if (!emails.length) {
    emptyState.classList.remove('hidden');
    setStatus(chrome.i18n.getMessage('no_emails'));
    return;
  }

  emptyState.classList.add('hidden');

  const countEl = document.createElement('div');
  countEl.className = 'list-count';
  countEl.textContent = `${emails.length} email${emails.length > 1 ? 's' : ''} found`;
  emailList.appendChild(countEl);

  emails.forEach(email => {
    const row = document.createElement('div');
    row.className = 'email-row';

    const avatar = document.createElement('div');
    avatar.className = 'email-avatar';
    avatar.textContent = email.charAt(0).toUpperCase();

    const addr = document.createElement('div');
    addr.className = 'email-address';
    addr.textContent = email;
    addr.title = email;

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(email).then(() => {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        showToast(`Copied: ${email}`);
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, TIMEOUT_MS);
      }).catch(() => showToast('Failed to copy.'));
    });

    row.append(avatar, addr, btn);
    emailList.appendChild(row);
  });
}

function updateBadge(emails) {
  if (emails.length) {
    chrome.action.setBadgeText({ text: emails.length > 99 ? '99+' : String(emails.length) });
    chrome.action.setBadgeBackgroundColor({ color: '#0066cc' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function extractMailtoLinks() {
  try {
    const anchors = document.querySelectorAll('a[href^="mailto:"]');
    const emails = new Set();
    anchors.forEach(a => {
      try {
        const match = a.getAttribute('href').match(MAILTO_REGEX);
        if (match && match[1]) emails.add(decodeURIComponent(match[1].trim()));
      } catch (e) {}
    });
    return Array.from(emails);
  } catch (e) {
    return [];
  }
}

function scanPage() {
  scanBtn.classList.add('scanning');
  scanBtn.textContent = chrome.i18n.getMessage('scanning') || 'Scanning…';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) {
      setStatus('Unable to access current tab.');
      scanBtn.classList.remove('scanning');
      scanBtn.textContent = chrome.i18n.getMessage('scan');
      return;
    }

    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, func: extractMailtoLinks },
      (results) => {
        scanBtn.classList.remove('scanning');
        scanBtn.textContent = chrome.i18n.getMessage('scan');

        if (chrome.runtime.lastError) {
          setStatus('Cannot scan this page (restricted URL).');
          return;
        }

        const emails = results?.[0]?.result ?? [];
        renderEmails(emails);
        updateBadge(emails);
        if (emails.length) {
          setStatus(`Found ${emails.length} unique email${emails.length > 1 ? 's' : ''}.`);
        }
      }
    );
  });
}

replaceCheck.addEventListener('change', () => {
  const value = replaceCheck.checked;
  chrome.storage.local.set({ interceptMailto: value });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabs[0]?.id && chrome.tabs.sendMessage(tabs[0].id, { action: 'updateSetting', value });
  });
});

chrome.storage.local.get('interceptMailto', (data) => {
  replaceCheck.checked = data.interceptMailto !== false;
});

i18n();
scanBtn.addEventListener('click', scanPage);
scanPage();
