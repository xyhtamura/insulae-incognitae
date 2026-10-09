// Animals and other things that come out of the terrain for a while and then
// go (SPEC.md section 13). Each has its own sound, unlike the gong voice of the
// keys. Creatures that walk call with the vendored ZzFX, which makes pitched
// sounds with slides and tremolo; those that stay put tick with the vendored
// dithertick synth.
//
// The animal words are the ones Sulat uses for the same animals, copied from
// ../../sulat/landAnimals.js. The sprout and the bubbles are marks, not words.
//
//   habitats   where it can appear and stay; it leaves if its key becomes
//              anything else
//   walks      true if it moves to a touching key of a suitable habitat
//              instead of sounding in place
//   family     the dithertick family its sound is rendered with
//   brightness, tail   passed to dithertick: -1 to 1, and a length multiplier
//   call       ZzFX parameters, in that tool's order (see CALL below). A kind
//              with a call uses it and ignores its dithertick fields.
//   every      seconds between sounds, drawn between the two bounds
//   stays      seconds before it leaves, drawn between the two bounds

import { SANDS, CORALS } from './habitats.js';

// ZzFX parameters by position, for reading the calls:
//   0 volume  1 randomness  2 frequency  3 attack  4 sustain  5 release
//   6 shape (0 sine, 1 triangle, 2 saw, 3 tan, 4 noise)  7 shape curve
//   8 slide  9 delta slide  10 pitch jump  11 pitch jump time  12 repeat time
//   13 noise  14 modulation  15 bit crush  16 delay  17 sustain volume
//   18 decay  19 tremolo  20 filter
// Each was written from the parameter list and has not been heard.
const CALL = {
  crab:     [1, 0.08, 900, 0, 0.08, 0.04, 1, 1, 0, 0, 300, 0.02, 0.05],                       // a run of dry clicks, each stepping up
  octopus:  [1, 0.08, 140, 0.02, 0.08, 0.2, 0, 1, -4],                                        // a low gulp falling
  turtle:   [1, 0.05, 90, 0.08, 0.2, 0.3, 0, 1, 0.5, 0, 0, 0, 0.12, 0, 0, 0, 0, 1, 0, 0.3],   // a slow low note that wavers
  milkfish: [1, 0.1, 600, 0, 0.02, 0.08, 0, 1, 12],                                           // a quick rising chirp
  squid:    [1, 0.08, 300, 0, 0.02, 0.12, 2, 1, -8, 0, 0, 0, 0, 0.4],                         // a rough squirt falling
};

export const CREATURES = [
  { id: 'crab', call: CALL.crab,      name: 'crab',      glyph: 'カニ',     habitats: [...SANDS, 'tideline', 'mangrove', 'marsh', 'mudflat'], walks: true,  family: 'lattice',   brightness: 0.2,  tail: 0.6, every: [4, 8],  stays: [40, 90] },
  { id: 'shrimp',    name: 'shrimp',    glyph: 'झींगा',    habitats: ['channel', 'creek', 'seagrass', ...CORALS],            walks: false, family: 'fizz',      brightness: 0.5,  tail: 0.5, every: [2, 5],  stays: [30, 70] },
  { id: 'octopus', call: CALL.octopus,   name: 'octopus',   glyph: 'タコ',     habitats: [...CORALS, 'seagrass', 'basalt'],                      walks: true,  family: 'handshake', brightness: -0.2, tail: 1.2, every: [6, 11], stays: [50, 100] },
  { id: 'jellyfish', name: 'jellyfish', glyph: 'クラゲ',   habitats: ['shallows', 'dropoff', 'tidepool'],                    walks: false, family: 'latency',   brightness: 0,    tail: 1.6, every: [5, 9],  stays: [40, 80] },
  { id: 'turtle', call: CALL.turtle,    name: 'turtle',    glyph: 'ᜉᜏᜒᜃᜈ᜔', habitats: ['coral', 'braincoral', 'shallows', 'seagrass', 'channel'], walks: true, family: 'underflow', brightness: -0.3, tail: 1.4, every: [7, 12], stays: [60, 110] },
  { id: 'milkfish', call: CALL.milkfish,  name: 'milkfish',  glyph: 'ᜊᜅᜓᜐ᜔',  habitats: ['channel', 'shallows', 'creek'],                       walks: true,  family: 'shard',     brightness: 0.3,  tail: 0.7, every: [3, 6],  stays: [30, 60] },
  { id: 'squid', call: CALL.squid,     name: 'squid',     glyph: 'ᜉᜓᜐᜒᜆ᜔',  habitats: ['dropoff', 'shallows'],                                walks: true,  family: 'tear',      brightness: 0,    tail: 0.8, every: [5, 9],  stays: [30, 70] },
  { id: 'monkey',    name: 'monkey',    glyph: 'ลิง',      habitats: ['mangrove', 'ironwood', 'driftwood'],                  walks: false, family: 'chroma',    brightness: 0.4,  tail: 0.5, every: [4, 8],  stays: [40, 80] },
  { id: 'sprout',    name: 'sprout',    glyph: '艹',       habitats: ['mudflat', 'marsh', 'oxide'],                          walks: false, family: 'foil',      brightness: -0.1, tail: 1.0, every: [6, 12], stays: [60, 120] },
  { id: 'bubbles',   name: 'bubbles',   glyph: '∘∘',      habitats: ['tidepool', 'anemone', 'limestone'],                   walks: false, family: 'shard',     brightness: 0.9,  tail: 0.4, every: [2, 4],  stays: [15, 30] },
];

// How many may be out at once, and the chance each second that one more
// appears while there is room.
export const CROWD = { most: 3, chance: 0.02 };

// A walker moves on this share of its turns and sounds in place on the rest.
export const WALK_CHANCE = 0.7;

// Level of a creature's sound against a played key at full level.
export const CREATURE_LEVEL = 0.3;

// Settings for the dithertick render, from that tool's own defaults with the
// lead, the second layered species, and the bit reduction turned off.
export const DITHERTICK = {
  colour: 0.74, memory: 0.82, brightness: 0.66, edge: 0.58, body: 0.31, width: 0.62,
  openness: 0.34, tailScale: 1, tailJitter: 0.48, hybridity: 0, mixLevel: 0.42,
  foreknowledge: 0, lead: 92, leadLevel: 0.68, leadJitter: 0.58, gapFit: 0.78, drift: 0.36, slip: 0,
  bits: 16, hold: 1, dither: 0,
};

// How many different renders each creature has to draw on.
export const VARIANTS = 3;
