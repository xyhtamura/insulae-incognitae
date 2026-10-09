// Where each key sits and what outline it has. The four rows follow a wave, so
// the board reads as shoals lying in the order of a keyboard. No DOM.

import { unit } from './hash.js';
import { ROWS, COLS, STAGGER } from './board.js';

// One unit is the distance between two keys in a row.
export const VIEW = { width: COLS + STAGGER * (ROWS.length - 1) + 0.6, height: ROWS.length * 0.94 + 1.1 };

// Two overlaid waves along the keyboard, phased by the seed and shifted a
// little from row to row.
function wave(x, row, seed) {
  const a = unit(1, seed, 401) * Math.PI * 2, b = unit(2, seed, 401) * Math.PI * 2;
  return 0.26 * Math.sin(x * 0.72 + a + row * 0.5) + 0.1 * Math.sin(x * 1.9 + b - row * 0.8);
}

export function centre(key, seed) {
  const n = key.row * COLS + key.col;
  const x = 0.8 + key.col + key.row * STAGGER + (unit(n, seed, 409) - 0.5) * 0.16;
  const y = 0.95 + key.row * 0.94 + wave(x, key.row, seed) + (unit(n, seed, 419) - 0.5) * 0.1;
  return { x, y };
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

// Faint lines across the water, following the same wave as the rows.
export function ripples(seed) {
  const lines = [];
  for (let row = -1; row <= ROWS.length; row++) {
    let d = '';
    for (let x = 0; x <= VIEW.width + 0.01; x += 0.25) {
      const y = 0.95 + (row + 0.5) * 0.94 + wave(x, row + 0.5, seed);
      d += `${d ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(3)}`;
    }
    lines.push(d);
  }
  return lines;
}
