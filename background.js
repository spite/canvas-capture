const DEFAULTS = { preserve: "always", sites: [] };
const BADGE_MS = 4000;

function inject(tabId, allFrames) {
  return chrome.scripting.executeScript({
    target: { tabId, allFrames },
    world: "MAIN",
    files: ["snap.js"],
  });
}

function badge(tabId, text, color) {
  chrome.action.setBadgeBackgroundColor({ tabId, color });
  chrome.action.setBadgeText({ tabId, text });
  setTimeout(() => chrome.action.setBadgeText({ tabId, text: "" }), BADGE_MS);
}

function baseName(tabUrl) {
  let host = "";
  try {
    host = new URL(tabUrl).hostname;
  } catch {}
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const stamp =
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return `${(host || "canvas").replace(/[^\w.-]/g, "_")}-${stamp}`;
}

chrome.action.onClicked.addListener(async (tab) => {
  let results;
  try {
    results = await inject(tab.id, true);
  } catch {
    // A frame the extension can't access fails the whole call, so retry with just the top frame.
    try {
      results = await inject(tab.id, false);
    } catch (error) {
      console.error("CanvasCapture: could not inject into tab:", error);
      badge(tab.id, "!", "#c62828");
      return;
    }
  }

  const images = results.flatMap((r) => r.result || []);
  const base = baseName(tab.url);
  let saved = 0;
  for (const [i, url] of images.entries()) {
    const filename = images.length > 1 ? `${base}-${i + 1}.png` : `${base}.png`;
    try {
      await chrome.downloads.download({ url, filename, conflictAction: "uniquify" });
      saved++;
    } catch (error) {
      console.error("CanvasCapture: download failed:", error);
    }
  }
  badge(tab.id, String(saved), saved ? "#2e7d32" : "#c62828");
});

function preserveMatches({ preserve, sites }) {
  if (preserve === "always") return ["<all_urls>"];
  if (preserve === "sites") return sites.flatMap((h) => [`*://${h}/*`, `*://*.${h}/*`]);
  return [];
}

async function syncPreserve() {
  const settings = await chrome.storage.sync.get(DEFAULTS);
  await chrome.scripting.unregisterContentScripts({ ids: ["preserve"] }).catch(() => {});
  const matches = preserveMatches(settings);
  if (!matches.length) return;
  await chrome.scripting.registerContentScripts([
    {
      id: "preserve",
      js: ["preserve.js"],
      matches,
      runAt: "document_start",
      allFrames: true,
      matchOriginAsFallback: true,
      world: "MAIN",
    },
  ]);
}

// Serialized so quick successive setting changes can't race on the script id.
let syncing = Promise.resolve();
const queueSync = () => {
  syncing = syncing.then(syncPreserve).catch((e) => console.error("CanvasCapture: sync failed:", e));
};

chrome.runtime.onInstalled.addListener(queueSync);
chrome.runtime.onStartup.addListener(queueSync);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && ("preserve" in changes || "sites" in changes)) queueSync();
});
