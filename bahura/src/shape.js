// Where each key sits and what outline it has. The four rows follow a wave, so
// the board reads as shoals lying in the order of a keyboard. No DOM.
//
// In the upright layout, for a narrow screen with no keyboard under it, the
// same board is turned a quarter: the rows run down the screen and the shore's
// landward edge is on the left. Which keys touch does not change.

import { unit } from './hash.js';
import { ROWS, COLS, STAGGER } from './board.js';

// One unit is the distance between two keys in a row.
const ALONG = COLS + STAGGER * (ROWS.length - 1) + 0.6, ACROSS = ROWS.length * 0.94 + 1.1;
export const view = upright => (upright ? { width: ACROSS, height: ALONG } : { width: ALONG, height: ACROSS });

// Two overlaid waves along the rows, phased by the seed and shifted a little
// from row to row.
function wave(along, row, seed) {
  const a = unit(1, seed, 401) * Math.PI * 2, b = unit(2, seed, 401) * Math.PI * 2;
  return 0.26 * Math.sin(along * 0.72 + a + row * 0.5) + 0.1 * Math.sin(along * 1.9 + b - row * 0.8);
}

export function centre(key, seed, upright = false) {
  const n = key.row * COLS + key.col;
  const along = 0.8 + key.col + key.row * STAGGER + (unit(n, seed, 409) - 0.5) * 0.16;
  const across = 0.95 + key.row * 0.94 + wave(along, key.row, seed) + (unit(n, seed, 419) - 0.5) * 0.1;
  return upright ? { x: across, y: along } : { x: along, y: across };
}

// A closed, smooth, irregular outline around a centre. The radius is a little
// over half the key spacing, so neighbours overlap and same-habitat keys, which
// share a colour, run together into one shoal.
export function outline(key, seed, { x, y }) {
  const n = key.row * COLS + key.col, count = 9;
  const size = 0.5 + unit(n, seed, 421) * 0.1;
  const points = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + unit(n, seed, 431) * 0.7;
    const r = size * (0.8 + unit(n * count + i, seed, 433) * 0.4);
    return [x + Math.cos(angle) * r, y + Math.sin(angle) * r * 0.92];
  });
  // Catmull-Rom through the points, written as cubic Béziers.
  const at = i => points[(i + count) % count], f = v => v.toFixed(3);
  let d = `M${f(at(0)[0])} ${f(at(0)[1])}`;
  for (let i = 0; i < count; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}
