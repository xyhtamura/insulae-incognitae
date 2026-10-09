// How fast the terrain changes. Starting values, set against the simulation in
// scripts/check_contact.mjs; SPEC.md section 7 gives the targets.

// Playing: each time a key is played, it and its neighbours each get one
// contact opportunity.
export const CONTACT = {
  // A key changes only if the rules name the same target on this many
  // successive opportunities.
  agree: 2,
  // The chance that an agreed change happens on a given opportunity.
  chance: 0.035,
  // Opportunities a changed key sits out before it can change again.
  cooldown: 60,
};

// Time: every `seconds`, each key gets one contact opportunity and one drift
// opportunity.
export const TICK = {
  seconds: 5,
  contact: { agree: 2, chance: 0.012, cooldown: 12 },
  // Drift: the chance per key per tick of changing with nothing causing it.
  // On `spread` of those occasions it takes a touching key's habitat, and on
  // the rest a habitat within `reach` of its own place on the shore.
  drift: { chance: 0.0012, reach: 0.25, spread: 0.85 },
};

// Tide: comes in after a wait drawn between `every` bounds, stays in for a
// time drawn between `stays` bounds, then goes out. All in seconds.
export const TIDE = {
  every: [180, 360],
  stays: [40, 80],
  cover: 0.2,     // share of coverable keys in the two seaward rows that flood
  uncover: 0.4,   // share of mudflat keys the ebb turns to sandbar
};

// Earthquake: after a wait drawn between these bounds, in seconds.
export const QUAKE = {
  every: [600, 1200],
  reach: 0.5,     // chance that each key touching the centre also changes
};

// The Audition panel runs terrain time at one of these multiples, to watch
// change happen without waiting for it.
export const SPEEDS = [
  { id: 'normal', label: 'Normal', factor: 1 },
  { id: 'fast', label: '20 times faster', factor: 20 },
  { id: 'off', label: 'Off', factor: 0 },
];
