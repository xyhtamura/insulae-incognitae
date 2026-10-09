// A board is a function of its seed: forty keys, each with a habitat and a
// glyph, and ten column offsets. No DOM.

import { unit } from './hash.js';
import { HABITATS, UNUSUAL, UNUSUAL_RATE } from '../data/habitats.js';

export const ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];
export const COLS = 10;
// Each row sits half a key to the right of the one above, which gives a key up
// to six neighbours.
export const STAGGER = 0.5;

const clamp = (n, low, high) => Math.max(low, Math.min(high, n));

// The ten column offsets as fractions of the window: a seeded shuffle of ten
// evenly spaced values, each nudged by under a tenth of the spacing, so any two
// differ by at least 0.92 / 9.08 of the window (1.2 Hz when it is 12 Hz wide).
function columnOffsets(seed) {
  const order = [...Array(COLS).keys()];
  for (let i = COLS - 1; i > 0; i--) {
    const j = Math.floor(unit(i, seed, 701) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.map((slot, c) => (slot + unit(c, seed, 709) * 0.08) / 9.08);
}

// How many patches a board is grown from. Forty keys over ten centres gives
// patches of about four keys.
const CENTRES = 10;

// Each centre is a point on the keyboard with one habitat, drawn from those
// that live near its row's place on the shore. A key takes the habitat of the
// nearest centre, so same-habitat keys form patches.
function centres(seed) {
  return Array.from({ length: CENTRES }, (_, i) => {
    const y = unit(i, seed, 307) * (ROWS.length - 1);
    const x = unit(i, seed, 311) * (COLS - 1 + STAGGER * (ROWS.length - 1));
    const shore = clamp(y / (ROWS.length - 1) + (unit(i, seed, 313) - 0.5) * 0.3, 0, 1);
    const near = HABITATS.filter(h => Math.abs(h.shore - shore) <= 0.16);
    const pool = near.length ? near : [HABITATS.reduce((p, q) => Math.abs(q.shore - shore) < Math.abs(p.shore - shore) ? q : p)];
    return { x, y, kind: pool[Math.floor(unit(i, seed, 317) * pool.length)] };
  });
}

export function generateBoard(seed) {
  const points = centres(seed), keys = [];
  ROWS.forEach((chars, row) => {
    [...chars].forEach((char, col) => {
      const x = col + row * STAGGER, n = row * COLS + col;
      let kind;
      if (unit(n, seed, 211) < UNUSUAL_RATE) {
        kind = UNUSUAL[Math.floor(unit(n, seed, 223) * UNUSUAL.length)];
      } else {
        // Rows count for more than columns, so patches run along the shore.
        let best = Infinity;
        for (const point of points) {
          const d = (point.x - x) ** 2 + ((point.y - row) * 1.6) ** 2;
          if (d < best) { best = d; kind = point.kind; }
        }
      }
      const glyph = kind.glyphs[Math.floor(unit(n, seed, 227) * kind.glyphs.length)];
      keys.push({ char, row, col, habitat: kind.id, glyph });
    });
  });
  return { seed, keys, offsets: columnOffsets(seed) };
}

// The keys that touch a key: left, right, and the two above and two below that
// the stagger puts against it.
export function neighbours(board, key) {
  const at = (row, col) => board.keys.find(k => k.row === row && k.col === col);
  return [at(key.row, key.col - 1), at(key.row, key.col + 1),
    at(key.row - 1, key.col), at(key.row - 1, key.col + 1),
    at(key.row + 1, key.col - 1), at(key.row + 1, key.col)].filter(Boolean);
}
