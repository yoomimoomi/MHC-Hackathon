// lMbq3e = listing title node, DkEaL = place type button (minified Maps classes)
const TARGET_CLASS = "lMbq3e";
const TYPE_BUTTON_CLASS = "DkEaL";
const INJECTED_ATTR = "data-mhc-maps-injected";

function findPlaceTypeText(titleEl) {
  let el = titleEl.parentElement;
  while (el) {
    const btn = el.querySelector(`button.${TYPE_BUTTON_CLASS}`);
    if (btn) return btn.textContent.trim();
    el = el.parentElement;
  }
  return "";
}

function isRestaurantOrBar(type) {
  const t = type.toLowerCase();
  return t.includes("restaurant") || /\bbar\b/.test(t);
}

function injectIntoListing(node) {
  if (!node.classList.contains(TARGET_CLASS)) return;
  if (node.hasAttribute(INJECTED_ATTR)) return;

  const typeText = findPlaceTypeText(node);
  if (!typeText || !isRestaurantOrBar(typeText)) return;

  const banner = document.createElement("div");
  banner.className = "mhc-maps-inject";
  banner.textContent = "MHC extension";
  node.append(banner);
  node.setAttribute(INJECTED_ATTR, "true");
}

function scan(root) {
  root.querySelectorAll(`.${TARGET_CLASS}`).forEach(injectIntoListing);
}

function observe() {
  scan(document.body);

  new MutationObserver((mutations) => {
    for (const { addedNodes } of mutations) {
      for (const n of addedNodes) {
        if (n.nodeType !== Node.ELEMENT_NODE) continue;
        if (n.matches(`.${TARGET_CLASS}`)) injectIntoListing(n);
        else scan(n);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

if (document.body) {
  observe();
} else {
  document.addEventListener("DOMContentLoaded", observe, { once: true });
}
