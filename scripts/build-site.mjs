#!/usr/bin/env node
// Assemble _site from templates/ plus the app pages staged in _src/.
//
// SECURITY: this copies an EXPLICIT ALLOWLIST of files (pages.json). Never
// replace it with a glob or a recursive copy — an app repo's docs/legal/ also
// holds internal engineering notes (app-store-privacy.md, README.md) that must
// not be published. scripts/verify-site.mjs is the backstop if this rule slips.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The app whose pages answer the bare /privacy and /terms URLs. Noctura shipped
// with those paths compiled in before the site was namespaced per app.
const ROOT_APP = 'noctura';

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function write(dest, contents) {
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, contents);
}

export function build({ srcDir, outDir, rootDir }) {
  const apps = readJson(join(rootDir, 'apps.json')).apps;
  const pages = readJson(join(rootDir, 'pages.json'));
  const redirectTpl = readFileSync(join(rootDir, 'templates', 'redirect.html'), 'utf8');
  const indexTpl = readFileSync(join(rootDir, 'templates', 'index.html'), 'utf8');

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  write(join(outDir, '.nojekyll'), '');

  const links = [];
  for (const app of apps) {
    for (const page of pages) {
      const src = join(srcDir, app.slug, `${page.route}.html`);
      if (!existsSync(src)) throw new Error(`missing staged page: ${src}`);
      const html = readFileSync(src, 'utf8');
      if (html.trim() === '') throw new Error(`empty staged page: ${src}`);
      write(join(outDir, app.slug, page.route, 'index.html'), html);
    }
    const routes = pages
      .map((p) => `<a href="/${app.slug}/${p.route}">${p.label}</a>`)
      .join(' &middot; ');
    links.push(`  <li><strong>${app.name}</strong> — ${routes}</li>`);
  }

  for (const route of ['privacy', 'terms']) {
    write(
      join(outDir, route, 'index.html'),
      redirectTpl.replaceAll('__TARGET__', `/${ROOT_APP}/${route}`),
    );
  }

  write(join(outDir, 'index.html'), indexTpl.replaceAll('__APP_LINKS__', links.join('\n')));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rootDir = fileURLToPath(new URL('..', import.meta.url));
  build({ srcDir: join(rootDir, '_src'), outDir: join(rootDir, '_site'), rootDir });
  console.log('built _site');
}
