// Contact rules: a key reads the habitats touching it and may change. An
// authored set, not an ecological model. No DOM.
//
// The rules are the part of `target()` in ../../sulat/typingEcology.js whose
// biomes occur here, in the same order, renamed to this page's habitats. Two
// are adapted, because Sulat's cold water is not a habitat here: ice and
// glacier beside open water or mangrove become shallows.

import { neighbours } from './board.js';
import { habitat } from '../data/habitats.js';

const MANGROVE = 'mangrove';
const WET = new Set(['shallows', 'coral', 'channel', 'creek', 'tidepool', 'dropoff', 'seagrass', 'mudflat', 'marsh']);
const OPEN = new Set(['sandbar', 'tideline', 'flower']);
const COLD = new Set(['ice', 'snow', 'glacier']);
const FRESH = new Set(['creek', 'tidepool']);

// The habitat `id` would become beside these neighbours, or null.
export function target(id, around) {
  const has = (...ids) => around.some(n => ids.includes(n));
  const wet = around.some(n => WET.has(n)), cold = around.some(n => COLD.has(n));
  const fresh = around.some(n => FRESH.has(n)), mangrove = has(MANGROVE);
  if (id === 'lava' && cold) return 'rock';
  if (id === 'volcanic' && wet) return 'rock';
  if (id === 'snow' && has('glacier')) return 'glacier';
  if (id === 'glacier' && has('shallows', 'lava')) return 'shallows';
  if (id === 'sandbar' && has('desert', 'dunes') && !wet) return 'dunes';
  if (id === 'lava' && wet) return 'rock';
  if (id === 'flower' && fresh) return 'marsh';
  if (id === 'sandbar' && has('shallows', 'coral')) return 'tideline';
  if (id === 'creek' && has('shallows', 'tideline')) return 'channel';
  if (id === 'ice' && (mangrove || has('shallows'))) return 'shallows';
  if (id === 'shallows' && mangrove) return 'channel';
  if (id === 'shallows' && has('dropoff')) return 'dropoff';
  if (OPEN.has(id) && wet) return 'mudflat';
  if (OPEN.has(id) && mangrove) return MANGROVE;
  if (id === 'mudflat' && mangrove && !has('shallows', 'coral', 'channel')) return MANGROVE;
  return null;
}

// One contact opportunity for each of `keys`. The targets are all read before
// anything is written, so a change cannot run through a patch in one call.
// Returns the changes made, as { key, from, to }.
export function contact(board, keys, rates, random = Math.random) {
  const wanted = keys.map(key => target(key.habitat, neighbours(board, key).map(n => n.habitat)));
  const changes = [];
  keys.forEach((key, i) => {
    if (key.cooldown > 0) { key.cooldown--; return; }
    const to = wanted[i];
    key.agreed = to && to === key.wants ? (key.agreed ?? 0) + 1 : (to ? 1 : 0);
    key.wants = to;
    if (!to || key.agreed < rates.agree || random() >= rates.chance) return;
    const glyphs = habitat(to).glyphs, from = key.habitat;
    key.habitat = to;
    key.glyph = glyphs[Math.floor(random() * glyphs.length)];
    key.cooldown = rates.cooldown;
    key.agreed = 0;
    key.wants = null;
    changes.push({ key, from, to });
  });
  return changes;
}

// True when no key on the board has anything to become.
export const settled = board => board.keys.every(key => !target(key.habitat, neighbours(board, key).map(n => n.habitat)));
