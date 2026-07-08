// Pure logic — no DOM access. Tested by tests/logic.test.mjs and reused
// by app.js, admin.js and scripts/validate-catalog.mjs.

export function annotateResults(activities, { category = "", city = "", budget = 0, group = 0 } = {}) {
  return activities
    .filter(a =>
      (!category || a.category === category) &&
      (!city || a.city === city) &&
      (!group || (group >= a.group_min && group <= a.group_max)))
    .map(a => {
      const total = group ? a.price_per_person * group : null;
      const over = (budget && total) ? Math.max(0, total - budget) : 0;
      return { ...a, total, over, inBudget: !budget || !total || total <= budget };
    })
    .sort((x, y) => (x.inBudget === y.inBudget)
      ? (x.total ?? x.price_per_person) - (y.total ?? y.price_per_person)
      : (x.inBudget ? -1 : 1));
}

export function buildBookingLinks(activity, { group = 0, budget = 0 } = {}, t) {
  const msg = encodeURIComponent(t.waMsg(activity, group, budget));
  const phone = activity.provider?.phone;
  const email = activity.provider?.email;
  return {
    wa: phone ? `https://wa.me/${phone}?text=${msg}` : null,
    mail: email ? `mailto:${email}?subject=${encodeURIComponent(t.mailSubject(activity))}&body=${msg}` : null
  };
}

const REGIONS = { il: "ILS", dallas: "USD" };

export function validateActivity(a) {
  const errs = [];
  if (!a || typeof a !== "object") return ["entry is not an object"];
  const str = f => typeof a[f] === "string" && a[f].trim().length > 0;
  for (const f of ["id", "name", "category", "city", "description"]) {
    if (!str(f)) errs.push(`missing/empty string field: ${f}`);
  }
  if (!(a.region in REGIONS)) errs.push(`unknown region: ${a.region}`);
  else if (a.currency !== REGIONS[a.region]) errs.push(`currency ${a.currency} does not match region ${a.region}`);
  if (!Number.isInteger(a.price_per_person) || a.price_per_person <= 0) errs.push("price_per_person must be a positive integer");
  if (!Number.isInteger(a.group_min) || a.group_min < 1) errs.push("group_min must be an integer >= 1");
  if (!Number.isInteger(a.group_max) || a.group_max < a.group_min) errs.push("group_max must be an integer >= group_min");
  if (a.rating !== undefined && !(typeof a.rating === "number" && a.rating >= 1 && a.rating <= 5)) errs.push("rating must be a number 1..5");
  if (!a.provider || typeof a.provider !== "object" || !(typeof a.provider.name === "string" && a.provider.name.trim())) {
    errs.push("provider.name is required");
  } else {
    if (a.provider.phone !== undefined && !/^\d{8,15}$/.test(a.provider.phone)) errs.push("provider.phone must be 8-15 digits (E.164, no +)");
    if (a.provider.email !== undefined && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.provider.email)) errs.push("provider.email is not a valid email");
  }
  return errs;
}

export function validateCatalog(list) {
  if (!Array.isArray(list)) return ["catalog is not an array"];
  const errs = [];
  const seen = new Set();
  list.forEach((a, i) => {
    const id = a?.id ?? `#${i}`;
    if (a?.id) {
      if (seen.has(a.id)) errs.push(`duplicate id: ${a.id}`);
      seen.add(a.id);
    }
    validateActivity(a).forEach(e => errs.push(`[${id}] ${e}`));
  });
  return errs;
}
