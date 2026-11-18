// Tank volume and water-change calculators for the "How to cycle a fish tank" guide.
// Pure logic is exported for tests; init(root) wires the DOM in browsers only.

const LITERS_PER_US_GALLON = 3.785411784;
const CM3_PER_IN3 = 16.387064;
const CM3_PER_LITER = 1000;

const toNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.trim().replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
};

const fail = (error) => ({ ok: false, error });

/**
 * Rectangular tank volume. Dimensions in `unit` ('cm' or 'in').
 * waterDepth (optional, same unit) must be > 0 and no taller than the tank.
 */
export function tankVolume(input) {
  if (!input || typeof input !== 'object') return fail('Enter the tank dimensions.');
  const { unit } = input;
  if (unit !== 'cm' && unit !== 'in') return fail('Choose centimeters or inches.');
  const length = toNumber(input.length);
  const width = toNumber(input.width);
  const height = toNumber(input.height);
  if (!(length > 0) || !(width > 0) || !(height > 0)) {
    return fail('Length, width and height must be numbers greater than zero.');
  }
  const hasDepth =
    input.waterDepth !== undefined && input.waterDepth !== null && input.waterDepth !== '';
  let depth = height;
  if (hasDepth) {
    depth = toNumber(input.waterDepth);
    if (!(depth > 0)) return fail('Water depth must be a number greater than zero.');
    if (depth > height) return fail('Water depth cannot be taller than the tank.');
  }
  const cm3PerUnit3 = unit === 'in' ? CM3_PER_IN3 : 1;
  const liters = (length * width * height * cm3PerUnit3) / CM3_PER_LITER;
  const filledLiters = (length * width * depth * cm3PerUnit3) / CM3_PER_LITER;
  return {
    ok: true,
    liters,
    usGallons: liters / LITERS_PER_US_GALLON,
    filledLiters,
    filledUsGallons: filledLiters / LITERS_PER_US_GALLON,
  };
}

/**
 * Water change: volume in `unit` ('L' or 'gal' = US gallons), percent in (0, 100].
 * remainingFraction is the share of the old water still in the tank afterwards.
 */
export function waterChange(input) {
  if (!input || typeof input !== 'object') return fail('Enter the tank volume and percentage.');
  const { unit } = input;
  if (unit !== 'L' && unit !== 'gal') return fail('Choose liters or US gallons.');
  const volume = toNumber(input.volume);
  if (!(volume > 0)) return fail('Tank volume must be a number greater than zero.');
  const percent = toNumber(input.percent);
  if (!(percent > 0) || percent > 100) return fail('Percent must be above 0 and at most 100.');
  const volumeLiters = unit === 'gal' ? volume * LITERS_PER_US_GALLON : volume;
  const replaceLiters = (volumeLiters * percent) / 100;
  return {
    ok: true,
    replaceLiters,
    replaceUsGallons: replaceLiters / LITERS_PER_US_GALLON,
    remainingFraction: 1 - percent / 100,
  };
}

const fmt = (n) =>
  (Math.round(n * 10) / 10).toLocaleString('en-US', { maximumFractionDigits: 1 });

export function init(root) {
  if (!root) return;
  const $ = (id) => root.querySelector(`#${id}`);
  const volOut = $('bw-volume-result');
  const wcOut = $('bw-change-result');
  const volStatus = $('bw-volume-status');
  const wcStatus = $('bw-change-status');
  if (!volOut || !wcOut) return;

  const runVolume = () => {
    const r = tankVolume({
      length: $('bw-length').value,
      width: $('bw-width').value,
      height: $('bw-height').value,
      unit: $('bw-dim-unit').value,
      waterDepth: $('bw-depth').value,
    });
    if (!r.ok) {
      volOut.textContent = '';
      if (volStatus) volStatus.textContent = r.error;
      return;
    }
    if (volStatus) volStatus.textContent = '';
    const depthGiven = $('bw-depth').value.trim() !== '';
    volOut.textContent = depthGiven
      ? `Water volume: ${fmt(r.filledLiters)} L (${fmt(r.filledUsGallons)} US gal). Full tank: ${fmt(r.liters)} L (${fmt(r.usGallons)} US gal).`
      : `Tank volume: ${fmt(r.liters)} L (${fmt(r.usGallons)} US gal).`;
    // Hand the water volume to the water-change calculator.
    if (!$('bw-change-volume').value.trim()) {
      const unit = $('bw-change-unit').value;
      $('bw-change-volume').value = fmt(unit === 'gal' ? r.filledUsGallons : r.filledLiters).replace(/,/g, '');
    }
  };

  const runChange = () => {
    const r = waterChange({
      volume: $('bw-change-volume').value,
      unit: $('bw-change-unit').value,
      percent: $('bw-change-percent').value,
    });
    if (!r.ok) {
      wcOut.textContent = '';
      if (wcStatus) wcStatus.textContent = r.error;
      return;
    }
    if (wcStatus) wcStatus.textContent = '';
    wcOut.textContent =
      `Replace ${fmt(r.replaceLiters)} L (${fmt(r.replaceUsGallons)} US gal). ` +
      `${fmt(r.remainingFraction * 100)}% of the old water stays in the tank.`;
  };

  $('bw-volume-go')?.addEventListener('click', runVolume);
  $('bw-change-go')?.addEventListener('click', runChange);
}

if (globalThis.document) {
  const start = () => {
    const root = globalThis.document.querySelector('[data-tool="how-to-cycle-a-fish-tank"]');
    if (root) init(root);
  };
  if (globalThis.document.readyState === 'loading') {
    globalThis.document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}
