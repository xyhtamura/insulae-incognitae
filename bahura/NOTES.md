# Bahura — notes

A browser gong keyboard whose forty keys are a patch of estuarine terrain: the
glyph on a key is its note, and the notes change as the terrain does. Sulat's
terrain and contact rules with Ombak Lock's beating, at shoal scale. The design
is in [SPEC.md](SPEC.md). Nothing is built.

## Next step

Build step 1 of [SPEC.md](SPEC.md) section 10: a playable board with no
mutation, so that Xyh can audition the tuning and the voice.

## Log

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
