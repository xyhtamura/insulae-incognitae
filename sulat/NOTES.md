# Sulat

Sulat is a typing artwork derived from Insulae Incognita. Typed keys create 26 kinds of terrain; completed lines advance in whole rows, translate across scripts, and change biomes through contact. Birds fly freely while deer, foxes, goats, and crabs follow connected land. Play and Pause control movement and mutations. A title screen opens the work, with Translation and Ecology enabled by default.

Open `index.html` through the workspace server at `/insulaeincognita/sulat/`.

## Next in development

Tune biome contact rates and animal density against longer typed landscapes.

## Files and shared code

- `index.html`: Sulat's page, styles, controls, and animation driver.
- `typerEngine.js`: typing, stepped movement, translation integration, and animal rendering.
- `biomes.js`: Sulat's palette and keys, extending the parent's biome definitions.
- `landAnimals.js`: species habitats, connected land routes, and continuous walking.
- `typingEcology.js`: biome contact rules and forest birth opportunities.
- `typingEcology.test.mjs`: palette, contact, translation, and land-route regression checks. From `F:/xyh`, run `node --test insulaeincognita/sulat/typingEcology.test.mjs`.

Sulat stays in the Insulae Incognita repository. It loads `../backgroundManager.js`, `../LetterMap.js`, `../glyphData.js`, `../lexicon.js`, and `../translationModule.js`, and uses the existing font in `../fonts/`. These are canonical same-repository files rather than independent copies. Asset provenance and the font license are recorded in [the parent asset record](../ASSETS.md). The combined prototype also uses `../LetterMap.js`.

## 2026-10-05 — Codex — Separate project folder

Named the typing artwork Sulat and moved its page, engine, ecology code, and tests into `sulat/`. Adjusted parent imports and the font URL, and changed the browser title to Sulat. The previous `../index_typing.html` redirects to this folder. The earlier playback and mutation history remains in [the parent notes](../NOTES.md); Sulat's development continues here.

Verified the moved page in the Codex browser by typing terrain, completing a line, and toggling Play/Pause. Checked that the old typing URL reaches Sulat, the shared scripts and font load, and the browser reports no JavaScript errors. The seven moved regression tests and `git diff --check` passed. The parent generator and combined page retain their original imports. Mobile software keyboard input, pasted text, the placeholder romanizations in the shared lexicon, and bird feedback into terrain remain unfinished as recorded in the parent history.

## 2026-10-05 — Codex — Biomes, animals, and title screen

Expanded the reachable palette from 15 to 26 biomes without changing the original letter keys or parent files. Number keys add desert, rock, forest, grass, flower, lava, mangrove, marsh, river, and lake; the hyphen adds coast. The key guide includes buttons for every biome. Earlier files provided grass, flower, and lava styles; desert, rock, and forest already had definitions but no typing keys. Contact rules let rivers and lakes form marsh, estuary and coast form mangrove, flowers spread into grass, rivers green desert, and water cool lava into rock.

Added deer, foxes, goats, and crabs as Unicode marks, with species-specific habitats. Routes follow measured glyph bounds within a row and overlapping land in adjacent rows. Water, spaces, lava, and empty rows break routes. Animals cross rows through their shared width; terrain steps carry their paths with them. Habitat loss, deleted cells, or translation replacing a route endpoint removes the affected animal rather than relocating it. Each species is capped at two animals, and each animal lasts at most 36 seconds. These are authored behavior rules, not an ecological simulation. Disabling Ecology stops births and biome changes while existing animals finish moving; Pause stops both.

Added a title screen with a keyboard-accessible Start button. Translation and Ecology remain enabled on initial load, and playback starts paused. Returning to the title pauses the work, retains terrain and settings, and offers Continue typing. The typing field reserves space for the actual control height, including the expanded key guide.

Verified all 26 biome classes through keyboard input in the Codex browser and tested a biome button. Observed all four land species, translation marks, and biome mutations with both defaults enabled. Two DOM samples 350 milliseconds apart showed moving animals with unchanged integer row positions; the typing-field DOM stayed identical during a 2.2-second pause. Checked keyboard start, title return, retained terrain, palette count, control clearance, and the browser error log. All 14 Node regression cases and `git diff --check` passed. Mobile software keyboard input and paste remain unfinished; biome buttons offer direct insertion but do not provide a complete mobile text input method. Animals do not yet change terrain or interact with each other. The shared lexicon's placeholder romanizations remain unchanged.
