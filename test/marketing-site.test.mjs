import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
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
  for (const asset of ['marketing/assets/voxwarm-1.png', 'marketing/assets/unregistered-art.svg', 'marketing/assets/voxwarm-art.svg/../private.svg', 'marketing/assets/voxwarm.html', 'marketing/assets/unregistered.mjs', 'marketing/assets/carousel.js', 'marketing/assets/carousel.mjs/../private.mjs']) {
    const unsafe = manifest();
    unsafe.assets.push(asset);
    assert.throws(() => marketingFiles({ apps, marketing: unsafe }), /asset publication path/i);
  }
});

test('requires real calendar publication dates for resource metadata', () => {
  for (const publishedAt of [undefined, '', 'November 15, 2026', '2026-02-30']) {
    const marketing = manifest();
    marketing.resources[0].publishedAt = publishedAt;
    assert.throws(() => marketingFiles({ apps, marketing }), /publication date/i);
  }
});

test('requires appOrder to contain every marketed product exactly once at the authoring boundary', () => {
  const control = manifest();
  control.appOrder = control.products.map(product => product.app);
  assert.doesNotThrow(() => marketingFiles({ apps, marketing: control }));

  const reordered = structuredClone(control);
  reordered.appOrder.reverse();
  assert.doesNotThrow(() => marketingFiles({ apps, marketing: reordered }));

  assert.doesNotThrow(() => marketingFiles({
    apps, marketing: { appOrder: [], products: [], resources: [], assets: [] },
  }));

  const cases = [
    ['missing order', undefined],
    ['wrong list type', 'voxwarm'],
    ['unknown app', [...control.appOrder.slice(0, -1), 'unknown-app']],
    ['registered but unmarketed app', [...control.appOrder.slice(0, -1), 'sugar-free']],
    ['duplicate product', [...control.appOrder.slice(0, -1), control.appOrder[0]]],
    ['omitted product', control.appOrder.slice(0, -1)],
  ];
  for (const [label, appOrder] of cases) {
    const marketing = structuredClone(control);
    marketing.appOrder = appOrder;
    assert.throws(() => marketingFiles({ apps, marketing }), /appOrder|app order/i, label);
  }
});

test('rejects obsolete promotion lists instead of ignoring legacy configuration', () => {
  for (const key of ['featured', 'campaigns']) {
    const marketing = manifest();
    marketing[key] = [];
    assert.throws(() => marketingFiles({ apps, marketing }), /obsolete|appOrder/i, key);
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
      assert.deepEqual(schema.screenshot, [`https://bogtsi.xyz/marketing/assets/${app}-capture.png`]);
      assert.equal(schema.image, `https://bogtsi.xyz/marketing/assets/${app}-device.png`);
      assert.ok(html.includes(`<meta property="og:image" content="https://bogtsi.xyz/marketing/assets/${app}-device.png">`));
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

function visualFixture() {
  const rootDir = mkdtempSync(join(tmpdir(), 'bogtsi-assets-'));
  cpSync(join(ROOT, 'marketing'), join(rootDir, 'marketing'), { recursive: true });
  cpSync(join(ROOT, 'templates'), join(rootDir, 'templates'), { recursive: true });
  cpSync(join(ROOT, 'pages.json'), join(rootDir, 'pages.json'));
  return { rootDir, outDir: join(rootDir, '_site'), apps, marketing: manifest() };
}

test('refuses publication without the registered homepage controller', () => {
  const fixture = visualFixture();
  fixture.marketing.assets = fixture.marketing.assets.filter(asset => asset !== 'marketing/assets/carousel.mjs');
  try {
    assert.throws(() => buildMarketing(fixture), /required.*carousel module/i);
    assert.equal(existsSync(fixture.outDir), false);
  } finally { rmSync(fixture.rootDir, { recursive: true, force: true }); }
});

test('rejects missing, unregistered, foreign and dimension-mismatched visual roles before publication', () => {
  const fixture = visualFixture();
  const { rootDir, outDir, marketing } = fixture;
  try {
    const contentPath = join(rootDir, marketing.products[0].content);
    const original = JSON.parse(readFileSync(contentPath, 'utf8'));
    for (const role of ['device', 'capture', 'secondaryCapture', 'illustration']) {
      const data = structuredClone(original);
      const visual = data.visuals[role];
      const assetPath = join(rootDir, visual.src);
      const bytes = readFileSync(assetPath);
      delete data.visuals[role];
      writeFileSync(contentPath, JSON.stringify(data));
      assert.throws(() => buildMarketing(fixture), /visual|role/i);
      data.visuals[role] = visual;
      const src = visual.src;
      visual.src = `marketing/assets/not-registered-${role === 'illustration' ? 'art.svg' : `${role}.png`}`;
      writeFileSync(contentPath, JSON.stringify(data));
      assert.throws(() => buildMarketing(fixture), /unregistered.*visual/i);
      visual.src = `marketing/assets/umbra-${role === 'illustration' ? 'art.svg' : role === 'secondaryCapture' ? 'secondary-capture.png' : `${role}.png`}`;
      writeFileSync(contentPath, JSON.stringify(data));
      assert.throws(() => buildMarketing(fixture), /visual.*identity/i);
      visual.src = src;
      visual.width += 1;
      writeFileSync(contentPath, JSON.stringify(data));
      assert.throws(() => buildMarketing(fixture), /dimensions/i);
      visual.width -= 1;
      writeFileSync(contentPath, JSON.stringify(data));
      rmSync(assetPath);
      assert.throws(() => buildMarketing(fixture), /missing.*asset|ENOENT/i);
      assert.equal(existsSync(join(outDir, src)), false);
      writeFileSync(assetPath, bytes);
      if (role !== 'illustration') {
        for (const corrupt of [
          png => { png[0] = 0; },
          png => { png.write('FAKE', 12, 'ascii'); },
        ]) {
          const malformed = Buffer.from(bytes);
          corrupt(malformed);
          writeFileSync(assetPath, malformed);
          assert.throws(() => buildMarketing(fixture), /PNG/i);
        }
        writeFileSync(assetPath, bytes);
      }
    }
    const legacy = structuredClone(original);
    legacy.screenshots = [original.visuals.capture];
    writeFileSync(contentPath, JSON.stringify(legacy));
    assert.throws(() => buildMarketing(fixture), /screenshots|obsolete|visual/i);
    for (const role of ['capture', 'secondaryCapture']) {
      for (const profile of [undefined, '', 'phone', 'notch" onload="alert(1)']) {
        const invalid = structuredClone(original);
        invalid.visuals[role].frameProfile = profile;
        writeFileSync(contentPath, JSON.stringify(invalid));
        assert.throws(() => buildMarketing(fixture), /frame profile/i);
      }
      for (const caption of [undefined, '', '   ']) {
        const invalid = structuredClone(original);
        invalid.visuals[role].caption = caption;
        writeFileSync(contentPath, JSON.stringify(invalid));
        assert.throws(() => buildMarketing(fixture), /caption/i);
      }
    }
    const extra = structuredClone(original);
    extra.visuals.poster = original.visuals.device;
    writeFileSync(contentPath, JSON.stringify(extra));
    assert.throws(() => buildMarketing(fixture), /visual roles/i);
  } finally { rmSync(rootDir, { recursive: true, force: true }); }
});

test('rejects identical primary and secondary screenshot bytes before publication', () => {
  const fixture = visualFixture();
  const { rootDir, outDir, marketing } = fixture;
  try {
    buildMarketing(fixture);
    rmSync(outDir, { recursive: true, force: true });
    const contentPath = join(rootDir, marketing.products[0].content);
    const data = JSON.parse(readFileSync(contentPath, 'utf8'));
    const { capture, secondaryCapture } = data.visuals;
    secondaryCapture.width = capture.width;
    secondaryCapture.height = capture.height;
    writeFileSync(contentPath, JSON.stringify(data));
    writeFileSync(join(rootDir, secondaryCapture.src), readFileSync(join(rootDir, capture.src)));
    assert.throws(() => buildMarketing(fixture), /screenshots.*distinct bytes/i);
    assert.equal(existsSync(outDir), false);
  } finally { rmSync(rootDir, { recursive: true, force: true }); }
});

test('SVG publication accepts registered static art and rejects active, event, external and entity variants', () => {
  const fixture = visualFixture();
  const { rootDir, outDir, marketing } = fixture;
  try {
    const data = JSON.parse(readFileSync(join(rootDir, marketing.products[0].content), 'utf8'));
    const src = data.visuals.illustration.src;
    const assetPath = join(rootDir, src);
    const publishedPath = join(outDir, src);
    const safe = '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="640" viewBox="0 0 1000 640" role="img" aria-labelledby="title desc"><title id="title">Static art</title><desc id="desc">A quiet shape</desc><defs><linearGradient id="wash" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#123456"/></linearGradient><mask id="cut"><circle cx="50" cy="50" r="40" fill="#fff"/></mask></defs><g fill="url(#wash)" mask="url(#cut)"><path d="M0 0 L100 0 L100 100 Z"/><circle cx="20" cy="20" r="10"/><ellipse cx="50" cy="50" rx="20" ry="10"/></g></svg>';
    writeFileSync(assetPath, safe);
    buildMarketing(fixture);
    assert.equal(readFileSync(publishedPath, 'utf8'), safe);
    const variants = [
      ['active script', safe.replace('</svg>', '<script>alert(1)</script></svg>')],
      ['event handler', safe.replace('<g ', '<g onload="alert(1)" ')],
      ['external paint', safe.replace('url(#wash)', 'url(https://example.com/paint.svg#x)')],
      ['external href', safe.replace('<path ', '<path href="https://example.com/art.svg" ')],
      ['style attribute', safe.replace('<g ', '<g style="fill:red" ')],
      ['unknown attribute', safe.replace('<g ', '<g unexpected="value" ')],
      ['foreign content', safe.replace('</svg>', '<foreignObject><div>HTML</div></foreignObject></svg>')],
      ['DTD and entity', '<!DOCTYPE svg [<!ENTITY leak SYSTEM "file:///private">]>' + safe.replace('Static art', '&leak;')],
      ['entity reference', safe.replace('Static art', '&unknown;')],
      ['processing instruction', '<?xml-stylesheet href="https://example.com/style.css"?>' + safe],
      ['wrong dimensions', safe.replace('width="1000"', 'width="999"')],
      ['wrong viewBox', safe.replace('viewBox="0 0 1000 640"', 'viewBox="0 0 999 640"')],
      ['missing namespace', safe.replace(' xmlns="http://www.w3.org/2000/svg"', '')],
      ['duplicate attribute', safe.replace('<g ', '<g fill="#fff" ')],
      ['duplicate root', safe + safe],
      ['unclosed document', safe.replace('</svg>', '')],
      ['mismatched element', safe.replace('</g>', '</defs>')],
      ['unresolved local paint', safe.replace('url(#wash)', 'url(#missing)')],
      ['unknown namespace', safe.replace('<g ', '<g xmlns:xlink="http://www.w3.org/1999/xlink" ')],
      ['nonlocal namespace', safe.replace('http://www.w3.org/2000/svg', 'https://example.com/svg')],
    ];
    for (const [label, unsafe] of variants) {
      rmSync(outDir, { recursive: true, force: true });
      writeFileSync(assetPath, unsafe);
      assert.throws(() => buildMarketing(fixture), /SVG|illustration|dimensions/i, label);
      assert.equal(existsSync(publishedPath), false, `${label} must not be published`);
    }
  } finally { rmSync(rootDir, { recursive: true, force: true }); }
});

// ---- Resource authoring boundary (tools + guides) ----
const TOOL_SCRIPT = 'marketing/assets/tools/vocal-warm-up.mjs';
const OLD_ROUTE = 'resources/five-minute-vocal-warm-up';

// A manifest that satisfies the full resource contract: resources[0] is a tool with a script and a redirect, the rest are guides.
function resourceManifest() {
  const marketing = manifest();
  marketing.resources = marketing.resources.map((resource, i) => ({ ...resource, kind: 'guide', appPitch: 'The app adds more.', note: '' }));
  Object.assign(marketing.resources[0], { route: 'resources/vocal-warm-up', content: 'marketing/resources/vocal-warm-up.html', kind: 'tool', script: TOOL_SCRIPT, redirectFrom: [OLD_ROUTE] });
  return marketing;
}

function resourceFixture(mutate = () => {}) {
  const fixture = visualFixture();
  fixture.marketing = resourceManifest();
  const fragment = '<p class="lead">Pick a range.</p><div class="tool" data-tool="vocal-warm-up"><label for="vw-range">Range</label><select id="vw-range"><option>Low</option></select><button id="vw-start" class="tool-button" type="button">Start</button><input id="vw-x" type="number"><output id="vw-out" class="tool-output"></output><table class="guide-table"><tr><td>1</td></tr></table></div>';
  fixture.write = (path, content) => { mkdirSync(dirname(join(fixture.rootDir, path)), { recursive: true }); writeFileSync(join(fixture.rootDir, path), content); };
  // Every resource fragment must exist for a build; guides reuse a trivial valid body.
  for (const resource of fixture.marketing.resources) fixture.write(resource.content, resource === fixture.marketing.resources[0] ? fragment : '<p class="lead">A guide.</p>');
  fixture.write(TOOL_SCRIPT, 'export function init() {}\n');
  mutate(fixture);
  return fixture;
}
const withFixture = (mutate, run) => { const fixture = resourceFixture(mutate); try { return run(fixture); } finally { rmSync(fixture.rootDir, { recursive: true, force: true }); } };

test('control: a fully valid tool/guide manifest builds, with redirects outside the sitemap', () => {
  assert.doesNotThrow(() => marketingFiles({ apps, marketing: resourceManifest() }));
  withFixture(() => {}, fixture => {
    buildMarketing(fixture);
    assert.ok(existsSync(join(fixture.outDir, 'resources/vocal-warm-up/index.html')));
    assert.ok(existsSync(join(fixture.outDir, TOOL_SCRIPT)));
    const sitemap = readFileSync(join(fixture.outDir, 'sitemap.xml'), 'utf8');
    assert.match(sitemap, /resources\/vocal-warm-up\//);
    assert.doesNotMatch(sitemap, /five-minute-vocal-warm-up/);
  });
});

test('resource kind must be tool or guide', () => {
  for (const kind of [undefined, '', 'worksheet', 'Tool']) {
    const marketing = resourceManifest();
    marketing.resources[1].kind = kind;
    assert.throws(() => marketingFiles({ apps, marketing }), /kind/i);
  }
});

test('resource appPitch is required', () => {
  for (const appPitch of [undefined, '', '   ', 7]) {
    const marketing = resourceManifest();
    marketing.resources[1].appPitch = appPitch;
    assert.throws(() => marketingFiles({ apps, marketing }), /appPitch/i);
  }
});

test('resource script must be the exact registered tool module for its own slug', () => {
  const wrong = [
    'marketing/assets/tools/other.mjs',
    'marketing/assets/tools/vocal-warm-up.js',
    'marketing/assets/tools/../vocal-warm-up.mjs',
    'marketing/assets/tools/vocal-warm-up.mjs/../x.mjs',
    'marketing/assets/carousel.mjs',
    '/marketing/assets/tools/vocal-warm-up.mjs',
    'https://example.com/vocal-warm-up.mjs',
    '../marketing/assets/tools/vocal-warm-up.mjs'
  ];
  for (const script of wrong) {
    const marketing = resourceManifest();
    marketing.resources[0].script = script;
    assert.throws(() => marketingFiles({ apps, marketing }), /script/i, script);
  }
  const unregistered = resourceManifest();
  unregistered.assets = unregistered.assets.filter(asset => asset !== TOOL_SCRIPT);
  assert.throws(() => marketingFiles({ apps, marketing: unregistered }), /script/i);
});

test('tool modules only publish through, and only appear on, their own resource page', () => {
  const foreign = resourceManifest();
  foreign.resources[1].script = TOOL_SCRIPT;
  assert.throws(() => marketingFiles({ apps, marketing: foreign }), /script/i);
  const orphan = resourceManifest();
  delete orphan.resources[0].script;
  assert.throws(() => marketingFiles({ apps, marketing: orphan }), /script|asset publication path/i);
  withFixture(() => {}, fixture => {
    buildMarketing(fixture);
    const tag = `<script type="module" src="/${TOOL_SCRIPT}"></script>`;
    assert.ok(readFileSync(join(fixture.outDir, 'resources/vocal-warm-up/index.html'), 'utf8').includes(tag));
    for (const page of ['index.html', 'resources/index.html', 'site-privacy/index.html', 'resources/how-to-start-shadow-work/index.html'].filter(page => existsSync(join(fixture.outDir, page)))) {
      assert.ok(!readFileSync(join(fixture.outDir, page), 'utf8').includes('tools/vocal-warm-up.mjs'), page);
    }
  });
});

test('redirectFrom publishes noindex forwarding pages that are not in the sitemap', () => {
  assert.ok(marketingFiles({ apps, marketing: resourceManifest() }).includes(`${OLD_ROUTE}/index.html`));
  withFixture(() => {}, fixture => {
    buildMarketing(fixture);
    const html = readFileSync(join(fixture.outDir, OLD_ROUTE, 'index.html'), 'utf8');
    const target = 'https://bogtsi.xyz/resources/vocal-warm-up/';
    assert.ok(html.includes(`<link rel="canonical" href="${target}">`));
    assert.match(html, /<meta http-equiv="refresh" content="0; ?url=https:\/\/bogtsi\.xyz\/resources\/vocal-warm-up\/">/);
    assert.match(html, /<meta name="robots" content="noindex/i);
    assert.doesNotMatch(html, /cloudflareinsights/);
    assert.doesNotMatch(html, /site-header/);
    assert.doesNotMatch(readFileSync(join(fixture.outDir, 'sitemap.xml'), 'utf8'), /five-minute/);
  });
});

test('redirectFrom routes are safe and collision-checked against every route', () => {
  const bad = ['resources/vocal-warm-up', resourceManifest().resources[1].route, 'resources', 'privacy', 'Resources/Old', 'resources/../x', '/resources/old', 'resources/old/', ''];
  for (const route of bad) {
    const marketing = resourceManifest();
    marketing.resources[0].redirectFrom = [route];
    assert.throws(() => marketingFiles({ apps, marketing }), /redirect|route/i, route);
  }
  const productRoute = resourceManifest();
  productRoute.resources[0].redirectFrom = [productRoute.products[0].route];
  assert.throws(() => marketingFiles({ apps, marketing: productRoute }), /redirect|route|duplicate/i);
  const duplicated = resourceManifest();
  duplicated.resources[1].redirectFrom = [OLD_ROUTE];
  assert.throws(() => marketingFiles({ apps, marketing: duplicated }), /redirect|route|duplicate/i);
  const repeated = resourceManifest();
  repeated.resources[0].redirectFrom = [OLD_ROUTE, OLD_ROUTE];
  assert.throws(() => marketingFiles({ apps, marketing: repeated }), /redirect|route|duplicate/i);
  const notArray = resourceManifest();
  notArray.resources[0].redirectFrom = OLD_ROUTE;
  assert.throws(() => marketingFiles({ apps, marketing: notArray }), /redirect/i);
});

test('fragment validator rejects forbidden elements and attributes but accepts tool controls', () => {
  const forbidden = {
    script: '<script>1</script>', style: '<style>p{}</style>', iframe: '<iframe src="/x"></iframe>', form: '<form></form>',
    textarea: '<textarea></textarea>', link: '<link rel="x" href="/y">', h1: '<h1>Title</h1>', object: '<object data="/x"></object>', embed: '<embed src="/x">',
    onclick: '<button id="vw-b" onclick="x()">Go</button>', onmouseover: '<p ONMOUSEOVER = "x()">Hi</p>', styleAttr: '<p style="color:red">Hi</p>'
  };
  for (const [name, markup] of Object.entries(forbidden)) {
    withFixture(fixture => fixture.write(fixture.marketing.resources[0].content, `<p class="lead">Intro</p>${markup}`), fixture => {
      assert.throws(() => buildMarketing(fixture), /fragment|resource/i, name);
      assert.equal(existsSync(fixture.outDir), false, name);
    });
  }
  withFixture(fixture => fixture.write(fixture.marketing.resources[0].content, '<p class="lead">Intro</p><label for="vw-a">A</label><input id="vw-a" type="number"><select id="vw-s"><option>1</option></select><button id="vw-go" type="button">Go</button><output id="vw-o"></output><table class="guide-table"><tr><td>1</td></tr></table>'), fixture => {
    assert.doesNotThrow(() => buildMarketing(fixture));
  });
});

test('fragment ids must be unique', () => {
  for (const body of ['<p id="vw-a">a</p><p id="vw-a">b</p>']) {
    withFixture(fixture => fixture.write(fixture.marketing.resources[0].content, `<p class="lead">Intro</p>${body}`), fixture => {
      assert.throws(() => buildMarketing(fixture), /id/i, body);
    });
  }
});
