/**
 * Google Maps: when a listing is opened, the place title lives in a node with class
 * `lMbq3e` (minified; may change on Maps updates). We inject a food-inspection badge.
 * MutationObserver is required: the panel is SPA-driven and nodes are replaced when
 * switching listings or searching again.
 *
 * Injection is idempotent: we skip DOM updates when the resolved place key and grade
 * match what is already shown, so zoom-driven layout mutations do not rerender the badge.
 *
 * Place type (e.g. "Cantonese restaurant") appears on a `button.DkEaL` within the card;
 * we only show the inspection badge when that label indicates a restaurant or bar.
 */
const TARGET_CLASS = "lMbq3e";
const TYPE_BUTTON_CLASS = "DkEaL";
const BADGE_CLASS = "mhc-maps-inject";

/** Walk up from the title node to ancestors whose subtree contains the type button. */
function findPlaceTypeText(titleEl) {
  let el = titleEl.parentElement;
  while (el) {
    const btn = el.querySelector(`button.${TYPE_BUTTON_CLASS}`);
    if (btn) return btn.textContent.trim();
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

function normalizePlaceKey(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function extractPlaceKeyFromUrl(href) {
  const m = href.match(/\/place\/([^/?]+)/);
  if (!m) return "";
  try {
    return normalizePlaceKey(decodeURIComponent(m[1].replace(/\+/g, " ")));
  } catch {
    return normalizePlaceKey(m[1]);
  }
}

/** Prefer title text inside the header (stable when zoom changes URL); fall back to /place/ slug. */
function getPlaceKey(node) {
  const heading =
    node.querySelector('h1[aria-level="1"]') ||
    node.querySelector("h1") ||
    node.querySelector('[role="heading"]');
  const fromDom = heading?.textContent;
  if (fromDom) return normalizePlaceKey(fromDom);
  return extractPlaceKeyFromUrl(location.href);
}

/** Replace with a real inspection lookup (e.g. NYC Open Data) when wired up. */
function getInspectionGrade(placeKey) {
  if (!placeKey) return "—";
  const grades = ["A", "B", "C"];
  let h = 0;
  for (let i = 0; i < placeKey.length; i++) {
    h = (h + placeKey.charCodeAt(i) * (i + 1)) % 10007;
  }
  return grades[h % grades.length];
}

function ensureTitlePosition(node) {
  const pos = getComputedStyle(node).position;
  if (pos === "static") node.style.position = "relative";
}

function buildBadge(placeKey, grade) {
  const badge = document.createElement("div");
  badge.className = BADGE_CLASS;
  badge.dataset.mhcPlaceKey = placeKey;
  badge.dataset.mhcGrade = grade;
  badge.setAttribute("aria-label", `NYC food inspection grade ${grade}`);

  const region = document.createElement("span");
  region.className = `${BADGE_CLASS}__region`;
  region.textContent = "NYC";

  const letter = document.createElement("span");
  letter.className = `${BADGE_CLASS}__grade`;
  letter.textContent = grade;

  badge.append(region, letter);
  return badge;
}

function injectIntoListing(node) {
  if (!node.classList.contains(TARGET_CLASS)) return;

  const placeKey = getPlaceKey(node);
  if (!placeKey) return;

  const typeText = findPlaceTypeText(node);
  if (!typeText) return;
  if (!isRestaurantOrBarType(typeText)) {
    node.querySelector(`:scope > .${BADGE_CLASS}`)?.remove();
    return;
  }

  const grade = getInspectionGrade(placeKey);

  const existing = node.querySelector(`:scope > .${BADGE_CLASS}`);
  if (existing) {
    const samePlace = existing.dataset.mhcPlaceKey === placeKey;
    const sameGrade = existing.dataset.mhcGrade === grade;
    if (samePlace && sameGrade) return;

    if (samePlace && !sameGrade) {
      existing.dataset.mhcGrade = grade;
      const letterEl = existing.querySelector(`.${BADGE_CLASS}__grade`);
      if (letterEl) letterEl.textContent = grade;
      existing.setAttribute("aria-label", `NYC food inspection grade ${grade}`);
      return;
    }

    existing.remove();
  }

  ensureTitlePosition(node);
  node.append(buildBadge(placeKey, grade));
}

function scan(root) {
  root.querySelectorAll(`.${TARGET_CLASS}`).forEach(injectIntoListing);
}

function observe() {
  scan(document.body);

  const observer = new MutationObserver((mutations) => {
    const hosts = new Set();

    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== Node.ELEMENT_NODE) continue;
        if (n.matches?.(`.${TARGET_CLASS}`)) {
          hosts.add(n);
        }
        if (n.querySelectorAll) {
          n.querySelectorAll(`.${TARGET_CLASS}`).forEach((el) => hosts.add(el));
        }
      }

      if (m.type === "childList" && m.target instanceof HTMLElement) {
        const host = m.target.classList.contains(TARGET_CLASS)
          ? m.target
          : m.target.closest(`.${TARGET_CLASS}`);
        if (host) hosts.add(host);
      }
    }

    hosts.forEach(injectIntoListing);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.body) {
  observe();
} else {
  document.addEventListener("DOMContentLoaded", observe, { once: true });
}
