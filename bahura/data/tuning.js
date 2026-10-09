// Pitch for a key (SPEC.md section 6):
//   frequency = row register × habitat ratio + column offset
// Everything here is a placeholder for the ear. The page's Audition panel
// switches between the presets below; the first of each list is the default.

import { HABITATS, UNUSUAL } from './habitats.js';

// Habitat pitch within the octave. `step(i)` takes a habitat's index in shore
// order (0 to 11) and returns its step out of `divisions` equal divisions of
// the octave. "Spread" walks the steps by a fixed stride, so habitats that sit
// beside each other on the shore are several steps apart in pitch. A tuning
// with fewer than twelve steps makes some habitats share a note.
export const TUNINGS = [
  { id: 'spread13', label: '13 equal, spread',      divisions: 13, step: i => (5 * i) % 13 },
  { id: 'shore13',  label: '13 equal, shore order', divisions: 13, step: i => (i < 11 ? i : 12) },
  { id: 'shared7',  label: '7 equal, shared notes', divisions: 7,  step: i => (3 * i) % 7 },
  { id: 'shared5',  label: '5 equal, shared notes', divisions: 5,  step: i => (2 * i) % 5 },
];

// Row registers in hertz, top (landward) row first. 236.5 Hz is Ombak Lock's
// lowest base pitch.
export const REGISTERS = [
  { id: 'octaves', label: 'Octaves, 118 to 946 Hz', hz: [946, 473, 236.5, 118.25] },
  { id: 'fifths',  label: 'Fifths, 158 to 532 Hz',  hz: [532.125, 354.75, 236.5, 157.667] },
];

// Width in hertz of the band the ten column offsets are spread across. Ombak
// Lock's window is 12 Hz. A wide band at a low register pulls two keys of one
// habitat far enough apart to be heard as two notes.
export const WINDOW = { min: 2, max: 12, step: 0.5, initial: 6 };

const preset = (list, id) => list.find(p => p.id === id) ?? list[0];

// Cents above the row register for a habitat. Unusual terrain sits halfway
// between two steps of whichever tuning is in use.
export function habitatCents(habitatId, tuningId) {
  const tuning = preset(TUNINGS, tuningId), size = 1200 / tuning.divisions;
  const i = HABITATS.findIndex(h => h.id === habitatId);
  if (i >= 0) return tuning.step(i) * size;
  const u = Math.max(0, UNUSUAL.findIndex(h => h.id === habitatId));
  return (((3 * u + 1) % tuning.divisions) + 0.5) * size;
}

// `offsets` are the board's ten column fractions in [0, 1].
export function frequency(key, offsets, settings) {
  const register = preset(REGISTERS, settings.registers).hz[key.row];
  return register * 2 ** (habitatCents(key.habitat, settings.tuning) / 1200) + offsets[key.col] * settings.window;
}
