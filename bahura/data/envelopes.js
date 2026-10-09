// The envelope of a key follows the script its glyph is written in. The
// habitat gives the note and the timbre (data/habitats.js); the glyph's script
// gives how the note starts, holds, and stops. Placeholders for the ear.
//
//   attack   seconds from silence to full level
//   decay    multiplies the habitat's own decay time
//   sustain  level held while the key stays down, as a share of full level;
//            0 means a plain strike that dies away whether or not it is held
//   release  seconds to fall silent after the key comes up; null means the
//            note rings out and lifting the key does nothing

export const ENVELOPES = {
  mark:       { label: 'mark',       attack: 0.003, decay: 1.0,  sustain: 0,    release: null },
  baybayin:   { label: 'Baybayin',   attack: 0.02,  decay: 1.2,  sustain: 0.15, release: 0.8 },
  kana:       { label: 'kana',       attack: 0.002, decay: 0.35, sustain: 0,    release: 0.08 },
  jawi:       { label: 'Jawi',       attack: 0.25,  decay: 1.0,  sustain: 0.5,  release: 1.2 },
  devanagari: { label: 'Devanagari', attack: 0.06,  decay: 1.5,  sustain: 0.3,  release: 0.6 },
  hanzi:      { label: 'Hanzi',      attack: 0.01,  decay: 1.8,  sustain: 0.1,  release: 2.0 },
  other:      { label: 'other',      attack: 0.12,  decay: 0.8,  sustain: 0.4,  release: 0.5 },
};

const RANGES = [
  [0x1700, 0x171f, 'baybayin'],
  [0x3040, 0x30ff, 'kana'], [0xff65, 0xff9f, 'kana'],
  [0x0600, 0x06ff, 'jawi'], [0x0750, 0x077f, 'jawi'], [0xfb50, 0xfdff, 'jawi'],
  [0x0900, 0x097f, 'devanagari'],
  [0x4e00, 0x9fff, 'hanzi'],
  [0x0e00, 0x0e7f, 'other'], [0x0c00, 0x0c7f, 'other'], [0x1000, 0x109f, 'other'], [0xa980, 0xa9df, 'other'],
];

// Punctuation and symbols fall through to 'mark'.
export function scriptOf(glyph) {
  const code = glyph.codePointAt(0);
  for (const [low, high, script] of RANGES) if (code >= low && code <= high) return script;
  return 'mark';
}
