import { test as controllerTest } from 'node:test';
import assert from 'node:assert/strict';

let initCarousel;
let importFailure;
try {
  ({ initCarousel } = await import('../marketing/assets/carousel.mjs'));
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  importFailure = error.message;
}

// Native EventTarget supplies listener ordering, cancellation and once semantics.
// This fixture supplies only the DOM tree, layout and browser clock unavailable in Node.
class Element extends EventTarget {
  constructor(ownerDocument, { className = '', attributes = {}, width = 0, left = 0 } = {}) {
    super();
    this.ownerDocument = ownerDocument;
    this.parentElement = null;
    this.children = [];
    this.attributes = new Map(Object.entries(attributes));
    this.className = className;
    this.style = {
      scrollSnapType: '', scrollBehavior: '',
      setProperty(name, value) { this[name] = value; },
      removeProperty(name) { delete this[name]; },
    };
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(' '); },
      toggle: (name, force) => {
        const add = force ?? !this.classList.contains(name);
        this.classList[add ? 'add' : 'remove'](name);
        return add;
      },
    };
    this.dataset = Object.fromEntries(Object.entries(attributes).filter(([name]) => name.startsWith('data-')).map(([name, value]) => [name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), value]));
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
    this.clientWidth = width;
    this.scrollWidth = width;
    this.offsetLeft = left;
    this.offsetWidth = width;
    this.position = 0;
  }
  append(...children) {
    for (const child of children) {
      child.parentElement = this;
      this.children.push(child);
    }
  }
  get id() { return this.getAttribute('id') ?? ''; }
  get scrollLeft() { return this.position; }
  set scrollLeft(value) { this.position = Math.max(0, Math.min(value, this.scrollWidth - this.clientWidth)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  hasAttribute(name) { return this.attributes.has(name); }
  contains(node) { return node === this || this.children.some(child => child.contains(node)); }
  matches(selector) {
    if (selector === ':hover') return this.contains(this.ownerDocument.hoveredElement);
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    const attribute = /^\[([^=\]]+)(?:="([^"]*)")?\]$/.exec(selector);
    return Boolean(attribute && this.hasAttribute(attribute[1]) && (attribute[2] === undefined || this.getAttribute(attribute[1]) === attribute[2]));
  }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) ?? null; }
  querySelectorAll(selector) {
    return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  getBoundingClientRect() {
    const viewport = this.ownerDocument.viewport;
    const left = this === viewport ? 100 : 100 + this.offsetLeft - viewport.scrollLeft;
    return { left, right: left + this.offsetWidth, top: 0, bottom: 500, width: this.offsetWidth, height: 500, x: left, y: 0 };
  }
  scrollTo(options, y) { this.scrollLeft = typeof options === 'number' ? options : options.left; }
  scrollBy(options) { this.scrollLeft += options.left; }
  focus() { this.ownerDocument.activeElement = this; }
}

function fixture({ reducedMotion = false, hidden = false, visible = true } = {}) {
  const document = new EventTarget();
  const view = new EventTarget();
  document.defaultView = view;
  document.hidden = hidden;
  Object.defineProperty(document, 'visibilityState', { get: () => document.hidden ? 'hidden' : 'visible' });
  document.activeElement = null;
  document.hoveredElement = null;
  let now = 0;
  let nextFrame = 0;
  const frames = new Map();
  view.requestAnimationFrame = callback => { const id = ++nextFrame; frames.set(id, callback); return id; };
  view.cancelAnimationFrame = id => frames.delete(id);
  view.performance = { now: () => now };
  const media = new EventTarget();
  media.matches = reducedMotion;
  media.media = '(prefers-reduced-motion: reduce)';
  view.matchMedia = query => {
    assert.equal(query, '(prefers-reduced-motion: reduce)');
    return media;
  };
  const observers = { intersection: [], resize: [] };
  view.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.connected = false; observers.intersection.push(this); }
    observe(target) { this.target = target; this.connected = true; this.deliver(visible); }
    disconnect() { this.connected = false; }
    deliver(isIntersecting) {
      if (this.connected) this.callback([{ target: this.target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }]);
    }
  };
  view.ResizeObserver = class {
    constructor(callback) { this.callback = callback; this.connected = false; observers.resize.push(this); }
    observe(target) { this.target = target; this.connected = true; }
    disconnect() { this.connected = false; }
    deliver() { if (this.connected) this.callback([{ target: this.target }]); }
  };
  const root = new Element(document, { className: 'app-carousel', attributes: { 'data-carousel': '' } });
  const viewport = new Element(document, { className: 'carousel-viewport', attributes: { id: 'carousel-viewport', 'data-carousel-viewport': '' }, width: 320 });
  document.viewport = viewport;
  viewport.scrollWidth = 1280;
  const track = new Element(document, { className: 'carousel-track', attributes: { 'data-carousel-track': '' } });
  const cards = [8, 328, 648, 968].map(left => new Element(document, { className: 'carousel-item', width: 300, left }));
  const anchor = new Element(document, { attributes: { href: '#first-app' } });
  cards[0].append(anchor);
  const toggle = new Element(document, { className: 'carousel-toggle', attributes: { 'data-carousel-toggle': '', 'aria-label': 'Pause automatic scrolling', 'aria-controls': viewport.id } });
  const previous = new Element(document, { className: 'carousel-previous', attributes: { 'data-carousel-prev': '', 'aria-controls': viewport.id } });
  const next = new Element(document, { className: 'carousel-next', attributes: { 'data-carousel-next': '', 'aria-controls': viewport.id } });
  for (const button of [toggle, previous, next]) button.hidden = true;
  toggle.textContent = 'Pause';
  track.append(...cards);
  viewport.append(track);
  root.append(toggle, previous, viewport, next);

  function emit(target, type, properties = {}) {
    if (type === 'mouseenter') document.hoveredElement = target;
    if (type === 'mouseleave' && target.contains(document.hoveredElement)) document.hoveredElement = null;
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperties(event, Object.fromEntries(Object.entries({ target, ...properties }).map(([name, value]) => [name, { value, configurable: true }])));
    for (let node = target; node; node = node.parentElement) {
      node.dispatchEvent(event);
      if (event.cancelBubble) break;
    }
    return event;
  }
  const advance = milliseconds => {
    now += milliseconds;
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(now);
  };
  return {
    root, viewport, track, cards, anchor, toggle, previous, next, document, view, media, observers, emit, advance,
    pendingFrames: () => frames.size,
    setHidden(value) { document.hidden = value; document.dispatchEvent(new Event('visibilitychange')); },
    setReduced(value) { media.matches = value; media.dispatchEvent(new Event('change')); },
    setVisible(value) { for (const observer of observers.intersection) observer.deliver(value); },
    resize() { view.dispatchEvent(new Event('resize')); for (const observer of observers.resize) observer.deliver(); },
    start() {
      assert.equal(typeof initCarousel, 'function', `Missing initCarousel(root) from marketing/assets/carousel.mjs${importFailure ? `: ${importFailure}` : ''}`);
      const cleanup = initCarousel(root);
      advance(0);
      return cleanup;
    },
    click(button) { emit(button, 'click'); },
    pointerClick(button) {
      const previousFocus = document.activeElement;
      emit(button, 'pointerdown', { pointerType: 'mouse' });
      if (previousFocus && previousFocus !== button) emit(previousFocus, 'focusout', { relatedTarget: button });
      document.activeElement = button;
      if (previousFocus !== button) emit(button, 'focusin', { relatedTarget: previousFocus });
      emit(button, 'pointerup', { pointerType: 'mouse' });
      emit(button, 'click');
    },
  };
}

function closeTo(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 0.00001, `expected scrollLeft ${expected}, received ${actual}`);
}
function action(button) { return button.getAttribute('aria-label') || button.textContent; }
controllerTest('automatic movement advances the real viewport at 18 CSS pixels per second', () => {
  const f = fixture();
  const cleanup = f.start();
  assert.equal(typeof cleanup, 'function');
  assert.equal(f.toggle.hidden, false);
  assert.equal(f.previous.hidden, false);
  assert.equal(f.next.hidden, false);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 18);
  f.advance(500);
  closeTo(f.viewport.scrollLeft, 27);
  cleanup();
});

controllerTest('Pause stops scheduling and Play resumes without elapsed-time jumps', () => {
  const f = fixture();
  const cleanup = f.start();
  f.advance(1000);
  f.click(f.toggle);
  assert.match(action(f.toggle), /play/i);
  assert.equal(f.pendingFrames(), 0);
  f.advance(60000);
  closeTo(f.viewport.scrollLeft, 18);
  f.click(f.toggle);
  assert.match(action(f.toggle), /pause/i);
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 36);
  cleanup();
});

controllerTest('pointerdown then focusin then click on Pause remains a pause, not an accidental Play', () => {
  const f = fixture();
  const cleanup = f.start();
  f.advance(1000);
  f.pointerClick(f.toggle);
  assert.match(action(f.toggle), /play/i);
  assert.equal(f.pendingFrames(), 0);
  f.advance(10000);
  closeTo(f.viewport.scrollLeft, 18);
  // The same already-focused button can explicitly restart rotation.
  f.click(f.toggle);
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 36);
  cleanup();
});

controllerTest('focus moving from the playing rotation control into content stops rotation', () => {
  const f = fixture();
  const cleanup = f.start();
  f.pointerClick(f.toggle);
  f.click(f.toggle);
  f.advance(0);
  f.advance(1000);
  f.document.activeElement = f.anchor;
  f.emit(f.anchor, 'focusin', { relatedTarget: f.toggle });
  assert.equal(f.pendingFrames(), 0);
  f.advance(10000);
  closeTo(f.viewport.scrollLeft, 18);
  cleanup();
});

controllerTest('pointer activation of Pause preserves its action through content focusout', () => {
  const f = fixture();
  const cleanup = f.start();
  f.document.activeElement = f.anchor;
  f.emit(f.anchor, 'focusin');
  // Assistive activation need not move DOM focus to the activated button.
  f.click(f.toggle);
  f.advance(0);
  f.advance(1000);
  f.pointerClick(f.toggle);
  assert.match(action(f.toggle), /play/i);
  assert.equal(f.pendingFrames(), 0);
  f.advance(10000);
  closeTo(f.viewport.scrollLeft, 18);
  cleanup();
});

controllerTest('arrows step between actual card starts, skip initial 8px padding, and enforce both bounds', () => {
  const f = fixture();
  const cleanup = f.start();
  assert.equal(f.previous.disabled, true);
  assert.equal(f.next.disabled, false);
  const anchorCount = f.track.children.length;
  f.click(f.next);
  closeTo(f.viewport.scrollLeft, 320);
  assert.equal(f.pendingFrames(), 0);
  assert.equal(f.document.activeElement, null, 'arrows do not move focus');
  f.click(f.next);
  closeTo(f.viewport.scrollLeft, 640);
  f.click(f.next);
  closeTo(f.viewport.scrollLeft, 960);
  assert.equal(f.next.disabled, true);
  assert.equal(f.previous.disabled, false);
  f.click(f.next);
  closeTo(f.viewport.scrollLeft, 960);
  f.click(f.previous);
  closeTo(f.viewport.scrollLeft, 640);
  f.click(f.previous);
  f.click(f.previous);
  f.click(f.previous);
  closeTo(f.viewport.scrollLeft, 0);
  assert.equal(f.previous.disabled, true);
  assert.equal(f.track.children.length, anchorCount, 'navigation must not clone cards');
  cleanup();
});

controllerTest('arrows use geometry relative to the first card even after a partial native scroll', () => {
  const f = fixture();
  const cleanup = f.start();
  f.viewport.scrollLeft = 170;
  f.emit(f.viewport, 'scroll');
  f.click(f.next);
  closeTo(f.viewport.scrollLeft, 320);
  f.viewport.scrollLeft = 170;
  f.emit(f.viewport, 'scroll');
  f.click(f.previous);
  closeTo(f.viewport.scrollLeft, 0);
  cleanup();
});

controllerTest('initial hover pauses rotation until the existing pointer leaves', () => {
  const f = fixture();
  f.document.hoveredElement = f.anchor;
  const cleanup = f.start();
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 0);
  assert.equal(f.pendingFrames(), 0);
  f.advance(60000);
  closeTo(f.viewport.scrollLeft, 0);
  f.emit(f.root, 'mouseleave');
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 18);
  cleanup();
});

controllerTest('initial focus requires explicit Play even after focus leaves the carousel', () => {
  const f = fixture();
  f.anchor.focus();
  const cleanup = f.start();
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 0);
  assert.equal(f.pendingFrames(), 0);
  f.document.activeElement = null;
  f.emit(f.anchor, 'focusout', { relatedTarget: null });
  f.emit(f.root, 'mouseleave');
  f.setVisible(false);
  f.setVisible(true);
  f.advance(60000);
  closeTo(f.viewport.scrollLeft, 0);
  f.pointerClick(f.toggle);
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 18);
  cleanup();
});

controllerTest('hover temporarily pauses and leaving resumes without accumulating paused time', () => {
  const f = fixture();
  const cleanup = f.start();
  f.advance(1000);
  f.emit(f.root, 'mouseenter');
  assert.equal(f.pendingFrames(), 0);
  f.advance(60000);
  closeTo(f.viewport.scrollLeft, 18);
  f.emit(f.root, 'mouseleave');
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 36);
  cleanup();
});

controllerTest('focus entering content pauses persistently even after focus and hover leave', () => {
  const f = fixture();
  const cleanup = f.start();
  f.advance(1000);
  f.document.activeElement = f.anchor;
  f.emit(f.anchor, 'focusin');
  assert.equal(f.pendingFrames(), 0);
  f.document.activeElement = null;
  f.emit(f.anchor, 'focusout', { relatedTarget: null });
  f.emit(f.root, 'mouseleave');
  f.advance(10000);
  closeTo(f.viewport.scrollLeft, 18);
  f.pointerClick(f.toggle);
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 36);
  cleanup();
});

for (const [name, type, properties] of [
  ['mouse pointer', 'pointerdown', { pointerType: 'mouse' }],
  ['touch pointer', 'pointerdown', { pointerType: 'touch' }],
  ['native touch', 'touchstart', {}],
  ['wheel', 'wheel', { deltaX: 90, deltaY: 0 }],
  ['keyboard navigation', 'keydown', { key: 'ArrowRight' }],
]) {
  controllerTest(`${name} input pauses persistently without preventing native gestures`, () => {
    const f = fixture();
    const cleanup = f.start();
    f.advance(1000);
    const event = f.emit(f.viewport, type, properties);
    assert.equal(event.defaultPrevented, false);
    assert.equal(f.pendingFrames(), 0);
    f.emit(f.root, 'mouseleave');
    f.setHidden(true);
    f.setHidden(false);
    f.setVisible(false);
    f.setVisible(true);
    f.advance(10000);
    closeTo(f.viewport.scrollLeft, 18);
    f.click(f.toggle);
    f.advance(0);
    f.advance(1000);
    closeTo(f.viewport.scrollLeft, 36);
    cleanup();
  });
}

controllerTest('card anchors retain their default action and are not intercepted', () => {
  const f = fixture();
  const cleanup = f.start();
  assert.equal(f.emit(f.anchor, 'click').defaultPrevented, false);
  cleanup();
});

controllerTest('hidden pages cancel frames and resume from a fresh clock', () => {
  const f = fixture();
  const cleanup = f.start();
  f.advance(1000);
  f.setHidden(true);
  assert.equal(f.pendingFrames(), 0);
  f.advance(120000);
  closeTo(f.viewport.scrollLeft, 18);
  f.setHidden(false);
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 36);
  cleanup();
});

controllerTest('offscreen carousels cancel frames and resume from a fresh clock', () => {
  const f = fixture();
  const cleanup = f.start();
  f.advance(1000);
  f.setVisible(false);
  assert.equal(f.pendingFrames(), 0);
  f.advance(120000);
  closeTo(f.viewport.scrollLeft, 18);
  f.setVisible(true);
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 36);
  cleanup();
});

for (const [name, options] of [
  ['reduced-motion preference', { reducedMotion: true }],
  ['initially hidden page', { hidden: true }],
  ['initially offscreen carousel', { visible: false }],
]) {
  controllerTest(`${name} suppresses automatic movement at initialization`, () => {
    const f = fixture(options);
    const cleanup = f.start();
    assert.equal(f.pendingFrames(), 0);
    f.advance(10000);
    closeTo(f.viewport.scrollLeft, 0);
    if (options.reducedMotion) {
      f.click(f.toggle);
      f.advance(10000);
      closeTo(f.viewport.scrollLeft, 0);
      assert.equal(f.pendingFrames(), 0);
    }
    cleanup();
  });
}

controllerTest('changing reduced-motion preference cancels active movement and prevents Play from overriding it', () => {
  const f = fixture();
  const cleanup = f.start();
  f.advance(1000);
  f.setReduced(true);
  assert.equal(f.pendingFrames(), 0);
  f.advance(60000);
  closeTo(f.viewport.scrollLeft, 18);
  f.click(f.toggle);
  f.advance(10000);
  closeTo(f.viewport.scrollLeft, 18);
  assert.equal(f.pendingFrames(), 0);
  f.setReduced(false);
  // Whether preference removal resumes automatically or requires Play, no old time may leak.
  f.advance(0);
  if (!f.pendingFrames()) f.click(f.toggle);
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 36);
  cleanup();
});

controllerTest('automatic motion clamps at the end and stops without wrapping', () => {
  const f = fixture();
  const cleanup = f.start();
  f.viewport.scrollLeft = 950;
  f.emit(f.viewport, 'scroll');
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 960);
  assert.equal(f.pendingFrames(), 0);
  assert.equal(f.next.disabled, true);
  assert.match(action(f.toggle), /play/i);
  f.advance(60000);
  closeTo(f.viewport.scrollLeft, 960);
  f.click(f.toggle);
  closeTo(f.viewport.scrollLeft, 0);
  f.advance(0);
  f.advance(1000);
  closeTo(f.viewport.scrollLeft, 18);
  cleanup();
});

controllerTest('resize and native scroll update bounds and arrows use the current card geometry', () => {
  const f = fixture();
  const cleanup = f.start();
  f.click(f.toggle);
  f.cards.forEach((card, index) => { card.offsetLeft = 8 + index * 400; card.offsetWidth = 380; });
  f.viewport.clientWidth = 400;
  f.viewport.offsetWidth = 400;
  f.viewport.scrollWidth = 1600;
  f.resize();
  f.click(f.next);
  closeTo(f.viewport.scrollLeft, 400);
  f.viewport.scrollLeft = 1200;
  f.emit(f.viewport, 'scroll');
  assert.equal(f.next.disabled, true);
  assert.equal(f.previous.disabled, false);
  f.viewport.scrollLeft = 0;
  f.emit(f.viewport, 'scroll');
  assert.equal(f.previous.disabled, true);
  assert.equal(f.next.disabled, false);
  cleanup();
});

controllerTest('cleanup cancels animation and detaches event and observer effects', () => {
  const f = fixture();
  const cleanup = f.start();
  f.advance(1000);
  cleanup();
  assert.equal(f.pendingFrames(), 0);
  f.click(f.next);
  f.click(f.toggle);
  f.emit(f.root, 'mouseleave');
  f.setVisible(false);
  f.setVisible(true);
  f.setHidden(true);
  f.setHidden(false);
  f.setReduced(true);
  f.setReduced(false);
  f.resize();
  f.advance(10000);
  closeTo(f.viewport.scrollLeft, 18);
  assert.equal(f.pendingFrames(), 0);
  assert.ok(f.observers.intersection.every(observer => !observer.connected));
  assert.ok(f.observers.resize.every(observer => !observer.connected));
});
