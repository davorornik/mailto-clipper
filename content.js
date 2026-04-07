/* ── Mailto Clipper — content.js ──────────────────────────── */

/**
 * Clean the mailto string.
 * Regex breakdown:
 * ^mailto:          -> Matches the start of the string
 * ([^?]+)           -> Captures everything that IS NOT a '?' (the actual email)
 * (\?.*)?           -> Matches the '?' and anything after it (optional)
 */
const cleanMailto = (href) => {
  const mailtoRegex = /^mailto:([^?]+)(\?.*)?$/i;
  const match = href.match(mailtoRegex);
  
  if (match && match[1]) {
    // decodeURIComponent handles %40 (@) and other encoded chars
    return decodeURIComponent(match[1].trim());
  }
  return null;
};

// Function to perform the copy
const copyEmail = async (e, link) => {
  e.preventDefault();
  e.stopPropagation();

  const email = cleanMailto(link.href);

  if (email) {
    try {
      await navigator.clipboard.writeText(email);
      
      // Visual feedback
      const originalText = link.innerText;
      const originalColor = link.style.color;
      
      link.innerText = "Copied to Clipboard!";
      link.style.color = "#22c55e"; // Success green
      
      setTimeout(() => {
        link.innerText = originalText;
        link.style.color = originalColor;
      }, 2000);

      // Optional: Notify the popup if it's open
      chrome.runtime.sendMessage({ action: "emailCopied", email: email }).catch(() => {
        // Ignore error if popup is closed
      });

    } catch (err) {
      console.error('Clipboard access denied', err);
    }
  }
};

/**
 * MutationObserver Logic
 * This watches for new 'mailto' links and can be used to style them 
 * or attach specific listeners if you don't want to use delegation.
 */
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(node => {
      // Check if the added node is an element
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

// Start watching the entire document
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Initial pass for existing links
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.style.cursor = 'copy';
    link.title = "Click to copy email address";
  });
}

// Global listener using the cleaning function
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="mailto:"]');
  if (link) {
    copyEmail(e, link);
  }
}, true);

// Listener for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractMailto') {
    const anchors = document.querySelectorAll('a[href^="mailto:"]');
    const emails = new Set();

    anchors.forEach(a => {
      const email = cleanMailto(a.getAttribute('href'));
      if (email) emails.add(email);
    });

    sendResponse({ emails: Array.from(emails) });
  }
  return true;
});
