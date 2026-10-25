import { existsSync, readFileSync } from "fs";
import { join } from "path";

let failed = 0;
function assert(name: string, condition: boolean, detail = "") {
  if (condition) console.log(`✅ ${name}`);
  else {
    failed++;
    console.error(`❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

const readme = read("README.md");
const api = read("API.md");
const claude = read("CLAUDE.md");

console.log("=== Test 1: public docs enforce correct list field names ===");
for (const needle of ["reward_value", "reward_type", "cookie_days", "stars_count"]) {
  assert(`README/API/CLAUDE mention ${needle}`, readme.includes(needle) || api.includes(needle) || claude.includes(needle), needle);
}
assert("CLAUDE.md explicitly bans wrong field names", claude.includes("NOT: `commission_rate`, `upvotes`, `cookie_duration`"));
assert("API.md explicitly bans wrong field names", api.includes("Do not substitute `commission_rate`, `upvotes`, or `cookie_duration`"));

console.log("\n=== Test 2: public docs still point to core artifacts ===");
for (const needle of ["registry.json", "skills/{stage}/{skill-name}/SKILL.md", "tools/src/", "evals/"]) {
  assert(`README mentions ${needle}`, readme.includes(needle), needle);
}

console.log("\n=== Test 3: cross-repo contract check against local affiliate-list (if present) ===");
const listRoot = join(root, "..", "affiliate-list");
if (existsSync(listRoot)) {
  const listReadme = readFileSync(join(listRoot, "README.md"), "utf8");
  const listTypes = readFileSync(join(listRoot, "src/lib/supabase/types.ts"), "utf8");
  for (const needle of ["reward_value", "reward_type", "cookie_days", "stars_count"]) {
    assert(`affiliate-list README mentions ${needle}`, listReadme.includes(needle), needle);
    assert(`affiliate-list types mention ${needle}`, listTypes.includes(needle), needle);
  }
  assert("affiliate-list README uses afl_ prefix", listReadme.includes("afl_"));
} else {
  console.log("ℹ️ sibling affiliate-list repo not found — skipping cross-repo local check");
}

if (failed > 0) {
  console.error(`\n❌ Skills doc/contracts failed: ${failed}`);
  process.exit(1);
}
console.log("\n✅ All skills doc/contracts checks passed");
