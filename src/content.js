window.browser = (function () {
  return window.msBrowser || window.browser || window.chrome;
})();

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
      link.innerText = "Copied to Clipboard!";
      setTimeout(() => link.innerText = originalText, 2000);
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
          // You could add a 'copy' class or icon here
          link.style.cursor = 'copy';
          link.title = "Click to copy email address";
        });
      }
    });
  }
});

// Start watching the entire document
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Global listener using the cleaning function
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="mailto:"]');
  if (link) {
    copyEmail(e, link);
  }
}, true);