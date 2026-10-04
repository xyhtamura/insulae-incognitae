// lexicon.js
//
// The dictionary the translation engine reads. THIS is the file to grow.
//
// A word is a list of SYLLABLE UNITS. Each unit carries:
//     g : the glyph cell(s) that render it  (a cell can be multi-codepoint, e.g. 'ป่า')
//     p : its phoneme, romanised            (the GLUE — see below)
//
// HOW THE MALFUNCTION EMERGES — it's all in the phonemes `p`:
//   • Two words that share a meaning  -> they can SEMANTIC-hop into each other.
//   • A word whose first syllable `p` equals some syllable `p` inside another word
//        -> that word can be spliced into the other (DECOMPOSE). Scripts collide.
//   • Loose adjacent syllables whose `p` sequence spells a word -> they fuse (COMPOSE).
// So you don't script chains. You just add words; wherever their phonemes coincide
// across languages, the engine starts mishearing one as the other. Add a word that
// happens to start with "ba" and suddenly every "ba" in the field can become it.
//
// CLOSURE RULE: any glyph you put in `g` should also exist in GLYPH_DATA (at least a
// phoneme), or the chain dead-ends there. Single logograms used as whole words
// (木 林 山 …) also need a LEXICON entry here so they're recognised.
//
// NOTE: romanisations below are rough placeholders — replace with your own. The
// Thai / Jawi / Devanagari values especially are illustrative. The collisions
// (shared `p` across languages) are what you're really authoring.

const LEXICON = [

    // ── tree ────────────────────────────────────────────────────────────────
    { meaning: 'tree', lang: 'Hanzi',    script: 'Hanzi',    syllables: [ {g:['木'], p:'mu'} ] },
    { meaning: 'tree', lang: 'Japanese', script: 'Kanji',    syllables: [ {g:['木'], p:'ki'} ] },   // same glyph, other reading
    { meaning: 'tree', lang: 'Tagalog',  script: 'Baybayin', syllables: [ {g:['ᜉ','ᜓ'], p:'pu'}, {g:['ᜈ','ᜓ'], p:'nu'} ] }, // puno

    // ── woods ───────────────────────────────────────────────────────────────
    { meaning: 'woods', lang: 'Hanzi',   script: 'Hanzi',    syllables: [ {g:['林'], p:'lin'} ] },
    { meaning: 'woods', lang: 'Thai',    script: 'Thai',     syllables: [ {g:['ป่า'], p:'pa'} ] },
    { meaning: 'woods', lang: 'Tagalog', script: 'Baybayin', syllables: [ {g:['ᜄ','ᜓ'], p:'gu'}, {g:['ᜊ'], p:'ba'}, {g:['ᜆ','᜔'], p:'t'} ] }, // gubat

    // ── forest ──────────────────────────────────────────────────────────────
    { meaning: 'forest', lang: 'Hanzi',  script: 'Hanzi',    syllables: [ {g:['森'], p:'sen'} ] },

    // ── mountain ──────────────────────────────────────────────────────────────
    { meaning: 'mountain', lang: 'Hanzi', script: 'Hanzi',   syllables: [ {g:['山'], p:'san'} ] },

    // ── wet / read  (Tagalog "basa") ──────────────────────────────────────────
    // first syllable 'ba' collides with gubat's middle 'ba'  -> decompose
    // phoneme-sequence 'ba|sa' lets ب+サ (Jawi+Kana) COMPOSE into it (manual's example)
    { meaning: 'wet', lang: 'Tagalog',   script: 'Baybayin', syllables: [ {g:['ᜊ'], p:'ba'}, {g:['ᜐ'], p:'sa'} ] }, // basa

    // ── banana  (Tagalog "saging") — first syllable 'sa' collides with basa's 'sa'
    { meaning: 'banana', lang: 'Tagalog', script: 'Baybayin', syllables: [ {g:['ᜐ'], p:'sa'}, {g:['ᜄᜒ'], p:'gi'}, {g:['ᜅ','᜔'], p:'ng'} ] }, // saging

    // ── sun / day  (Tagalog "araw") ─────────────────────────────────────────
    { meaning: 'sun', lang: 'Tagalog',   script: 'Baybayin', syllables: [ {g:['ᜀ'], p:'a'}, {g:['ᜇ'], p:'ra'}, {g:['ᜏ'], p:'wa'} ] }, // araw

    // add your words here — wherever a `p` coincides with another word's, a chain opens
];
