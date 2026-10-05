# Sulat

Sulat is a typing artwork derived from Insulae Incognitae. Typed keys create 36 kinds of terrain; completed lines advance in whole rows, translate across scripts, and change biomes through contact. Water circulates along its row, glacier tips calve icebergs, tides and floods cover and uncover ground, storms cross the field, and rare earthquakes change terrain. Birds fly freely while deer, foxes, goats, crabs, hares, and camels follow connected land, and fish swim through connected water. Play and Pause control movement and mutations. A title screen opens the work, with Translation and Ecology enabled by default.

Open `index.html` through the workspace server at `/insulae-incognitae/sulat/`.

## Next in development

Tune biome contact rates and animal density against longer typed landscapes.

## Files and shared code

- `index.html`: Sulat's page, styles, controls, and animation driver.
- `typerEngine.js`: typing, stepped movement, translation integration, and animal rendering.
- `biomes.js`: Sulat's palette and keys, extending the parent's biome definitions.
- `landAnimals.js`: species habitats, separate land and water routes, and continuous walking and swimming.
- `typingEcology.js`: biome contact rules and forest birth opportunities.
- `events.js`: water currents, glacier calving and icebergs, tides, floods, storms, and earthquakes.
- `typingEcology.test.mjs`: palette, contact, translation, land-route, and event regression checks. From `F:/xyh`, run `node --test insulae-incognitae/sulat/typingEcology.test.mjs`.

Sulat stays in the Insulae Incognitae repository. It loads `../backgroundManager.js`, `../LetterMap.js`, `../glyphData.js`, `../lexicon.js`, and `../translationModule.js`, and uses the existing font in `../fonts/`. These are canonical same-repository files rather than independent copies. Asset provenance and the font license are recorded in [the parent asset record](../ASSETS.md). The combined prototype also uses `../LetterMap.js`.

## 2026-10-05 — Codex — Separate project folder

Named the typing artwork Sulat and moved its page, engine, ecology code, and tests into `sulat/`. Adjusted parent imports and the font URL, and changed the browser title to Sulat. The previous `../index_typing.html` redirects to this folder. The earlier playback and mutation history remains in [the parent notes](../NOTES.md); Sulat's development continues here.

Verified the moved page in the Codex browser by typing terrain, completing a line, and toggling Play/Pause. Checked that the old typing URL reaches Sulat, the shared scripts and font load, and the browser reports no JavaScript errors. The seven moved regression tests and `git diff --check` passed. The parent generator and combined page retain their original imports. Mobile software keyboard input, pasted text, the placeholder romanizations in the shared lexicon, and bird feedback into terrain remain unfinished as recorded in the parent history.

## 2026-10-05 — Codex — Biomes, animals, and title screen

Expanded the reachable palette from 15 to 26 biomes without changing the original letter keys or parent files. Number keys add desert, rock, forest, grass, flower, lava, mangrove, marsh, river, and lake; the hyphen adds coast. The key guide includes buttons for every biome. Earlier files provided grass, flower, and lava styles; desert, rock, and forest already had definitions but no typing keys. Contact rules let rivers and lakes form marsh, estuary and coast form mangrove, flowers spread into grass, rivers green desert, and water cool lava into rock.

Added deer, foxes, goats, and crabs as Unicode marks, with species-specific habitats. Routes follow measured glyph bounds within a row and overlapping land in adjacent rows. Water, spaces, lava, and empty rows break routes. Animals cross rows through their shared width; terrain steps carry their paths with them. Habitat loss, deleted cells, or translation replacing a route endpoint removes the affected animal rather than relocating it. Each species is capped at two animals, and each animal lasts at most 36 seconds. These are authored behavior rules, not an ecological simulation. Disabling Ecology stops births and biome changes while existing animals finish moving; Pause stops both.

Added a title screen with a keyboard-accessible Start button. Translation and Ecology remain enabled on initial load, and playback starts paused. Returning to the title pauses the work, retains terrain and settings, and offers Continue typing. The typing field reserves space for the actual control height, including the expanded key guide.

Verified all 26 biome classes through keyboard input in the Codex browser and tested a biome button. Observed all four land species, translation marks, and biome mutations with both defaults enabled. Two DOM samples 350 milliseconds apart showed moving animals with unchanged integer row positions; the typing-field DOM stayed identical during a 2.2-second pause. Checked keyboard start, title return, retained terrain, palette count, control clearance, and the browser error log. All 14 Node regression cases and `git diff --check` passed. Mobile software keyboard input and paste remain unfinished; biome buttons offer direct insertion but do not provide a complete mobile text input method. Animals do not yet change terrain or interact with each other. The shared lexicon's placeholder romanizations remain unchanged.

## 2026-10-05 — Codex — Parent project rename

Sulat's local URL is `/insulae-incognitae/sulat/` after the parent folder and repository rename. Updated its origin label, notes, and test command. Shared imports remain relative to the parent. Opened the renamed route in the Codex browser, started typing, submitted terrain, and toggled Play/Pause without browser errors; all 14 regression cases passed from the renamed folder. Sulat retains its name and development plan. The prior local `/insulaeincognita/sulat/` route no longer resolves, and no remote content push was performed.

## 2026-10-05 — Codex — Retain the earlier prototype

`../index_typing.html` no longer redirects to Sulat. It restores the pre-Sulat page and uses [preserved scripts](../prototype-typing/README.md) from `f2723fa`. Verified the prototype's original URL, snapshot imports, typing, and playback in the browser; its seven regression cases passed. Sulat's implementation and development plan are unchanged.

## 2026-10-05 — Codex — Cold, dry, and underwater regions

Expanded Sulat from 26 to 36 biomes, adding snow, glacier, alpine, oasis, badlands, cave, deep ocean, kelp, dunes, and volcanic ground. The reference prototype includes snowflake glyphs under ice and defines desert; the combined page includes earlier lava styles. Sulat retains those earlier types and gives the added regions distinct glyphs, colors, keys, and buttons. The palette groups every biome once into water and shores, forests and grasslands, snow and mountains, or deserts and volcanic ground. Existing letter and number keys retain their mappings. Added keys are `=` for snow, `[` for glacier, `]` for alpine, `;` for oasis, `'` for badlands, `,` for cave, `.` for deep ocean, `/` for kelp, `\` for dunes, and the backtick for volcanic ground.

Added authored regional rules: mountains touching cold terrain become alpine; snow beside mountains becomes glacier; forest or fresh water can turn snow into tundra. Fresh water turns desert and dunes into oasis, and badlands into grass. Snow cools lava into rock, lava changes nearby mountain into volcanic ground, and water cools volcanic ground into rock. Cold water turns reef into kelp; deep ocean spreads into adjacent water unless a forest edge takes priority and forms estuary. Contacts retain the existing two-step delay, probability, and cooldown. Caves are typed terrain; cave formation and cave animals are not implemented.

Added hares, camels, and fish, and extended goat habitats to alpine and badlands. Fish use a separate water network; land animals cannot cross it, and fish cannot cross dry tiles. Spaces, lava, and missing rows still break routes. The existing path geometry, endpoint revalidation, pause clock, two animals per species, and 36-second lifespan apply to both networks. Free-flying birds retain their separate clock and cap. The scrollable palette keeps Play/Pause visible while reserving space for the actual control height. The preserved typing reference was not edited.

Verified all ten added keys and their terrain classes in the browser, the 36-button palette and its four groups, cold and desert regions, and live hare, camel, and fish marks. Fish carry the swimming state and use fractional positions over the water row. Checked control clearance and the browser error log. All 18 regression cases passed, including regional mutations, palette reachability, original key mappings, fish barriers, freezing habitat loss, and cold/dry/wet animal births. The existing next step remains tuning contact rates and animal density on longer landscapes. Mobile keyboard input, paste, animal effects on terrain, and the shared lexicon's placeholder romanizations remain unfinished. No remote push was performed.

## 2026-10-05 — Claude Code — Currents, calving, and earthquakes

Added `events.js` with three authored behaviors, run once per step after biome contact and gated by the Ecology toggle. They are rules for the artwork, not physical models.

- **Currents.** Each row draws a direction once. Every second step, each run of connected water in the row moves one cell that way and re-enters at the run's other end. Glyph and biome move together; cell ids stay in place, so fish routes are unaffected. Lakes do not move and divide a row's water into separate runs. A run of identical cells is skipped. Water glyphs also carry a CSS ripple whose phase comes from the engine's play clock, so rebuilding a row does not restart it, and Pause holds it.
- **Calving.** A glacier cell with water, a gap, or the row end beside it is a tip. After three steps as a tip, each step has a 25% chance that it becomes cold water and launches an iceberg toward the open side. Icebergs live in the flight layer, drift 1.2% of the field width per second, turn water, river, and estuary under them into cold water and reef into kelp, and are removed at land, at the field edge, after 24 seconds, or when their row leaves the field. At most six exist.
- **Earthquakes.** With at least 12 terrain cells and 15 steps since the previous one, each step has a 3% chance. A random cell is the epicenter. Within 18% of the field width and two rows, each affected cell has a 50% chance to change: mountain and alpine to rock, rock and badlands to cave, cave to rock, volcanic ground to lava, glacier to cold water with an iceberg. A gap is inserted in the epicenter row at the epicenter, which shifts that row and breaks animal routes there. The affected rows shake for 0.9 seconds. This is the first way caves form without being typed.

Event changes carry a thick underline (`data-mutation="event"`), and a status line in the controls reports each calving and earthquake. `engine.stats` gained `calvings` and `quakes`. The rates are constructor fields on `TypingEvents`.

Verified in the browser pane at 1100 by 900 through `engine.advance`, with `calveChance` and `quakeChance` forced to 1: a typed glacier tip became cold water (later estuary by contact) with one iceberg element at 18.4% on its row, the water run rotated between steps while the lake stayed, the earthquake changed three cells, inserted the gap, marked three rows, and wrote the status line; Pause set the water animation to `paused`; no console errors. All 24 Node cases pass, six of them new.

Not observed: the ripple and shake animations themselves. The pane reports `prefers-reduced-motion: reduce`, so what was confirmed is that both are disabled under that setting. Their look, and the event rates at default values over a long session, need a look on a normal display.

Considered and left out: fish carried by the current, floods, and tides. Quake and calving rates are first guesses and belong to the existing tuning step. Mobile keyboard input, paste, and the lexicon's placeholder romanizations remain unfinished.

## 2026-10-05 — Claude Code — Tides, floods, and storms

Extended `events.js` with three more authored behaviors. None has a control: they start on their own, and the Ecology toggle only holds them in place. Step order is currents, calving, iceberg cooling, tide, storm, flood, earthquake; the earthquake stays last because its gap shifts a row's columns.

- **Covered ground.** Tides and floods share one mechanism. A covered cell becomes water and keeps its previous glyph and class in `cell.submerged`, tagged `tide` or `flood`. Uncovering restores it only if the cell is still water; if contact has changed it in the meantime (to estuary, for example), the marker is dropped and the change stays. In the browser run most tidal cells were kept by contact rather than returned, so tides currently erode shores more than they cycle them.
- **Tides.** Period 16 steps. At step 8, sand and coast touching sea water, in the row or by overlap one row away, become water. At step 16 they return.
- **Floods.** Need a river or lake. Start at 2% per step after a 20-step rest, or from rain or a typhoon passing over fresh water. For 3 steps the water spreads one cell per step from rivers, lakes, and flooded cells over grass, plain, flower, steppe, savanna, sand, coast, marsh, desert, dunes, badlands, and oasis; other terrain stops it. At step 8 it recedes and leaves silt: desert, dunes, badlands, and steppe become grass; grass, plain, savanna, and sand become marsh; the rest return unchanged.
- **Storms.** One at a time, 6% per step after an 8-step rest, with at least 12 terrain cells. A storm enters from a random side on a random row, covers 24% of the field width and three rows, and crosses at 4% of the width per second. Each step, each covered cell with a rule for that storm has a 25% chance to change. Types and their conditions are in `SULAT_STORMS`: rain and thunderstorm always qualify; blizzard needs three cold cells, sandstorm three dry ones, typhoon six sea cells. A thunderstorm instead strikes exactly one covered cell per step and flashes. The storm ends past the far edge or when its row leaves the field.

Status-line messages and `stats.storms` / `stats.floods` were added. Iceberg and storm drift now also stop when Ecology is off.

Verified in the browser pane at 1100 by 900 through `engine.advance`, with chances set to 0 and each event forced in turn: high tide covered one sand cell beside sea in each of two rows and low tide returned one as sand; a placed rain storm rendered as a 169 by 54 px element at the expected position, started a flood, the flood reached nine cells in one row by its third step and receded from 10 cells leaving grass and marsh; a placed thunderstorm changed one forest cell and set the flash class; with `stormChance` at 1 a typhoon formed on its own at x = −0.12 and wrote its status line. No console errors. All 31 Node cases pass, seven of them new.

Not observed: a full unforced session at default rates, and a storm crossing the whole field in real time. The pane still reports reduced motion, so the ripple and shake animations remain unseen.

Known rough edges, for the tuning step: currents rotate glyph and class along a run but `submerged` markers stay with their cell, so covered ground can come back one cell away from where its water has moved; a flood's cells count as river for contact rules, so banks turn to marsh quickly; storm glyphs 雲 雨 雷 吹 塵 嵐 depend on Noto Sans JP coverage and were checked only for rain. Fish carried by current, storms moving icebergs or birds, and wind direction shared between storms and currents were considered and left out.
