import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RANGES,
  ROUTINE,
  buildLadder,
  buildSession,
  fitLadderToBudget,
  midiToFrequency,
  midiToName,
  sessionDurationMs,
  stepTimeline,
} from '../../marketing/assets/tools/vocal-warm-up.mjs';

const RANGE_IDS = ['low', 'medium', 'high'];
const PATTERN_ORDER = ['five-note-scale', 'triad-135', 'octave-siren', 'lip-trill-five-note', 'hum-triad'];

test('three voice ranges, each wide enough for the whole routine', () => {
  assert.deepEqual(Object.keys(RANGES), RANGE_IDS);
  for (const id of RANGE_IDS) {
    const { lowMidi, highMidi } = RANGES[id];
    assert.ok(highMidi - lowMidi >= 24, `${id} spans two octaves`);
  }
  assert.ok(RANGES.low.lowMidi < RANGES.medium.lowMidi);
  assert.ok(RANGES.medium.lowMidi < RANGES.high.lowMidi);
});

test('the routine follows the free singer-5 order with the shipped syllables', () => {
  assert.deepEqual(
    ROUTINE.map((b) => b.id),
    ['deep-belly-breath', ...PATTERN_ORDER],
  );
  assert.deepEqual(
    ROUTINE.filter((b) => b.kind === 'pattern').map((b) => b.syllable),
    ['ah', 'ah', 'oo', 'brr', 'hmm'],
  );
});

test('session opens with the 4 / 2 / 6 breath, then each pattern in order', () => {
  for (const id of RANGE_IDS) {
    const steps = buildSession(id);
    assert.equal(steps[0].kind, 'breathing');
    assert.deepEqual(
      steps[0].phases.map((p) => [p.kind, p.seconds]),
      [
        ['inhale', 4],
        ['hold', 2],
        ['exhale', 6],
      ],
    );
    assert.equal(steps[0].durationMs, 12000);

    const order = [];
    for (const s of steps.slice(1)) {
      assert.equal(s.kind, 'pattern');
      if (order[order.length - 1] !== s.patternId) order.push(s.patternId);
    }
    assert.deepEqual(order, PATTERN_ORDER);
  }
});

test('rungs are numbered 1..n within each pattern', () => {
  const steps = buildSession('medium').filter((s) => s.kind === 'pattern');
  for (const id of PATTERN_ORDER) {
    const own = steps.filter((s) => s.patternId === id);
    assert.ok(own.length >= 1);
    assert.deepEqual(
      own.map((s) => s.rung),
      own.map((_, i) => i + 1),
    );
    assert.ok(own.every((s) => s.rungs === own.length));
  }
});

test('notes are the pattern offsets transposed from each rung root', () => {
  const steps = buildSession('medium').filter((s) => s.kind === 'pattern');
  const scale = steps.find((s) => s.patternId === 'five-note-scale');
  assert.deepEqual(
    scale.notes,
    [0, 2, 4, 5, 7, 5, 4, 2, 0].map((o) => scale.root + o),
  );
  const triad = steps.find((s) => s.patternId === 'triad-135');
  assert.deepEqual(
    triad.notes,
    [0, 4, 7, 4, 0].map((o) => triad.root + o),
  );
  const hum = steps.find((s) => s.patternId === 'hum-triad');
  assert.deepEqual(
    hum.notes,
    [0, 4, 7, 4, 0].map((o) => hum.root + o),
  );
  const siren = steps.find((s) => s.patternId === 'octave-siren');
  assert.equal(siren.glide, true);
  assert.deepEqual(siren.notes, [siren.root, siren.root + 12]);
  assert.equal(scale.glide, false);
});

test('every sung note stays inside the chosen range, for every range', () => {
  for (const id of RANGE_IDS) {
    const { lowMidi, highMidi } = RANGES[id];
    for (const s of buildSession(id)) {
      if (s.kind !== 'pattern') continue;
      assert.ok(Math.min(...s.notes) >= lowMidi, `${id} ${s.patternId} low`);
      assert.ok(Math.max(...s.notes) <= highMidi, `${id} ${s.patternId} high`);
      assert.ok(Math.min(...s.notes) >= lowMidi + 2 && Math.max(...s.notes) <= highMidi - 2, 'comfortable inset');
    }
  }
});

test('buildLadder walks whole tones up the inset root band and back down', () => {
  // Baritone-style 45-69, five-note scale (span 7): safe roots 45..62, inset 47..60.
  const ladder = buildLadder([0, 2, 4, 5, 7, 5, 4, 2, 0], { lowMidi: 45, highMidi: 69 });
  assert.deepEqual(ladder, [47, 49, 51, 53, 55, 57, 59, 57, 55, 53, 51, 49, 47]);
  // Octave siren (span 12): roots 45..57, inset 47..55.
  assert.deepEqual(buildLadder([0, 12], { lowMidi: 45, highMidi: 69 }), [47, 49, 51, 53, 55, 53, 51, 49, 47]);
  // Pattern wider than the range gives no root at all, never a clamped one.
  assert.deepEqual(buildLadder([0, 12], { lowMidi: 60, highMidi: 66 }), []);
});

test('fitLadderToBudget keeps first and last rung and preserves order', () => {
  const ladder = [47, 49, 51, 53, 55, 57, 59, 57, 55, 53, 51, 49, 47];
  assert.deepEqual(fitLadderToBudget(ladder, 3), [47, 59, 47]);
  assert.deepEqual(fitLadderToBudget(ladder, 1), [47]);
  assert.deepEqual(fitLadderToBudget(ladder, 0), []);
  assert.deepEqual(fitLadderToBudget(ladder, 40), ladder);
  const five = fitLadderToBudget(ladder, 5);
  assert.equal(five.length, 5);
  assert.equal(five[0], 47);
  assert.equal(five[4], 47);
});

test('the session fits inside five minutes and is not trivially short', () => {
  for (const id of RANGE_IDS) {
    const total = sessionDurationMs(buildSession(id));
    assert.ok(total <= 5 * 60000, `${id} ${total}`);
    assert.ok(total >= 3.5 * 60000, `${id} ${total}`);
  }
});

test('stepTimeline: listen, count-in, sing, rest for a pattern; three phases for the breath', () => {
  const steps = buildSession('high');
  const breath = stepTimeline(steps[0]);
  assert.deepEqual(
    breath.map((p) => [p.kind, p.ms]),
    [
      ['inhale', 4000],
      ['hold', 2000],
      ['exhale', 6000],
    ],
  );
  const rung = steps[1];
  const tl = stepTimeline(rung);
  assert.deepEqual(
    tl.map((p) => p.kind),
    ['listen', 'countIn', 'sing', 'rest'],
  );
  assert.equal(tl[0].ms, rung.phraseMs);
  assert.equal(tl[2].ms, rung.phraseMs);
  assert.equal(
    tl.reduce((sum, p) => sum + p.ms, 0),
    rung.durationMs,
  );
});

test('pitch helpers', () => {
  assert.equal(midiToFrequency(69), 440);
  assert.ok(Math.abs(midiToFrequency(60) - 261.6256) < 0.001);
  assert.equal(midiToName(60), 'C4');
  assert.equal(midiToName(70), 'A#4');
});

test('unknown range is rejected', () => {
  assert.throws(() => buildSession('baritone-ish'));
});
