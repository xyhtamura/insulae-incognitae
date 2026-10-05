# Sulat

Sulat is a typing artwork derived from Insulae Incognitae. Typed keys create 36 kinds of terrain, each drawn in glyphs chosen for their shape from Baybayin, Kana, Jawi, Devanagari, Hanzi, and punctuation; completed lines advance in whole rows, translate across scripts, and change biomes through contact. Water circulates along its row, glacier tips calve icebergs, tides and floods cover and uncover ground, storms cross the field, and rare earthquakes change terrain. Birds fly freely while deer, foxes, goats, crabs, hares, and camels follow connected land, and fish swim through connected water. Play and Pause control movement and mutations. A title screen opens the work. Translation and ecology always run; there is no switch for either. An on-screen keyboard shows each key as its terrain and is the input method on touch devices.

Open `index.html` through the workspace server at `/insulae-incognitae/sulat/`.

## Next in development

Tune biome contact rates and animal density against longer typed landscapes.

## Files and shared code

- `index.html`: Sulat's page, styles, controls, and animation driver.
- `typerEngine.js`: typing, stepped movement, translation integration, and animal rendering.
- `biomes.js`: Sulat's palette, keys, and its own glyph set for every biome.
- `landAnimals.js`: species habitats, separate land and water routes, continuous walking and swimming, megafauna, trampling, and hunting.
- `fliers.js`: birds, insects, and bats as three-part words with folding wings.
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

## 2026-10-05 — Claude Code — Glyphs by shape, across scripts

Xyh's correction: Sulat had become too reliant on CJK characters and had lost the concept recorded in [the About page](../about/index.html). The biomes added on 2026-10-05, and the storms and animals after them, were Hanzi words for the thing shown (花 for flower, 湖 for lake, 雨 for rain, 鹿 for deer). The parent work does the opposite: characters are chosen for visual affinity to waves, foliage, or mountains, from scripts linked to the precolonial networks around Manila, and no set is a vocabulary list.

- **Biomes.** `biomes.js` now defines all 36 glyph sets itself instead of spreading the parent's `WATERY`, `LAND6`, and `CLASSIC`. Each set has five or more of: punctuation or a geometric mark, Baybayin, Kana, Jawi, Devanagari, Hanzi, with at most two Hanzi and always one Baybayin. The original five terrain sets in `../lineGenerator.js` were the model, limited to the five scripts the About page names; its Thai, Telugu, Burmese, and Javanese glyphs were not carried over. Parent files are unchanged. Key and biome mappings are unchanged; `SULAT_KEYS` entries now point at Sulat's glyph sets.
- **Translation.** Glyphs with a phoneme in `../glyphData.js` were preferred where the shape allowed, so loose syllables meet more often. Marsh holds ba and sa in Baybayin, Kana, and Jawi, which the lexicon can fuse into *basa*, wet. Most new glyphs have no phoneme and stay inert until someone adds them there.
- **Storms.** Drawn in punctuation from the same scripts rather than a repeated word: commas and dandas for rain (`, ، । ヽ ᜵ 、`), hooks for lightning, stars for snow, dots for dust, spirals for a typhoon, under an arc row for cloud. Each storm draws its own arrangement.
- **Icebergs** show the glyph that broke off the glacier.
- **Animals** cannot be chosen by shape, so they are short words, one language per species: ᜂᜐ *usa* deer and ᜁᜊᜓᜈ᜔ *ibon* bird (Tagalog), キツネ fox and カニ crab (Japanese), बकरी goat and ऊँट camel (Hindi), ايکن *ikan* fish (Malay in Jawi), 兔 hare (Hanzi). These are my propositions and need Xyh's check, the Jawi spelling and the choice of languages most of all.
- **Fonts.** The page now also requests Noto Sans Arabic and Noto Sans Devanagari from Google Fonts, linked and not shipped, so nothing changes in `ASSETS.md`.
- **Copy and title.** The title screen terrain and the typing help name the scripts.

A new test fails if any biome set has fewer than five script groups, more than two Hanzi, no Baybayin, or a bare combining mark. It caught sand missing Baybayin on first run. All 32 Node cases pass.

Verified in the browser pane at 1100 by 900: typed all 36 biomes across five rows and read the rows back from the engine and in a screenshot, with every script present in each row and no missing-glyph boxes visible at that size; a rain storm rendered as arcs over commas and dandas; crab, camel, and fish appeared as カニ, ऊँट, ايکن; `document.fonts` reported the Arabic, Devanagari, JP, and local Tagalog faces loaded. No console errors.

Not done: glyph choices were made by me from shape alone, at small size, in one sitting. Several are weak (flower, cave, badlands) and all are Xyh's to replace. Whether individual Jawi letters in isolated form read as intended next to left-to-right text was checked only in one screenshot. Phonemes for the new glyphs are not in `../glyphData.js`; adding them changes the parent's translation behavior, so it was left for a decision.

## 2026-10-05 — Claude Code — Thai, Telugu, Burmese, and Javanese glyphs restored

At Xyh's request, the glyphs from `../lineGenerator.js` that the previous entry left out are back in the biomes they came from: ల น ရေ ꦮ in water, อ ဝ in sand, ꦱ in grass, ꦒ in forest. The two Thai words the lexicon recognizes were also placed, ป่า in rainforest and ไม้ in temperate forest, so the woods translation chain can start from typed terrain. The other 30 biomes have none of these four scripts yet. The page requests Noto Sans Thai, Telugu, Myanmar, and Javanese from Google Fonts, linked and not shipped.

Verified in the browser pane at 1100 by 900: typed 28 cells of each of the six biomes and found all ten restored glyphs in the engine's rows under the right biome, each rendered with a nonzero width and visible in a screenshot; `document.fonts` reported one loaded face each for Thai, Telugu, Myanmar, and Javanese. No console errors. All 32 Node cases pass. The title and help copy now name the four scripts.

## 2026-10-05 — Claude Code — Folding wings, insects, mammals, and megafauna

Xyh's direction: a long animal word can be scaled down; a three-part word can use its first and last parts as wings that fold, readable only in flight; add insects, megafauna, and mammals.

- **Fliers** (`fliers.js`, replacing the engine's bird code). Every flier is a word in three parts. The outer parts are wings: perched, they are narrowed to 15% and turned 75° in over the body, so the word cannot be read; in flight they open over a quarter second and beat. A flier starts perched on a cell, takes off after 0.6 to 1.8 seconds, and moves with its row while it sits. Birds (ᜁ ᜊᜓ ᜈ᜔, *ibon*) still come from forest patches and leave the field. The others rise from their habitat, loiter for 3 to 6 seconds, and fold again on any dry cell under them; over water or a gap they keep flying. Dragonfly ᜆᜓᜆᜓᜊᜒ *tutubi* and mosquito ᜎᜋᜓᜃ᜔ *lamok* (Tagalog), butterfly तितली *titli* (Hindi), firefly ホタル (Japanese), bee لبه *lebah* (Malay in Jawi, with joiners so each separated letter keeps its connected form), bat ᜉᜈᜒᜃᜒ *paniki* (Tagalog), which rises from caves and hangs inverted while perched. Two per species, eight birds, fourteen fliers in all. Fireflies glow in flight.
- **Mammals.** Monkey ลิง (Thai), boar ᜊᜊᜓᜌ᜔ *baboy*, civet ᜋᜓᜐᜅ᜔ *musang* (Tagalog), bear クマ (Japanese).
- **Megafauna.** Drawn at 1.6 times, walking at half speed, one per species, 48 seconds: elephant ช้าง (Thai), carabao ᜃᜎᜊᜏ᜔ *kalabaw* and crocodile ᜊᜓᜏᜌ *buwaya* (Tagalog), tiger పులి *puli* (Telugu), rhinoceros ꦧꦝꦏ꧀ *badhak* (Javanese), whale クジラ (Japanese). Whales and crocodiles use the water network.
- **Animals now change terrain and each other**, which earlier entries listed as unfinished. A megafauna leaving a cell has a 25% chance to change it: elephants and rhinoceroses open forest into grass or savanna, carabaos turn grass and plain into marsh. Targets are always inside the animal's own habitats so its route survives. A hunter removes prey standing on its cell: tigers take deer, boars, and monkeys; foxes take hares; crocodiles take fish.
- **Scale.** A walking animal's word is scaled to `min(1, 2 / letters)` by grapheme count, times 1.6 for megafauna; fliers are drawn at 0.7. Scaling is a CSS transform. A first attempt used `font-size`, which also scaled the `em` offsets and drew animals up to several rows below their cells; the browser check caught it.
- **Density.** Walkers are capped at 12 overall and the spawn loop starts at a random species each step.

Verified in the browser pane at 1100 by 900 through `engine.advance` over 40 simulated seconds on four typed rows: all seven fliers appeared and each was seen both perched and flying; a perched bird measured 19 px wide with wings at `rotate(75deg) scaleX(0.15)`, a flying one 36 px with `rotate(0deg) scaleX(1)`; 13 walking and swimming species appeared including tiger, elephant, rhinoceros, and whale; after the scaling fix every walker's drawn height was within 0.25 em of its row and every flier within 0.35 em of its `y`; hunting removed two animals in one run and trampling changed one cell in another. No console errors. All 38 Node cases pass, six of them new.

Not observed: the fold and beat as motion on a display, the bee's joined Jawi letters at reading size, and bats hanging. The pane reports reduced motion, under which the wingbeat is disabled and only the fold remains.

Needs Xyh's check: every word here is my proposition. Least certain are the Javanese *badhak*, the Telugu *puli*, the Jawi spellings of *ikan* and *lebah*, and the Baybayin spellings with virama. Twelve walkers on four rows looks crowded in the screenshot, so density belongs with the tuning step. Insects have no effect on terrain yet; pollination and mosquitoes following animals were considered and left out.

## 2026-10-05 — Claude Code — Terrain keyboard, sheets, and insects that change ground

Xyh's direction: insects affect terrain too; Translation and Ecology need no switch; show the keyboard as terrain keys, also for mobile, with the name on hover or long press; make the translation list something that pulls up; the old Keys and interactions block was hard to find again once scrolled.

- **Insects and bats change the ground they settle on**, at 50% per landing, skipping cells on cooldown. Butterflies and bees turn grass, plain, and savanna into flower. Bats turn grass, plain, and savanna into forest. Fireflies turn swamp and marsh into mangrove. Mosquitoes turn marsh into swamp and grass into marsh; dragonflies turn swamp into marsh and remove a mosquito flying within 4% of the field width and 0.8 rows. `Fliers.changed` and `Fliers.caught` count both.
- **Switches removed.** The Translation and Ecology checkboxes are gone, with the title-screen line that reported them. `engine.translationEnabled` and `engine.ecologyEnabled` remain as fields, both true, because the tests and the browser checks use them.
- **Keyboard.** Four rows in physical layout, 47 terrain keys covering all 36 biomes, plus Delete, Space, and Enter. Each key is drawn in its terrain's colors and shows one glyph of its set; where two keys share a terrain they show different glyphs. A tap types. Hovering with a mouse, focusing, or holding for 450 ms shows the name and key above the keyboard, and a hold does not type. A physical keystroke outlines the matching key. The Keys button hides the keyboard and its help line, which takes the controls from 362 px to 92 px tall at desktop width. This replaces the grouped biome buttons and is the first complete input method for touch screens, which closes the mobile-keyboard item carried in earlier entries. Paste is still not handled.
- **Sheets.** Guide and Translations are buttons in the bar and open as sheets from the bottom edge, one at a time, each with a sticky header and a Close button; Escape closes. The Guide has eight headed sections and a row of links to them in its header, so a section can be reached without scrolling for it. The Translations sheet lists every lexicon entry (word, sounds, language, meaning) built from `../lexicon.js` at load, with one paragraph on the three ways translation acts.

`SULAT_GROUPS` in `biomes.js` no longer drives any interface; it is kept because a test checks that every biome belongs to one group, and it is the obvious way to order a future legend.

Verified in the browser pane. At 1100 by 900: 50 keys in rows of 13, 13, 11, 10, and 3, all 36 biomes present; key clicks typed rainforest, rainforest, gap, water; Delete, Enter, and a physical X keystroke behaved and the X key took the pressed outline; a 520 ms hold showed "Temperate forest · W" and typed nothing, and the following tap typed one glyph; the Guide opened 720 px wide with a sticky header and eight sections, opening Translations closed it and listed 11 rows, Escape closed that; no checkbox remains; the controls did not scroll. At 375 by 812: keys measured 24 by 40 px, nothing overflowed horizontally, the field kept 360 px, and the Guide sheet spanned the full width. A second pass confirmed no terrain key has a transparent or white background after a contrast fix for the two water keys. No console errors. All 39 Node cases pass, one new.

Not checked: a real touch device (the long press was simulated with pointer events), and the insect effects in the page beyond the Node case. 24 px keys are below the usual touch-target size; the layout would need a fifth row or horizontal scroll to do better at that width.
