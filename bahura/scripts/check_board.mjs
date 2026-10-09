// Board checks for step 1 of SPEC.md (section 9): determinism, column offsets,
// and frequency range, plus a printed habitat mix and patch sizes.
//
//   node scripts/check_board.mjs [--seeds 100]

import { generateBoard, neighbours, COLS } from '../src/board.js';
import { HABITATS, UNUSUAL, habitat } from '../data/habitats.js';
import { TUNINGS, REGISTERS, WINDOW, frequency } from '../data/tuning.js';

const at = process.argv.indexOf('--seeds');
const SEEDS = at > 0 ? Number(process.argv[at + 1]) : 100;
const failures = [];
const fail = text => { if (failures.length < 20) failures.push(text); };

const mix = new Map(), patchSizes = [];
let keys = 0, unusual = 0, minGap = Infinity, low = Infinity, high = 0;

for (let seed = 0; seed < SEEDS; seed++) {
  const board = generateBoard(seed);
  if (JSON.stringify(board) !== JSON.stringify(generateBoard(seed))) fail(`seed ${seed}: two builds differ`);
  if (board.keys.length !== 40) fail(`seed ${seed}: ${board.keys.length} keys`);

  for (const key of board.keys) {
    const kind = habitat(key.habitat);
    if (!kind) { fail(`seed ${seed}: unknown habitat ${key.habitat}`); continue; }
    if (!kind.glyphs.includes(key.glyph)) fail(`seed ${seed}: glyph ${key.glyph} is not in ${kind.id}`);
    keys++;
    if (UNUSUAL.includes(kind)) unusual++;
    mix.set(kind.id, (mix.get(kind.id) ?? 0) + 1);
  }

  // Offsets: inside the window, and far enough apart at Ombak Lock's 12 Hz.
  for (let a = 0; a < COLS; a++) {
    if (board.offsets[a] < 0 || board.offsets[a] > 1) fail(`seed ${seed}: offset ${a} outside the window`);
    for (let b = a + 1; b < COLS; b++) minGap = Math.min(minGap, Math.abs(board.offsets[a] - board.offsets[b]) * 12);
  }

  // Range, under every preset and at both ends of the window.
  for (const tuning of TUNINGS) for (const registers of REGISTERS) for (const window of [WINDOW.min, WINDOW.max]) {
    for (const key of board.keys) {
      const hz = frequency(key, board.offsets, { tuning: tuning.id, registers: registers.id, window });
      low = Math.min(low, hz); high = Math.max(high, hz);
      if (!(hz >= 80 && hz <= 2000)) fail(`seed ${seed}: ${key.char} at ${hz.toFixed(1)} Hz under ${tuning.id}, ${registers.id}`);
    }
  }

  // Patches: connected keys of one habitat.
  const seen = new Set();
  for (const start of board.keys) {
    if (seen.has(start.char)) continue;
    let size = 0;
    const queue = [start];
    seen.add(start.char);
    while (queue.length) {
      const key = queue.pop();
      size++;
      for (const next of neighbours(board, key)) {
        if (next.habitat === key.habitat && !seen.has(next.char)) { seen.add(next.char); queue.push(next); }
      }
    }
    patchSizes.push(size);
  }
}

if (minGap < 1.1) fail(`column offsets come within ${minGap.toFixed(2)} Hz at a 12 Hz window; the floor is 1.1`);

const share = n => `${(100 * n / keys).toFixed(1)}%`;
console.log(`${SEEDS} boards, ${keys} keys`);
console.log(`Smallest gap between two column offsets at a 12 Hz window: ${minGap.toFixed(2)} Hz`);
console.log(`Frequency range across all presets: ${low.toFixed(1)} to ${high.toFixed(1)} Hz`);
console.log(`Unusual terrain: ${share(unusual)} of keys (${(40 * unusual / keys).toFixed(1)} per board)`);
console.log('Habitat mix:');
for (const kind of [...HABITATS, ...UNUSUAL]) console.log(`  ${kind.id.padEnd(10)} ${share(mix.get(kind.id) ?? 0)}`);
const single = patchSizes.filter(n => n === 1).length;
const mean = patchSizes.reduce((a, b) => a + b, 0) / patchSizes.length;
console.log(`Patches: ${(patchSizes.length / SEEDS).toFixed(1)} per board, mean ${mean.toFixed(2)} keys, largest ${Math.max(...patchSizes)}, ${(100 * single / patchSizes.length).toFixed(0)}% are single keys`);

if (failures.length) {
  console.error(`\nFAILED\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('\nPASSED: determinism, offsets, range');
