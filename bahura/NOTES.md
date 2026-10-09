# Bahura — notes

A browser gong keyboard whose forty keys are a patch of estuarine terrain: the
glyph on a key is its note, and the notes change as the terrain does. Sulat's
terrain and contact rules with Ombak Lock's beating, at shoal scale. The design
is in [SPEC.md](SPEC.md). Steps 1 to 4 are built: a playable board with
sympathetic ringing whose terrain changes by playing, by time, by tide, and by
earthquake. That is the first complete version by the spec's own measure.

## Next step

Xyh listens to the creatures: whether dithertick's ticks sit well against the
gong voice, how often they sound, and how loud. Alongside that, Xyh looks for photographed textures and says whether the shading, grain, and
colour strength are right. A texture is added by putting the file in
`textures/` and listing it in `data/look.js`. After the look is settled, step 5
of [SPEC.md](SPEC.md) section 10 is what is left: a check on a real touch
device, and hiding the Audition panel for the finished page.

## Log

2026-10-10 — Claude Code — Three changes Xyh asked for after playing: the
glyph stays dark while its shoal glows, the terrain changes faster, and each
creature has a tune.

Glyph:
- The glow's top layers moved under the glyphs, and a played shoal's glyph
  and letter turn dark for as long as it glows. Moving the layers was not
  enough by itself: dark habitats have pale glyphs, and a pale glyph on a
  shoal that has just turned pale disappears. A headless Edge screenshot with
  5, h, and z held shows all three glyphs dark, where the one before showed
  two of them washed out.

Terrain, in `data/rates.js`, each about three times what it was:
- The chance that playing changes a key: 1.2% to 3.5% per opportunity.
- Timed contact: 0.4% to 1.2% per key per tick. Drift: 0.04% to 0.12%.
- The tide comes every 3 to 6 minutes and stays 40 to 80 s, where it came
  every 8 to 14 and stayed 60 to 120. An earthquake comes every 10 to 20
  minutes, where it came every 25 to 45.

Measured by `node scripts/check_contact.mjs`, 100 boards for 60 simulated
minutes: left alone, 1.77 keys change a minute, up from 0.65; played at 120
keys a minute with time running, 2.38, up from 0.93.

Faster change broke the patches up, which matters because same-habitat
neighbours are what beat and ring together. The check now prints the share of
keys touching one of their own habitat. It is 92% on a new board. With the
faster rates alone it fell to 57% after an hour of play. Three changes hold
more of it: drift takes a touching key's habitat 85% of the time and only
otherwise becomes something new; one ebb leaves one kind of sand or tide line
behind, not a different one per key; and an earthquake throws one habitat
over the keys round its centre, not a different one each. With those it is
68% after an hour, and a board has 13.9 habitats where it had 16.2.

Creature tunes:
- `src/creatures.js`: each creature is given a tune of three to five notes
  when it comes out. A note is a number of steps, from 3 down to 5 up, in
  whichever tuning the board is in. The first note is the pitch its sounds
  were rendered at, and at least one other differs.
- `src/main.js`: each sound a creature makes, call, tick, or voice, is the
  next note of its tune, made by playing the clip faster or slower. So a
  higher note is also shorter.
- Measured by `node scripts/check_creatures.mjs`: 6,636 creatures came out
  with 2,718 different tunes, for example "0 2 4 -3", and the check fails any
  creature without one.

Verified: the checks above pass, and the page loads and draws in headless
Edge. Not verified: any tune by ear; the playback-rate arithmetic was read
and not listened to, and no creature sound was triggered in a browser in this
sitting. Whether 2.4 changes a minute is the right speed is for Xyh.

2026-10-10 — Claude Code — Two changes Xyh asked for: the name of the terrain
shown as a subtitle when a shoal is played, and a glow in place of the dark
outline on a sounding shoal, after Ombak Lock's activation glow.

What Ombak Lock does, read from `../../ombak-lock/index.html`: an active
tumbler gets an outer shadow in amber, `hsl(32 84% 56% / .5)`, whose spread
grows with a glow variable, over an inset highlight.

What changed:
- Subtitle. Playing a shoal writes its habitat name at the foot of the
  window, for example "mangrove" or "pink sand". It stays while a key is down
  and fades 1.6 s after the last one is lifted. It is an `aria-live` region.
- Glow. A sounding shoal has three layers in place of the outline: a blurred
  amber copy of its shape underneath every shoal, so light shows round its
  edge; a fainter blurred copy on top, so some light falls on the shoals
  beside it; and a pale wash on top that brightens the shoal itself. A
  neighbour set ringing has the same three, weaker. All fade in over 0.12 s
  and out over 0.45 s.
- `?hold=5hz` holds those keys as the page opens, for screenshots.

Verified: two headless Edge screenshots of board 5 with 5, h, and z held,
looked at. The glow reads as light round each held shoal and faintly on the
two mangrove neighbours of 5, and the subtitle reads "anemone", the last of
the three. The first screenshot, without the layer on top, showed almost
nothing round h, which is surrounded by other shoals; the second has it. In
the Browser pane by DOM: holding 5 made three of each layer, two of them the
weak kind, and no old outline elements; the subtitle read "mangrove" and was
shown; on lifting, all nine layers were fading; 2.3 s later none remained and
the subtitle was hidden; playing h changed the subtitle to "pink sand". No
console errors. `npm run check` passes.

Not verified: the glow in motion, by eye. The cost of blurring three shapes
per sounding shoal while several keys are held.

Known: the state now rests on brightness and colour, where the outline it
replaced was a shape. The wash lowers the contrast of the glyph on pale
shoals; in the screenshot the glyph on pink sand is faint while it is held.
The subtitle carries only the habitat's name; the readout in the menu still
has the frequency and envelope.

2026-10-10 — Claude Code — Moved Reshuffle out of the menu to a small button
of its own in the bottom left corner, at Xyh's request. The menu keeps the
board number and tide. The corner is the one diagonally opposite the menu, so
the open panel does not cover it on a wide window.

Verified: two headless Edge screenshots, looked at. At 1280 by 720 with the
menu open, Reshuffle is in the bottom left, clear of the panel and of the
shoals. At 520 by 900 with the menu open, the panel ends above it and it sits
over the water beside the lowest shoals. In the Browser pane by DOM: there is
one Reshuffle button, it is outside the menu, and clicking it with the menu
closed changed the seed in the address. `npm run check` passes.

Not verified: a real phone, where a thumb reaching for the lowest shoals may
find the button in the way.

2026-10-10 — Claude Code — Made the board the whole window and put everything
else behind one corner button, at Xyh's request for a minimal page.

What changed:
- `index.html`, `style.css`: the board is a fixed element the size of the
  window. Its drawing is fitted inside, and the water, which is the element's
  background, runs to every edge. The title, the instructions, the bar, and
  the settings dialog are gone from the page surface.
- A Menu button sits in the top right corner. It opens a panel in that
  corner holding Reshuffle with the board number and tide, the instructions
  under "How to play", the four settings, and the testing controls folded
  under "Testing". The button reads Close while the panel is open, and Escape
  also closes it.
- The panel is not a dialog. The board stays in view and playable while it is
  open, so the testing controls can be used while playing. The 2026-10-10
  rule that keys do not play while settings are open is withdrawn with the
  dialog; keys typed into a text field or a select still do not play.
- The board turns upright in any window taller than it is wide, where before
  it needed the window to be under 700 px as well. The keyboard characters
  are hidden on touch devices and no longer tied to the upright layout.
- `?menu=open` replaces `?settings=open` for screenshots.

Verified: three headless Edge screenshots, looked at. At 1280 by 720 the
board spans the window's width with water above and below and the Menu button
in the corner. With the menu open the panel covers the right-hand keys and
leaves the rest playable. At 520 by 900 the board is upright and the panel
covers most of it. In the Browser pane by DOM: the menu opens from the button
and closes on Escape with the button's label and `aria-expanded` following; a
key played while the menu was open; Reshuffle in the menu changed the seed
and the status line; no console errors. `npm run check` passes.

Not verified: sizes in the pane, which reported a window of zero by zero
while hidden. A real phone. Whether the Menu button or the open panel sits
over a shoal someone wants to play; on the wide screenshot the button is
clear of the board, and on the tall one the panel covers most of it.

Known: on a phone the open menu hides most of the board, so Reshuffle cannot
be watched there. A separate small Reshuffle button in another corner would
fix that and was left out to keep to one button.

2026-10-10 — Claude Code — Added a Settings button, at Xyh's request, and
made creature movement one of its settings.

What changed:
- `index.html`, `style.css`: a Settings button beside Reshuffle opens a
  dialog with Volume, Colour strength, Show creatures, and Creatures move.
  Those four controls moved there from the bar and from the Audition panel,
  which now holds only the testing controls.
- `src/settings.js`: the four values are read from this browser's storage
  under `bahura_settings` when the page opens and written when one changes.
- Creatures move starts from the system's reduced-motion setting: unticked
  where the system asks for reduced motion, ticked elsewhere. Once the
  visitor changes any setting, their choice is saved and used from then on.
  This replaces the earlier entry's choice to ignore the system setting. The
  dialog shows a line explaining the unticked box when the system setting is
  the reason.
- Keys typed while the dialog is open do not play shoals.
- `?settings=open` shows the dialog as the page opens, for screenshots.

Verified in the Browser pane by DOM: with storage cleared, the controls came
up at their defaults and nothing was saved; changing Creatures move and Colour
strength wrote all four values; after a reload the saved values were applied,
with the board's filter at `saturate(0.4)`; a key event while the dialog was
open left the readout unchanged, and the same key after closing played. The
bar's buttons are Reshuffle and Settings. One headless Edge screenshot of the
open dialog was looked at. `npm run check` passes.

Not verified: the reduced-motion default itself. In this sitting the pane and
headless Edge both reported no reduced-motion request, although Windows'
"animations inside windows" setting reads off and the pane had reported a
request earlier in the day. So the unticked default and its explanatory line
were not seen. Which of the two Xyh's own browser reports is unknown; the
checkbox is the remedy either way.

The storage used for the test was cleared afterwards.

2026-10-10 — Claude Code — Coloured the creatures and set them moving, at
Xyh's request, after how Sulat draws its animals.

What Sulat does, read from `../sulat/index.html` and `typerEngine.js`: an
animal is a word on a dark rounded tag, a blue one while swimming, and while
it walks it rocks by five degrees on a sine of twelve times its age.

What changed:
- `src/creature-view.js`: draws each creature as its word on a rounded tag
  and moves it in one animation loop that runs only while something is out.
  A creature wanders to points near the top of its shoal, rests, and wanders
  again; when the rules move it to another shoal it travels there. It rocks
  while moving, as in Sulat.
- `data/creatures.js`: a tag colour and word colour per kind, and a motion
  entry per kind. Crabs are quick and keep to a line; milkfish dart; octopus
  and squid glide and squeeze; turtles are slow; jellyfish barely travel, bob,
  and pulse; shrimp and monkeys jitter in a small range; the sprout leans
  from side to side; bubbles climb, fade, and start again.
- The page has a "Creatures move" checkbox beside Reshuffle. Unticked,
  creatures are placed where they were heading and stay there.

Found while checking: this machine has Windows' "animations inside windows"
setting turned off (`SPI_GETCLIENTAREAANIMATION` reads false), so every
browser on it reports `prefers-reduced-motion: reduce`. The first version
stood still under that setting, which would have shown Xyh no movement at
all. Movement was asked for, so it now follows the page's checkbox, on by
default, and does not read the system setting. That is a choice against the
usual accessibility practice, and whether a visitor with that setting should
get still creatures by default is Xyh's to decide. The brief CSS flash on the
tag when a creature sounds, and its fade in and out, also still play.

Verified:
- A headless Edge screenshot of board 5 with three creatures out, looked at:
  a red crab tag, a pink shrimp tag, and a purple octopus tag, each sized to
  its word and legible over its shoal.
- Movement, in the Browser pane by DOM. The pane was hidden, which stops the
  browser's animation frames, so the frame function was replaced with a
  16 ms timer for the test. Over four seconds and 243 frames an octopus went
  from (2.761, 2.635) to (3.007, 2.526) and was tilted mid-move, and two crabs
  shifted along their lines. With the checkbox unticked the positions were
  identical two seconds apart.
- `npm run check` passes. The page loads with no new console errors.

Not verified: the movement as it looks, by eye, at real frame rates; no agent
has watched it. Whether a moving tag is distracting over a key being played.
Cost was not measured; the loop sets one transform per creature per frame, at
most three.

A bug caught on the way: the first load after this change drew no creatures
and no board number, because a local variable in `draw` had the same name as
the new view. The console error showed it.

2026-10-10 — Claude Code — Gave every creature a voice rendered by Pink
Trombone, at Xyh's request, after confirming its licence and putting it on the
workspace shelf.

Licence: read in the page itself at `https://dood.al/pinktrombone/`. Its
opening comment is "Copyright 2017 Neil Thapen" followed by the MIT text, and
the noise routine inside it is marked public domain by its own comment.

What changed:
- `scripts/vendor_pink_trombone.mjs`: Pink Trombone is one web page, so this
  script cuts the Glottis object, the Tract object, and the noise routine out
  of the shelf copy and writes `vendor/pink-trombone.js`, with the author's
  notice and a list of what was changed in its header. Three things in the
  page would not run as a module and are handled there: a zero written as
  `00`, a variable assigned without being declared, and a reference to a
  drawing canvas.
- `src/mouth.js`: renders a clip offline, following the page's own audio
  loop: 512-sample blocks, the tract stepped twice per sample, and noise
  through two band-pass filters computed directly. Pitch, tongue, and lips
  glide from one setting to another. The tongue shaping is a hand-port of the
  page's `TractUI.setRestDiameter`.
- `data/creatures.js`: a `mouth` entry per kind, with a comment saying which
  vowel it is aiming at. The voice is heard when a creature comes out and
  when the shoal it is on is played. Its sounds every few seconds are still
  the ZzFX call or the dithertick tick.
- `src/main.js`: all of a kind's sounds are now rendered in a timer after it
  comes out, not inside a key press. A creature that has to sound before its
  renders exist is silent that once.
- `scripts/check_creatures.mjs`: fails if the vendored file is not what the
  script makes from the shelf, or has lost its notice. It renders every voice
  and measures its pitch by autocorrelation.

Measured by the check, asked against measured in hertz: crab 570/632, shrimp
675/667, octopus 100/99, jellyfish 210/210, turtle 75/75, milkfish 375/400,
squid 220/207, monkey 450/490, sprout 195/199, bubbles 600/716. The ten
voices took 939 ms to render in Node, about a tenth of a second each, and the
longest is 0.96 s. An early test rendered a front vowel with about three times
the zero crossings of a back one, so the tongue position does change the
sound.

Verified in the Browser pane by DOM, through the server already on port 8000:
the page loads with the new modules and no console messages; after calling an
octopus and waiting 1.5 s, pressing its key took 2 ms, against 38 ms before
rendering moved out of the key press, and marked it sounding.

Not verified: any voice, by ear. The measurements show a sound at the right
pitch with a spectrum that moves with the tongue; they do not show that an
"oo" sounds like an "oo", or that these read as animals and not as a person.
The level, 22% of a key, is a guess. Whether the page stutters while a voice
renders in its timer was not looked at.

Known: the voices are human-shaped, because the model is a human vocal tract.
If that is wrong for the piece, the tract length (the number of sections,
44) is the first thing to change, and the extract would need a small edit to
allow it.

2026-10-10 — Claude Code — Added ZzFX as a second creature voice, after Xyh
opened vendoring to engines by other people and asked for a root folder to
keep such copies in.

Survey before choosing: ZzFX (Frank Force, MIT, one module of 260 lines),
jsfxr (Unlicense, the same kind of sound, larger), Pink Trombone (a vocal
tract; the original's licence was not found, a TypeScript fork is MIT; it runs
continuously and would be a larger change), Flocking (licence listed two
ways), and Tone.js (MIT, a framework). ZzFX was taken. Pink Trombone is the
one worth a second look, licence first.

What changed:
- The workspace has a shelf, `../../third-party/`, with ZzFX and its licence
  at a pinned commit, a manifest of hashes, and a check. Its README says how
  to add to it.
- `vendor/zzfx.js` and `vendor/zzfx-LICENSE`: the stamped copy and the MIT
  notice. The contract is in the root `DEPENDENCIES.md`.
- `data/creatures.js`: the five walkers (crab, octopus, turtle, milkfish,
  squid) each have a ZzFX call, a list of numbers in that tool's parameter
  order with a comment saying what it is meant to be. The five sitters keep
  their dithertick ticks. So a creature that moves calls in pitch, and one
  that stays put ticks.
- `src/main.js`: a kind with a call is built by `ZZFX.buildSamples` three
  times; ZzFX's own randomness makes each build a slightly different pitch.
- `scripts/check_creatures.mjs`: checks both vendored copies against their
  stamps and sources, that the licence file is present, and that every call
  is a list of numbers that renders finite, audible, and at or under full
  level.

Measured by the check: the calls last 0.12 s (crab), 0.30 s (octopus),
0.58 s (turtle), 0.10 s (milkfish), and 0.14 s (squid), each peaking at full
level before the 30% creature level is applied. The crab call first came out
at 0.05 s, shorter than its own repeat time, so it could only click once; its
sustain was lengthened.

Verified in the Browser pane by DOM: the page loads with the ZzFX import and
draws 40 keys with no console messages; importing the vendored module in the
page and building all five calls gave the same lengths as Node; calling a
turtle and pressing its key ran without error.

Not verified: any call, by ear. The five parameter lists were written from
ZzFX's parameter list and comments, not from listening, and they are the part
of this entry most likely to need changing. Real key presses could not be sent
to the pane in this sitting, so the sound path was reached only through a
dispatched event.

Known: ZzFX makes its own `AudioContext` when imported, so the page holds a
second one that plays nothing. In the Browser pane it reported itself running.
Removing it would mean editing the copy, which the shelf's rule forbids
without saying so in the header.

2026-10-09 — Claude Code — Added creatures, at Xyh's request: animals and
other things that come out of the terrain, make sounds unlike the keys', and
leave by themselves. Xyh offered `cytophone/` and `dithertick/` as engines to
vendor.

Which engine: dithertick. `dithertick/synth.js` is a module with a public
`buildPlan` and `renderPlan` that turn one note into a short buffer in one of
nine families, and its own page already auditions a family that way. The
cytophones are single HTML files with their engines inline, so using one
would mean a hand-port and not a copy. Nothing from `cytophone/` is used.

What changed:
- `vendor/dithertick-synth.js`: a stamped copy, unmodified below its header.
  The contract and blast-radius row are in the root `DEPENDENCIES.md`. To
  copy it again, from this folder: rewrite the header's hash and date, then
  append `../../dithertick/synth.js` unchanged. The check below fails if the
  body and the stamp disagree.
- `data/creatures.js`: ten kinds. Crab, shrimp, octopus, jellyfish, turtle,
  milkfish, squid, and monkey use the words Sulat already has for them
  (`../sulat/landAnimals.js`). A sprout and bubbles are marks, since Sulat has
  no plant words and none were invented here. Each kind lists the habitats it
  comes out of, a dithertick family, how often it sounds (2 to 12 s), and how
  long it stays (15 to 120 s).
- `src/creatures.js`: at most three are out. Each second there is a 2% chance
  of another while there is room. A sitter sounds in place; a walker moves to
  a touching key of a habitat that suits it on 70% of its turns and sounds as
  it goes. A creature leaves when its time is up or when the terrain under it
  changes to something that does not suit it. Playing the key one is on makes
  it sound, moves a walker away, and brings its leaving forward to within 4 to
  12 s.
- `src/voice.js`, `src/main.js`, `style.css`: the sounds are rendered the
  first time a kind is heard, three variants each, and played through the same
  output as the keys at 30% of a key's level, panned by column and a little
  higher toward the landward row. A creature is drawn as a pale word with a
  dark edge above its shoal, slides when it moves, flashes when it sounds, and
  fades in and out. They are silent until a key has been played, because a
  timer cannot start audio in a browser.
- Audition panel: a Creatures checkbox and a "Call a creature" button.
  `?creatures=3` calls up to three as the page opens, for screenshots.

Measured by `node scripts/check_creatures.mjs`, 100 boards left alone for 60
simulated minutes: 1.13 creatures out on average, three at most, and none 30%
of the time; 1.08 appear per minute and there are 10.1 sounds per minute; a
creature stays 63 s on average. Crabs are about a quarter of all appearances
(2,027 of 7,495), because they suit the most habitats; squid are the rarest
(134). The 30 renders took 302 ms in Node, and the longest is 0.49 s of sound.

Verified in the Browser pane by DOM, board 5, after two real key presses to
start audio: calling twice drew a monkey and a milkfish; pressing the
milkfish's key moved its drawing to another shoal and set its sounding state,
and that key press took 38 ms including the first render of its three sounds;
nine seconds later it had gone and its element was removed; no console
errors. Looked at one headless Edge screenshot with a shrimp, a monkey, and an
octopus out; the words were small and heavy-edged, so they were enlarged and
the edge thinned, and that second state has not been looked at.

Not verified: any creature sound, by ear, or its level against the keys. The
38 ms first-render pause happens inside a key press and may be audible as a
late note. Movement and fade were checked by DOM state, not watched. The
Thai, Devanagari, and Baybayin words rely on system fonts, as the terrain
glyphs do.

Dropped: invented plant words in other scripts. Getting a word wrong in a
script the agent cannot proofread is worse than using a mark; Xyh can supply
words and they go in `data/creatures.js`.

2026-10-09 — Claude Code — First pass on the look of the shoals, after Xyh
played steps 1 to 4 and found the sound and behaviour acceptable. Xyh asked
for something drawn from Ombak Lock's gradients, less saturation, and room for
textures to be found later.

What changed:
- Shading. Ombak Lock draws its knobs and tumblers with two layered radial
  gradients: a highlight up and to the left over a body that darkens down and
  to the right. Each shoal now has the same two layers over its flat habitat
  colour, as SVG gradients shared by every key (`defs` in `src/main.js`), so
  a shoal reads as a low boss. The outline stroke is gone.
- Water. The board background is the water colour under two radial gradients
  in the same manner, and a deeper pair while the tide is in.
- Colour strength. One CSS `saturate` filter over the shoals and their glyphs,
  set to 65%, with a Colour slider in the Audition panel from 20% to 100%. The
  habitat colours in `data/habitats.js` are unchanged.
- Grain. A generated noise layer (`feTurbulence`) over the board in soft
  light, as a stand-in for texture.
- Texture slot. `data/look.js` has a `TEXTURES` table from habitat id to an
  image and a tile size. A listed habitat has its image tiled over its colour
  and multiplied into it, under the shading. The table is empty.

Verified: headless Edge screenshots of board 11 at 900 px wide and board 5 at
520 px wide, upright, both looked at. The shoals read as rounded and grainy,
glyphs stay legible, and the colours are muted. The first upright screenshot
showed the grain as a band narrower than the board, because an upright board
is letterboxed inside its element; the grain rectangle was enlarged and the
second screenshot shows it edge to edge. In the Browser pane by DOM: the
element under the centre of a shoal is still the key and not a shading layer,
a pointer press there sounded it and its neighbours, the Colour slider changed
the computed filter to `saturate(0.4)`, and there were no console errors.

Not verified: the texture path. No image has been through it, so the tiling
size, the multiply blend, and how a texture sits under the shading are
untested. Drawing cost was not measured; the board now has 120 shading paths,
a filter over the group, and a noise filter, and a slow phone may show it.

A consequence to judge by eye: each shoal is shaded by itself, so a patch of
one habitat now reads as several mounds side by side and less as one merged
shape.

Any texture file that is added needs its source and licence in
`../ASSETS.md` before it is committed.

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
