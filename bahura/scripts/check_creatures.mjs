// Creature checks: the vendored synth matches its stamp and its source, the
// creature table refers only to things that exist, and a simulation prints how
// crowded the board gets.
//
//   node scripts/check_creatures.mjs [--seeds 100] [--minutes 60]

import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { generateBoard } from '../src/board.js';
import { createClock } from '../src/clock.js';
import { createCreatures } from '../src/creatures.js';
import { CREATURES, CROWD, DITHERTICK, VARIANTS } from '../data/creatures.js';
import { build, SHELF, OUT } from './vendor_pink_trombone.mjs';
import { renderMouth } from '../src/mouth.js';
import { habitat } from '../data/habitats.js';
import { FAMILY_LIST, buildPlan, renderPlan } from '../vendor/dithertick-synth.js';

// ZzFX makes an AudioContext as it is imported, and Node has none.
globalThis.AudioContext ??= class {};
const { ZZFX } = await import('../vendor/zzfx.js');

const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? Number(process.argv[i + 1]) : fallback; };
const SEEDS = arg('seeds', 100), MINUTES = arg('minutes', 60);
const failures = [], notes = [];
const here = name => fileURLToPath(new URL(name, import.meta.url));
const sha = buffer => crypto.createHash('sha256').update(buffer).digest('hex');

// Each vendored copy: its body must hash to its own stamp, and to the source
// if the source is on this disk. A difference from the source is reported and
// nothing is copied, because re-vendoring is a decision.
const MARK = '// ---------------------------------------------------------------------------\n';
for (const [name, from] of [['dithertick-synth.js', '../../../dithertick/synth.js'], ['zzfx.js', '../../../third-party/zzfx/ZzFX.js']]) {
  const copy = fs.readFileSync(here(`../vendor/${name}`));
  const cut = copy.indexOf(MARK) + MARK.length;
  const stamp = /Source SHA-256: ([0-9a-f]{64})/.exec(copy.subarray(0, cut).toString())?.[1];
  if (sha(copy.subarray(cut)) !== stamp) failures.push(`vendor/${name} does not match its own stamp: it has been edited`);
  const source = here(from);
  if (!fs.existsSync(source)) notes.push(`${from.slice(9)} is not on this disk, so drift was not checked.`);
  else if (sha(fs.readFileSync(source)) !== stamp) notes.push(`DRIFT: ${from.slice(9)} has changed since it was vendored. Listen before copying it again.`);
  else notes.push(`vendor/${name} matches ${from.slice(9)}.`);
}
// Pink Trombone is cut out of a web page by a script, so its check is that the
// vendored file is exactly what the script makes from the shelf copy today.
if (!fs.existsSync(SHELF)) notes.push('third-party/pink-trombone/index.html is not on this disk, so the Pink Trombone copy was not checked.');
else if (build() !== fs.readFileSync(OUT, 'utf8')) failures.push('vendor/pink-trombone.js is not what scripts/vendor_pink_trombone.mjs makes from the shelf copy: it was edited, or the shelf or the script changed');
else notes.push('vendor/pink-trombone.js is what vendor_pink_trombone.mjs makes from third-party/pink-trombone/index.html.');
if (!fs.readFileSync(OUT, 'utf8').includes('Copyright 2017 Neil Thapen')) failures.push('vendor/pink-trombone.js has lost its copyright notice');

if (!fs.existsSync(here('../vendor/zzfx-LICENSE'))) failures.push('vendor/zzfx-LICENSE is missing; the MIT notice has to travel with the copy');

// The table.
for (const kind of CREATURES) {
  if (kind.call && !(Array.isArray(kind.call) && kind.call.every(Number.isFinite))) failures.push(`${kind.id}: its call is not a list of numbers`);
  if (!kind.call && !FAMILY_LIST.includes(kind.family)) failures.push(`${kind.id}: no dithertick family called ${kind.family}`);
  for (const id of kind.habitats) if (!habitat(id)) failures.push(`${kind.id}: no habitat called ${id}`);
  if (!(kind.every[0] > 0 && kind.every[1] >= kind.every[0] && kind.stays[1] >= kind.stays[0])) failures.push(`${kind.id}: bounds out of order`);
}

// Every render the page will ask for is finite and not silent.
let longest = 0, renderMs = 0;
ZZFX.sampleRate = 48000;
const lengths = [];
for (const kind of CREATURES) for (let v = 0; v < VARIANTS; v++) {
  if (kind.call) {
    const started = performance.now();
    const samples = ZZFX.buildSamples(...kind.call);
    renderMs += performance.now() - started;
    longest = Math.max(longest, samples.length / 48000);
    if (!v) lengths.push(`${kind.id} ${(samples.length / 48000).toFixed(2)} s`);
    let peak = 0;
    for (const x of samples) { if (!Number.isFinite(x)) { failures.push(`${kind.id} variant ${v}: a sample is not a number`); break; } peak = Math.max(peak, Math.abs(x)); }
    if (peak < 0.01) failures.push(`${kind.id} variant ${v}: the call is silent`);
    if (peak > 1.001) failures.push(`${kind.id} variant ${v}: the call peaks at ${peak.toFixed(2)}, over full level`);
    continue;
  }
  const settings = { ...DITHERTICK, seed: `${kind.id}:${v}`, brightness: DITHERTICK.brightness + kind.brightness * 0.3, tailScale: kind.tail };
  const started = performance.now();
  const rendered = renderPlan(buildPlan([{ time: 0, note: 42, velocity: 0.8, duration: 0.1, track: 0, channel: 9 }], settings, kind.family), settings, 48000);
  renderMs += performance.now() - started;
  longest = Math.max(longest, rendered.duration);
  let peak = 0;
  for (const x of rendered.left) { if (!Number.isFinite(x)) { failures.push(`${kind.id} variant ${v}: a sample is not a number`); break; } peak = Math.max(peak, Math.abs(x)); }
  if (peak < 0.01) failures.push(`${kind.id} variant ${v}: the render is silent`);
}

// Every voice renders finite and audible, and sounds at about the pitch it was
// asked for. The pitch is read from the middle of the clip by autocorrelation,
// which is a check on the sound itself and not on the numbers that went in.
function pitchOf(samples, rate, expect) {
  const from = Math.floor(samples.length * 0.3), size = Math.min(8192, Math.floor(samples.length * 0.4));
  let best = 0, bestLag = 0;
  for (let lag = Math.floor(rate / (expect * 2)); lag <= Math.ceil(rate / (expect / 2)); lag++) {
    let sum = 0;
    for (let i = from; i < from + size - lag; i++) sum += samples[i] * samples[i + lag];
    if (sum / (size - lag) > best) { best = sum / (size - lag); bestLag = lag; }
  }
  return bestLag ? rate / bestLag : 0;
}
const voices = [];
let mouthMs = 0, mouthLongest = 0;
for (const kind of CREATURES) {
  if (!kind.mouth) { failures.push(`${kind.id}: no voice`); continue; }
  const started = performance.now(), samples = renderMouth(kind.mouth, 48000);
  mouthMs += performance.now() - started;
  mouthLongest = Math.max(mouthLongest, samples.length / 48000);
  let peak = 0, bad = false;
  for (const x of samples) { if (!Number.isFinite(x)) bad = true; peak = Math.max(peak, Math.abs(x)); }
  if (bad) failures.push(`${kind.id}: a sample of its voice is not a number`);
  if (peak < 0.5 || peak > 0.91) failures.push(`${kind.id}: its voice peaks at ${peak.toFixed(2)}, not 0.9`);
  const asked = (kind.mouth.pitch[0] + kind.mouth.pitch[1]) / 2, heard = pitchOf(samples, 48000, asked);
  voices.push(`${kind.id} ${Math.round(asked)}/${Math.round(heard)}`);
  const low = Math.min(...kind.mouth.pitch) * 0.8, high = Math.max(...kind.mouth.pitch) * 1.25;
  if (!(heard >= low && heard <= high)) failures.push(`${kind.id}: its voice was asked for ${kind.mouth.pitch.join(' to ')} Hz and measures ${Math.round(heard)} Hz`);
}

function mulberry(seed) {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// An hour on each board with terrain time running and nobody playing.
const counts = new Map(), seen = new Map();
let samples = 0, total = 0, most = 0, sounds = 0, appearances = 0, stayed = 0, left = 0, misplaced = 0;
for (let seed = 0; seed < SEEDS; seed++) {
  const board = generateBoard(seed), random = mulberry(seed + 1);
  const clock = createClock(board, random), creatures = createCreatures(board, random);
  const born = new Map();
  for (let half = 0; half <= MINUTES * 120; half++) {
    const now = half / 2;
    if (half % 10 === 0 && half) clock.advance(5);
    for (const event of creatures.step(now)) {
      if (event.type === 'appear') { appearances++; born.set(event.creature.id, now); seen.set(event.creature.kind.id, (seen.get(event.creature.kind.id) ?? 0) + 1); }
      if (event.type === 'sound' || event.type === 'move') sounds++;
      if (event.type === 'leave') { left++; stayed += now - born.get(event.creature.id); }
    }
    const n = creatures.out.length;
    samples++; total += n; most = Math.max(most, n);
    counts.set(n, (counts.get(n) ?? 0) + 1);
    if (new Set(creatures.out.map(c => c.key)).size !== n) misplaced++;
  }
}
if (most > CROWD.most) failures.push(`${most} creatures were out at once; the limit is ${CROWD.most}`);
if (misplaced) failures.push(`two creatures shared a key at ${misplaced} moments`);

for (const note of notes) console.log(note);
console.log(`Voices, hertz asked/measured: ${voices.join(', ')}`);
console.log(`Voices: ${CREATURES.length} in ${mouthMs.toFixed(0)} ms in Node, the longest ${mouthLongest.toFixed(2)} s`);
console.log(`ZzFX calls: ${lengths.join(', ')}`);
console.log(`Renders: ${CREATURES.length * VARIANTS} in ${renderMs.toFixed(0)} ms in Node, the longest ${longest.toFixed(2)} s of sound`);
console.log(`${SEEDS} boards, ${MINUTES} minutes each, left alone`);
console.log(`Creatures out: ${(total / samples).toFixed(2)} on average, ${most} at most; none ${(100 * (counts.get(0) ?? 0) / samples).toFixed(0)}% of the time`);
console.log(`Per minute: ${(appearances / SEEDS / MINUTES).toFixed(2)} appear, ${(sounds / SEEDS / MINUTES).toFixed(1)} sounds`);
console.log(`A creature stays ${(stayed / left).toFixed(0)} s on average`);
console.log(`Seen: ${CREATURES.map(kind => `${kind.id} ${seen.get(kind.id) ?? 0}`).join(', ')}`);

if (failures.length) {
  console.error(`\nFAILED\n${[...new Set(failures)].slice(0, 20).join('\n')}`);
  process.exit(1);
}
console.log('\nPASSED: vendored copies, creature table, calls, ticks, voices, crowd limit');
