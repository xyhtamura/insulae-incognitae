// How fast the terrain changes. Starting values, set against the simulation in
// scripts/check_board.mjs; SPEC.md section 7 gives the targets.

// Playing: each time a key is played, it and its neighbours each get one
// contact opportunity.
export const CONTACT = {
  // A key changes only if the rules name the same target on this many
  // successive opportunities.
  agree: 2,
  // The chance that an agreed change happens on a given opportunity.
  chance: 0.012,
  // Opportunities a changed key sits out before it can change again.
  cooldown: 60,
};

// The Audition panel multiplies `chance` by one of these, to watch contact
// happen without waiting for it.
export const SPEEDS = [
  { id: 'normal', label: 'Normal', factor: 1 },
  { id: 'fast', label: '20 times faster', factor: 20 },
  { id: 'off', label: 'Off', factor: 0 },
];
