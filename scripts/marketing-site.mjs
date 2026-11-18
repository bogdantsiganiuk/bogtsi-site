// Local, explicit publication contract. No app-repository fetches belong here.
import { readFileSync, writeFileSync, mkdirSync, realpathSync, existsSync } from 'node:fs';
import { dirname, join, relative, isAbsolute } from 'node:path';
import { VISUAL_FILES, validateVisualAsset } from './marketing-assets.mjs';

const ORIGIN = 'https://bogtsi.xyz';
const ALIASES = { umbra: 'penumbra', noctura: 'halcyon', reverie: 'duskmere' };
const RESERVED = new Set(['privacy', 'terms', 'support', 'site-privacy', 'resources', 'marketing', 'index', 'robots', 'sitemap']);
const KINDS = new Set(['tool', 'guide']);
const RESOURCE_ROUTE = /^resources\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const THEMES = new Set(['coral', 'earth', 'night', 'ice', 'jade', 'ocean', 'garden', 'gold', 'indigo', 'slate']);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lines = (s) => esc(s).replace(/\r?\n/g, '<br>');
const storeUrl = (app) => `https://apps.apple.com/app/id${app.appStoreId}`;
const canonical = (route = '') => `${ORIGIN}/${route ? `${route}/` : ''}`;
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const fail = (message) => { throw new Error(message); };

// Pure: validate identity/routes and return the exact additional public files.
// The homepage already belongs to the legacy 64-file publication contract.
export function marketingFiles({ apps, marketing }) {
  if (!marketing || !Array.isArray(marketing.products) || !Array.isArray(marketing.resources) || !Array.isArray(marketing.assets)) fail('explicit marketing manifest is required');
  if ('featured' in marketing || 'campaigns' in marketing) fail('obsolete featured/campaigns configuration; use appOrder');
  if (!Array.isArray(marketing.appOrder)) fail('appOrder must be an explicit list of marketed app identities');
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
  const ordered = new Set();
  for (const app of marketing.appOrder) {
    if (!products.has(app) || ordered.has(app)) fail(`unknown, unmarketed or duplicate appOrder identity: ${app}`);
    ordered.add(app);
  }
  if (ordered.size !== products.size) fail('appOrder must contain every marketed product exactly once');
  for (const resource of marketing.resources) {
    if (!products.has(resource.app)) fail(`unknown resource app: ${resource.app}`);
    if (!RESOURCE_ROUTE.test(resource.route) || routes.has(resource.route)) fail(`unsafe or duplicate resource route: ${resource.route}`);
    if (resource.content !== `marketing/${resource.route}.html`) fail(`invalid resource content path: ${resource.content}`);
    if (!text(resource.title) || !text(resource.description)) fail(`resource title and description required: ${resource.route}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(resource.publishedAt || '') || !Number.isFinite(Date.parse(resource.publishedAt)) || new Date(resource.publishedAt).toISOString().slice(0, 10) !== resource.publishedAt) fail(`valid resource publication date required: ${resource.route}`);
    if (!KINDS.has(resource.kind)) fail(`resource kind must be tool or guide: ${resource.route}`);
    if (!text(resource.appPitch)) fail(`resource appPitch required: ${resource.route}`);
    if (typeof resource.note !== 'string') fail(`resource note must be a string: ${resource.route}`);
    if (resource.script !== undefined && resource.script !== `marketing/assets/tools/${resource.route.slice('resources/'.length)}.mjs`) fail(`resource script must be marketing/assets/tools/<slug>.mjs for its own slug: ${resource.route}`);
    if (resource.script !== undefined && !marketing.assets.includes(resource.script)) fail(`resource script must be registered in assets: ${resource.route}`);
    if (resource.redirectFrom !== undefined && !Array.isArray(resource.redirectFrom)) fail(`resource redirectFrom must be a list: ${resource.route}`);
    routes.add(resource.route);
    files.push(`${resource.route}/index.html`);
  }
  for (const resource of marketing.resources) {
    for (const from of resource.redirectFrom || []) {
      if (typeof from !== 'string' || !RESOURCE_ROUTE.test(from) || routes.has(from)) fail(`unsafe or colliding redirect route: ${from}`);
      routes.add(from);
      files.push(`${from}/index.html`);
    }
  }
  const assets = new Set();
  const allowedAssets = new Set(['marketing/assets/site.css', 'marketing/assets/carousel.mjs', ...marketing.resources.filter(r => r.script).map(r => r.script), ...marketing.products.flatMap(entry => Object.values(VISUAL_FILES).map(file => `marketing/assets/${entry.app}-${file}`))]);
  for (const asset of marketing.assets) {
    if (typeof asset !== 'string' || !allowedAssets.has(asset)) fail(`unsafe asset publication path: ${asset}`);
    if (assets.has(asset)) fail(`duplicate marketing asset: ${asset}`);
    assets.add(asset);
    files.push(asset);
  }
  return files.sort();
}

function validateFragment(html, route) {
  if (!html.trim() || /<(?:h1|script|style|iframe|form|textarea|link|object|embed)\b/i.test(html) || /<[^>]*\s(?:on[a-z]+|style)\s*=/i.test(html)) fail(`resource must be a body fragment without h1, script, style, frame, form, textarea, link, object, embed, inline handlers or style attributes: ${route}`);
  const ids = [...html.matchAll(/<[^>]*\sid\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) fail(`resource fragment ids must be unique: ${route}`);
}

function source(rootDir, path, label) {
  const full = join(rootDir, path);
  if (!existsSync(full)) fail(`missing ${label}: ${path}`);
  const rel = relative(realpathSync(rootDir), realpathSync(full));
  if (rel.startsWith('..') || isAbsolute(rel)) fail(`unsafe ${label} source: ${path}`);
  return readFileSync(full);
}

function validateContent(data, entry, marketing) {
  for (const key of ['title', 'description', 'headline', 'intro', 'category', 'tagline', 'cardHeadline', 'theme', 'purchaseNote', 'sourceVersion', 'reviewedAt']) {
    if (!text(data[key])) fail(`missing product ${key}: ${entry.app}`);
  }
  if ('appStoreId' in data || 'name' in data) fail(`product identity must come from apps.json: ${entry.app}`);
  if (!THEMES.has(data.theme)) fail(`invalid product theme: ${entry.app}`);
  for (const [key, count] of [['steps', 3], ['features', 2]]) {
    if (!Array.isArray(data[key]) || (key === 'steps' ? data[key].length !== count : data[key].length < count) || data[key].some(item => !text(item.title) || !text(item.text))) fail(`invalid product ${key}: ${entry.app}`);
  }
  for (const key of ['included', 'premium', 'privacy', 'limitations']) {
    if (!Array.isArray(data[key]) || !data[key].length || data[key].some(item => !text(item))) fail(`invalid product ${key}: ${entry.app}`);
  }
  if ('screenshots' in data) fail(`obsolete screenshots field: ${entry.app}`);
  if (!data.visuals || typeof data.visuals !== 'object' || Array.isArray(data.visuals) || Object.keys(data.visuals).length !== 4 || Object.keys(data.visuals).some(role => !Object.hasOwn(VISUAL_FILES, role))) fail(`exactly four visual roles required: ${entry.app}`);
  for (const [role, file] of Object.entries(VISUAL_FILES)) {
    const visual = data.visuals[role];
    if (!visual || !text(visual.src) || !marketing.assets.includes(visual.src)) fail(`unregistered visual ${role}: ${entry.app}`);
    if (visual.src !== `marketing/assets/${entry.app}-${file}`) fail(`visual does not match product identity: ${entry.app}/${role}`);
    if (!text(visual.alt) || !Number.isInteger(visual.width) || !Number.isInteger(visual.height) || visual.width <= 0 || visual.height <= 0) fail(`invalid visual metadata: ${entry.app}/${role}`);
  }
  for (const role of ['capture', 'secondaryCapture']) {
    if (!text(data.visuals[role].caption) || !['notch', 'island'].includes(data.visuals[role].frameProfile)) fail(`invalid ${role} caption or frame profile: ${entry.app}`);
  }
  if (data.resourceRoute && !marketing.resources.some(r => r.route === data.resourceRoute && r.app === entry.app)) fail(`unknown product resource route: ${data.resourceRoute}`);
}

function device({ app, entry, data }, { placement = 'main', visual = 'capture', link = 'source', lazy = false } = {}) {
  const image = data.visuals[visual];
  const tag = link ? 'a' : 'span';
  const destination = link === 'product' ? `/${entry.route}/` : `/${image.src}`;
  const action = link === 'product' ? `Meet ${app.name}` : `Open the complete ${app.name} screenshot`;
  return `<${tag} class="iphone-device" id="phone-${placement}-${app.slug}" data-frame-profile="${image.frameProfile}"${link ? ` href="${esc(destination)}" aria-label="${esc(action)}"` : ''}><span class="iphone-ground-shadow" aria-hidden="true"></span><span class="iphone-chassis"><span class="iphone-button iphone-mute" aria-hidden="true"></span><span class="iphone-button iphone-volume-up" aria-hidden="true"></span><span class="iphone-button iphone-volume-down" aria-hidden="true"></span><span class="iphone-button iphone-power" aria-hidden="true"></span><span class="iphone-antenna iphone-antenna-top" aria-hidden="true"></span><span class="iphone-antenna iphone-antenna-bottom" aria-hidden="true"></span><span class="iphone-glass" style="aspect-ratio:${image.width} / ${image.height}"><img class="iphone-screen-image" src="/${esc(image.src)}" width="${image.width}" height="${image.height}" alt="${esc(image.alt)}" decoding="async"${lazy ? ' loading="lazy"' : ''}><span class="iphone-sensor" aria-hidden="true"><span class="iphone-earpiece"></span><span class="iphone-camera"></span></span></span></span></${tag}>`;
}

function scene(product, { placement = 'main', visual = 'capture', link = 'source', lazy = false, sources = true } = {}) {
  const { app, data } = product;
  const image = data.visuals[visual];
  const sourceLinks = sources ? `<details class="scene-sources"><summary>Open complete images</summary><ul><li><a href="/${esc(image.src)}">Complete source screenshot · ${image.width} × ${image.height}</a></li><li><a href="/${esc(data.visuals.device.src)}">Standalone iPhone render · ${data.visuals.device.width} × ${data.visuals.device.height}</a></li></ul></details>` : '';
  return `<figure class="iphone-scene" id="scene-${placement}-${app.slug}" aria-label="${esc(app.name)} shown on an illustrative iPhone"><div class="iphone-stage">${device(product, { placement, visual, link, lazy })}</div><figcaption><p>${esc(image.caption)}</p>${sourceLinks}</figcaption></figure>`;
}

function art(data) {
  const visual = data.visuals.illustration;
  return `<figure class="art-note"><img class="supporting-art" src="/${esc(visual.src)}" width="${visual.width}" height="${visual.height}" alt="${esc(visual.alt)}" loading="lazy"></figure>`;
}
const list = (items) => `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
const paragraphs = (items) => items.map(item => `<p>${esc(item)}</p>`).join('');

function productBody({ app, entry, data }, marketing) {
  const resource = marketing.resources.find(r => r.route === data.resourceRoute);
  const resourceLink = resource ? `<a class="inline-link" href="/${resource.route}/">${esc(resource.title)}</a>` : '';
  return `<div class="shell"><p class="breadcrumb"><a href="/#apps">All apps</a> <span aria-hidden="true">/</span> ${esc(app.name)}</p>
<section class="product-hero" aria-labelledby="product-title"><div class="product-copy"><p class="eyebrow">${esc(app.name)} / ${esc(data.category)}</p><h1 id="product-title">${lines(data.headline)}</h1><p class="lead">${esc(data.intro)}</p><div class="product-actions"><a class="button button-coral" href="${storeUrl(app)}">Get ${esc(app.name)} on the App Store <span aria-hidden="true">↗</span></a>${resourceLink}</div><p class="product-fineprint">For iPhone · ${esc(data.purchaseNote)}</p><div class="product-proof"><span>${esc(data.tagline)}</span></div></div><div class="product-art">${scene({ app, data })}</div></section>
<section class="how-section" aria-labelledby="how-title"><div class="how-editorial"><p class="eyebrow">Getting started</p><h2 id="how-title">One step at a time.</h2>${art(data)}</div><ol class="steps">${data.steps.map((step, i) => `<li><span class="step-number" aria-hidden="true">0${i + 1}</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></li>`).join('')}</ol></section>
<section class="product-features" aria-labelledby="features-title"><h2 id="features-title">Made to be useful.</h2><div class="feature-list">${data.features.map(feature => `<div><h3>${esc(feature.title)}</h3><p>${esc(feature.text)}</p></div>`).join('')}</div></section>
<section class="product-depth depth-text-only" aria-labelledby="included-title"><div class="depth-copy"><p class="eyebrow">What you get</p><h2 id="included-title">A clear place to begin.</h2><div class="plan-row"><h3>Included to start</h3>${list(data.included)}</div><div class="plan-row"><h3>Paid options</h3>${list(data.premium)}</div><p class="pricing-note">${esc(data.purchaseNote)} Local prices and purchase terms are shown in the app before purchase.</p></div></section>
<section class="privacy-block" aria-labelledby="privacy-title"><div><p class="eyebrow">Your data, considered</p><h2 id="privacy-title">${lines(data.privacyHeadline || 'Privacy, in practice.')}</h2></div><div class="privacy-copy">${paragraphs(data.privacy)}<a class="inline-link" href="/${app.slug}/privacy">Read ${esc(app.name)}’s privacy policy</a></div></section>
<section class="limitations" aria-labelledby="limits-title"><h2 id="limits-title">A few things to know.</h2>${list(data.limitations)}</section>
${resource ? `<aside class="product-resource"><div><h2>A good place to start.</h2><p>${esc(resource.description)}</p></div>${resourceLink}</aside>` : ''}
<aside class="product-resource"><div><h2>Need a hand with ${esc(app.name)}?</h2><p><a href="/${app.slug}/privacy">Privacy policy</a> · <a href="/${app.slug}/terms">Terms of use</a></p></div><a class="inline-link" href="/${app.slug}/support">${esc(app.name)} support <span aria-hidden="true">↗</span></a></aside></div>`;
}

const resourceDateFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const resourceDate = (resource) => `<p class="resource-date">Published <time datetime="${resource.publishedAt}">${resourceDateFormat.format(new Date(resource.publishedAt))}</time></p>`;

function resourceCards(products, marketing) {
  return marketing.resources.map(resource => {
    const { app, data } = products.find(product => product.app.slug === resource.app);
    return `<article class="resource-card">${art(data)}<p class="eyebrow">${resource.kind === 'tool' ? 'Free tool' : 'Free guide'} / ${esc(app.name)}</p><h3><a href="/${resource.route}/">${esc(resource.title)}</a></h3>${resourceDate(resource)}<p>${esc(resource.description)}</p></article>`;
  }).join('');
}

function homepage(products, marketing, template) {
  const byApp = new Map(products.map(product => [product.app.slug, product]));
  const ordered = marketing.appOrder.map(slug => byApp.get(slug));
  const carousel = ordered.map((product, index) => {
    const { app, data } = product;
    return `<li class="carousel-item"><a class="carousel-card theme-${data.theme}" href="#highlight-${app.slug}"><div class="carousel-copy"><p class="eyebrow">${esc(data.category)}</p><h3>${esc(app.name)}</h3></div>${scene(product, { placement: 'carousel', visual: 'secondaryCapture', link: null, lazy: index > 0, sources: false })}<span class="carousel-explore">Explore below <span aria-hidden="true">↓</span></span></a></li>`;
  }).join('');
  const highlights = ordered.map(product => {
    const { app, entry, data } = product;
    return `<article class="feature theme-${data.theme}" id="highlight-${app.slug}" tabindex="-1" aria-labelledby="highlight-title-${app.slug}"><div class="feature-copy"><p class="eyebrow">${esc(data.category)}</p><h3 id="highlight-title-${app.slug}" class="feature-title"><a href="/${entry.route}/">${esc(app.name)}<br>${lines(data.cardHeadline)}</a></h3><p>${esc(data.intro)}</p><a class="button" href="/${entry.route}/">Meet ${esc(app.name)} <span aria-hidden="true">↗</span></a><div class="feature-meta">${esc(data.tagline)}</div></div><div class="feature-art">${scene(product, { placement: 'highlight', link: 'product', lazy: true, sources: false })}</div></article>`;
  }).join('');
  return template.replaceAll('__CAROUSEL__', carousel).replaceAll('__HIGHLIGHTS__', highlights).replaceAll('__RESOURCES__', resourceCards(products, marketing));
}

export function buildMarketing({ rootDir, outDir, apps, marketing }) {
  marketingFiles({ apps, marketing });
  if (!marketing.assets.includes('marketing/assets/site.css')) fail('required marketing stylesheet is not registered');
  if (!marketing.assets.includes('marketing/assets/carousel.mjs')) fail('required homepage carousel module is not registered');
  const assets = new Map(marketing.assets.map(path => [path, source(rootDir, path, 'asset')]));
  const products = marketing.products.map(entry => {
    const data = JSON.parse(source(rootDir, entry.content, 'product content').toString('utf8'));
    validateContent(data, entry, marketing);
    for (const [role, visual] of Object.entries(data.visuals)) validateVisualAsset(assets.get(visual.src), visual, role);
    if (assets.get(data.visuals.capture.src).equals(assets.get(data.visuals.secondaryCapture.src))) fail(`primary and secondary screenshots must contain distinct bytes: ${entry.app}`);
    return { entry, data, app: apps.find(app => app.slug === entry.app) };
  });
  const resources = marketing.resources.map(resource => {
    const html = source(rootDir, resource.content, 'resource content').toString('utf8');
    validateFragment(html, resource.route);
    return { ...resource, html };
  });
  const template = source(rootDir, 'templates/page.html', 'page template').toString('utf8');
  const redirectTemplate = source(rootDir, 'templates/redirect.html', 'redirect template').toString('utf8');
  const write = (path, content) => { mkdirSync(dirname(join(outDir, path)), { recursive: true }); writeFileSync(join(outDir, path), content); };
  const page = ({ route = '', title, description, content, bodyClass = '', schema, socialImage, headExtra = '' }) => {
    const values = { TITLE: esc(title), DESCRIPTION: esc(description), CANONICAL: esc(canonical(route)), HEAD_EXTRA: headExtra, CONTENT: content, BODY_CLASS: esc(bodyClass), SCHEMA: schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : '', SOCIAL_META: socialImage ? `<meta property="og:image" content="${ORIGIN}/${esc(socialImage.src)}">\n  <meta property="og:image:width" content="${socialImage.width}">\n  <meta property="og:image:height" content="${socialImage.height}">\n  <meta property="og:image:alt" content="${esc(socialImage.alt)}">\n  <meta name="twitter:image" content="${ORIGIN}/${esc(socialImage.src)}">\n  <meta name="twitter:image:alt" content="${esc(socialImage.alt)}">` : '', TWITTER_CARD: socialImage ? 'summary_large_image' : 'summary' };
    write(route ? `${route}/index.html` : 'index.html', template.replace(/__(TITLE|DESCRIPTION|CANONICAL|CONTENT|BODY_CLASS|SCHEMA|SOCIAL_META|TWITTER_CARD|HEAD_EXTRA)__/g, (_, key) => values[key]));
  };
  page({ title: 'bogtsi — independent iPhone apps for real life', description: 'Eleven independent iPhone apps for voice practice, private reflection, everyday care, and the things you make time for. Find your next useful thing.', content: homepage(products, marketing, source(rootDir, 'templates/index.html', 'homepage template').toString('utf8')) });
  page({ route: 'resources', title: 'Free tools and guides — bogtsi', description: 'Free browser tools and step-by-step guides: a vocal warm-up, date night ideas, a fish-tank cycling guide, shadow work, cold showers, dream recall and desk stretches.', content: `<section class="home-intro shell" aria-labelledby="resources-title"><div><p class="eyebrow">Free tools and guides</p><h1 id="resources-title">A good place<br>to start.</h1></div><div class="intro-aside"><p>Free tools and step-by-step guides you can use right now, each built around something we make.</p></div></section><section class="resources" aria-label="Free tools and guides"><div class="shell resource-grid">${resourceCards(products, marketing)}</div></section>` });
  for (const product of products) {
    const { app, entry, data } = product;
    page({ route: entry.route, title: data.title, description: data.description, bodyClass: `theme-${data.theme}`, content: productBody(product, marketing), socialImage: data.visuals.device, schema: { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: app.name, description: data.description, operatingSystem: 'iOS', url: canonical(entry.route), installUrl: storeUrl(app), screenshot: [`${ORIGIN}/${data.visuals.capture.src}`], image: `${ORIGIN}/${data.visuals.device.src}`, author: { '@type': 'Organization', name: 'bogtsi', url: `${ORIGIN}/` } } });
  }
  for (const resource of resources) {
    const product = products.find(p => p.app.slug === resource.app);
    const name = esc(product.app.name);
    const capture = product.data.visuals.capture;
    const appSection = `<section class="resource-app" aria-labelledby="resource-app-title"><div class="resource-app-copy"><p class="eyebrow">${name}</p><h2 id="resource-app-title">Take it further with ${name}.</h2><p>${esc(resource.appPitch)}</p><a class="button button-coral" href="/${product.entry.route}/">Meet ${name}</a></div>${scene(product, { placement: 'resource', visual: 'capture', link: 'product', lazy: true, sources: false })}</section>`;
    const note = resource.note.trim() ? `<p class="resource-note">${esc(resource.note)}</p>` : '';
    const headExtra = resource.script ? `<script type="module" src="/${resource.script}"></script>` : '';
    page({ route: resource.route, title: `${resource.title} — bogtsi`, description: resource.description, headExtra, content: `<article class="shell editorial"><p class="eyebrow">${resource.kind === 'tool' ? 'Free tool' : 'Free guide'} / ${name}</p><div class="resource-heading"><h1>${esc(resource.title)}</h1><div>${art(product.data)}</div></div>${resourceDate(resource)}<div class="resource-body">${resource.html}</div>${appSection}${note}</article>` });
    for (const from of resource.redirectFrom || []) {
      write(`${from}/index.html`, redirectTemplate.replaceAll('__TARGET__', canonical(resource.route)));
    }
  }
  page({ route: 'site-privacy', title: 'Website privacy — bogtsi', description: 'How bogtsi.xyz uses aggregate, cookie-free Cloudflare Web Analytics, ordinary GitHub Pages hosting requests, and separate privacy policies for each app.', content: source(rootDir, 'templates/site-privacy.html', 'privacy template').toString('utf8') });
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
  const values = { TITLE: 'App support, privacy & terms — bogtsi', DESCRIPTION: 'Find support, privacy policies and terms for every bogtsi app, including Wageproof’s Spanish support and legal pages.', CANONICAL: canonical('support'), CONTENT: content, BODY_CLASS: '', SCHEMA: '', SOCIAL_META: '', TWITTER_CARD: 'summary', HEAD_EXTRA: '' };
  mkdirSync(join(outDir, 'support'), { recursive: true });
  writeFileSync(join(outDir, 'support/index.html'), readFileSync(join(rootDir, 'templates/page.html'), 'utf8').replace(/__(TITLE|DESCRIPTION|CANONICAL|CONTENT|BODY_CLASS|SCHEMA|SOCIAL_META|TWITTER_CARD|HEAD_EXTRA)__/g, (_, key) => key === 'CONTENT' ? values[key] : esc(values[key])));
}
