// Animals and other things that come out of the terrain for a while and then
// go (SPEC.md section 13). Each has its own sounds, unlike the gong voice of
// the keys. Every few seconds a creature that walks calls with the vendored
// ZzFX, which makes pitched sounds with slides and tremolo, and one that stays
// put ticks with the vendored dithertick synth. When a creature comes out, and
// when its shoal is played, it uses its voice, from the vendored Pink Trombone.
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
//   colour     its tag and its word, as [background, text]
//   motion     how it is drawn moving (see MOTION below)
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

// A voice for each creature, rendered by the vendored Pink Trombone
// (src/mouth.js). It is heard when the creature comes out and when the shoal
// it is on is played; its sounds in between are the call or the tick.
//   pitch    hertz, from and to
//   tongue   [index, diameter] from and to: index about 12 (back) to 29
//            (front), diameter about 2.05 (close) to 3.5 (open)
//   lips     opening, from and to: about 0.4 (rounded) to 1.5 (open)
//   tense    0 breathy to 1 pressed
//   seconds  how long it is voiced; a quarter second of release follows
// Each was written from how the model is described and has not been heard.
const MOUTH = {
  crab:      { pitch: [520, 620], tongue: [[27, 2.2], [27, 2.1]], lips: [1.5, 1.5], tense: 0.8, seconds: 0.12 },  // a short high "ih"
  shrimp:    { pitch: [700, 650], tongue: [[28, 2.1], [28, 2.1]], lips: [1.4, 1.4], tense: 0.7, seconds: 0.1 },   // a shorter, higher "ee"
  octopus:   { pitch: [110, 90],  tongue: [[20, 2.8], [22, 2.2]], lips: [0.9, 0.5], tense: 0.5, seconds: 0.5 },   // a low "oh" closing to "oo"
  jellyfish: { pitch: [220, 200], tongue: [[14, 3.3], [14, 3.3]], lips: [1.5, 1.5], tense: 0.2, seconds: 0.6 },   // a breathy "ah"
  turtle:    { pitch: [80, 70],   tongue: [[21, 2.4], [21, 2.4]], lips: [0.6, 0.6], tense: 0.6, seconds: 0.7 },   // a long low "oo"
  milkfish:  { pitch: [300, 450], tongue: [[22, 2.3], [27, 2.1]], lips: [0.7, 1.5], tense: 0.7, seconds: 0.25 },  // "oo" rising to "ee"
  squid:     { pitch: [260, 180], tongue: [[25, 2.6], [21, 2.3]], lips: [1.4, 0.6], tense: 0.4, seconds: 0.3 },   // "eh" falling to "oo"
  monkey:    { pitch: [380, 520], tongue: [[14, 3.2], [26, 2.2]], lips: [1.5, 1.5], tense: 0.9, seconds: 0.25 },  // "ah" rising to "ee", pressed
  sprout:    { pitch: [190, 200], tongue: [[24, 2.8], [24, 2.8]], lips: [1.2, 1.2], tense: 0.3, seconds: 0.4 },   // a soft "eh"
  bubbles:   { pitch: [500, 700], tongue: [[19, 2.6], [19, 2.6]], lips: [0.5, 0.5], tense: 0.7, seconds: 0.08 },  // a very short rounded "o"
};

// How each is drawn moving, in key spacings and seconds. Sulat's animals walk
// with a rock of five degrees; the numbers here start from that.
//   speed     how fast it crosses the board, key spacings a second
//   range     how far from the top of its shoal it wanders
//   rests     seconds it stays put between wanders, as two bounds
//   rock      degrees it tilts from side to side while moving
//   sideways  true if it keeps to a line, as a crab does
//   sway, bob, pulse, rise   for things that stay put: degrees of slow
//             leaning, a vertical drift, a squeeze in and out, and a climb
//             that starts again from the bottom
const MOTION = {
  crab:      { speed: 0.9,  range: 0.3,  rests: [0.4, 1.6], rock: 7, sideways: true },
  shrimp:    { speed: 0.6,  range: 0.12, rests: [0.2, 0.9], rock: 9 },
  octopus:   { speed: 0.22, range: 0.26, rests: [1.0, 3.0], rock: 3, pulse: 0.08 },
  jellyfish: { speed: 0.08, range: 0.2,  rests: [0.5, 2.0], rock: 0, bob: 0.05, pulse: 0.12 },
  turtle:    { speed: 0.12, range: 0.24, rests: [1.5, 4.0], rock: 4 },
  milkfish:  { speed: 0.8,  range: 0.3,  rests: [0.2, 1.0], rock: 5 },
  squid:     { speed: 0.6,  range: 0.28, rests: [1.0, 2.5], rock: 2, pulse: 0.06 },
  monkey:    { speed: 0.5,  range: 0.14, rests: [0.6, 2.0], rock: 8, bob: 0.03 },
  sprout:    { speed: 0,    range: 0,    rests: [9, 9],     rock: 0, sway: 7 },
  bubbles:   { speed: 0,    range: 0,    rests: [9, 9],     rock: 0, rise: 0.35 },
};

const COLOUR = {
  crab:      ['#c8452c', '#fff3e6'],
  shrimp:    ['#e88a8a', '#4a1414'],
  octopus:   ['#7a4a9c', '#f6ecff'],
  jellyfish: ['#b9a7e0', '#2d2350'],
  turtle:    ['#4f7d4a', '#f0f7e6'],
  milkfish:  ['#9fb6c4', '#17303d'],
  squid:     ['#2f3559', '#e6e9ff'],
  monkey:    ['#7a5536', '#fbeedd'],
  sprout:    ['#6fa03c', '#f4fbe6'],
  bubbles:   ['#e9f6fb', '#2b6b86'],
};

export const CREATURES = [
  { id: 'crab', colour: COLOUR.crab, motion: MOTION.crab, mouth: MOUTH.crab, call: CALL.crab,      name: 'crab',      glyph: 'カニ',     habitats: [...SANDS, 'tideline', 'mangrove', 'marsh', 'mudflat'], walks: true,  family: 'lattice',   brightness: 0.2,  tail: 0.6, every: [4, 8],  stays: [40, 90] },
  { id: 'shrimp', colour: COLOUR.shrimp, motion: MOTION.shrimp, mouth: MOUTH.shrimp,    name: 'shrimp',    glyph: 'झींगा',    habitats: ['channel', 'creek', 'seagrass', ...CORALS],            walks: false, family: 'fizz',      brightness: 0.5,  tail: 0.5, every: [2, 5],  stays: [30, 70] },
  { id: 'octopus', colour: COLOUR.octopus, motion: MOTION.octopus, mouth: MOUTH.octopus, call: CALL.octopus,   name: 'octopus',   glyph: 'タコ',     habitats: [...CORALS, 'seagrass', 'basalt'],                      walks: true,  family: 'handshake', brightness: -0.2, tail: 1.2, every: [6, 11], stays: [50, 100] },
  { id: 'jellyfish', colour: COLOUR.jellyfish, motion: MOTION.jellyfish, mouth: MOUTH.jellyfish, name: 'jellyfish', glyph: 'クラゲ',   habitats: ['shallows', 'dropoff', 'tidepool'],                    walks: false, family: 'latency',   brightness: 0,    tail: 1.6, every: [5, 9],  stays: [40, 80] },
  { id: 'turtle', colour: COLOUR.turtle, motion: MOTION.turtle, mouth: MOUTH.turtle, call: CALL.turtle,    name: 'turtle',    glyph: 'ᜉᜏᜒᜃᜈ᜔', habitats: ['coral', 'braincoral', 'shallows', 'seagrass', 'channel'], walks: true, family: 'underflow', brightness: -0.3, tail: 1.4, every: [7, 12], stays: [60, 110] },
  { id: 'milkfish', colour: COLOUR.milkfish, motion: MOTION.milkfish, mouth: MOUTH.milkfish, call: CALL.milkfish,  name: 'milkfish',  glyph: 'ᜊᜅᜓᜐ᜔',  habitats: ['channel', 'shallows', 'creek'],                       walks: true,  family: 'shard',     brightness: 0.3,  tail: 0.7, every: [3, 6],  stays: [30, 60] },
  { id: 'squid', colour: COLOUR.squid, motion: MOTION.squid, mouth: MOUTH.squid, call: CALL.squid,     name: 'squid',     glyph: 'ᜉᜓᜐᜒᜆ᜔',  habitats: ['dropoff', 'shallows'],                                walks: true,  family: 'tear',      brightness: 0,    tail: 0.8, every: [5, 9],  stays: [30, 70] },
  { id: 'monkey', colour: COLOUR.monkey, motion: MOTION.monkey, mouth: MOUTH.monkey,    name: 'monkey',    glyph: 'ลิง',      habitats: ['mangrove', 'ironwood', 'driftwood'],                  walks: false, family: 'chroma',    brightness: 0.4,  tail: 0.5, every: [4, 8],  stays: [40, 80] },
  { id: 'sprout', colour: COLOUR.sprout, motion: MOTION.sprout, mouth: MOUTH.sprout,    name: 'sprout',    glyph: '艹',       habitats: ['mudflat', 'marsh', 'oxide'],                          walks: false, family: 'foil',      brightness: -0.1, tail: 1.0, every: [6, 12], stays: [60, 120] },
  { id: 'bubbles', colour: COLOUR.bubbles, motion: MOTION.bubbles, mouth: MOUTH.bubbles,   name: 'bubbles',   glyph: '∘∘',      habitats: ['tidepool', 'anemone', 'limestone'],                   walks: false, family: 'shard',     brightness: 0.9,  tail: 0.4, every: [2, 4],  stays: [15, 30] },
];

// How many may be out at once, and the chance each second that one more
// appears while there is room.
export const CROWD = { most: 3, chance: 0.02 };

// Each creature has a tune of this many notes, each between `low` and `high`
// steps of the board's tuning from the pitch its sound was rendered at.
export const MELODY = { length: [3, 5], low: -3, high: 5 };

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
// A voice takes about a tenth of a second to render, so there are fewer.
export const MOUTH_VARIANTS = 2;
// Level of a creature's voice against a played key at full level.
export const MOUTH_LEVEL = 0.22;
