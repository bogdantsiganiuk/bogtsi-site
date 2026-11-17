const PIXELS_PER_SECOND = 18;

export function initCarousel(root) {
  const document = root.ownerDocument;
  const view = document.defaultView;
  const viewport = root.querySelector('[data-carousel-viewport]');
  const track = root.querySelector('.carousel-track');
  const toggle = root.querySelector('[data-carousel-toggle]');
  const previous = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const motion = view.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = [];
  let requested = !motion.matches && !root.contains(document.activeElement);
  let hovered = root.matches(':hover');
  let visible = !view.IntersectionObserver;
  let disposed = false;
  let frame = null;
  let lastTime = null;
  let rotationPointer = false;

  const maximum = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  const clamp = position => Math.max(0, Math.min(position, maximum()));
  const running = () => requested && !hovered && !document.hidden && visible && !motion.matches && !disposed;
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  };
  const updateBounds = () => {
    previous.disabled = viewport.scrollLeft <= 1;
    next.disabled = viewport.scrollLeft >= maximum() - 1;
  };
  const cancelFrame = () => {
    if (frame !== null) view.cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
  };
  const update = () => {
    if (disposed) return;
    viewport.classList.toggle('carousel-auto', requested && !motion.matches);
    toggle.textContent = requested ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', requested ? 'Pause automatic scrolling' : 'Play automatic scrolling');
    toggle.disabled = motion.matches;
    updateBounds();
    if (!running()) cancelFrame();
    else if (frame === null) frame = view.requestAnimationFrame(advance);
  };
  function advance(timestamp) {
    frame = null;
    if (!running()) { lastTime = null; return; }
    if (lastTime !== null) viewport.scrollLeft = clamp(viewport.scrollLeft + (timestamp - lastTime) * PIXELS_PER_SECOND / 1000);
    lastTime = timestamp;
    if (viewport.scrollLeft >= maximum()) {
      requested = false;
      cancelFrame();
      update();
      return;
    }
    updateBounds();
    frame = view.requestAnimationFrame(advance);
  }
  const pause = () => { requested = false; update(); };
  const play = () => {
    if (motion.matches) return;
    if (viewport.scrollLeft >= maximum() - 1) viewport.scrollLeft = 0;
    requested = true;
    lastTime = null;
    update();
  };
  const step = direction => {
    pause();
    const cards = track.children;
    const firstLeft = cards[0].getBoundingClientRect().left;
    const current = viewport.scrollLeft;
    let destination = direction > 0 ? maximum() : 0;
    // Relative geometry removes the leading track padding and works after resize.
    for (const card of cards) {
      const position = clamp(card.getBoundingClientRect().left - firstLeft);
      if (direction > 0 && position > current + 1) { destination = position; break; }
      if (direction < 0 && position < current - 1) destination = position;
    }
    viewport.scrollLeft = clamp(destination);
    updateBounds();
  };

  listen(toggle, 'click', () => {
    rotationPointer = false;
    if (requested) pause();
    else play();
  });
  listen(previous, 'click', () => step(-1));
  listen(next, 'click', () => step(1));
  listen(root, 'mouseenter', () => { hovered = true; update(); });
  listen(root, 'mouseleave', () => { hovered = false; rotationPointer = false; update(); });
  listen(root, 'pointerdown', event => {
    // A pointer activates Pause after focusin. Do not let that focus event first
    // change its action into Play; keyboard focus still stops rotation normally.
    rotationPointer = toggle.contains(event.target);
    if (!rotationPointer) pause();
  }, { passive: true });
  listen(root, 'pointerup', () => { rotationPointer = false; }, { passive: true });
  listen(root, 'pointercancel', () => { rotationPointer = false; }, { passive: true });
  listen(root, 'focusin', event => {
    if (rotationPointer && toggle.contains(event.target)) return;
    pause();
  });
  listen(root, 'focusout', event => {
    if (!root.contains(event.relatedTarget)) rotationPointer = false;
  });
  listen(root, 'touchstart', event => {
    if (!toggle.contains(event.target)) pause();
  }, { passive: true });
  listen(root, 'wheel', pause, { passive: true });
  listen(root, 'keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) pause();
  });
  listen(viewport, 'scroll', updateBounds, { passive: true });
  listen(view, 'resize', updateBounds);
  listen(document, 'visibilitychange', update);
  listen(motion, 'change', () => {
    if (motion.matches) requested = false;
    update();
  });

  const intersection = view.IntersectionObserver ? new view.IntersectionObserver(entries => {
    const entry = entries.find(entry => entry.target === root);
    if (entry) { visible = entry.isIntersecting; update(); }
  }) : null;
  const resize = view.ResizeObserver ? new view.ResizeObserver(updateBounds) : null;
  viewport.classList.add('carousel-controlled');
  root.classList.add('carousel-ready');
  intersection?.observe(root);
  resize?.observe(viewport);
  resize?.observe(track);
  for (const button of [toggle, previous, next]) button.hidden = false;
  update();

  return () => {
    disposed = true;
    cancelFrame();
    for (const remove of listeners) remove();
    intersection?.disconnect();
    resize?.disconnect();
    viewport.classList.remove('carousel-controlled', 'carousel-auto');
    root.classList.remove('carousel-ready');
    for (const button of [toggle, previous, next]) button.hidden = true;
  };
}

if (typeof document !== 'undefined') {
  for (const root of document.querySelectorAll('[data-carousel]')) initCarousel(root);
}
