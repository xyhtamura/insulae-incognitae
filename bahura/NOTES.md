# Bahura — notes

A browser gong keyboard whose forty keys are a patch of estuarine terrain: the
glyph on a key is its note, and the notes change as the terrain does. Sulat's
terrain and contact rules with Ombak Lock's beating, at shoal scale. The design
is in [SPEC.md](SPEC.md). Steps 1 and 2 are built: a playable board with
sympathetic ringing and no mutation.

## Next step

Build step 3 of [SPEC.md](SPEC.md) section 10: contact mutation driven by
playing, with the changed-key mark and the closed-rules check. Xyh's verdicts
on the envelopes, tunings, and ringing level are still owed and can arrive at
any point.

## Log

2026-10-09 — Claude Code — Built step 2, sympathetic ringing, at Xyh's request.

What changed:
- `src/main.js`: playing a key also starts each of its six neighbours that
  has the same habitat, at that neighbour's own pitch and envelope, and stops
  them when the key is lifted. Each ringing neighbour gets a thin broken
  outline.
- `src/voice.js`: a note takes a level and a minimum attack. A ringing
  neighbour plays at 30% of a played key's level and starts over at least
  0.06 s, so it is not heard as a second strike. Both values are in
  `data/voice.js`.
- Audition panel: a "Neighbour ringing" slider from off to 60%, and the
  readout lists which keys ring and how many hertz each is from the played
  key.

A neighbour in the row above or below is in another register, so it rings
about an octave or a fifth away and does not beat closely. Only same-row
neighbours give the close beating.

Verified in the Browser pane by DOM, board 5: pressing 5 (mangrove) gave three
outlines, two of them the neighbour kind, and the readout "rings with 4
(5.32 Hz), 6 (1.36 Hz)"; lifting removed all three; with the slider at off the
same key gave one outline and no "rings with"; no console errors.
`node scripts/check_board.mjs` passes.

Not verified: the sound. No agent has heard whether a patch shimmers or
whether 30% is too much. A neighbour whose glyph is a mark rings out fully
after the played key is lifted, because marks ignore release; whether that is
wanted is for the ear.

Undone: steps 3 to 5.

2026-10-09 — Claude Code — Three changes after Xyh played step 1: envelopes
that follow the glyph, a board drawn as shoals, and tuning drawn by the
reshuffle.

What changed:
- `data/envelopes.js` and `src/voice.js`: each key has an attack, decay,
  sustain, and release set by the script its glyph is written in (mark,
  Baybayin, kana, Jawi, Devanagari, Hanzi, other). The habitat still gives the
  pitch and the partial balance. Notes start on key-down and release on
  key-up, so a script with a sustain level holds while the key is held. A
  mark is a plain strike that rings out. Xyh said "based on the character";
  reading that as the glyph's script is the agent's interpretation.
- `src/shape.js`, `src/main.js`, `style.css`: the board is an SVG. Each key
  is an irregular closed outline on a row that follows two overlaid waves,
  both seeded. Outlines overlap their neighbours, and same-habitat keys share
  a fill, so a patch draws as one shoal. Faint lines on the water follow the
  same wave. A sounding key gets a dark outline drawn on top.
- `data/tuning.js` `drawSettings`: a reshuffle draws the tuning, registers,
  and beat band from the seed. The Audition panel shows what was drawn;
  choosing a value there pins it across reshuffles until Unpin. Xyh's ruling:
  the panel is exposed for this test and hidden in the final page, where the
  player takes what the reshuffle gives.

Verified in the Browser pane through the root server: 40 outlines; one
screenshot of board 5 at a 577 px pane, where the patches read as shoals in
four wavy rows and every glyph drew; pressing e then r gave "r  tide line
625.50 Hz  kana: attack 0.002 s, sustain 0, release 0.08 s   1.33 Hz from e";
a pointer press added one outline mark and lifting removed it; a reshuffle
changed registers and band with the seed; pinning the tuning kept it across a
reshuffle and wrote it to the address; no console errors or overflow.
`node scripts/check_board.mjs` passes.

Not verified: the sound, again. No agent has heard the envelopes, and the
release path (`cancelAndHoldAtTime`) has only been run, not listened to.
Water habitats (creek mouth, shallows) are close to the water colour and are
faint in the screenshot. Touch was not tried on a device.

Changed from the spec: colour and habitat now carry the note, and the glyph
within a habitat carries the envelope, where the spec said the glyph is the
note. SPEC.md sections 4, 6, and 8 are updated to match.

2026-10-09 — Claude Code — Built step 1 at Xyh's request, to audition the
tuning. Open `http://localhost:8000/insulae-incognitae/bahura/`.

What changed:
- `src/board.js`: a board from a seed. Ten centres are placed on the keyboard,
  each with a habitat drawn from those near its row's place on the shore, and
  every key takes the habitat of its nearest centre. About 5% of keys are
  unusual terrain. Also the ten column offsets and the six-neighbour lookup.
- `data/habitats.js`: twelve habitats and ten unusual ones, with glyph sets
  copied from `../sulat/biomes.js`, colours, and placeholder decay and
  brightness.
- `data/tuning.js`: the pitch formula with presets. `data/voice.js` and
  `src/voice.js`: four sine partials at the ideal free-bar ratios, decaying.
- `src/main.js`, `index.html`, `style.css`: the keys, keyboard and pointer
  striking, Reshuffle, Volume, and an Audition panel.
- `scripts/check_board.mjs` and `package.json` (`npm run check`).

The Audition panel is not in the spec. It switches the tuning (13 equal
spread, 13 equal in shore order, 7 equal, 5 equal), the registers (octaves
from 118 Hz, or fifths from 158 Hz), and the width of the beat band (2 to
12 Hz), can print each key's frequency on it, and reports the last key struck
and its distance in hertz from the one before. Every setting is written to
the address bar. It is there for step 1 and is meant to come out once the
values are chosen.

Found while building: the spec's 12 Hz band and its "the glyph is the note"
rule pull against each other in low registers. 12 Hz is 22 cents at 946 Hz and
about 165 cents at 118 Hz, which is wider than one 13-division step, so two
bottom-row keys of one habitat can sound as two different notes. The band
width and the fifths registers are in the panel so that this can be judged by
ear. The page opens at 6 Hz, where neighbouring offsets can be as close as
0.6 Hz; the spec's 1.1 Hz floor holds only at 12 Hz.

Verified:
- `node scripts/check_board.mjs` over 100 seeds: two builds of a seed are
  identical; column offsets are at least 1.22 Hz apart at a 12 Hz band;
  every frequency under every preset lies between 118.3 and 1852.8 Hz; 2.0
  unusual keys per board; 10.1 patches per board with a mean of 3.97 keys,
  the largest 18, and 29% of patches a single key. The first generator, two
  noise fields, left 63% of patches as single keys and was replaced.
- In the Browser pane, by DOM, through the root server: 40 keys in four rows
  of ten; no glyph measured as zero width; pressing q then w gave the readout
  "w  creek mouth  531.56 Hz   0.65 Hz from q"; Reshuffle changed the seed in
  the address bar; a pointer press set and cleared the struck state; changing
  the tuning changed a key's printed frequency from 426.5 to 237.8 Hz; no
  console errors; no horizontal overflow at 1280 px or at 375 px, where a key
  is 28.8 px.

Not verified: the sound. No agent has heard it; the strikes ran without
error, which is all that is known. Screenshots timed out because the pane was
hidden, so the layout and colours have not been looked at. Glyph coverage
was measured on this machine's fonts only; the page loads Noto Sans Tagalog
from `../fonts/` and takes every other script from system fonts, so another
machine may show empty boxes.

Dropped from step 1: separate `render.js` and `input.js`, which the spec
lists; one `src/main.js` holds both at this size. `noise` in `src/hash.js` is
unused since the generator changed.

Undone: steps 2 to 5, and the decisions in spec section 11.

2026-10-09 — Claude Code — Created the folder and wrote [SPEC.md](SPEC.md) from
Xyh's brief, given over two days in the multicart thread: Sulat plus Ombak Lock
as a non-12-TET gong keyboard whose layout is the terrain; mutation by playing
and by time, slowed, with a reshuffle; mostly estuarine terrain with occasional
unusual terrain; shoal-sized where its two relatives are world-sized. The name
is Xyh's. Added the ROADMAP entry.

Read before writing: `../sulat/biomes.js` and `../sulat/typingEcology.js` in
full, the header and constants of `../sulat/events.js`, the top of
`../sulat/NOTES.md`, section 2 of `../../ombak-lock/ombak-lock.md`, and the
category list of `../../tabota/scala/index.json`. Ombak Lock's audio code was
not read beyond a search for its oscillator calls.

Proposed by the agent and not in the brief: the four-by-ten staggered layout
with six neighbours; rows as a shore in section and as registers; the pitch
formula, with column offsets in hertz inside Ombak Lock's 12 Hz window;
sympathetic ringing between same-habitat neighbours; the renaming of Sulat's
biomes at shoal scale; and every number. Each is marked as a starting value or
listed in section 11.

Not verified, because nothing runs: whether the rates can be made slow and
still audible, whether boards settle, how the voice sounds, and whether forty
glyph keys fit a phone-width screen. The statement about Balinese beat rates in
section 6 is from memory and has no retrieved source.

Placement: put beside Sulat in this repository instead of in a root folder,
for the shared fonts and for git history. Xyh was not asked first; it is
decision 6 in the spec, and moving two Markdown files is the whole cost of
reversing it.

Undone: all of section 10, and the seven decisions in section 11.
