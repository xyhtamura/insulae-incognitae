// The tide and the earthquake. Authored events, not a model of either. No DOM.
// Each returns the changes it made, as { key, from, to, cause }.

import { neighbours, ROWS } from './board.js';
import { become, anyHabitat, anyUnusual } from './contact.js';
import { SANDS } from '../data/habitats.js';

// What the incoming tide can cover.
const FLOODABLE = new Set([...SANDS, 'tideline', 'mudflat', 'marsh']);
const SEAWARD = ROWS.length - 1;

// The tide comes in over the two seaward rows: some of what it can cover
// becomes shallows, and is remembered as flooded.
export function flood(board, rates, random = Math.random) {
  const changes = [];
  for (const key of board.keys) {
    if (key.row < SEAWARD - 1 || !FLOODABLE.has(key.habitat) || random() >= rates.cover) continue;
    changes.push(become(key, 'shallows', 'tide', random));
    key.flooded = true;
  }
  return changes;
}

// The tide goes out. Flooded keys that are still shallows come back as tide
// line or one of the sands, and mudflat anywhere below the landward row is
// uncovered as sandbar.
export function ebb(board, rates, random = Math.random) {
  const changes = [];
  // One tide leaves one thing behind, so what it uncovers lies in patches.
  const choices = ['tideline', ...SANDS], left = choices[Math.floor(random() * choices.length)];
  for (const key of board.keys) {
    if (key.flooded) {
      key.flooded = false;
      if (key.habitat === 'shallows') {
        changes.push(become(key, left, 'tide', random));
        continue;
      }
    }
    if (key.row > 0 && key.habitat === 'mudflat' && random() < rates.uncover) changes.push(become(key, 'sandbar', 'tide', random));
  }
  return changes;
}

// An earthquake picks one key. That key becomes unusual terrain, and the keys
// touching it may all become one other habitat, any at all, which leaves a
// new patch round the centre.
export function quake(board, rates, random = Math.random) {
  const centre = board.keys[Math.floor(random() * board.keys.length)];
  const changes = [become(centre, anyUnusual(random), 'earthquake', random)];
  const thrown = anyHabitat(random);
  for (const key of neighbours(board, centre)) {
    if (key.habitat !== thrown && random() < rates.reach) changes.push(become(key, thrown, 'earthquake', random));
  }
  return changes;
}
