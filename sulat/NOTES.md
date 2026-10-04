# Sulat

Sulat is a typing artwork derived from Insulae Incognita. Typed letters create terrain; completed lines advance in whole rows, translate across scripts, change biomes through contact, and release continuously flying birds. Play and Pause control both clocks.

Open `index.html` through the workspace server at `/insulaeincognita/sulat/`.

## Next in development

Tune biome contact rates and bird density against longer typed landscapes.

## Files and shared code

- `index.html`: Sulat's page, styles, controls, and animation driver.
- `typerEngine.js`: typing, stepped movement, translation integration, and bird flight.
- `typingEcology.js`: biome contact rules and forest birth opportunities.
- `typingEcology.test.mjs`: contact and translation regression checks. From `F:/xyh`, run `node --test insulaeincognita/sulat/typingEcology.test.mjs`.

Sulat stays in the Insulae Incognita repository. It loads `../backgroundManager.js`, `../LetterMap.js`, `../glyphData.js`, `../lexicon.js`, and `../translationModule.js`, and uses the existing font in `../fonts/`. These are canonical same-repository files rather than independent copies. Asset provenance and the font license are recorded in [the parent asset record](../ASSETS.md). The combined prototype also uses `../LetterMap.js`.

## 2026-10-05 — Codex — Separate project folder

Named the typing artwork Sulat and moved its page, engine, ecology code, and tests into `sulat/`. Adjusted parent imports and the font URL, and changed the browser title to Sulat. The previous `../index_typing.html` redirects to this folder. The earlier playback and mutation history remains in [the parent notes](../NOTES.md); Sulat's development continues here.

Verified the moved page in the Codex browser by typing terrain, completing a line, and toggling Play/Pause. Checked that the old typing URL reaches Sulat, the shared scripts and font load, and the browser reports no JavaScript errors. The seven moved regression tests and `git diff --check` passed. The parent generator and combined page retain their original imports. Mobile software keyboard input, pasted text, the placeholder romanizations in the shared lexicon, and bird feedback into terrain remain unfinished as recorded in the parent history.
