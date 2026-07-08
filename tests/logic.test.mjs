import test from "node:test";
import assert from "node:assert/strict";
import { annotateResults, buildBookingLinks, validateActivity, validateCatalog } from "../js/logic.js";

const A = (over = {}) => ({
  id: "a1", region: "il", name: "Escape", category: "escape_room", city: "TLV",
  currency: "ILS", price_per_person: 100, group_min: 4, group_max: 30,
  description: "d", provider: { name: "P", phone: "972501111111", email: "p@x.co" },
  ...over
});

test("annotateResults filters by category, city and group range", () => {
  const acts = [A(), A({ id: "a2", category: "food" }), A({ id: "a3", city: "JLM" }), A({ id: "a4", group_max: 10 })];
  const r = annotateResults(acts, { category: "escape_room", city: "TLV", group: 15 });
  assert.deepEqual(r.map(x => x.id), ["a1"]);
});

test("annotateResults computes totals and budget fit", () => {
  const r = annotateResults([A()], { group: 10, budget: 900 });
  assert.equal(r[0].total, 1000);
  assert.equal(r[0].inBudget, false);
  assert.equal(r[0].over, 100);
});

test("annotateResults: no group -> total null, always inBudget", () => {
  const r = annotateResults([A()], { budget: 1 });
  assert.equal(r[0].total, null);
  assert.equal(r[0].inBudget, true);
});

test("annotateResults sorts in-budget first, then ascending total", () => {
  const acts = [A({ id: "over", price_per_person: 200 }), A({ id: "cheap", price_per_person: 50 }), A({ id: "mid", price_per_person: 80 })];
  const r = annotateResults(acts, { group: 10, budget: 1000 });
  assert.deepEqual(r.map(x => x.id), ["cheap", "mid", "over"]);
  assert.equal(r[2].inBudget, false);
});

const T = {
  waMsg: (a, g, b) => `book ${a.name} g=${g} b=${b}`,
  mailSubject: a => `req ${a.name}`
};

test("buildBookingLinks builds wa.me and mailto with encoded prefill", () => {
  const { wa, mail } = buildBookingLinks(A(), { group: 12, budget: 2000 }, T);
  assert.equal(wa, "https://wa.me/972501111111?text=" + encodeURIComponent("book Escape g=12 b=2000"));
  assert.ok(mail.startsWith("mailto:p@x.co?subject=" + encodeURIComponent("req Escape")));
  assert.ok(mail.includes("&body=" + encodeURIComponent("book Escape g=12 b=2000")));
});

test("buildBookingLinks returns null for missing contact fields", () => {
  const { wa, mail } = buildBookingLinks(A({ provider: { name: "P" } }), {}, T);
  assert.equal(wa, null);
  assert.equal(mail, null);
});

test("validateActivity accepts a valid entry", () => {
  assert.deepEqual(validateActivity(A()), []);
});

test("validateActivity catches missing fields, bad region/currency, bad ranges", () => {
  assert.ok(validateActivity(A({ id: "" })).length > 0);
  assert.ok(validateActivity(A({ region: "nyc" })).length > 0);
  assert.ok(validateActivity(A({ region: "il", currency: "USD" })).length > 0);
  assert.ok(validateActivity(A({ group_min: 20, group_max: 10 })).length > 0);
  assert.ok(validateActivity(A({ price_per_person: 0 })).length > 0);
  assert.ok(validateActivity(A({ rating: 7 })).length > 0);
  assert.ok(validateActivity(A({ provider: null })).length > 0);
});

test("validateCatalog flags duplicate ids and collects entry errors", () => {
  const errs = validateCatalog([A(), A(), A({ id: "bad", region: "nyc" })]);
  assert.ok(errs.some(e => e.includes("duplicate id")));
  assert.ok(errs.some(e => e.includes("bad")));
});
