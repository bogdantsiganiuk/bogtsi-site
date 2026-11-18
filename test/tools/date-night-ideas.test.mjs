import test from 'node:test';
import assert from 'node:assert/strict';
import { IDEAS, filterIdeas, nextIdea } from '../../marketing/assets/tools/date-night-ideas.mjs';

const ANY = { budget: 'any', time: 'any', setting: 'any' };

test('catalogue is well formed and unique', () => {
  assert.ok(IDEAS.length > 100);
  assert.equal(new Set(IDEAS.map((i) => i.id)).size, IDEAS.length);
  for (const i of IDEAS) {
    assert.ok(i.title && i.description);
    assert.ok(['free', 'cheap', 'splurge'].includes(i.budget));
    assert.ok(['quick', 'evening', 'allday'].includes(i.time));
    assert.ok(['in', 'out'].includes(i.setting));
  }
});

test('filterIdeas with all "any" returns everything', () => {
  assert.equal(filterIdeas(IDEAS, ANY).length, IDEAS.length);
  assert.equal(filterIdeas(IDEAS).length, IDEAS.length);
});

test('filterIdeas applies every filter together', () => {
  const r = filterIdeas(IDEAS, { budget: 'free', time: 'evening', setting: 'in' });
  assert.ok(r.length > 0);
  for (const i of r) {
    assert.equal(i.budget, 'free');
    assert.equal(i.time, 'evening');
    assert.equal(i.setting, 'in');
  }
  const expected = IDEAS.filter((i) => i.budget === 'free' && i.time === 'evening' && i.setting === 'in');
  assert.deepEqual(r.map((i) => i.id), expected.map((i) => i.id));
});

test('filterIdeas returns an empty array when nothing matches', () => {
  const pool = [{ id: 'a', budget: 'free', time: 'quick', setting: 'in' }];
  assert.deepEqual(filterIdeas(pool, { budget: 'splurge', time: 'any', setting: 'any' }), []);
});

test('nextIdea never repeats until the pool is exhausted', () => {
  const pool = filterIdeas(IDEAS, { budget: 'free', time: 'any', setting: 'out' });
  assert.ok(pool.length > 3);
  let seen = [];
  const shown = [];
  let seq = 0;
  const rng = () => ((seq++ * 0.37) % 1);
  for (let n = 0; n < pool.length; n++) {
    const r = nextIdea(pool, seen, rng);
    assert.equal(r.cycled, false);
    shown.push(r.idea.id);
    seen = r.seen;
  }
  assert.equal(new Set(shown).size, pool.length);
  assert.deepEqual([...shown].sort(), pool.map((i) => i.id).sort());
});

test('nextIdea starts a new round after exhaustion without repeating the last idea', () => {
  const pool = [
    { id: 'a', budget: 'free', time: 'quick', setting: 'in' },
    { id: 'b', budget: 'free', time: 'quick', setting: 'in' },
  ];
  const first = nextIdea(pool, [], () => 0);
  const second = nextIdea(pool, first.seen, () => 0);
  assert.notEqual(first.idea.id, second.idea.id);
  const third = nextIdea(pool, second.seen, () => 0);
  assert.equal(third.cycled, true);
  assert.notEqual(third.idea.id, second.idea.id);
  assert.deepEqual(third.seen, [third.idea.id]);
});

test('nextIdea ignores seen ids that are no longer in the pool', () => {
  const pool = [{ id: 'a', budget: 'free', time: 'quick', setting: 'in' }];
  const r = nextIdea(pool, ['gone', 'also-gone'], () => 0.9);
  assert.equal(r.idea.id, 'a');
  assert.equal(r.cycled, false);
});

test('nextIdea handles an empty pool and a single-idea pool', () => {
  const r = nextIdea([], ['x'], () => 0);
  assert.equal(r.idea, null);
  assert.deepEqual(r.seen, []);
  const one = [{ id: 'a', budget: 'free', time: 'quick', setting: 'in' }];
  const a = nextIdea(one, [], () => 0);
  const b = nextIdea(one, a.seen, () => 0);
  assert.equal(b.idea.id, 'a');
  assert.equal(b.cycled, true);
});
