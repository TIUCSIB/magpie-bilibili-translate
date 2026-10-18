// add-icon.mjs - inline icon.svg into package.json as a base64 data URI (magpie.icon)
// Node reads/writes UTF-8 natively, so the system ANSI codepage can never corrupt it.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const svg = readFileSync(join(here, "icon.svg"), "utf8").replace(/\r?\n\s*/g, " ").trim();
const icon = "data:image/svg+xml;base64," + Buffer.from(svg, "utf8").toString("base64");

const pkgPath = join(here, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.magpie ??= {};
pkg.magpie.maxConcurrency ??= 4;
pkg.magpie.icon = icon;
pkg.repository ??= { type: "git", url: "https://github.com/TIUCSIB/magpie-biliTranslate.git" };
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

const check = JSON.parse(readFileSync(pkgPath, "utf8"));
console.log("ICON_OK", check.magpie.icon.startsWith("data:image/svg+xml;base64,"), "len:", check.magpie.icon.length);
