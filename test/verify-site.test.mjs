import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build-site.mjs';
import { verify, expectedFiles } from '../scripts/verify-site.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APPS = JSON.parse(readFileSync(join(ROOT, 'apps.json'), 'utf8')).apps;
const PAGES = JSON.parse(readFileSync(join(ROOT, 'pages.json'), 'utf8'));

function built() {
  const dir = mkdtempSync(join(tmpdir(), 'bogtsi-v-'));
  const srcDir = join(dir, '_src');
  for (const app of APPS) {
    mkdirSync(join(srcDir, app.slug), { recursive: true });
    for (const page of PAGES) {
      writeFileSync(join(srcDir, app.slug, `${page.route}.html`), `<h1>${page.marker}</h1>`);
    }
  }
  const outDir = join(dir, '_site');
  build({ srcDir, outDir, rootDir: ROOT });
  return outDir;
}

test('accepts a site built by build()', () => {
  const outDir = built();
  const files = verify({ outDir, apps: APPS, pages: PAGES });
  assert.deepEqual(files, expectedFiles(APPS, PAGES));
});

test('rejects an unexpected file — the glob-creep backstop', () => {
  const outDir = built();
  writeFileSync(join(outDir, 'noctura', 'app-store-privacy.md'), '# internal notes');
  assert.throws(() => verify({ outDir, apps: APPS, pages: PAGES }), /unexpected files/);
});

test('rejects a leaked .git directory from a stray checkout copy', () => {
  const outDir = built();
  mkdirSync(join(outDir, '.git'), { recursive: true });
  writeFileSync(join(outDir, '.git', 'config'), '[remote "origin"]');
  assert.throws(() => verify({ outDir, apps: APPS, pages: PAGES }), /unexpected files/);
});

test('rejects a missing file', () => {
  const outDir = built();
  rmSync(join(outDir, 'noctura', 'support', 'index.html'));
  assert.throws(() => verify({ outDir, apps: APPS, pages: PAGES }), /missing files/);
});

test('rejects credential-shaped content even in an expected file', () => {
  const outDir = built();
  writeFileSync(
    join(outDir, 'index.html'),
    '<p>ghp_0123456789abcdefghijABCDEFGHIJ0123</p>',
  );
  assert.throws(() => verify({ outDir, apps: APPS, pages: PAGES }), /possible credential/);
});
