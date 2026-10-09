// Contact checks for step 3 of SPEC.md (section 9): the rules are closed, and
// a simulation of steady playing prints how fast the terrain changes.
//
//   node scripts/check_contact.mjs [--seeds 100] [--minutes 60] [--rate 120]
//
// --rate is keys played per minute.

import { generateBoard, neighbours } from '../src/board.js';
import { target, contact, settled } from '../src/contact.js';
import { HABITATS, UNUSUAL, habitat } from '../data/habitats.js';
import { habitatCents } from '../data/tuning.js';
import { CONTACT } from '../data/rates.js';

const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? Number(process.argv[i + 1]) : fallback; };
const SEEDS = arg('seeds', 100), MINUTES = arg('minutes', 60), RATE = arg('rate', 120);
const failures = [];

// Closed rules: under every single neighbour and every pair, a target is
// either nothing or a habitat with glyphs, a voice, and a pitch.
const ids = [...HABITATS, ...UNUSUAL].map(h => h.id);
const reachable = new Set();
for (const id of ids) for (const a of ids) for (const b of ids) {
  const to = target(id, [a, b]);
  if (to == null) continue;
  reachable.add(`${id} -> ${to}`);
  const kind = habitat(to);
  if (!kind) failures.push(`${id} beside ${a}, ${b} becomes ${to}, which is not a habitat`);
  else if (!kind.glyphs.length || !(kind.decay > 0) || !Number.isFinite(habitatCents(to, 'spread13'))) failures.push(`${to} lacks glyphs, a voice, or a pitch`);
  if (to === id) failures.push(`${id} beside ${a}, ${b} becomes itself`);
}

// A small seeded generator, so a run can be repeated.
function mulberry(seed) {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const perMinute = Array(MINUTES).fill(0), mixStart = new Map(), mixEnd = new Map();
let settledAtStart = 0, settledAtEnd = 0, settleMinutes = [];
for (let seed = 0; seed < SEEDS; seed++) {
  const board = generateBoard(seed), random = mulberry(seed + 1);
  for (const key of board.keys) mixStart.set(key.habitat, (mixStart.get(key.habitat) ?? 0) + 1);
  if (settled(board)) settledAtStart++;
  let settledAt = null;
  for (let minute = 0; minute < MINUTES; minute++) {
    for (let n = 0; n < RATE; n++) {
      const key = board.keys[Math.floor(random() * board.keys.length)];
      perMinute[minute] += contact(board, [key, ...neighbours(board, key)], CONTACT, random).length;
    }
    if (settledAt == null && settled(board)) settledAt = minute + 1;
  }
  if (settled(board)) { settledAtEnd++; settleMinutes.push(settledAt); }
  for (const key of board.keys) mixEnd.set(key.habitat, (mixEnd.get(key.habitat) ?? 0) + 1);
}

const mean = (from, to) => perMinute.slice(from, to).reduce((a, b) => a + b, 0) / (to - from) / SEEDS;
console.log(`Rules: ${reachable.size} distinct changes, e.g. ${[...reachable].slice(0, 4).join('; ')}`);
console.log(`${SEEDS} boards, ${MINUTES} minutes each at ${RATE} keys played per minute`);
console.log(`Keys changed per minute: ${mean(0, Math.min(5, MINUTES)).toFixed(2)} in the first 5 minutes, ${mean(0, Math.min(15, MINUTES)).toFixed(2)} in the first 15, ${mean(0, MINUTES).toFixed(2)} over the whole run`);
console.log(`Boards with nothing left to change: ${settledAtStart} at the start, ${settledAtEnd} at the end${settleMinutes.length ? ` (median minute ${settleMinutes.sort((a, b) => a - b)[Math.floor(settleMinutes.length / 2)]})` : ''}`);
console.log('Habitat mix, start to end:');
const total = SEEDS * 40, share = n => `${(100 * (n ?? 0) / total).toFixed(1)}%`.padStart(6);
for (const id of ids) if (mixStart.get(id) || mixEnd.get(id)) console.log(`  ${id.padEnd(10)} ${share(mixStart.get(id))} -> ${share(mixEnd.get(id))}`);

if (failures.length) {
  console.error(`\nFAILED\n${[...new Set(failures)].slice(0, 20).join('\n')}`);
  process.exit(1);
}
console.log('\nPASSED: closed rules');
