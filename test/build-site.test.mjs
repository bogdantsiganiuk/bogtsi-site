import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build-site.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APPS = JSON.parse(readFileSync(join(ROOT, 'apps.json'), 'utf8')).apps;
const PAGES = JSON.parse(readFileSync(join(ROOT, 'pages.json'), 'utf8'));

// Stage fake app pages so the builder can run without touching the network.
function stage({ omit = null } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'bogtsi-'));
  const srcDir = join(dir, '_src');
  for (const app of APPS) {
    mkdirSync(join(srcDir, app.slug), { recursive: true });
    for (const page of PAGES) {
      if (omit && page.route === omit) continue;
      writeFileSync(join(srcDir, app.slug, `${page.route}.html`), `<h1>${page.marker}</h1>`);
    }
  }
  return { srcDir, outDir: join(dir, '_site') };
}

test('writes one page per app per route', () => {
  const { srcDir, outDir } = stage();
  build({ srcDir, outDir, rootDir: ROOT });
  for (const app of APPS) {
    for (const page of PAGES) {
      const f = join(outDir, app.slug, page.route, 'index.html');
      assert.ok(existsSync(f), `expected ${f}`);
      assert.match(readFileSync(f, 'utf8'), new RegExp(page.marker));
    }
  }
});

test('root /privacy and /terms redirect to the noctura pages', () => {
  const { srcDir, outDir } = stage();
  build({ srcDir, outDir, rootDir: ROOT });
  const privacy = readFileSync(join(outDir, 'privacy', 'index.html'), 'utf8');
  assert.match(privacy, /url=\/noctura\/privacy/);
  assert.ok(!privacy.includes('__TARGET__'), 'placeholder must be substituted');
  const terms = readFileSync(join(outDir, 'terms', 'index.html'), 'utf8');
  assert.match(terms, /url=\/noctura\/terms/);
});

test('root index lists every app and substitutes the placeholder', () => {
  const { srcDir, outDir } = stage();
  build({ srcDir, outDir, rootDir: ROOT });
  const index = readFileSync(join(outDir, 'index.html'), 'utf8');
  assert.ok(!index.includes('__APP_LINKS__'));
  for (const app of APPS) assert.match(index, new RegExp(app.name));
});

test('emits .nojekyll so Pages skips Jekyll', () => {
  const { srcDir, outDir } = stage();
  build({ srcDir, outDir, rootDir: ROOT });
  assert.ok(existsSync(join(outDir, '.nojekyll')));
});

test('throws when a staged page is missing rather than publishing a hole', () => {
  const { srcDir, outDir } = stage({ omit: 'support' });
  assert.throws(() => build({ srcDir, outDir, rootDir: ROOT }), /missing staged page/);
});
