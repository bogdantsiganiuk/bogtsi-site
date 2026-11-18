// Voxwarm's free five-minute Singer warm-up, played in the browser.
//
// Content mirrors voxwarm/src/domain: routines.ts (`singer-5` blocks),
// patterns.ts (offsets, syllables, tempos), breathing.ts (deep belly 4/2/6),
// transposition.ts (root ladder, inset by two semitones, whole-tone steps) and
// routineBudget.ts (ladders thinned to the routine's five minutes, first and
// last rung kept). Everything below is pure except `init`, which is the only
// code that touches the page or Web Audio.

export const TOOL_SLUG = 'vocal-warm-up';

// Two-octave bands from voxwarm's voiceRange.ts. The page offers three of them.
export const RANGES = {
  low: { lowMidi: 45, highMidi: 69, label: 'Low' }, // A2-A4
  medium: { lowMidi: 53, highMidi: 77, label: 'Medium' }, // F3-F5
  high: { lowMidi: 60, highMidi: 84, label: 'High' }, // C4-C6
};

const COMFORT_MARGIN = 2; // voiceRange.comfortableRange default
const LADDER_STEP = 2; // every singer-5 block uses ladderStep 2
const COUNT_IN_BEATS = 3;
const SETTLE_GAP_MS = 120;
const REST_BEAT_MS = 1200; // the app's per-rung result beat
export const ROUTINE_MINUTES = 5;

export const BREATH = {
  kind: 'breathing',
  id: 'deep-belly-breath',
  name: 'Deep belly breath',
  cue: 'Breathe low into your belly',
  inhaleSeconds: 4,
  holdSeconds: 2,
  exhaleSeconds: 6,
};

// The free singer-5 routine, in order. offsets are semitones above each root.
export const ROUTINE = [
  BREATH,
  { kind: 'pattern', id: 'five-note-scale', name: 'Five-note scale', syllable: 'ah', offsets: [0, 2, 4, 5, 7, 5, 4, 2, 0], glide: false, bpm: 80 },
  { kind: 'pattern', id: 'triad-135', name: '1-3-5-3-1', syllable: 'ah', offsets: [0, 4, 7, 4, 0], glide: false, bpm: 82 },
  { kind: 'pattern', id: 'octave-siren', name: 'Octave siren', syllable: 'oo', offsets: [0, 12], glide: true, bpm: 40 },
  { kind: 'pattern', id: 'lip-trill-five-note', name: 'Lip trill five-note', syllable: 'brr', offsets: [0, 2, 4, 5, 7, 5, 4, 2, 0], glide: false, bpm: 90 },
  { kind: 'pattern', id: 'hum-triad', name: 'Hum on a triad', syllable: 'hmm', offsets: [0, 4, 7, 4, 0], glide: false, bpm: 70 },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function midiToName(midi) {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

function resolveRange(range) {
  if (typeof range === 'string') {
    if (!Object.prototype.hasOwnProperty.call(RANGES, range)) throw new RangeError(`Unknown voice range: ${range}`);
    return RANGES[range];
  }
  if (range && Number.isFinite(range.lowMidi) && Number.isFinite(range.highMidi) && range.lowMidi < range.highMidi) {
    return range;
  }
  throw new RangeError('A voice range needs lowMidi < highMidi');
}

/**
 * Root notes for one pattern: every root that keeps all offsets inside the
 * range, inset by two semitones at each end, walked up in whole tones and back
 * down. [] when the pattern is wider than the range (never a clamped root).
 */
export function buildLadder(offsets, range) {
  const { lowMidi, highMidi } = resolveRange(range);
  const rootLow = lowMidi - Math.min(...offsets);
  const rootHigh = highMidi - Math.max(...offsets);
  if (rootLow > rootHigh) return [];
  let walkLow = rootLow + COMFORT_MARGIN;
  let walkHigh = rootHigh - COMFORT_MARGIN;
  if (walkLow > walkHigh) {
    const mid = Math.round((rootLow + rootHigh) / 2);
    walkLow = mid;
    walkHigh = mid;
  }
  const up = [];
  for (let root = walkLow; root <= walkHigh; root += LADDER_STEP) up.push(root);
  return [...up, ...up.slice(0, -1).reverse()];
}

/** Thin a ladder to at most maxRungs, keeping first and last and the order. */
export function fitLadderToBudget(ladder, maxRungs) {
  if (maxRungs <= 0) return [];
  if (ladder.length <= maxRungs) return [...ladder];
  if (maxRungs === 1) return [ladder[0]];
  const kept = [];
  for (let i = 0; i < maxRungs; i += 1) {
    kept.push(ladder[Math.round((i * (ladder.length - 1)) / (maxRungs - 1))]);
  }
  return kept;
}

function noteMsFor(pattern) {
  const beat = 60000 / pattern.bpm;
  return pattern.glide ? beat * 2 : beat; // a glide leg takes two beats
}

function phraseMsFor(pattern) {
  const legs = pattern.glide ? pattern.offsets.length - 1 : pattern.offsets.length;
  return noteMsFor(pattern) * legs;
}

function countInMs(pattern) {
  return SETTLE_GAP_MS + COUNT_IN_BEATS * (60000 / pattern.bpm) + SETTLE_GAP_MS;
}

function rungMs(pattern) {
  return phraseMsFor(pattern) * 2 + countInMs(pattern) + REST_BEAT_MS;
}

function breathMs(b) {
  return (b.inhaleSeconds + b.holdSeconds + b.exhaleSeconds) * 1000;
}

/**
 * The whole session for a voice range as an ordered flat step list: the 4/2/6
 * breath, then every rung of each pattern in routine order. Each pattern gets
 * an equal share of the five minutes left after the breath, as in the app.
 */
export function buildSession(range) {
  const bounds = resolveRange(range);
  const patterns = ROUTINE.filter((b) => b.kind === 'pattern');
  const breath = ROUTINE.find((b) => b.kind === 'breathing');
  const perBlockMs = (ROUTINE_MINUTES * 60000 - breathMs(breath)) / patterns.length;
  const steps = [];
  for (const block of ROUTINE) {
    if (block.kind === 'breathing') {
      steps.push({
        kind: 'breathing',
        patternId: block.id,
        name: block.name,
        cue: block.cue,
        phases: [
          { kind: 'inhale', seconds: block.inhaleSeconds, label: 'Breathe in' },
          { kind: 'hold', seconds: block.holdSeconds, label: 'Hold' },
          { kind: 'exhale', seconds: block.exhaleSeconds, label: 'Breathe out' },
        ],
        durationMs: breathMs(block),
      });
      continue;
    }
    const fit = Math.max(1, Math.floor(perBlockMs / rungMs(block)));
    const roots = fitLadderToBudget(buildLadder(block.offsets, bounds), fit);
    roots.forEach((root, i) => {
      steps.push({
        kind: 'pattern',
        patternId: block.id,
        name: block.name,
        syllable: block.syllable,
        glide: block.glide,
        bpm: block.bpm,
        root,
        notes: block.offsets.map((o) => root + o),
        rung: i + 1,
        rungs: roots.length,
        noteMs: noteMsFor(block),
        phraseMs: phraseMsFor(block),
        durationMs: rungMs(block),
      });
    });
  }
  return steps;
}

export function sessionDurationMs(steps) {
  return steps.reduce((sum, s) => sum + s.durationMs, 0);
}

/** The timed phases inside one step. */
export function stepTimeline(step) {
  if (step.kind === 'breathing') {
    return step.phases.map((p) => ({ kind: p.kind, label: p.label, ms: p.seconds * 1000 }));
  }
  return [
    { kind: 'listen', label: 'Listen', ms: step.phraseMs },
    { kind: 'countIn', label: 'Get ready', ms: SETTLE_GAP_MS * 2 + COUNT_IN_BEATS * (60000 / step.bpm) },
    { kind: 'sing', label: 'Your turn', ms: step.phraseMs },
    { kind: 'rest', label: 'Breathe', ms: REST_BEAT_MS },
  ];
}

// ---------------------------------------------------------------------------
// Browser wiring
// ---------------------------------------------------------------------------

const HARMONICS = [
  [1, 1],
  [2, 0.45],
  [3, 0.22],
  [4, 0.1],
];

export function init(root) {
  const $ = (suffix) => root.querySelector(`#vw-${suffix}`);
  const rangeSelect = $('range');
  const startBtn = $('start');
  const pauseBtn = $('pause');
  const nextBtn = $('next');
  const exerciseOut = $('exercise');
  const instructionOut = $('instruction');
  const detailOut = $('detail');
  const progressOut = $('progress');
  const countdownOut = $('countdown');
  const panel = $('controls');
  if (!rangeSelect || !startBtn || !pauseBtn || !nextBtn || !exerciseOut || !instructionOut || !detailOut || !progressOut || !countdownOut) {
    return;
  }
  if (panel) panel.hidden = false;

  const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
  let ctx = null;
  let master = null;
  let session = [];
  let stepIndex = 0;
  let timeline = [];
  let phaseIndex = 0;
  let phaseEnd = 0;
  let timer = null;
  let ticker = null;
  let state = 'idle'; // idle | running | paused | finished

  function clearTimers() {
    if (timer !== null) globalThis.clearTimeout(timer);
    if (ticker !== null) globalThis.clearInterval(ticker);
    timer = null;
    ticker = null;
  }

  function silence() {
    if (master) {
      master.disconnect();
      master = null;
    }
  }

  function voice() {
    if (!ctx) return null;
    if (!master) {
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    return master;
  }

  // Piano-like: a few decaying harmonics with a fast attack. A glide sweeps
  // the pitch smoothly instead of stepping.
  function tone(fromMidi, toMidi, start, seconds) {
    const out = voice();
    if (!out) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.35, start + 0.012);
    // Glides hold their level so the target pitch is still audible; only the tail fades.
    if (toMidi !== fromMidi) env.gain.setValueAtTime(0.35, start + Math.max(0.012, seconds - 0.15));
    env.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    env.connect(out);
    for (const [mult, amp] of HARMONICS) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      g.gain.value = amp / 2;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(midiToFrequency(fromMidi) * mult, start);
      if (toMidi !== fromMidi) {
        osc.frequency.exponentialRampToValueAtTime(midiToFrequency(toMidi) * mult, start + seconds * 0.95);
      }
      osc.connect(g);
      g.connect(env);
      osc.start(start);
      osc.stop(start + seconds + 0.05);
    }
  }

  function click(start) {
    const out = voice();
    if (!out) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = 1100;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.25, start + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.05);
    osc.connect(g);
    g.connect(out);
    osc.start(start);
    osc.stop(start + 0.08);
  }

  function playPhrase(step) {
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.05;
    if (step.glide) {
      tone(step.notes[0], step.notes[1], t0, step.noteMs / 1000);
      return;
    }
    step.notes.forEach((midi, i) => {
      tone(midi, midi, t0 + (i * step.noteMs) / 1000, (step.noteMs / 1000) * 0.92);
    });
  }

  function playCountIn(step) {
    if (!ctx) return;
    const beat = 60 / step.bpm;
    const t0 = ctx.currentTime + SETTLE_GAP_MS / 1000;
    for (let i = 0; i < COUNT_IN_BEATS; i += 1) click(t0 + i * beat);
  }

  function showStep(step) {
    progressOut.value = `Step ${stepIndex + 1} of ${session.length}`;
    if (step.kind === 'breathing') {
      exerciseOut.value = step.name;
      detailOut.value = `${step.cue}. In 4 seconds, hold 2, out 6.`;
    } else {
      exerciseOut.value = step.name;
      detailOut.value = `Sing "${step.syllable}" from ${midiToName(step.notes[0])}${step.glide ? ` up to ${midiToName(step.notes[1])}` : ''}. Round ${step.rung} of ${step.rungs}.`;
    }
  }

  function showPhase(phase, step) {
    if (step.kind === 'pattern' && phase.kind === 'sing') {
      instructionOut.value = `Your turn: sing "${step.syllable}"`;
    } else {
      instructionOut.value = phase.label;
    }
  }

  function updateCountdown(step) {
    const msLeft = Math.max(0, phaseEnd - Date.now());
    const phase = timeline[phaseIndex];
    if (!phase) return;
    countdownOut.value = step.kind === 'pattern' && phase.kind === 'rest' ? '' : String(Math.ceil(msLeft / 1000));
  }

  function runPhase() {
    const step = session[stepIndex];
    const phase = timeline[phaseIndex];
    showPhase(phase, step);
    phaseEnd = Date.now() + phase.ms;
    updateCountdown(step);
    if (step.kind === 'pattern') {
      if (phase.kind === 'listen') playPhrase(step);
      if (phase.kind === 'countIn') playCountIn(step);
    }
    timer = globalThis.setTimeout(() => {
      phaseIndex += 1;
      if (phaseIndex < timeline.length) runPhase();
      else advance();
    }, phase.ms);
  }

  function beginStep() {
    clearTimers();
    silence();
    const step = session[stepIndex];
    timeline = stepTimeline(step);
    phaseIndex = 0;
    showStep(step);
    ticker = globalThis.setInterval(() => updateCountdown(session[stepIndex]), 200);
    runPhase();
  }

  function finish() {
    clearTimers();
    silence();
    state = 'finished';
    exerciseOut.value = 'Warm-up complete';
    instructionOut.value = 'Nice work. Take a sip of water.';
    detailOut.value = '';
    countdownOut.value = '';
    progressOut.value = `Step ${session.length} of ${session.length}`;
    syncButtons();
  }

  function advance() {
    stepIndex += 1;
    if (stepIndex >= session.length) finish();
    else beginStep();
  }

  function syncButtons() {
    const active = state === 'running' || state === 'paused';
    const focused = globalThis.document?.activeElement;
    startBtn.disabled = state === 'running';
    startBtn.textContent = state === 'paused' ? 'Resume' : state === 'finished' ? 'Start again' : 'Start';
    pauseBtn.disabled = state !== 'running';
    nextBtn.disabled = !active;
    rangeSelect.disabled = active;
    // A button that disables itself would drop focus to the page: hand it on.
    if ((focused === startBtn || focused === pauseBtn || focused === nextBtn) && focused.disabled) {
      (state === 'running' ? pauseBtn : startBtn).focus();
    }
  }

  function start() {
    if (AudioCtx && !ctx) ctx = new AudioCtx(); // created inside the click: iOS needs a gesture
    if (ctx && ctx.state === 'suspended') ctx.resume();
    if (state === 'paused') {
      state = 'running';
      syncButtons();
      beginStep();
      return;
    }
    session = buildSession(rangeSelect.value);
    stepIndex = 0;
    state = 'running';
    syncButtons();
    beginStep();
  }

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', () => {
    if (state !== 'running') return;
    clearTimers();
    silence();
    state = 'paused';
    instructionOut.value = 'Paused. Resume restarts this step.';
    countdownOut.value = '';
    syncButtons();
  });
  nextBtn.addEventListener('click', () => {
    if (state === 'running') advance();
    else if (state === 'paused') {
      stepIndex += 1;
      if (stepIndex >= session.length) finish();
      else {
        state = 'running';
        syncButtons();
        beginStep();
      }
    }
  });
  rangeSelect.addEventListener('change', () => {
    state = 'idle';
    syncButtons();
  });

  syncButtons();
}

if (globalThis.document) {
  const mount = () => {
    for (const root of globalThis.document.querySelectorAll(`[data-tool="${TOOL_SLUG}"]`)) init(root);
  };
  if (globalThis.document.readyState === 'loading') globalThis.document.addEventListener('DOMContentLoaded', mount);
  else mount();
}
