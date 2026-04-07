/* ── Mailto Clipper — popup.js ────────────────────────────── */

const scanBtn       = document.getElementById('scanBtn');
const emailList     = document.getElementById('emailList');
const emptyState    = document.getElementById('emptyState');
const statusBar     = document.getElementById('statusBar');
const statusText    = document.getElementById('statusText');
const footerActions = document.getElementById('footerActions');
const copyAllBtn    = document.getElementById('copyAllBtn');
const clearBtn      = document.getElementById('clearBtn');
const toast         = document.getElementById('toast');

let foundEmails = [];

/* ── Utilities ────────────────────────────────────────────── */

function showToast(msg, duration = 1800) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  // Force reflow so transition fires
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

/* ── Render email list ────────────────────────────────────── */

function renderEmails(emails) {
  // Remove previous rows (keep emptyState node)
  const rows = emailList.querySelectorAll('.email-row, .list-count');
  rows.forEach(r => r.remove());

  if (emails.length === 0) {
    emptyState.style.display = 'flex';
    footerActions.style.display = 'none';
    setStatus('No mailto links found on this page.');
    return;
  }

  emptyState.style.display = 'none';
  footerActions.style.display = 'flex';

  // Count label
  const countEl = document.createElement('div');
  countEl.className = 'list-count';
  countEl.textContent = `${emails.length} email${emails.length > 1 ? 's' : ''} found`;
  emailList.appendChild(countEl);

  emails.forEach((email, idx) => {
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
    btn.innerHTML = `
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
      Copy
    `;

    btn.addEventListener('click', () => {
      copyToClipboard(email).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = `
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied
        `;
        showToast(`Copied: ${email}`);
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            Copy
          `;
        }, 2000);
      }).catch(() => showToast('Failed to copy.'));
    });

    row.appendChild(avatar);
    row.appendChild(addr);
    row.appendChild(btn);
    emailList.appendChild(row);
  });
}

/* ── Scan page via content script ────────────────────────── */

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
      {
        target: { tabId: tab.id },
        func: extractMailtoLinks,
      },
      (results) => {
        resetScanBtn();

        if (chrome.runtime.lastError) {
          setStatus('Cannot scan this page (restricted URL).');
          return;
        }

        const emails = results?.[0]?.result ?? [];
        foundEmails = emails;
        renderEmails(emails);

        if (emails.length > 0) {
          setStatus(`Found ${emails.length} mailto link${emails.length > 1 ? 's' : ''}.`);
        }
      }
    );
  });
}

function resetScanBtn() {
  scanBtn.classList.remove('scanning');
  scanBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 21l-4.35-4.35"/>
      <circle cx="11" cy="11" r="8"/>
    </svg>
    Scan
  `;
}

/* ── Content script function (injected into page) ─────────── */

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

/* ── Copy All ─────────────────────────────────────────────── */

copyAllBtn.addEventListener('click', () => {
  if (foundEmails.length === 0) return;
  const text = foundEmails.join('\n');
  copyToClipboard(text).then(() => {
    showToast(`Copied ${foundEmails.length} email${foundEmails.length > 1 ? 's' : ''} to clipboard`);
    copyAllBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied!
    `;
    setTimeout(() => {
      copyAllBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        Copy All
      `;
    }, 2000);
  }).catch(() => showToast('Failed to copy.'));
});

/* ── Clear ────────────────────────────────────────────────── */

clearBtn.addEventListener('click', () => {
  foundEmails = [];
  renderEmails([]);
  statusBar.classList.add('hidden');
});

/* ── Scan on click ────────────────────────────────────────── */

scanBtn.addEventListener('click', scanPage);

/* ── Auto-scan on open ────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  scanPage();
});
