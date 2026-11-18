import test from 'node:test';
import assert from 'node:assert/strict';
import { tankVolume, waterChange } from '../../marketing/assets/tools/how-to-cycle-a-fish-tank.mjs';

const near = (actual, expected, eps = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= eps, `${actual} not within ${eps} of ${expected}`);

test('tankVolume: 100 x 40 x 50 cm is 200 L', () => {
  const r = tankVolume({ length: 100, width: 40, height: 50, unit: 'cm' });
  assert.equal(r.ok, true);
  near(r.liters, 200);
  near(r.usGallons, 52.834, 0.001);
  assert.equal(r.filledLiters, r.liters);
});

test('tankVolume: 24 x 12 x 16 in is about 75.5 L / 19.95 US gal', () => {
  const r = tankVolume({ length: 24, width: 12, height: 16, unit: 'in' });
  assert.equal(r.ok, true);
  near(r.liters, 75.516, 0.005);
  near(r.usGallons, 19.948, 0.001);
});

test('tankVolume: fill depth reduces the water volume only', () => {
  const r = tankVolume({ length: 100, width: 40, height: 50, unit: 'cm', waterDepth: 45 });
  assert.equal(r.ok, true);
  near(r.liters, 200);
  near(r.filledLiters, 180);
  near(r.filledUsGallons, 47.55, 0.01);
});

test('tankVolume: accepts numeric strings', () => {
  const r = tankVolume({ length: '60', width: '30', height: '30', unit: 'cm' });
  assert.equal(r.ok, true);
  near(r.liters, 54);
});

test('tankVolume: rejects invalid input', () => {
  const bad = [
    { length: 0, width: 40, height: 50, unit: 'cm' },
    { length: -1, width: 40, height: 50, unit: 'cm' },
    { length: 'abc', width: 40, height: 50, unit: 'cm' },
    { length: '', width: 40, height: 50, unit: 'cm' },
    { length: Infinity, width: 40, height: 50, unit: 'cm' },
    { length: 100, width: 40, height: 50, unit: 'ft' },
    { length: 100, width: 40, height: 50, unit: 'cm', waterDepth: 60 },
    { length: 100, width: 40, height: 50, unit: 'cm', waterDepth: -5 },
    undefined,
  ];
  for (const input of bad) {
    const r = tankVolume(input);
    assert.equal(r.ok, false, JSON.stringify(input));
    assert.equal(typeof r.error, 'string');
  }
});

test('waterChange: 25% of 200 L', () => {
  const r = waterChange({ volume: 200, unit: 'L', percent: 25 });
  assert.equal(r.ok, true);
  near(r.replaceLiters, 50);
  near(r.replaceUsGallons, 13.209, 0.001);
  near(r.remainingFraction, 0.75, 1e-9);
});

test('waterChange: gallons in, 50% of 20 gal', () => {
  const r = waterChange({ volume: 20, unit: 'gal', percent: 50 });
  assert.equal(r.ok, true);
  near(r.replaceUsGallons, 10);
  near(r.replaceLiters, 37.854, 0.001);
  near(r.remainingFraction, 0.5, 1e-9);
});

test('waterChange: 100% leaves nothing; empty optional fields are errors', () => {
  const r = waterChange({ volume: 10, unit: 'L', percent: 100 });
  assert.equal(r.ok, true);
  assert.equal(r.remainingFraction, 0);
});

test('waterChange: rejects invalid input', () => {
  const bad = [
    { volume: 0, unit: 'L', percent: 25 },
    { volume: -5, unit: 'L', percent: 25 },
    { volume: 100, unit: 'L', percent: 0 },
    { volume: 100, unit: 'L', percent: 101 },
    { volume: 100, unit: 'L', percent: NaN },
    { volume: 'x', unit: 'L', percent: 25 },
    { volume: 100, unit: 'pt', percent: 25 },
    null,
  ];
  for (const input of bad) {
    const r = waterChange(input);
    assert.equal(r.ok, false, JSON.stringify(input));
    assert.equal(typeof r.error, 'string');
  }
});
