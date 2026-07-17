#!/usr/bin/env node
// Guard: _site must contain EXACTLY the expected files and nothing else.
//
// This runs before deploy and is the backstop for the allowlist rule in
// build-site.mjs. If a glob ever creeps in, or a checkout directory (with the
// credential actions/checkout writes into .git/config) gets copied, the extra
// paths fail the run BEFORE anything reaches the public internet.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Belt and braces: nothing published should ever look like a GitHub token.
const TOKEN_RE = /\b(gh[pousr]_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,})\b/;

function walk(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, base, out);
    else out.push(relative(base, full).split(sep).join('/'));
  }
  return out;
}

export function expectedFiles(apps, pages) {
  const files = ['.nojekyll', 'index.html', 'privacy/index.html', 'terms/index.html'];
  for (const app of apps) {
    for (const page of pages) files.push(`${app.slug}/${page.route}/index.html`);
  }
  return files.sort();
}

export function verify({ outDir, apps, pages }) {
  const actual = walk(outDir).sort();
  const expected = expectedFiles(apps, pages);
  const errors = [];

  const extra = actual.filter((f) => !expected.includes(f));
  if (extra.length) errors.push(`unexpected files in _site: ${extra.join(', ')}`);

  const missing = expected.filter((f) => !actual.includes(f));
  if (missing.length) errors.push(`missing files in _site: ${missing.join(', ')}`);

  for (const f of actual) {
    if (f === '.nojekyll') continue;
    if (TOKEN_RE.test(readFileSync(join(outDir, f), 'utf8'))) {
      errors.push(`possible credential in ${f}`);
    }
  }

  if (errors.length) throw new Error(errors.join('\n'));
  return actual;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rootDir = fileURLToPath(new URL('..', import.meta.url));
  const apps = JSON.parse(readFileSync(join(rootDir, 'apps.json'), 'utf8')).apps;
  const pages = JSON.parse(readFileSync(join(rootDir, 'pages.json'), 'utf8'));
  const files = verify({ outDir: join(rootDir, '_site'), apps, pages });
  console.log(`guard passed — ${files.length} files`);
}
