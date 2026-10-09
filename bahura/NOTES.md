# Bahura — notes

A browser gong keyboard whose forty keys are a patch of estuarine terrain: the
glyph on a key is its note, and the notes change as the terrain does. Sulat's
terrain and contact rules with Ombak Lock's beating, at shoal scale. The design
is in [SPEC.md](SPEC.md). Steps 1 to 4 are built: a playable board with
sympathetic ringing whose terrain changes by playing, by time, by tide, and by
earthquake. That is the first complete version by the spec's own measure.

## Next step

Xyh plays it and gives verdicts by ear and eye: the envelopes, the tunings,
the ringing level, the rate of change, and the twenty-five habitats' colours.
Step 5 of [SPEC.md](SPEC.md) section 10 is what is left to build: a check on a
real touch device, and hiding the Audition panel for the finished page.

## Log

2026-10-09 — Claude Code — Built step 4 and widened the terrain, at Xyh's
request: time, tide with an ebb that uncovers mudflat as sandbar, earthquake,
changes that need no cause, and a more colourful set of habitats.

What changed:
- `data/habitats.js`: twenty-five habitats, up from twelve. Added ironwood
  and driftwood; red oxide bank; ochre, white, pink, and black sand; limestone
  and basalt; anemone, brain coral, fire coral, and sea fan. Each borrows the
  glyph set of a Sulat biome that has no place on a shoal, and has its own
  colour, decay, and brightness. The ten unusual habitats are unchanged.
- `data/tuning.js`: with twenty-five habitats only a new 25-division tuning
  gives each its own note. In the 13-, 7-, and 5-division tunings several
  habitats share one, so there colour no longer identifies the note.
- `src/contact.js`: the rules read "sand" as any of the five sands and "reef"
  as any coral or anemone. Added drift: each key has a small chance per tick
  of becoming a habitat near its place on the shore with nothing causing it,
  following Xyh's ruling that terrain need not form literally.
- `src/events.js`: the tide floods some coverable keys in the two seaward rows
  to shallows; the ebb returns them as tide line or a sand and turns some
  mudflat to sandbar. An earthquake turns one key to unusual terrain and may
  turn each key touching it to any habitat.
- `src/clock.js`: one clock for the tick, tide, and earthquake, driven by a
  5-second timer in the page and directly by the simulation. A hidden page
  stands still.
- Page: a tide status beside the board number, a deeper water colour while the
  tide is in, and Audition buttons to turn the tide and to cause an
  earthquake. The Terrain change speed now scales time as well as playing.

Measured by `node scripts/check_contact.mjs`, 100 boards for 60 simulated
minutes:
- Left alone: 0.65 keys changed per minute (contact 0.20, drift 0.19, tide
  0.20, earthquake 0.06). The spec's target was about 0.5.
- Played at 120 keys a minute with time running: 0.93 per minute, steady from
  the first ten minutes (0.88) to the last twenty (0.86).
- Played with time stopped, for comparison: 0.55 in the first ten minutes and
  none in the last twenty.
- Habitats per board: 9.8 when generated, 15.8 after an hour of play with time
  running, never fewer than 10. Boards get more varied, not less.
- Mudflat still doubles, 6.0% to 12.3%. Every sand survives, between 1.5% and
  4.2% of keys each.

Two rule changes came out of the first run, which had 1.35 changes a minute
and no sand left: the sands were taken out of the rule that turns open ground
beside water to mudflat, and the timed contact chance was cut from 2% to 0.4%
per tick. The tide waits 8 to 14 minutes, longer than the spec's 5 to 10,
because Xyh asked for slow.

Verified in the Browser pane by DOM: the earthquake button reported "1 changed
by earthquake: creek mouth to rock" and "2 changed by earthquake: creek mouth
to marsh" with two rings; the tide button switched the status between "Tide
in" and "Tide out" and the board's class with it; at 20 times speed with no
input, three keys changed fill in ten seconds and the readout named drift and
contact changes; no console errors. Looked at one screenshot of board 11,
upright, showing sea fan, ochre sand, pink sand, and white sand. Both check
scripts pass.

Not verified: the sound of any new habitat. A flood or ebb that actually
changed keys in the page; on board 5 the tide button reported "Nothing
changed" both ways, because its seaward rows held nothing the tide covers, and
only the simulation shows tides changing keys. Whether twenty-five colours
stay distinguishable from one another, by eye. Touch on a device.

Known rough edges: the hint paragraph above the board is long on a phone. The
pale habitats (creek mouth, shallows, white sand) sit close to the water
colour. Reshuffling restarts terrain time, including the wait for the first
tide.

Undone: step 5.

2026-10-09 — Claude Code — Built step 3, contact by playing, and made two
changes Xyh asked for with it: no wave lines behind the board, and an upright
layout on a narrow screen.

What changed:
- `src/contact.js`: the contact rules, taken from `target()` in
  `../sulat/typingEcology.js` for the biomes that occur here, in Sulat's
  order. Two are adapted because Sulat's cold water is not a habitat here: ice
  and glacier beside shallows become shallows. Playing a key gives it and its
  neighbours one opportunity each. A key changes when the rules name the same
  target on two successive opportunities and a 1.2% chance comes up, and it
  then sits out 60 opportunities. The values are in `data/rates.js`.
- `src/main.js`, `style.css`: a changed key takes its new colour and a glyph
  from the new habitat, and carries a ring with a dot until it is next played.
  The readout names each change. The Audition panel has a Terrain change
  control: normal, 20 times faster, or off.
- `src/shape.js`: the wave lines are gone. On a portrait screen up to 700 px
  wide the board is turned a quarter, so its rows run down the screen, and the
  keyboard characters are hidden. Which keys touch is unchanged, so contact
  and ringing behave the same in both layouts. Xyh allowed the mobile layout
  to leave the keyboard arrangement altogether; a quarter turn was the least
  that keeps drawn neighbours and sounding neighbours the same keys.
- `scripts/check_contact.mjs`, run with `npm run check`.

Measured by `node scripts/check_contact.mjs`, 100 boards for 60 simulated
minutes at 120 keys played per minute:
- Keys changed per minute: 1.07 in the first 5 minutes, 0.61 in the first 15,
  0.18 over the hour. The spec's target is about one.
- 97 of 100 boards had nothing left to change by the end, at a median of
  minute 15. Six were already settled when generated.
- Sandbar and tide line go from 7.8% and 7.2% of keys to none, and flower,
  lava, and volcanic ground also disappear. Mudflat goes from 9.5% to 20.6%
  and mangrove from 4.5% to 8.5%. Marsh, tide pool, seagrass, and coral do not
  move, because no rule creates or removes them.
- The rules make 18 distinct changes, and every target is a habitat with
  glyphs, a voice, and a pitch.

Verified in the Browser pane by DOM, board 5: after 200 key presses at normal
speed at least one key's fill had changed; at 20 times, the readout reported
"d changed: tide line to mudflat" and "w changed: creek mouth to brackish
channel", four rings showed, and four keys' labels read "changed"; no wave
lines remained; no console errors. At 375 by 812 the board is upright, 343 by
666 px, with keys about 56 by 51 px against 29 px in the keyboard layout, the
key characters hidden, and no horizontal overflow. Looked at one screenshot of
the upright board with rings on four shoals.

Not verified: the sound of a key after it changes; touch on a device; whether
the ring is noticeable enough at phone size.

Open: Sulat's rules only run one way here, toward mud and mangrove, and
nothing makes sand, tide line, coral, or seagrass. Step 4's tide is where an
opposite direction would come from, for example an ebb that uncovers mudflat
as sandbar. That is new authored behaviour and is Xyh's to approve.

Undone: steps 4 and 5.

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
