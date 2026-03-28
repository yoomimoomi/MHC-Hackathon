/**
 * Google Maps: when a listing is opened, the place title lives in a node with class
 * `lMbq3e` (minified; may change on Maps updates). We inject once per element.
 * MutationObserver is required: the panel is SPA-driven and nodes are replaced when
 * switching listings or searching again.
 */
const TARGET_CLASS = "lMbq3e";
const INJECTED_ATTR = "data-mhc-maps-injected";

function injectIntoListing(node) {
  if (!(node instanceof HTMLElement)) return;
  if (!node.classList.contains(TARGET_CLASS)) return;
  if (node.hasAttribute(INJECTED_ATTR)) return;

  const banner = document.createElement("div");
  banner.className = "mhc-maps-inject";
  banner.textContent = "MHC extension";

  // Append so the place name (first content in this container) stays on top; use
  // prepend if you want the banner above the title.
  node.append(banner);
  node.setAttribute(INJECTED_ATTR, "true");
}

function scan(root) {
  root.querySelectorAll(`.${TARGET_CLASS}`).forEach(injectIntoListing);
}

function observe() {
  scan(document.body);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== Node.ELEMENT_NODE) continue;
        if (n.matches?.(`.${TARGET_CLASS}`)) {
          injectIntoListing(n);
        }
        if (n.querySelectorAll) {
          scan(n);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.body) {
  observe();
} else {
  document.addEventListener("DOMContentLoaded", observe, { once: true });
}
