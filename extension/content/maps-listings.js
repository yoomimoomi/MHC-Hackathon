/**
 * Google Maps: when a listing is opened, the place title lives in a node with class
 * `lMbq3e` (minified; may change on Maps updates). We inject once per element.
 * MutationObserver is required: the panel is SPA-driven and nodes are replaced when
 * switching listings or searching again.
 *
 * Place type (e.g. "French restaurant") appears on a `button.DkEaL` within the same
 * card; we only inject when that label indicates a restaurant or bar.
 */
const TARGET_CLASS = "lMbq3e";
const TYPE_BUTTON_CLASS = "DkEaL";
const INJECTED_ATTR = "data-mhc-maps-injected";

/** Walk up from the title node to the first ancestor whose subtree contains the type button. */
function findPlaceTypeText(titleEl) {
  let el = titleEl.parentElement;
  while (el) {
    const btn = el.querySelector(`button.${TYPE_BUTTON_CLASS}`);
    if (btn) return (btn.textContent || "").trim();
    el = el.parentElement;
  }
  return "";
}

function isRestaurantOrBarType(description) {
  const d = description.toLowerCase();
  if (d.includes("restaurant")) return true;
  // Word "bar" (wine bar, sports bar) — avoid substring matches like "barbecue" / "barber"
  return /\bbar\b/.test(d);
}

function injectIntoListing(node) {
  if (!(node instanceof HTMLElement)) return;
  if (!node.classList.contains(TARGET_CLASS)) return;
  if (node.hasAttribute(INJECTED_ATTR)) return;

  const typeText = findPlaceTypeText(node);
  if (!typeText || !isRestaurantOrBarType(typeText)) return;

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
