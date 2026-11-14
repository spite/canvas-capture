const DEFAULTS = { preserve: "always", sites: [] };
const sitesEl = document.getElementById("sites");
const statusEl = document.getElementById("status");
const radios = [...document.querySelectorAll("input[name=preserve]")];

function parseSites(text) {
  const hosts = text
    .split(/[\s,]+/)
    .map((s) => s.trim().toLowerCase())
    .map((s) => s.replace(/^\*\./, ""))
    .filter(Boolean)
    .map((s) => {
      try {
        return new URL(s.includes("://") ? s : "http://" + s).hostname.replace(/^www\./, "");
      } catch {
        return null;
      }
    })
    .filter((h) => h && /^[a-z0-9.-]+$/.test(h));
  return [...new Set(hosts)];
}

let timer;
function save() {
  const preserve = radios.find((r) => r.checked)?.value || DEFAULTS.preserve;
  const sites = parseSites(sitesEl.value);
  sitesEl.disabled = preserve !== "sites";
  chrome.storage.sync.set({ preserve, sites }).then(() => {
    statusEl.textContent = "Saved. Reload open pages to apply.";
    clearTimeout(timer);
    timer = setTimeout(() => (statusEl.textContent = ""), 3000);
  });
}

chrome.storage.sync.get(DEFAULTS).then(({ preserve, sites }) => {
  radios.forEach((r) => (r.checked = r.value === preserve));
  sitesEl.value = sites.join("\n");
  sitesEl.disabled = preserve !== "sites";
});

radios.forEach((r) => r.addEventListener("change", save));
sitesEl.addEventListener("change", save);
