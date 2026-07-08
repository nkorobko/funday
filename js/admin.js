// Catalog admin: draft entries client-side, validate with the same rules as CI,
// download the merged activities.json for a git commit. No write-backend.
import { validateActivity } from "./logic.js";
import { CATEGORY_NAMES } from "./i18n.js";

let catalog = [];
const drafts = [];
const $ = id => document.getElementById(id);

$("category").innerHTML = Object.keys(CATEGORY_NAMES)
  .map(k => `<option value="${k}">${k} — ${CATEGORY_NAMES[k].en}</option>`).join("");

try {
  const res = await fetch("data/activities.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  catalog = await res.json();
} catch (e) {
  $("adminErrors").style.display = "";
  $("adminErrors").textContent = `Could not load current catalog (${e.message}) — drafts will produce a standalone file.`;
}
refresh();

function entryFromForm() {
  const v = id => $(id).value.trim();
  const num = id => ($(id).value === "" ? undefined : Number($(id).value));
  const e = {
    id: v("id"), region: v("region"), name: v("name"), category: v("category"),
    city: v("city"), currency: v("region") === "il" ? "ILS" : "USD",
    price_per_person: num("price_per_person"), group_min: num("group_min"), group_max: num("group_max"),
    description: v("description"),
    provider: { name: v("provider_name") }
  };
  if (num("rating") !== undefined) e.rating = num("rating");
  if (v("link")) e.link = v("link");
  if (v("reviews_link")) e.reviews_link = v("reviews_link");
  if (v("provider_phone")) e.provider.phone = v("provider_phone");
  if (v("provider_email")) e.provider.email = v("provider_email");
  return e;
}

$("addBtn").onclick = () => {
  const entry = entryFromForm();
  const errs = validateActivity(entry);
  if (catalog.concat(drafts).some(a => a.id === entry.id)) errs.push(`duplicate id: ${entry.id}`);
  $("adminErrors").style.display = errs.length ? "" : "none";
  $("adminErrors").innerHTML = errs.map(e => `• ${e}`).join("<br>");
  if (errs.length) return;
  drafts.push(entry);
  document.querySelectorAll("#form input, #form textarea").forEach(el => { el.value = ""; });
  refresh();
};

function refresh() {
  $("draftCount").textContent = `${drafts.length} draft(s) · catalog ${catalog.length}`;
  $("jsonPreview").value = JSON.stringify(catalog.concat(drafts), null, 2);
}

$("downloadBtn").onclick = () => {
  const blob = new Blob([$("jsonPreview").value + "\n"], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "activities.json";
  a.click();
  URL.revokeObjectURL(a.href);
};
