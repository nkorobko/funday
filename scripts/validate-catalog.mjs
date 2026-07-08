import { readFile } from "node:fs/promises";
import { validateCatalog } from "../js/logic.js";

const path = new URL("../data/activities.json", import.meta.url);
let list;
try {
  list = JSON.parse(await readFile(path, "utf8"));
} catch (e) {
  console.error(`activities.json unreadable/unparseable: ${e.message}`);
  process.exit(1);
}
const errs = validateCatalog(list);
if (errs.length) {
  console.error(`Catalog validation FAILED (${errs.length} errors):`);
  errs.forEach(e => console.error("  - " + e));
  process.exit(1);
}
console.log(`Catalog OK: ${list.length} activities.`);
