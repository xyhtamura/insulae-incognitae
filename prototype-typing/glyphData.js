// glyphData.js
//
// Per-glyph linguistic data: { script, phoneme?, meaning? }
//   phoneme — used by the engine's COMPOSE move (reads adjacent cells' sounds)
//   meaning — documentation only now; the engine recognises WORDS via LEXICON,
//             not via single-glyph meaning. Kept here for reference.
//
// Any glyph that appears in a LEXICON word, or that you want COMPOSE to be able
// to read, should have at least a `phoneme` here. Terrain-decorative glyphs
// (~, ▓, *, 川 …) can stay phoneme-less; they simply never translate.

const GLYPH_DATA = {

    // ── Hanzi / Kanji logograms (recognised as whole words via LEXICON) ──
    '木': { script: 'Hanzi', phoneme: 'mu',  meaning: 'tree' },   // also 'ki' in Japanese — see LEXICON
    '林': { script: 'Hanzi', phoneme: 'lin', meaning: 'woods' },
    '森': { script: 'Hanzi', phoneme: 'sen', meaning: 'forest' },
    '山': { script: 'Hanzi', phoneme: 'san', meaning: 'mountain' },
    '川': { script: 'Hanzi', phoneme: 'chu', meaning: 'river' },

    // ── Baybayin (consonants carry inherent /a/; kudlit shifts the vowel) ──
    'ᜉ': { script: 'Baybayin', phoneme: 'pa' },
    'ᜈ': { script: 'Baybayin', phoneme: 'na' },
    'ᜊ': { script: 'Baybayin', phoneme: 'ba' },
    'ᜐ': { script: 'Baybayin', phoneme: 'sa' },
    'ᜃ': { script: 'Baybayin', phoneme: 'ka' },
    'ᜆ': { script: 'Baybayin', phoneme: 'ta' },
    'ᜄ': { script: 'Baybayin', phoneme: 'ga' },
    'ᜅ': { script: 'Baybayin', phoneme: 'nga' },
    'ᜀ': { script: 'Baybayin', phoneme: 'a' },
    'ᜇ': { script: 'Baybayin', phoneme: 'ra' },
    'ᜏ': { script: 'Baybayin', phoneme: 'wa' },
    'ᜂ': { script: 'Baybayin', phoneme: 'o/u' },
    'ᜓ': { script: 'Baybayin', phoneme: 'u' },     // kudlit (combining)
    'ᜒ': { script: 'Baybayin', phoneme: 'i' },     // kudlit (combining)
    '᜔': { script: 'Baybayin', phoneme: '' },      // virama / vowel-killer
    'ᜄᜒ': { script: 'Baybayin', phoneme: 'gi' },   // precomposed cell used in 'saging'

    // ── Thai ──
    'ป่า': { script: 'Thai', phoneme: 'pa', meaning: 'woods' },  // single multi-codepoint cell
    'ต':  { script: 'Thai', phoneme: 't' },
    'น':  { script: 'Thai', phoneme: 'na' },
    'ไม้': { script: 'Thai', phoneme: 'mai' },
    'ม':  { script: 'Thai', phoneme: 'ma' },

    // ── Kana ──
    'サ': { script: 'Katakana', phoneme: 'sa' },
    'ツ': { script: 'Katakana', phoneme: 'tsu' },

    // ── Jawi ──
    'ب': { script: 'Jawi', phoneme: 'ba' },
    'س': { script: 'Jawi', phoneme: 'sa' },
    'ل': { script: 'Jawi', phoneme: 'la' },
    'ڤ': { script: 'Jawi', phoneme: 'pa' },
    'ق': { script: 'Jawi', phoneme: 'qa' },

    // ── Devanagari ──
    'म': { script: 'Devanagari', phoneme: 'ma' },
    'ए': { script: 'Devanagari', phoneme: 'e' },

    // ── Latin (kept inert so they aren't reprocessed) ──
    'p': { script: 'Latin' }, 'u': { script: 'Latin' }, 'n': { script: 'Latin' },
    'o': { script: 'Latin' }, 'b': { script: 'Latin' }, 'a': { script: 'Latin' },
    's': { script: 'Latin' }, 't': { script: 'Latin' }, 'r': { script: 'Latin' },
    'e': { script: 'Latin' }, 'w': { script: 'Latin' }, 'd': { script: 'Latin' },
    'f': { script: 'Latin' }, 'g': { script: 'Latin' }, 'k': { script: 'Latin' },
};
