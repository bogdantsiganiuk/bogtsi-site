import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marketingFiles, buildMarketing } from '../scripts/marketing-site.mjs';
import { expectedFiles } from '../scripts/verify-site.mjs';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const apps = JSON.parse(readFileSync(join(ROOT, 'apps.json'), 'utf8')).apps;
const manifest = () => JSON.parse(readFileSync(join(ROOT, 'marketing.json'), 'utf8'));

test('requires explicit marketing input at the verifier boundary', () => {
  assert.throws(() => expectedFiles(apps, []), /marketing/i);
});

test('rejects duplicate product routes, foreign identity routes and identity overrides', () => {
  const marketing = manifest();
  marketing.products[1].route = marketing.products[0].route;
  assert.throws(() => marketingFiles({ apps, marketing }), /route|duplicate/i);
  const foreign = manifest();
  foreign.products[0].route = 'shiver';
  assert.throws(() => marketingFiles({ apps, marketing: foreign }), /route|identity/i);
  const wrongId = manifest();
  wrongId.products[0].appStoreId = '6794118680';
  assert.throws(() => marketingFiles({ apps, marketing: wrongId }), /identity|appstoreid/i);
});

test('rejects duplicate assets and unsafe content publication paths', () => {
  const duplicate = manifest();
  duplicate.assets.push(duplicate.assets[0]);
  assert.throws(() => marketingFiles({ apps, marketing: duplicate }), /duplicate/i);
  const privateContent = manifest();
  privateContent.products[0].content = '.superpowers/private.json';
  assert.throws(() => marketingFiles({ apps, marketing: privateContent }), /content/i);
});

test('requires real calendar publication dates for resource metadata', () => {
  for (const publishedAt of [undefined, '', 'November 15, 2026', '2026-02-30']) {
    const marketing = manifest();
    marketing.resources[0].publishedAt = publishedAt;
    assert.throws(() => marketingFiles({ apps, marketing }), /publication date/i);
  }
});

test('all eleven product pages preserve registry store identity and legal namespace', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'bogtsi-marketing-'));
  try {
    buildMarketing({ rootDir: ROOT, outDir, apps, marketing: manifest() });
    const home = readFileSync(join(outDir, 'index.html'), 'utf8');
    for (const [app, route, id] of [
      ['voxwarm', 'voxwarm', '6796622537'], ['umbra', 'penumbra', '6794122060'],
      ['noctura', 'halcyon', '6791122312'], ['reverie', 'duskmere', '6794113579'],
      ['maelzel', 'maelzel', '6830308948'], ['shiver', 'shiver', '6794118680'],
      ['dahlia', 'dahlia', '6791726428'], ['brightwater', 'brightwater', '6794113463'],
      ['posture-coach', 'posture-coach', '6791312375'], ['ascend', 'ascend', '6791695056'],
      ['wageproof', 'wageproof', '6800065810'],
    ]) {
      assert.ok(home.includes(`href="/${route}/"`), `home links to ${route}`);
      const html = readFileSync(join(outDir, route, 'index.html'), 'utf8');
      assert.ok(html.includes(`https://apps.apple.com/app/id${id}`));
      assert.ok(html.includes(`href="/${app}/privacy"`));
      assert.ok(html.includes(`href="/${app}/support"`));
      assert.ok(html.includes(`https://bogtsi.xyz/${route}/`));
      const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
      assert.equal(schema['@type'], 'SoftwareApplication');
      assert.equal(schema.installUrl, `https://apps.apple.com/app/id${id}`);
      assert.equal(schema.offers, undefined);
      assert.equal(schema.aggregateRating, undefined);
    }
    const resourceIndex = readFileSync(join(outDir, 'resources/index.html'), 'utf8');
    assert.ok(resourceIndex.includes('https://bogtsi.xyz/resources/'));
    for (const resource of manifest().resources) {
      assert.ok(resourceIndex.includes(`href="/${resource.route}/"`));
      assert.ok(resourceIndex.includes(resource.title));
      assert.ok(resourceIndex.includes(`<time datetime="${resource.publishedAt}">`));
      const html = readFileSync(join(outDir, resource.route, 'index.html'), 'utf8');
      assert.ok(html.includes(`<h1>${resource.title}</h1>`));
      assert.ok(html.includes(`<time datetime="${resource.publishedAt}">`));
      assert.ok(html.includes(`href="/${manifest().products.find(p => p.app === resource.app).route}/"`));
    }
    const sitemap = readFileSync(join(outDir, 'sitemap.xml'), 'utf8');
    assert.ok(sitemap.includes('https://bogtsi.xyz/penumbra/'));
    assert.ok(sitemap.includes('https://bogtsi.xyz/resources/</loc>'));
    assert.equal(sitemap.includes('https://bogtsi.xyz/umbra/</loc>'), false);
    for (const app of apps.filter(a => !a.appStoreId)) assert.equal(home.includes(`/${app.slug}/`), false);
  } finally { rmSync(outDir, { recursive: true, force: true }); }
});

test('rejects missing or unregistered screenshot assets rather than publishing a broken image', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'bogtsi-assets-'));
  const outDir = join(rootDir, '_site');
  try {
    cpSync(join(ROOT, 'marketing'), join(rootDir, 'marketing'), { recursive: true });
    cpSync(join(ROOT, 'templates'), join(rootDir, 'templates'), { recursive: true });
    const marketing = manifest();
    const contentPath = join(rootDir, marketing.products[0].content);
    const data = JSON.parse(readFileSync(contentPath, 'utf8'));
    data.screenshots[0].src = 'marketing/assets/not-registered.png';
    writeFileSync(contentPath, JSON.stringify(data));
    assert.throws(() => buildMarketing({ rootDir, outDir, apps, marketing }), /unregistered.*screenshot/i);
    data.screenshots[0].src = 'marketing/assets/penumbra-1.png';
    writeFileSync(contentPath, JSON.stringify(data));
    assert.throws(() => buildMarketing({ rootDir, outDir, apps, marketing }), /screenshot.*identity/i);
    data.screenshots[0].src = 'marketing/assets/voxwarm-1.png';
    data.screenshots[0].width += 1;
    writeFileSync(contentPath, JSON.stringify(data));
    assert.throws(() => buildMarketing({ rootDir, outDir, apps, marketing }), /screenshot dimensions/i);
    data.screenshots[0].width -= 1;
    writeFileSync(contentPath, JSON.stringify(data));
    rmSync(join(rootDir, data.screenshots[0].src));
    assert.throws(() => buildMarketing({ rootDir, outDir, apps, marketing }), /missing.*asset|ENOENT/i);
  } finally { rmSync(rootDir, { recursive: true, force: true }); }
});
