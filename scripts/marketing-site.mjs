// Local, explicit publication contract. No app-repository fetches belong here.
import { readFileSync, writeFileSync, mkdirSync, realpathSync, existsSync } from 'node:fs';
import { dirname, join, relative, isAbsolute } from 'node:path';

const ORIGIN = 'https://bogtsi.xyz';
const ALIASES = { umbra: 'penumbra', noctura: 'halcyon', reverie: 'duskmere' };
const RESERVED = new Set(['privacy', 'terms', 'support', 'site-privacy', 'resources', 'marketing', 'index', 'robots', 'sitemap']);
const THEMES = new Set(['coral', 'earth', 'night', 'ice', 'jade', 'ocean', 'garden', 'gold', 'indigo', 'slate']);
const GROUPS = { rhythm: 'Find a daily rhythm', details: 'Look after the details', practice: 'Keep a practice of your own' };
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lines = (s) => esc(s).replace(/\r?\n/g, '<br>');
const storeUrl = (app) => `https://apps.apple.com/app/id${app.appStoreId}`;
const canonical = (route = '') => `${ORIGIN}/${route ? `${route}/` : ''}`;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const fail = (message) => { throw new Error(message); };

// Pure: validate identity/routes and return the exact additional public files.
// The homepage already belongs to the legacy 64-file publication contract.
export function marketingFiles({ apps, marketing }) {
  if (!marketing || !Array.isArray(marketing.products) || !Array.isArray(marketing.resources) || !Array.isArray(marketing.assets) || !Array.isArray(marketing.featured)) fail('explicit marketing manifest is required');
  const registry = new Map();
  const storeIds = new Set();
  for (const app of apps) {
    if (registry.has(app.slug)) fail(`duplicate app identity: ${app.slug}`);
    registry.set(app.slug, app);
    if (app.appStoreId) {
      if (!/^\d+$/.test(app.appStoreId) || storeIds.has(String(app.appStoreId))) fail(`invalid or duplicate App Store identity: ${app.slug}`);
      storeIds.add(String(app.appStoreId));
    }
  }
  const products = new Map();
  const routes = new Set();
  const files = ['support/index.html', 'site-privacy/index.html', 'resources/index.html', 'sitemap.xml', 'robots.txt'];
  for (const entry of marketing.products) {
    const app = registry.get(entry.app);
    if (!app) fail(`unknown marketed app: ${entry.app}`);
    if (!app.appStoreId) fail(`marketed app requires a released App Store ID: ${entry.app}`);
    if ('appStoreId' in entry || 'name' in entry) fail(`product identity must come from apps.json: ${entry.app}`);
    if (products.has(entry.app)) fail(`duplicate product app: ${entry.app}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.route) || RESERVED.has(entry.route)) fail(`unsafe or reserved product route: ${entry.route}`);
    if (routes.has(entry.route)) fail(`duplicate marketing route: ${entry.route}`);
    if (entry.route !== (ALIASES[entry.app] || entry.app)) fail(`product route does not match app identity: ${entry.app}/${entry.route}`);
    if (entry.content !== `marketing/apps/${entry.app}.json`) fail(`invalid product content path: ${entry.content}`);
    products.set(entry.app, entry);
    routes.add(entry.route);
    files.push(`${entry.route}/index.html`);
  }
  const featured = new Set();
  for (const app of marketing.featured) {
    if (!products.has(app) || featured.has(app)) fail(`unknown or duplicate featured app: ${app}`);
    featured.add(app);
  }
  for (const resource of marketing.resources) {
    if (!products.has(resource.app)) fail(`unknown resource app: ${resource.app}`);
    if (!/^resources\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resource.route) || routes.has(resource.route)) fail(`unsafe or duplicate resource route: ${resource.route}`);
    if (resource.content !== `marketing/${resource.route}.html`) fail(`invalid resource content path: ${resource.content}`);
    if (!text(resource.title) || !text(resource.description)) fail(`resource title and description required: ${resource.route}`);
    routes.add(resource.route);
    files.push(`${resource.route}/index.html`);
  }
  const assets = new Set();
  for (const asset of marketing.assets) {
    if (typeof asset !== 'string' || !/^marketing\/assets\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\.png|site\.css)$/.test(asset)) fail(`unsafe asset publication path: ${asset}`);
    if (assets.has(asset)) fail(`duplicate marketing asset: ${asset}`);
    assets.add(asset);
    files.push(asset);
  }
  return files.sort();
}

function source(rootDir, path, label) {
  const full = join(rootDir, path);
  if (!existsSync(full)) fail(`missing ${label}: ${path}`);
  const rel = relative(realpathSync(rootDir), realpathSync(full));
  if (rel.startsWith('..') || isAbsolute(rel)) fail(`unsafe ${label} source: ${path}`);
  return readFileSync(full);
}

function validateContent(data, entry, marketing) {
  for (const key of ['title', 'description', 'headline', 'intro', 'category', 'tagline', 'cardHeadline', 'theme', 'group', 'purchaseNote', 'sourceVersion', 'reviewedAt']) {
    if (!text(data[key])) fail(`missing product ${key}: ${entry.app}`);
  }
  if ('appStoreId' in data || 'name' in data) fail(`product identity must come from apps.json: ${entry.app}`);
  if (!THEMES.has(data.theme) || !Object.hasOwn(GROUPS, data.group)) fail(`invalid product theme or group: ${entry.app}`);
  for (const [key, count] of [['steps', 3], ['features', 2]]) {
    if (!Array.isArray(data[key]) || (key === 'steps' ? data[key].length !== count : data[key].length < count) || data[key].some(item => !text(item.title) || !text(item.text))) fail(`invalid product ${key}: ${entry.app}`);
  }
  for (const key of ['included', 'premium', 'privacy', 'limitations']) {
    if (!Array.isArray(data[key]) || !data[key].length || data[key].some(item => !text(item))) fail(`invalid product ${key}: ${entry.app}`);
  }
  if (!Array.isArray(data.screenshots) || !data.screenshots.length) fail(`missing product screenshots: ${entry.app}`);
  const seen = new Set();
  for (const shot of data.screenshots) {
    if (!marketing.assets.includes(shot.src) || !shot.src.endsWith('.png')) fail(`unregistered screenshot: ${shot.src}`);
    const prefix = `marketing/assets/${entry.app === 'umbra' ? 'penumbra' : entry.app}-`;
    if (!shot.src.startsWith(prefix) || !/^[0-9]+[.]png$/.test(shot.src.slice(prefix.length))) fail(`screenshot does not match product identity: ${entry.app}`);
    if (seen.has(shot.src)) fail(`duplicate screenshot: ${shot.src}`);
    seen.add(shot.src);
    if (!text(shot.alt) || !Number.isInteger(shot.width) || !Number.isInteger(shot.height) || shot.width <= 0 || shot.height <= 0) fail(`invalid screenshot metadata: ${entry.app}`);
  }
  if (data.resourceRoute && !marketing.resources.some(r => r.route === data.resourceRoute && r.app === entry.app)) fail(`unknown product resource route: ${data.resourceRoute}`);
}

function image(shot, lazy = false) {
  return `<img class="poster" src="/${esc(shot.src)}" width="${shot.width}" height="${shot.height}"${lazy ? ' loading="lazy"' : ''} alt="${esc(shot.alt)}">`;
}
const list = (items) => `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
const paragraphs = (items) => items.map(item => `<p>${esc(item)}</p>`).join('');

function productBody({ app, entry, data }, marketing) {
  const resource = marketing.resources.find(r => r.route === data.resourceRoute);
  const resourceLink = resource ? `<a class="inline-link" href="/${resource.route}/">${esc(resource.title)}</a>` : '';
  return `<div class="shell"><p class="breadcrumb"><a href="/#apps">All apps</a> <span aria-hidden="true">/</span> ${esc(app.name)}</p>
<section class="product-hero" aria-labelledby="product-title"><div class="product-copy"><p class="eyebrow">${esc(app.name)} / ${esc(data.category)}</p><h1 id="product-title">${lines(data.headline)}</h1><p class="lead">${esc(data.intro)}</p><div class="product-actions"><a class="button button-coral" href="${storeUrl(app)}">Get ${esc(app.name)} on the App Store <span aria-hidden="true">↗</span></a>${resourceLink}</div><p class="product-fineprint">For iPhone · ${esc(data.purchaseNote)}</p><div class="product-proof"><span>${esc(data.tagline)}</span></div></div><div class="product-art">${image(data.screenshots[0])}</div></section>
<section class="how-section" aria-labelledby="how-title"><p class="eyebrow">Getting started</p><h2 id="how-title">One step at a time.</h2><ol class="steps">${data.steps.map((step, i) => `<li><span class="step-number" aria-hidden="true">0${i + 1}</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></li>`).join('')}</ol></section>
<section class="product-features" aria-labelledby="features-title"><h2 id="features-title">Made to be useful.</h2><div class="feature-list">${data.features.map(feature => `<div><h3>${esc(feature.title)}</h3><p>${esc(feature.text)}</p></div>`).join('')}</div></section>
<section class="product-depth" aria-labelledby="included-title"><div class="depth-art">${image(data.screenshots[1] || data.screenshots[0], true)}</div><div class="depth-copy"><p class="eyebrow">What you get</p><h2 id="included-title">A clear place to begin.</h2><div class="plan-row"><h3>Included to start</h3>${list(data.included)}</div><div class="plan-row"><h3>Paid options</h3>${list(data.premium)}</div><p class="pricing-note">${esc(data.purchaseNote)} Local prices and purchase terms are shown in the app before purchase.</p></div></section>
<section class="privacy-block" aria-labelledby="privacy-title"><div><p class="eyebrow">Your data, considered</p><h2 id="privacy-title">${lines(data.privacyHeadline || 'Privacy, in practice.')}</h2></div><div class="privacy-copy">${paragraphs(data.privacy)}<a class="inline-link" href="/${app.slug}/privacy">Read ${esc(app.name)}’s privacy policy</a></div></section>
<section class="limitations" aria-labelledby="limits-title"><h2 id="limits-title">A few things to know.</h2>${list(data.limitations)}</section>
${resource ? `<aside class="product-resource"><div><h2>A good place to start.</h2><p>${esc(resource.description)}</p></div>${resourceLink}</aside>` : ''}
<aside class="product-resource"><div><h2>Need a hand with ${esc(app.name)}?</h2><p><a href="/${app.slug}/privacy">Privacy policy</a> · <a href="/${app.slug}/terms">Terms of use</a></p></div><a class="inline-link" href="/${app.slug}/support">${esc(app.name)} support <span aria-hidden="true">↗</span></a></aside></div>`;
}

function resourceCards(products, marketing) {
  return marketing.resources.map(resource => {
    const { app } = products.find(product => product.app.slug === resource.app);
    return `<article class="resource-card"><p class="eyebrow">${esc(app.name)} / A practical guide</p><h3><a href="/${resource.route}/">${esc(resource.title)}</a></h3><p>${esc(resource.description)}</p></article>`;
  }).join('');
}

function homepage(products, marketing, template) {
  const byApp = new Map(products.map(p => [p.app.slug, p]));
  const featured = marketing.featured.map((slug, i) => {
    const { app, entry, data } = byApp.get(slug);
    const art = `<div class="feature-art">${data.screenshots.slice(0, slug === 'umbra' ? 2 : 1).map(s => image(s, i > 0)).join('')}</div>`;
    const copy = `<div class="feature-copy"><p class="eyebrow">0${i + 1} / ${esc(app.name)} · ${esc(data.category)}</p><h3 id="featured-${app.slug}" class="feature-title">${lines(data.cardHeadline)}</h3><p>${esc(data.intro)}</p><a class="button ${slug === 'umbra' ? 'button-light' : 'button-coral'}" href="/${entry.route}/">Meet ${esc(app.name)} <span aria-hidden="true">↗</span></a><div class="feature-meta">${esc(data.tagline)}</div></div>`;
    return `<article class="feature ${slug === 'umbra' ? 'feature-pen' : 'feature-vox'}" aria-labelledby="featured-${app.slug}">${slug === 'umbra' ? art + copy : copy + art}</article>`;
  }).join('');
  const catalog = Object.entries(GROUPS).map(([group, title]) => `<section aria-labelledby="group-${group}"><h3 class="group-label" id="group-${group}">${title}</h3>${products.filter(p => !marketing.featured.includes(p.app.slug) && p.data.group === group).map(({ app, entry, data }) => `<article class="app-card"><h3><a href="/${entry.route}/">${esc(app.name)} <span class="arrow" aria-hidden="true">↗</span></a></h3><p>${esc(data.description)}</p></article>`).join('')}</section>`).join('');
  return template.replaceAll('__FEATURED__', featured).replaceAll('__CATALOG__', catalog).replaceAll('__RESOURCES__', resourceCards(products, marketing));
}

export function buildMarketing({ rootDir, outDir, apps, marketing }) {
  marketingFiles({ apps, marketing });
  if (!marketing.assets.includes('marketing/assets/site.css')) fail('required marketing stylesheet is not registered');
  const assets = new Map(marketing.assets.map(path => [path, source(rootDir, path, 'asset')]));
  const products = marketing.products.map(entry => {
    const data = JSON.parse(source(rootDir, entry.content, 'product content').toString('utf8'));
    validateContent(data, entry, marketing);
    for (const shot of data.screenshots) {
      const png = assets.get(shot.src);
      if (png.length < 24 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || png.readUInt32BE(16) !== shot.width || png.readUInt32BE(20) !== shot.height) fail(`screenshot dimensions or PNG content do not match: ${shot.src}`);
    }
    return { entry, data, app: apps.find(app => app.slug === entry.app) };
  });
  const resources = marketing.resources.map(resource => {
    const html = source(rootDir, resource.content, 'resource content').toString('utf8');
    if (!html.trim() || /<(?:h1|script|iframe|form|input|textarea|link)\b/i.test(html)) fail(`resource must be a noninteractive body fragment without h1: ${resource.route}`);
    return { ...resource, html };
  });
  const template = source(rootDir, 'templates/page.html', 'page template').toString('utf8');
  const write = (path, content) => { mkdirSync(dirname(join(outDir, path)), { recursive: true }); writeFileSync(join(outDir, path), content); };
  const page = ({ route = '', title, description, content, bodyClass = '', schema }) => {
    const values = { TITLE: esc(title), DESCRIPTION: esc(description), CANONICAL: esc(canonical(route)), CONTENT: content, BODY_CLASS: esc(bodyClass), SCHEMA: schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : '' };
    write(route ? `${route}/index.html` : 'index.html', template.replace(/__(TITLE|DESCRIPTION|CANONICAL|CONTENT|BODY_CLASS|SCHEMA)__/g, (_, key) => values[key]));
  };
  page({ title: 'bogtsi — independent iPhone apps for real life', description: 'Eleven independent iPhone apps for voice practice, private reflection, everyday care, and the things you make time for. Find your next useful thing.', content: homepage(products, marketing, source(rootDir, 'templates/index.html', 'homepage template').toString('utf8')) });
  page({ route: 'resources', title: 'Practical guides for voice and reflection — bogtsi', description: 'Two free, printable guides: a five-minute vocal warm-up and a private reflection worksheet. No app, account, or sign-up required.', content: `<section class="home-intro shell" aria-labelledby="resources-title"><div><p class="eyebrow">From the notebook</p><h1 id="resources-title">A good place<br>to start.</h1></div><div class="intro-aside"><p>Two small, practical guides. Read them here or print a copy. No sign-up, no download, and no app required.</p></div></section><section class="resources" aria-label="Practical guides"><div class="shell resource-grid">${resourceCards(products, marketing)}</div></section>` });
  for (const product of products) {
    const { app, entry, data } = product;
    page({ route: entry.route, title: data.title, description: data.description, bodyClass: `theme-${data.theme}`, content: productBody(product, marketing), schema: { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: app.name, description: data.description, operatingSystem: 'iOS', url: canonical(entry.route), installUrl: storeUrl(app), screenshot: data.screenshots.map(s => `${ORIGIN}/${s.src}`), author: { '@type': 'Organization', name: 'bogtsi', url: `${ORIGIN}/` } } });
  }
  for (const resource of resources) {
    const product = products.find(p => p.app.slug === resource.app);
    page({ route: resource.route, title: `${resource.title} — bogtsi`, description: resource.description, content: `<article class="shell editorial"><p class="eyebrow">From the notebook / ${esc(product.app.name)}</p><h1>${esc(resource.title)}</h1><div class="resource-body">${resource.html}</div><p class="resource-app-link">Want an app alongside this practice? <a href="/${product.entry.route}/">Meet ${esc(product.app.name)}</a>. No app is required to use this page.</p></article>` });
  }
  page({ route: 'site-privacy', title: 'Website privacy — bogtsi', description: 'How bogtsi.xyz handles website privacy: no visitor tracking, ordinary GitHub Pages hosting requests, and separate privacy policies for each app.', content: source(rootDir, 'templates/site-privacy.html', 'privacy template').toString('utf8') });
  const urls = ['', 'support', 'site-privacy', 'resources', ...marketing.products.map(p => p.route), ...marketing.resources.map(r => r.route)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(route => `  <url><loc>${canonical(route)}</loc></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  for (const [path, bytes] of assets) write(path, bytes);
  buildSupport({ rootDir, outDir, apps, pages: JSON.parse(source(rootDir, 'pages.json', 'legal page registry').toString('utf8')) });
}

// Support needs pages.json to retain app-scoped legal links. Kept separate from
// marketing content so unreleased legal entries never acquire product CTAs.
function buildSupport({ rootDir, outDir, apps, pages }) {
  const links = apps.map(app => `<li><strong>${esc(app.name)}</strong><nav aria-label="${esc(app.name)} legal and support">${pages.filter(p => !p.app || p.app === app.slug).map(p => `<a href="/${app.slug}/${p.route}">${esc(p.label)}</a>`).join('')}</nav></li>`).join('\n');
  const content = readFileSync(join(rootDir, 'templates/support.html'), 'utf8').replaceAll('__APP_LINKS__', links);
  const values = { TITLE: 'App support, privacy & terms — bogtsi', DESCRIPTION: 'Find support, privacy policies and terms for every bogtsi app, including Wageproof’s Spanish support and legal pages.', CANONICAL: canonical('support'), CONTENT: content, BODY_CLASS: '', SCHEMA: '' };
  mkdirSync(join(outDir, 'support'), { recursive: true });
  writeFileSync(join(outDir, 'support/index.html'), readFileSync(join(rootDir, 'templates/page.html'), 'utf8').replace(/__(TITLE|DESCRIPTION|CANONICAL|CONTENT|BODY_CLASS|SCHEMA)__/g, (_, key) => key === 'CONTENT' ? values[key] : esc(values[key])));
}
