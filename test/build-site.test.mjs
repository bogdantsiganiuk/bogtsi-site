import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build-site.mjs';
import { execFileSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APPS = JSON.parse(readFileSync(join(ROOT, 'apps.json'), 'utf8')).apps;
const PAGES = JSON.parse(readFileSync(join(ROOT, 'pages.json'), 'utf8'));

// Stage fake app pages so the builder can run without touching the network.
function stage({ omit = null } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'bogtsi-'));
  const srcDir = join(dir, '_src');
  for (const app of APPS) {
    mkdirSync(join(srcDir, app.slug), { recursive: true });
    for (const page of PAGES.filter((page) => !page.app || page.app === app.slug)) {
      if (omit && page.route === omit) continue;
      mkdirSync(dirname(join(srcDir, app.slug, `${page.route}.html`)), { recursive: true });
      writeFileSync(join(srcDir, app.slug, `${page.route}.html`), `<h1>${page.marker}</h1>`);
    }
  }
  return { srcDir, outDir: join(dir, '_site') };
}

test('writes every unscoped page and each app-specific page only for its app', () => {
  const { srcDir, outDir } = stage();
  build({ srcDir, outDir, rootDir: ROOT });
  for (const app of APPS) {
    for (const page of PAGES.filter((page) => !page.app || page.app === app.slug)) {
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

test('apps with an appStoreId get an App Store link, others none', () => {
  const { srcDir, outDir } = stage();
  build({ srcDir, outDir, rootDir: ROOT });
  const index = readFileSync(join(outDir, 'index.html'), 'utf8');
  for (const app of APPS.filter((a) => a.appStoreId)) {
    assert.ok(
      index.includes(`https://apps.apple.com/app/id${app.appStoreId}`),
      `expected store link for ${app.slug}`,
    );
  }
  const storeLinks = index.split('https://apps.apple.com/app/id').length - 1;
  assert.equal(storeLinks, APPS.filter((a) => a.appStoreId).length);
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

test('publishes all six Wageproof routes without adding Spanish routes to another app', () => {
  const { srcDir, outDir } = stage();
  build({ srcDir, outDir, rootDir: ROOT });
  const index = readFileSync(join(outDir, 'index.html'), 'utf8');
  for (const route of ['privacy', 'terms', 'support', 'es/privacy', 'es/terms', 'es/support']) {
    assert.ok(existsSync(join(outDir, 'wageproof', route, 'index.html')));
    assert.ok(index.includes(`href="/wageproof/${route}"`));
  }
  for (const app of APPS.filter((app) => app.slug !== 'wageproof')) {
    assert.equal(existsSync(join(outDir, app.slug, 'es')), false);
    assert.equal(index.includes(`href="/${app.slug}/es/`), false);
  }
});

test('fails closed when an app-specific nested source is missing or empty', () => {
  const { srcDir, outDir } = stage({ omit: 'es/privacy' });
  assert.throws(() => build({ srcDir, outDir, rootDir: ROOT }), /missing staged page.*wageproof.*es/);
  mkdirSync(join(srcDir, 'wageproof', 'es'), { recursive: true });
  writeFileSync(join(srcDir, 'wageproof', 'es', 'privacy.html'), ' \n');
  assert.throws(() => build({ srcDir, outDir, rootDir: ROOT }), /empty staged page.*wageproof.*es/);
});

test('shell fetch and live checks honor app scope without contacting GitHub or the site', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bogtsi-shell-'));
  const bin = join(dir, 'bin');
  mkdirSync(bin);
  writeFileSync(join(dir, 'apps.json'), JSON.stringify({ apps: [
    { slug: 'wageproof', name: 'Wageproof', repo: 'owner/wageproof' },
    { slug: 'noctura', name: 'Halcyon', repo: 'owner/noctura' },
  ] }));
  writeFileSync(join(dir, 'pages.json'), JSON.stringify(PAGES));
  // Replace only external commands: the real shell scripts still select routes,
  // stage files, validate markers and construct URLs. Fixtures contain no token.
  writeFileSync(join(bin, 'gh'), `#!/usr/bin/env bash
printf '%s\\n' "$2" >> fetch.log
printf '<h1>staged legal page</h1>\\n'
`, { mode: 0o755 });
  writeFileSync(join(bin, 'curl'), `#!/usr/bin/env bash
while [ "$#" -gt 0 ]; do
  case "$1" in
    -o) output="$2"; shift 2 ;;
    https://*) url="$1"; shift ;;
    *) shift ;;
  esac
done
printf '%s\\n' "$url" >> live.log
printf '%s\\n' 'Privacy Policy Terms of Service Support Política de privacidad Términos de servicio Soporte /noctura/privacy /noctura/terms Wageproof' > "$output"
printf '200'
`, { mode: 0o755 });
  const shell = process.platform === 'win32'
    ? join(process.env.ProgramFiles || 'C:/Program Files', 'Git', 'bin', 'bash.exe')
    : 'bash';
  // Set PATH inside Bash: a POSIX path prefix also works under Git Bash,
  // without relying on Windows PATH-list conversion for the temporary bin.
  const options = { cwd: dir, encoding: 'utf8', env: { ...process.env, GH_TOKEN: 'fixture-only' } };
  const run = (script, ...args) => execFileSync(shell, [
    '-c', 'export PATH="$PWD/bin:$PATH"; exec bash "$@"', 'fixture',
    join(ROOT, 'scripts', script).replaceAll('\\', '/'), ...args,
  ], options);
  try {
    run('fetch-legal.sh');
    const requested = readFileSync(join(dir, 'fetch.log'), 'utf8').trim().split(/\r?\n/).sort();
    assert.deepEqual(requested, [
      'repos/owner/noctura/contents/docs/legal/privacy-policy.html',
      'repos/owner/noctura/contents/docs/legal/support.html',
      'repos/owner/noctura/contents/docs/legal/terms-of-service.html',
      'repos/owner/wageproof/contents/docs/legal/privacy-policy.es.html',
      'repos/owner/wageproof/contents/docs/legal/privacy-policy.html',
      'repos/owner/wageproof/contents/docs/legal/support.es.html',
      'repos/owner/wageproof/contents/docs/legal/support.html',
      'repos/owner/wageproof/contents/docs/legal/terms-of-service.es.html',
      'repos/owner/wageproof/contents/docs/legal/terms-of-service.html',
    ].sort());
    assert.match(readFileSync(join(dir, '_src', 'wageproof', 'es', 'privacy.html'), 'utf8'), /staged legal page/);
    assert.equal(existsSync(join(dir, '_src', 'noctura', 'es')), false);
    run('check-live.sh', 'https://fixture.invalid');
    const checked = readFileSync(join(dir, 'live.log'), 'utf8').trim().split(/\r?\n/).sort();
    assert.deepEqual(checked, [
      'https://fixture.invalid/',
      'https://fixture.invalid/privacy',
      'https://fixture.invalid/terms',
      'https://fixture.invalid/noctura/privacy',
      'https://fixture.invalid/noctura/terms',
      'https://fixture.invalid/noctura/support',
      'https://fixture.invalid/wageproof/privacy',
      'https://fixture.invalid/wageproof/terms',
      'https://fixture.invalid/wageproof/support',
      'https://fixture.invalid/wageproof/es/privacy',
      'https://fixture.invalid/wageproof/es/terms',
      'https://fixture.invalid/wageproof/es/support',
    ].sort());
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
