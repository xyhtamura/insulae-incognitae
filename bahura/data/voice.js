// The struck voice. An authored timbre, not a model of a particular gong.
// The ratios are the textbook modes of an ideal free bar, which is the family
// of a metallophone key; a bossed gong's partials differ. Placeholder for the ear.
export const PARTIALS = [1, 2.756, 5.404, 8.933];

// Each higher partial decays this much faster than the one below it.
export const DECAY_FALLOFF = 0.55;

// Seconds from silence to full level at the strike.
export const ATTACK = 0.004;
