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

async function copyEmail(e, link) {
  e.preventDefault();
  e.stopPropagation();

  const email = cleanMailto(link.href);

  if (email) {
    try {
      await navigator.clipboard.writeText(email);
      const originalText = link.innerText;
      link.innerText = "Copied to Clipboard!";
      setTimeout(() => link.innerText = originalText, 2000);
    } catch (err) {
      console.error('Clipboard access denied', err);
    }
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
