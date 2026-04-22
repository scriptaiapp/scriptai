#!/usr/bin/env node
/**
 * Usage: pnpm release <version>
 *   e.g. pnpm release 1.0.1
 *
 * - Validates semver input.
 * - Bumps "version" in root package.json + apps/web + apps/api to keep them in lockstep.
 * - Updates the `[Unreleased]` compare link in CHANGELOG.md and adds the new version link.
 * - Fails if CHANGELOG.md has no `## [<version>]` section yet (must be authored first).
 *
 * The actual changelog entry is authored by humans in:
 *   - CHANGELOG.md (source of truth for GitHub Releases)
 *   - apps/web/lib/changelog-data.ts (source of truth for /changelog page)
 *
 * After running this script:
 *   git add -A && git commit -m "chore(release): v<version>" && git tag v<version> && git push --follow-tags
 * The `.github/workflows/release.yml` workflow then publishes the GitHub Release.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

const version = process.argv[2];
if (!version || !SEMVER.test(version)) {
  console.error("Usage: pnpm release <semver>   e.g. pnpm release 1.0.1");
  process.exit(1);
}

const PKG_PATHS = [
  resolve(ROOT, "package.json"),
  resolve(ROOT, "apps/web/package.json"),
  resolve(ROOT, "apps/api/package.json"),
];

const bumpPackage = (path) => {
  const raw = readFileSync(path, "utf8");
  const pkg = JSON.parse(raw);
  const prev = pkg.version;
  pkg.version = version;
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`  ${path.replace(ROOT, ".")}: ${prev} -> ${version}`);
};

const updateChangelogLinks = () => {
  const path = resolve(ROOT, "CHANGELOG.md");
  const md = readFileSync(path, "utf8");

  if (!new RegExp(`^## \\[${version.replace(/\./g, "\\.")}\\]`, "m").test(md)) {
    console.error(
      `CHANGELOG.md is missing a "## [${version}]" section. Author the release notes first, then re-run.`
    );
    process.exit(1);
  }

  const prevLinkMatch = md.match(/^\[Unreleased\]:\s*(.+\/compare\/)v([^.]+\.[^.]+\.[^.\s]+)\.\.\.HEAD\s*$/m);
  if (!prevLinkMatch) {
    console.warn("Could not locate [Unreleased] compare link footer; skipping link rewrite.");
    return;
  }
  const [, baseUrl, prevVersion] = prevLinkMatch;

  const newUnreleased = `[Unreleased]: ${baseUrl}v${version}...HEAD`;
  const newVersionLine = `[${version}]: ${baseUrl}v${prevVersion}...v${version}`;

  const updated = md.replace(
    /^\[Unreleased\]:.+$/m,
    `${newUnreleased}\n${newVersionLine}`
  );
  writeFileSync(path, updated);
  console.log(`  CHANGELOG.md compare links updated (prev v${prevVersion} -> v${version}).`);
};

console.log(`Releasing v${version}\n`);
console.log("Bumping package versions:");
PKG_PATHS.forEach(bumpPackage);

console.log("\nUpdating CHANGELOG.md links:");
updateChangelogLinks();

console.log("\nDone. Next steps:");
console.log(`  git add -A && git commit -m "chore(release): v${version}"`);
console.log(`  git tag v${version} && git push --follow-tags`);
