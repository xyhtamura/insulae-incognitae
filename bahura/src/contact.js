// How terrain changes: contact between touching keys, and drift, where a key
// becomes something else for no stated reason. Authored behaviour, not an
// ecological model. No DOM.
//
// The contact rules are the part of `target()` in ../../sulat/typingEcology.js
// whose biomes occur here, in the same order, renamed to this page's habitats
// and widened so that "sand" means any of the sands and "reef" any of the
// corals. Two are adapted, because Sulat's cold water is not a habitat here:
// ice and glacier beside open water or mangrove become shallows.

import { neighbours, ROWS } from './board.js';
import { HABITATS, UNUSUAL, SANDS, CORALS, habitat } from '../data/habitats.js';

const MANGROVE = 'mangrove';
const WET = new Set(['shallows', 'channel', 'creek', 'tidepool', 'dropoff', 'seagrass', 'mudflat', 'marsh', ...CORALS]);
// Sands are left out on purpose: with them in, every sand beside water turned
// to mudflat and none survived an hour of the simulation.
const OPEN = new Set(['tideline', 'flower']);
const COLD = new Set(['ice', 'snow', 'glacier']);
const FRESH = new Set(['creek', 'tidepool']);
const SEA = ['shallows', ...CORALS];

// The habitat `id` would become beside these neighbours, or null.
export function target(id, around) {
  const has = (...ids) => around.some(n => ids.includes(n));
  const wet = around.some(n => WET.has(n)), cold = around.some(n => COLD.has(n));
  const fresh = around.some(n => FRESH.has(n)), mangrove = has(MANGROVE), sand = SANDS.includes(id);
  if (id === 'lava' && cold) return 'rock';
  if (id === 'volcanic' && wet) return 'rock';
  if (id === 'snow' && has('glacier')) return 'glacier';
  if (id === 'glacier' && has('shallows', 'lava')) return 'shallows';
  if (sand && has('desert', 'dunes') && !wet) return 'dunes';
  if (id === 'lava' && wet) return 'rock';
  if (id === 'flower' && fresh) return 'marsh';
  if (sand && has(...SEA)) return 'tideline';
  if (id === 'creek' && has('shallows', 'tideline')) return 'channel';
  if (id === 'ice' && (mangrove || has('shallows'))) return 'shallows';
  if (id === 'shallows' && mangrove) return 'channel';
  if (id === 'shallows' && has('dropoff')) return 'dropoff';
  if (OPEN.has(id) && wet) return 'mudflat';
  if (OPEN.has(id) && mangrove) return MANGROVE;
  if (id === 'mudflat' && mangrove && !has('channel', ...SEA)) return MANGROVE;
  return null;
}

// Writes a change into a key and returns its record.
export function become(key, to, cause, random) {
  const glyphs = habitat(to).glyphs, from = key.habitat;
  key.habitat = to;
  key.glyph = glyphs[Math.floor(random() * glyphs.length)];
  key.agreed = 0;
  key.wants = null;
  return { key, from, to, cause };
}

// One contact opportunity for each of `keys`. The targets are all read before
// anything is written, so a change cannot run through a patch in one call.
// Returns the changes made, as { key, from, to, cause }.
export function contact(board, keys, rates, random = Math.random) {
  const wanted = keys.map(key => target(key.habitat, neighbours(board, key).map(n => n.habitat)));
  const changes = [];
  keys.forEach((key, i) => {
    if (key.cooldown > 0) { key.cooldown--; return; }
    const to = wanted[i];
    key.agreed = to && to === key.wants ? (key.agreed ?? 0) + 1 : (to ? 1 : 0);
    key.wants = to;
    if (!to || key.agreed < rates.agree || random() >= rates.chance) return;
    key.cooldown = rates.cooldown;
    changes.push(become(key, to, 'contact', random));
  });
  return changes;
}

// A habitat a key could drift to: one whose place on the shore is near the
// key's present one, or near its row for a key of unusual terrain.
export function driftTarget(key, reach, random) {
  const now = HABITATS.find(h => h.id === key.habitat);
  const shore = now ? now.shore : key.row / (ROWS.length - 1);
  const near = HABITATS.filter(h => h.id !== key.habitat && Math.abs(h.shore - shore) <= reach);
  return near.length ? near[Math.floor(random() * near.length)].id : null;
}

// One drift opportunity for every key: a small chance of becoming a nearby
// habitat with nothing causing it.
export function drift(board, rates, random = Math.random) {
  const changes = [];
  for (const key of board.keys) {
    if (key.cooldown > 0 || random() >= rates.chance) continue;
    const to = driftTarget(key, rates.reach, random);
    if (to) changes.push(become(key, to, 'drift', random));
  }
  return changes;
}

// True when no key on the board has anything to become by contact.
export const settled = board => board.keys.every(key => !target(key.habitat, neighbours(board, key).map(n => n.habitat)));

export const anyHabitat = random => HABITATS[Math.floor(random() * HABITATS.length)].id;
export const anyUnusual = random => UNUSUAL[Math.floor(random() * UNUSUAL.length)].id;
