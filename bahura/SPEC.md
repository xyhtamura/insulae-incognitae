# Bahura — spec

Written 2026-10-09 by Claude Code from Xyh's brief. Nothing is built. Section 1
records the brief and section 2 the sources; everything after is a proposal,
and section 11 lists the decisions that are Xyh's. Every number below is a
starting value to be auditioned or measured.

## 1. Brief

Xyh's statements, 2026-10-08 and 2026-10-09, condensed:

- Sulat plus Ombak Lock: a simple playable gong-like keyboard that is not in
  12-tone equal temperament.
- The keyboard layout is the terrain. It responds to clicking or typing.
- Each key has a glyph that represents its sound. As the terrain mutates, the
  sounds and pitches change with it.
- Mutation is driven both by playing and by time, at a slow rate, and the
  player can reshuffle the board.
- The terrain is mostly estuarine, with occasional unusual terrain.
- Insulae Incognitae and Sulat are world-sized. This one is shoal-sized.
- The name is Bahura.

## 2. Sources

**Sulat** ([`../sulat/`](../sulat/NOTES.md)) supplies the terrain:

- 36 biomes in [`biomes.js`](../sulat/biomes.js), each with a glyph set chosen
  by shape from several scripts.
- Contact rules in [`typingEcology.js`](../sulat/typingEcology.js): a cell reads
  its neighbours and may change biome. The rules read one snapshot before
  writing, require the same target on two successive steps, apply with
  probability 0.4, and then hold the cell for four steps.
- Events in [`events.js`](../sulat/events.js): tides, floods, storms, and rare
  earthquakes.

**Ombak Lock** ([`../../ombak-lock/`](../../ombak-lock/ombak-lock.md)) supplies
the listening:

- Tones a few hertz apart beat against each other, and the beating is the
  thing listened to.
- Its base pitches, 236.5, 352.0, and 471.3 Hz, are not equal-tempered.
- Tones sit inside a 12 Hz window. Two tones closer than 0.30 Hz count as a
  unison, and its targets keep every pair at least 1.1 Hz apart.

Sulat's typed lines, playback, translation, animals, and towns do not carry
over. Ombak Lock's puzzle, dials, modes, and fail state do not carry over.

## 3. What it is

Bahura is a browser instrument. The screen shows a computer keyboard's four
rows of keys, each key drawn as one terrain glyph. Pressing a key on a physical
keyboard, or clicking or tapping it on screen, strikes it and it rings like a
small gong. The glyph says which note the key plays. Over minutes the terrain
changes by contact between neighbouring keys, and the notes change with it.

It has no score, target, or end. A **Reshuffle** control draws a different
board.

## 4. Keyboard

Forty keys in four rows of ten, staggered as on a physical keyboard:

```text
1 2 3 4 5 6 7 8 9 0
 q w e r t y u i o p
  a s d f g h j k l ;
   z x c v b n m , . /
```

The stagger gives each key up to six neighbours: left, right, two above, and
two below. Contact and sympathetic ringing (section 6) both use this
neighbourhood.

Each key shows its terrain glyph large and its keyboard character small, so a
typist can find it.

The rows are read as a shore in section: the top row is the landward edge and
the bottom row the seaward edge. Section 5 uses this for where each habitat
tends to start, and section 6 uses it for register.

## 5. Terrain

### Habitats

Sulat's world biomes are renamed at shoal scale. Each keeps its Sulat glyph
set, so the three works share one glyph vocabulary.

| Habitat here | Sulat biome | Tends to start |
| --- | --- | --- |
| Mangrove | `mangrove` | Landward |
| Marsh | `marsh` | Landward |
| Mudflat | `swamp` | Landward |
| Creek mouth | `river` | Landward to middle |
| Brackish channel | `estuary` | Middle |
| Sandbar | `sand` | Middle |
| Tide line | `coast` | Middle |
| Tide pool | `lake` | Middle |
| Shallows | `water` | Seaward |
| Seagrass | `kelp` | Seaward |
| Coral head | `reef` | Seaward |
| Drop-off | `deepwater` | Seaward |

Kelp grows in cold water, so `kelp` is renamed seagrass here. The names are
placeholders in English; section 11 asks about them.

**Unusual terrain** is anything else in Sulat's set: `lava`, `ice`, `glacier`,
`snow`, `desert`, `dunes`, `cave`, `volcanic`, `flower`, and `rock`, which is
what lava becomes beside water. A new board has about
two unusual keys in forty, and an earthquake (section 7) can add one.

### Generating a board

A board is a function of a seed. Seeded value noise over key positions picks
each key's habitat, weighted by row toward the habitats the table lists for
it, so habitats form
patches of two to six keys. Single scattered keys would leave nothing to
spread and no neighbours to ring with.

`?seed=<whole number>` selects a board. **Reshuffle** picks another seed and
writes it to the address bar, so a board a player likes can be returned to.

## 6. Sound

### Pitch

The glyph is the note. A key's frequency has three parts:

```text
frequency = row register × habitat ratio + column offset
```

- **Habitat ratio.** Each habitat has one pitch within the octave. All keys
  showing the same habitat in one row play the same note, apart from the
  offset.
- **Row register.** Each row is one register, low at the seaward bottom row and
  high at the landward top row. Placeholder: octaves on Ombak Lock's 236.5 Hz,
  giving 118.25, 236.5, 473, and 946 Hz.
- **Column offset.** Each column adds a fixed number of hertz between 0 and 12,
  Ombak Lock's window. The ten offsets are at least 1.1 Hz apart, so two keys
  of one habitat in one row always beat and never fall into a unison.

The offset is in hertz and not in cents, so a pair beats at the same rate in
every register. Balinese paired tuning is commonly described as keeping a
similar beat rate across an instrument's range; that description is from
memory and no source has been retrieved for it.

Placeholder habitat ratios: the twelve habitats on twelve of the thirteen
steps of 13 equal divisions of the octave, about 92 cents apart, which avoids
the 100-cent grid. Unusual terrain sits between those steps. The table lives in
`data/tuning.js` and is Xyh's to set by ear. `tabota/scala/` holds equal,
just, historical, and xenharmonic scales and no gamelan tuning, so a measured
pelog or slendro would have to be retrieved if one is wanted.

### Voice

A strike is a short burst of four to six sine partials at non-integer ratios,
with higher partials decaying faster. The habitat sets the decay time and the
balance of partials: mud is short and dull, water is long, coral is bright.
The partial ratios are an authored timbre, in `data/voice.js`. If the page ever
describes the voice as a model of a real gong, the ratios need a source first.

### Sympathetic ringing

When a key is struck, its neighbours of the same habitat ring with it at a
lower level. A key inside a patch therefore shimmers at the beat rates of that
patch, and an isolated key rings plain. The size and shape of a patch can be
heard in one strike, and a patch that is spreading sounds more complicated
than it did a minute before.

Playing two same-habitat keys together gives the same beating at full level.

## 7. Mutation

The contact rules are the subset of Sulat's `target()` whose biomes occur here,
for example: creek mouth beside shallows or tide line becomes brackish channel;
sandbar beside shallows or coral becomes tide line; open ground beside water
becomes mudflat; lava beside anything wet becomes rock. The subset is rewritten
for a fixed grid, because Sulat's version measures rendered line bounds.

Two drivers call the same rule:

- **Playing.** Each strike gives the struck key and its neighbours one contact
  opportunity.
- **Time.** A slow tick gives every key one contact opportunity.

Sulat's safeguards carry over: read a snapshot before writing, require the
same target twice, and hold a changed key for a cooldown.

Starting rates, all in `data/rates.js`:

| Thing | Target |
| --- | --- |
| Keys changed by playing | About one per minute of steady playing |
| Keys changed by time alone | About one every two minutes |
| Tide | Every five to ten minutes: the seaward row floods upward one row, then ebbs |
| Earthquake | Rare: changes a few keys around one key and may leave unusual terrain |

The check in section 9 measures these rates in simulation, so "slow" is a
number in the notes and not an impression.

A key that has changed keeps a visible mark until it is next struck, so the
player can see which notes moved. Colour alone does not carry the mark.

Contact tends toward a few stable habitats, so a board left long enough may
settle and stop changing. Tides and earthquakes disturb it, and Reshuffle
replaces it. Whether boards settle, and after how long, is a thing for the
check to measure.

## 8. Controls and page

| Input | Action |
| --- | --- |
| A character key | Strike that key |
| Click or tap a key | Strike that key |
| **Reshuffle** | Draw another board |
| **Volume** | Set the output level |

- Held keys do not repeat. Several keys can sound at once, by keyboard and by
  multi-touch.
- Audio starts on the first strike, which is the user gesture the browser
  requires. There is no separate start screen.
- The page carries no prose beyond its labels.
- It is a build-free static page with no network requests. Any `localStorage`
  key is prefixed `bahura_`.

## 9. Files and checks

Bahura sits beside Sulat in the Insulae Incognitae repository and is served at
`/insulae-incognitae/bahura/`, as Sulat is at `/insulae-incognitae/sulat/`. It
uses the fonts in `../fonts/` directly, and copies the glyph sets it needs from
`../sulat/biomes.js` into its own data file with the source named in a
comment.

```text
bahura/
  index.html
  style.css
  src/
    hash.js        # seeded hash and value noise
    board.js       # seed to forty habitats: no DOM
    contact.js     # contact rules and safeguards: no DOM
    events.js      # tide and earthquake: no DOM
    voice.js       # Web Audio strike and sympathetic ringing
    input.js
    render.js
  data/
    habitats.js    # names, glyph sets, row weights
    tuning.js      # ratios, registers, column offsets
    voice.js       # partials and decay per habitat
    rates.js
  scripts/
    check_board.mjs
  SPEC.md
  NOTES.md
```

`scripts/check_board.mjs`, in Node:

- **Determinism.** One seed gives one board.
- **Closed rules.** Every contact target is a defined habitat with a ratio, a
  voice, and a glyph set.
- **Offsets.** Every pair of column offsets is at least 1.1 Hz apart and all
  are within 12 Hz.
- **Range.** Every frequency a key can take lies between 80 Hz and 2 kHz.
- **Rates.** Simulates an hour of ticks, and separately an hour of random
  strikes, on 100 seeds, and prints keys changed per minute, the share of
  boards that settle, and the habitat mix at the end.

In the browser, by ear: that two same-habitat keys beat, that a patch rings
differently from a lone key, and that a changed key sounds its new note.

## 10. Build order

1. **Playable board.** Board generation, glyph keys, the voice, keyboard and
   pointer input, Reshuffle, and the determinism, offset, and range checks.
   Xyh auditions the tuning and the voice at this point, before anything
   mutates.
2. **Sympathetic ringing.**
3. **Contact by playing**, with the changed-key mark and the closed-rules
   check.
4. **Contact by time**, tide, and earthquake, with the rates check. Tune
   `data/rates.js` to the targets in section 7.
5. **Unusual terrain** and touch layout on a phone-width screen.

Step 1 is worth playing on its own. The first version is complete at step 4: a
board that can be played, heard to change, and replaced.

## 11. Decisions for Xyh

Each has a default so that building is not blocked.

1. **Tuning and voice.** The 13-division placeholder, the registers, and the
   partial ratios are for the ear. Default: placeholders until auditioned.
2. **Does a lone key beat?** Default: no; beating comes from neighbours and
   from playing two keys. The alternative gives every key its own detuned
   pair, as a gamelan instrument has, with the rate set by habitat.
3. **A hold control.** A toggle that stops mutation would let a player keep a
   board still. Default: none, since Reshuffle and a slow rate were asked for.
4. **Habitat names.** English placeholders, or Tagalog names such as bakawan
   for mangrove. The page shows no names unless a legend is added.
5. **A legend.** Default: none; the glyph is learned by ear.
6. **Folder.** Default: here, beside Sulat, for the shared fonts and the
   repository history. A root folder would need its own copy of the font and
   its licence.
7. **Place in the multicart.** It suits a touch screen and needs no text.

## 12. Deferred

- Animals. A crab crossing the keys and striking the ones it walks over would
  make the time driver audible.
- Sulat's storms, floods, and water circulation.
- Recording or exporting what was played.
- Loading a Scala file for the habitat ratios.
