// DOM wiring for index.html. All pure logic lives in logic.js; strings in i18n.js.
import { annotateResults, buildBookingLinks, validateActivity } from "./logic.js";
import { I18N, CATEGORY_NAMES, REGION_LANG } from "./i18n.js";

let ACTIVITIES = [];
let region = localStorage.getItem("funday_region") || "il";
let T = I18N[REGION_LANG[region]];

const $ = id => document.getElementById(id);
const fmt = n => T.currency + n.toLocaleString(T.locale);
const catName = c => (CATEGORY_NAMES[c] || {})[T.lang] || c;
const regionData = () => ACTIVITIES.filter(a => a.region === region);

async function loadCatalog() {
  $("loadError").style.display = "none";
  try {
    const res = await fetch("data/activities.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    ACTIVITIES = raw.filter(a => {
      const errs = validateActivity(a);
      if (errs.length) console.warn(`Skipping invalid catalog entry ${a?.id ?? "?"}:`, errs);
      return errs.length === 0;
    });
    $("resultsSection").style.display = "";
    applyLocale();
    renderSaved();
    search();
  } catch (e) {
    console.warn("Catalog load failed:", e);
    $("resultsSection").style.display = "none";
    $("loadError").style.display = "";
    $("loadErrorMsg").textContent = T.loadError;
    $("retryBtn").textContent = T.retry;
  }
}

function applyLocale() {
  T = I18N[REGION_LANG[region]];
  document.documentElement.lang = T.lang;
  document.documentElement.dir = T.dir;
  document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = T[el.dataset.i18n]; });
  $("tagline").textContent = T.tagline;
  $("footerNote").textContent = T.footerNote;
  $("budget").placeholder = T.budgetPh;
  $("group").placeholder = T.groupPh;
  document.querySelectorAll("#regionSwitch button").forEach(b => b.classList.toggle("active", b.dataset.region === region));
  const data = regionData();
  $("category").innerHTML = `<option value="">${T.all}</option>` +
    [...new Set(data.map(a => a.category))].map(c => `<option value="${c}">${catName(c)}</option>`).join("");
  $("city").innerHTML = `<option value="">${T.all}</option>` +
    [...new Set(data.map(a => a.city))].map(c => `<option value="${c}">${c}</option>`).join("");
}

document.querySelectorAll("#regionSwitch button").forEach(b => b.onclick = () => {
  region = b.dataset.region;
  localStorage.setItem("funday_region", region);
  $("budget").value = "";
  $("group").value = "";
  applyLocale();
  renderSaved();
  search();
});

function getSaved() { try { return JSON.parse(localStorage.getItem("funday_saved_v2") || "[]"); } catch { return []; } }
function setSaved(v) { localStorage.setItem("funday_saved_v2", JSON.stringify(v)); renderSaved(); }

function stars(r) { return r ? `<span class="stars">★ ${r.toFixed(1)}</span>` : ""; }

function search() {
  const budget = parseInt($("budget").value) || 0;
  const group = parseInt($("group").value) || 0;
  const list = annotateResults(regionData(), {
    category: $("category").value,
    city: $("city").value,
    budget, group
  });

  const saved = new Set(getSaved().map(s => s.id));
  $("resultCount").textContent = list.length ? T.found(list.length) : "";
  $("results").innerHTML = list.length ? list.map(a => `
    <div class="card activity">
      <div class="top">
        <div>
          <h3>${a.name}</h3>
          <div class="city">📍 ${a.city} &nbsp;${stars(a.rating)}</div>
        </div>
        ${a.total !== null && budget ? (a.inBudget
          ? `<span class="badge ok">${T.inBudget}</span>`
          : `<span class="badge over">${T.overBy(fmt(a.over))}</span>`) : ""}
      </div>
      <div class="desc">${a.description}</div>
      <div class="meta">
        <span class="chip">${catName(a.category)}</span>
        <span class="chip">${fmt(a.price_per_person)} ${T.perPerson}</span>
        <span class="chip">${a.group_min}–${a.group_max} ${T.participants}</span>
      </div>
      ${a.total !== null ? `<div class="total">${T.groupTotal}: ${fmt(a.total)}</div>` : ""}
      <div class="actions">
        <button class="details" data-id="${a.id}">${T.details}</button>
        <button class="save ${saved.has(a.id) ? "saved" : ""}" data-id="${a.id}">${saved.has(a.id) ? T.saved : T.save}</button>
      </div>
    </div>`).join("")
    : `<div class="empty" style="grid-column:1/-1">${T.noResults}</div>`;

  document.querySelectorAll(".save").forEach(b => b.onclick = () => toggleSave(b.dataset.id));
  document.querySelectorAll(".details").forEach(b => b.onclick = () => openModal(b.dataset.id));
}

function toggleSave(id) {
  const a = ACTIVITIES.find(x => x.id === id);
  let saved = getSaved();
  if (saved.some(s => s.id === id)) saved = saved.filter(s => s.id !== id);
  else saved.push({ id, region: a.region, name: a.name, city: a.city, group: $("group").value, budget: $("budget").value, price: a.price_per_person });
  setSaved(saved);
  search();
}

function renderSaved() {
  const saved = getSaved().filter(s => s.region === region);
  $("savedSection").style.display = saved.length ? "" : "none";
  $("savedList").innerHTML = saved.map(s => `
    <div class="saved-item">
      <div>
        <strong>${s.name}</strong> — ${s.city}
        <div class="ctx">${s.group ? T.groupOf(s.group) + " · " : ""}${s.budget ? T.budgetCtx(fmt(+s.budget)) + " · " : ""}${fmt(s.price)} ${T.perPerson}</div>
      </div>
      <button onclick='removeSaved("${s.id}")'>${T.remove}</button>
    </div>`).join("");
}
function removeSaved(id) { setSaved(getSaved().filter(s => s.id !== id)); search(); }
window.removeSaved = removeSaved; // used from inline onclick in saved items

function openModal(id) {
  const a = ACTIVITIES.find(x => x.id === id);
  const group = parseInt($("group").value) || 0;
  const budget = parseInt($("budget").value) || 0;
  const { wa, mail } = buildBookingLinks(a, { group, budget }, T);

  $("modal").innerHTML = `
    <button class="close" id="modalClose">✕</button>
    <h3>${a.name}</h3>
    <div class="sub">📍 ${a.city} &nbsp;·&nbsp; ${catName(a.category)} &nbsp;·&nbsp; ${stars(a.rating)}</div>
    <div class="desc">${a.description}</div>
    <div class="info-row"><span class="k">${T.provider}</span><strong>${a.provider.name}</strong></div>
    <div class="info-row"><span class="k">${T.priceLbl}</span><strong>${fmt(a.price_per_person)} ${T.perPerson}</strong></div>
    <div class="info-row"><span class="k">${T.groupRange}</span><strong>${a.group_min}–${a.group_max} ${T.participants}</strong></div>
    ${group ? `<div class="info-row"><span class="k">${T.groupTotal}</span><strong>${fmt(a.price_per_person * group)}</strong></div>` : ""}
    <div class="links">
      ${a.link ? `<a href="${a.link}" target="_blank" rel="noopener">${T.website}</a>` : ""}
      ${a.reviews_link ? `<a href="${a.reviews_link}" target="_blank" rel="noopener">${T.reviews}</a>` : ""}
    </div>
    <div class="cta">
      ${wa ? `<a class="wa" href="${wa}" target="_blank" rel="noopener">${T.bookWa}</a>` : ""}
      ${mail ? `<a class="mail" href="${mail}">${T.bookMail}</a>` : ""}
    </div>
    <div class="cta-note">${T.ctaNote}</div>`;
  $("modalClose").onclick = closeModal;
  $("overlay").classList.add("open");
}
function closeModal() { $("overlay").classList.remove("open"); }
$("overlay").onclick = e => { if (e.target === $("overlay")) closeModal(); };

$("searchForm").onsubmit = e => { e.preventDefault(); search(); };
$("retryBtn").onclick = loadCatalog;

applyLocale();
renderSaved();
loadCatalog();
