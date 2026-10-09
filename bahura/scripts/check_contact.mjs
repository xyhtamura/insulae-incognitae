// Terrain change checks for steps 3 and 4 of SPEC.md (section 9): the contact
// rules are closed, and simulations print how fast the terrain changes when
// played, when left alone, and when both happen.
//
//   node scripts/check_contact.mjs [--seeds 100] [--minutes 60] [--rate 120]
//
// --rate is keys played per minute.

import { generateBoard, neighbours } from '../src/board.js';
import { target, contact } from '../src/contact.js';
import { createClock } from '../src/clock.js';
import { HABITATS, UNUSUAL, habitat } from '../data/habitats.js';
import { habitatCents } from '../data/tuning.js';
import { CONTACT, TICK } from '../data/rates.js';

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
for (const kind of [...HABITATS, ...UNUSUAL]) {
  if (new Set(kind.glyphs).size !== kind.glyphs.length) failures.push(`${kind.id} lists a glyph twice`);
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

const kinds = board => new Set(board.keys.map(k => k.habitat)).size;

function simulate(label, { played, timed }) {
  const perMinute = Array(MINUTES).fill(0), causes = new Map(), mixStart = new Map(), mixEnd = new Map();
  let kindsStart = 0, kindsEnd = 0, fewest = Infinity;
  for (let seed = 0; seed < SEEDS; seed++) {
    const board = generateBoard(seed), random = mulberry(seed + 1), clock = createClock(board, random);
    kindsStart += kinds(board);
    for (const key of board.keys) mixStart.set(key.habitat, (mixStart.get(key.habitat) ?? 0) + 1);
    for (let minute = 0; minute < MINUTES; minute++) {
      const changes = [];
      const ticks = 60 / TICK.seconds, strikes = played ? RATE : 0;
      for (let t = 0; t < ticks; t++) {
        for (let n = 0; n < strikes / ticks; n++) {
          const key = board.keys[Math.floor(random() * board.keys.length)];
          changes.push(...contact(board, [key, ...neighbours(board, key)], CONTACT, random).map(c => ({ ...c, cause: 'playing' })));
        }
        if (timed) changes.push(...clock.advance(TICK.seconds));
      }
      perMinute[minute] += changes.length;
      for (const c of changes) causes.set(c.cause, (causes.get(c.cause) ?? 0) + 1);
    }
    kindsEnd += kinds(board);
    fewest = Math.min(fewest, kinds(board));
    for (const key of board.keys) mixEnd.set(key.habitat, (mixEnd.get(key.habitat) ?? 0) + 1);
  }
  const mean = (from, to) => (perMinute.slice(from, to).reduce((a, b) => a + b, 0) / (to - from) / SEEDS).toFixed(2);
  console.log(`\n${label}`);
  console.log(`  Keys changed per minute: ${mean(0, Math.min(10, MINUTES))} in the first 10 minutes, ${mean(Math.max(0, MINUTES - 20), MINUTES)} in the last 20, ${mean(0, MINUTES)} overall`);
  console.log(`  By cause, per minute: ${[...causes].map(([cause, n]) => `${cause} ${(n / MINUTES / SEEDS).toFixed(2)}`).join(', ') || 'none'}`);
  console.log(`  Habitats per board: ${(kindsStart / SEEDS).toFixed(1)} at the start, ${(kindsEnd / SEEDS).toFixed(1)} at the end, fewest ${fewest}`);
  return { mixStart, mixEnd };
}

console.log(`Rules: ${reachable.size} distinct contact changes`);
console.log(`${SEEDS} boards, ${MINUTES} minutes each; played means ${RATE} keys per minute`);
simulate('Played, time stopped', { played: true, timed: false });
simulate('Left alone', { played: false, timed: true });
const { mixStart, mixEnd } = simulate('Played, with time running', { played: true, timed: true });

console.log('\nHabitat mix when played with time running, start to end:');
const total = SEEDS * 40, share = n => `${(100 * (n ?? 0) / total).toFixed(1)}%`.padStart(6);
for (const id of ids) if (mixStart.get(id) || mixEnd.get(id)) console.log(`  ${id.padEnd(11)} ${share(mixStart.get(id))} -> ${share(mixEnd.get(id))}`);

if (failures.length) {
  console.error(`\nFAILED\n${[...new Set(failures)].slice(0, 20).join('\n')}`);
  process.exit(1);
}
console.log('\nPASSED: closed rules');
