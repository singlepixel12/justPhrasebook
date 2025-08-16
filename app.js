/* Mobile-first Phrasebook app with dark glass UI using Tailwind CDN */

const supportedLanguages = (window.PHRASES_DATA && window.PHRASES_DATA.supportedLanguages) || [];
const phrases = (window.PHRASES_DATA && window.PHRASES_DATA.phrases) || [];

const state = {
  targetLanguage: localStorage.getItem("targetLanguage") || supportedLanguages[0].code,
  showPolite: localStorage.getItem("showPolite") === "1", // default off (casual only)
  dropdownOpen: false,
};

// Minimal IndexedDB helpers (phrases + UI state)
function dbp(name = "phrasebook", version = 1) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("phrases")) {
        db.createObjectStore("phrases", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("state")) {
        db.createObjectStore("state", { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbPut(store, value) {
  const db = await dbp();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(store, key) {
  const db = await dbp();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(store) {
  const db = await dbp();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function setTargetLanguage(code) {
  state.targetLanguage = code;
  localStorage.setItem("targetLanguage", code);
  state.dropdownOpen = false;
  // Persist UI state to IndexedDB
  saveState({ targetLanguage: code, showPolite: state.showPolite }).catch(() => {});
  render();
}

function getLanguageLabel(code) {
  const lang = supportedLanguages.find((l) => l.code === code);
  return lang ? lang.label : code;
}

function togglePolite() {
  state.showPolite = !state.showPolite;
  localStorage.setItem("showPolite", state.showPolite ? "1" : "0");
  // Persist UI state to IndexedDB
  saveState({ targetLanguage: state.targetLanguage, showPolite: state.showPolite }).catch(() => {});
  render();
}

function createHeader() {
  const header = document.createElement("header");
  header.className = [
    "sticky top-0 z-10",
    "backdrop-blur-xl",
    "bg-white/5",
    "border-b border-white/10",
  ].join(" ");

  const inner = document.createElement("div");
  inner.className = "max-w-md mx-auto px-4 py-3 flex items-center gap-3";

  const title = document.createElement("h1");
  title.className = "text-lg font-semibold tracking-tight text-slate-100";
  title.textContent = "Phrasebook";

  const spacer = document.createElement("div");
  spacer.className = "flex-1";

  // Custom dropdown (glass)
  const ddWrap = document.createElement("div");
  ddWrap.className = "relative";

  const ddBtn = document.createElement("button");
  ddBtn.type = "button";
  ddBtn.className = [
    "flex items-center gap-2",
    "rounded-xl px-3 py-2",
    "bg-white/10",
    "ring-1 ring-white/15",
    "text-sm text-slate-100",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
    "hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400/40",
  ].join(" ");
  ddBtn.setAttribute("aria-haspopup", "listbox");
  ddBtn.setAttribute("aria-expanded", String(state.dropdownOpen));

  const ddLabel = document.createElement("span");
  ddLabel.textContent = getLanguageLabel(state.targetLanguage);

  const ddIcon = document.createElement("span");
  ddIcon.className = "text-slate-300 transition-transform " + (state.dropdownOpen ? "rotate-180" : "rotate-0");
  ddIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
      <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd" />
    </svg>
  `;

  ddBtn.addEventListener("click", () => {
    state.dropdownOpen = !state.dropdownOpen;
    render();
  });

  const ddMenu = document.createElement("div");
  ddMenu.className = [
    "absolute right-0 mt-2 w-40 p-1",
    "rounded-xl backdrop-blur-xl",
    "bg-white/10 ring-1 ring-white/15 shadow-lg shadow-black/30",
    state.dropdownOpen ? "block" : "hidden",
  ].join(" ");

  supportedLanguages.forEach(({ code, label }) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = [
      "w-full text-left px-3 py-2 rounded-lg",
      "text-sm",
      code === state.targetLanguage ? "bg-white/15 text-slate-50" : "text-slate-200 hover:bg-white/10",
    ].join(" ");
    item.textContent = label;
    item.addEventListener("click", () => setTargetLanguage(code));
    ddMenu.appendChild(item);
  });

  ddBtn.appendChild(ddLabel);
  ddBtn.appendChild(ddIcon);
  ddWrap.appendChild(ddBtn);
  ddWrap.appendChild(ddMenu);

  // Single toggle for Polite variant
  const politeBtn = document.createElement("button");
  politeBtn.type = "button";
  politeBtn.className = [
    "rounded-xl px-3 py-2",
    "bg-white/10 ring-1 ring-white/15",
    state.showPolite
      ? "bg-white/20 text-slate-50 ring-white/25 shadow-inner translate-y-[1px]"
      : "text-slate-200 hover:bg-white/15",
    "text-xs",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/40",
  ].join(" ");
  politeBtn.setAttribute("aria-pressed", String(state.showPolite));
  politeBtn.textContent = "Polite";
  politeBtn.addEventListener("click", togglePolite);

  inner.appendChild(title);
  inner.appendChild(spacer);
  inner.appendChild(politeBtn);
  inner.appendChild(ddWrap);
  header.appendChild(inner);
  
  // Close when clicking outside
  setTimeout(() => {
    document.addEventListener(
      "click",
      (evt) => {
        if (!ddWrap.contains(evt.target)) {
          if (state.dropdownOpen) {
            state.dropdownOpen = false;
            render();
          }
        }
      },
      { once: true }
    );
  }, 0);

  return header;
}

function getPronunciation(phrase, lang, polite = false) {
  const styleSuffix = polite ? "PronPolite" : "PronCasual";
  const genericKey = lang + "Pron";
  const styledKey = lang + styleSuffix;
  return phrase[styledKey] || phrase[genericKey] || "";
}

function createPhraseItem(phrase) {
  const card = document.createElement("article");
  card.className = [
    "group",
    "rounded-2xl",
    "p-4",
    "bg-gradient-to-b from-white/10 to-white/5",
    "backdrop-blur-xl",
    "ring-1 ring-white/15",
    "shadow-lg shadow-black/30",
    "hover:ring-white/25 transition",
  ].join(" ");

  // English label
  const english = document.createElement("div");
  english.className = "text-xs uppercase tracking-wide text-slate-300/80";
  english.textContent = phrase.en;

  // Pronunciation as large syllable chips
  const pronStr = getPronunciation(phrase, state.targetLanguage, false);
  const pronRow = document.createElement("div");
  pronRow.className = "mt-1 flex flex-wrap items-center gap-1.5";

  tokenizePronunciation(pronStr).forEach((token) => {
    const span = document.createElement("span");
    if (token === "/") {
      span.className = "px-1 text-slate-400";
      span.textContent = "/";
    } else if (token === "?") {
      span.className = "px-1 text-slate-400";
      span.textContent = "?";
    } else if (token === "!") {
      span.className = "px-1 text-slate-400";
      span.textContent = "!";
    } else if (token === ",") {
      span.className = "px-1 text-slate-400";
      span.textContent = ",";
    } else {
      span.className = [
        "text-xl leading-tight",
        "px-1.5 py-0.5",
        "rounded-lg",
        "bg-white/10 ring-1 ring-white/15",
        "shadow-sm shadow-black/20",
        "text-slate-50",
      ].join(" ");
      span.textContent = token;
    }
    pronRow.appendChild(span);
  });

  // Target script (smaller subtitle)
  const target = document.createElement("div");
  target.className = "mt-2 text-sm text-slate-300/90";
  const mainTargetText = getTargetText(phrase, false);
  target.textContent = mainTargetText;

  // Optional polite row
  if (state.showPolite && hasPoliteVariant(phrase)) {
    const divider = document.createElement("div");
    divider.className = "mt-3 h-px bg-white/10";

    const politeLabel = document.createElement("div");
    politeLabel.className = "mt-2 text-[10px] uppercase tracking-wide text-slate-400";
    politeLabel.textContent = "Polite";

    const politePronRow = document.createElement("div");
    politePronRow.className = "mt-1 flex flex-wrap items-center gap-1.5";
    tokenizePronunciation(getPronunciation(phrase, state.targetLanguage, true)).forEach((token) => {
      const span = document.createElement("span");
      if (["/", "?", "!", ","].includes(token)) {
        span.className = "px-1 text-slate-400";
        span.textContent = token;
      } else {
        span.className = [
          "text-base leading-tight",
          "px-1.5 py-0.5",
          "rounded-lg",
          "bg-white/10 ring-1 ring-white/15",
          "shadow-sm shadow-black/20",
          "text-slate-50",
        ].join(" ");
        span.textContent = token;
      }
      politePronRow.appendChild(span);
    });

    const politeTarget = document.createElement("div");
    politeTarget.className = "mt-2 text-sm text-slate-300/90";
    politeTarget.textContent = getTargetText(phrase, true);

    card.appendChild(divider);
    card.appendChild(politeLabel);
    card.appendChild(politePronRow);
    card.appendChild(politeTarget);
  }

  card.appendChild(english);
  card.appendChild(pronRow);
  card.appendChild(target);
  return card;
}

function tokenizePronunciation(pron) {
  // Normalize spacing around separators to split reliably
  const normalized = pron
    .replace(/\//g, " / ")
    .replace(/\?/g, " ? ")
    .replace(/!/g, " ! ")
    .replace(/,/g, " , ")
    .replace(/\s+/g, " ")
    .trim();
  const words = normalized.split(" ");
  const tokens = [];
  words.forEach((w) => {
    if (["/", "?", "!", ","].includes(w)) {
      tokens.push(w);
    } else {
      // Split hyphenated syllables, keep as individual tokens
      w.split("-").forEach((syll, idx) => {
        if (syll) tokens.push(syll);
      });
    }
  });
  return tokens;
}

function getTargetText(phrase, polite = false) {
  const lang = state.targetLanguage;
  const styleSuffix = polite ? "Polite" : "Casual";
  const generic = phrase[lang];
  const styled = phrase[lang + styleSuffix];
  return styled || generic || "—";
}

function hasPoliteVariant(phrase) {
  const lang = state.targetLanguage;
  return Boolean(phrase[lang + "Polite"]) || Boolean(phrase[lang + "PronPolite"]);
}

function createList() {
  const container = document.createElement("section");
  container.className = "px-4 pb-24 max-w-md mx-auto";

  const grid = document.createElement("div");
  grid.className = "mt-4 grid grid-cols-1 gap-3";

  phrases.forEach((p) => grid.appendChild(createPhraseItem(p)));
  container.appendChild(grid);
  return container;
}

function render() {
  const root = document.getElementById("app");
  root.innerHTML = "";

  // Decorative background resembling liquid glass lighting
  root.className = "relative max-w-md mx-auto p-4";
  root.innerHTML = `
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[28rem] rounded-full bg-blue-500/20 blur-3xl"></div>
      <div class="absolute -bottom-24 right-1/3 h-64 w-[24rem] rounded-full bg-fuchsia-500/10 blur-3xl"></div>
    </div>
  `;

  const header = createHeader();
  const list = createList();
  const footer = createFooter();

  root.appendChild(header);
  root.appendChild(list);
  root.appendChild(footer);
  // Ensure connection status reflects current network state
  updateConnectionBadge();
}

function createFooter() {
  const footer = document.createElement("footer");
  footer.id = "connection-footer";
  footer.className = "pointer-events-none mt-12 mb-10 flex justify-center";

  const badge = document.createElement("div");
  badge.className = [
    "flex items-center gap-2",
    "rounded-full px-3 py-1.5",
    "bg-white/10 backdrop-blur-xl",
    "ring-1 ring-white/15",
    "shadow-lg shadow-black/30",
    "text-xs text-slate-200",
  ].join(" ");

  const icon = document.createElement("span");
  icon.id = "connection-badge-dot";
  icon.className = "inline-block h-2 w-2 rounded-full";

  const label = document.createElement("span");
  label.id = "connection-badge-text";
  label.textContent = "";

  badge.appendChild(icon);
  badge.appendChild(label);
  footer.appendChild(badge);
  return footer;
}

function updateConnectionBadge() {
  const isOffline = !navigator.onLine;
  const dot = document.getElementById("connection-badge-dot");
  const text = document.getElementById("connection-badge-text");
  if (!dot || !text) return;
  if (isOffline) {
    dot.className = "inline-block h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.3)]";
    text.textContent = "Offline mode";
  } else {
    dot.className = "inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]";
    text.textContent = "Online";
  }
}

// Persist and restore UI state
async function saveState(partial) {
  const existing = (await idbGet("state", "ui"))?.value || {};
  await idbPut("state", { key: "ui", value: { ...existing, ...partial } });
}

async function restoreState() {
  try {
    const s = await idbGet("state", "ui");
    if (s && s.value) {
      applyUiState(s.value);
    }
  } catch (_) {
    // ignore
  }
}

function applyUiState(uiv) {
  if (typeof uiv.targetLanguage === "string") {
    state.targetLanguage = uiv.targetLanguage;
    localStorage.setItem("targetLanguage", uiv.targetLanguage);
  }
  if (typeof uiv.showPolite === "boolean") {
    state.showPolite = uiv.showPolite;
    localStorage.setItem("showPolite", uiv.showPolite ? "1" : "0");
  }
}

function readCurrentUiState() {
  return { targetLanguage: state.targetLanguage, showPolite: state.showPolite };
}

// Store phrases into IndexedDB for offline resilience
async function persistPhrases() {
  try {
    if (Array.isArray(phrases) && phrases.length) {
      await Promise.all(phrases.map((p) => idbPut("phrases", { ...p })));
    }
  } catch (_) {
    // ignore
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveState(readCurrentUiState()).catch(() => {});
  } else if (document.visibilityState === "visible") {
    restoreState().then(() => {
      render();
    }).catch(() => {});
  }
});

async function init() {
  // Register Service Worker and request persistent storage
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch (_) {
      // ignore
    }
    if (navigator.storage && navigator.storage.persist) {
      try {
        navigator.storage.persist();
      } catch (_) {
        // ignore
      }
    }
  }

  // Restore UI state, persist phrases, then render
  await restoreState();
  await persistPhrases();
  render();

  // Live connectivity updates without full re-render
  window.addEventListener("online", updateConnectionBadge);
  window.addEventListener("offline", updateConnectionBadge);
}

document.addEventListener("DOMContentLoaded", init);

