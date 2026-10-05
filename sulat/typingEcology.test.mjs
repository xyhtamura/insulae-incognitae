// From the workspace root: node --test insulae-incognitae/sulat/typingEcology.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function setup() {
  const context = vm.createContext({ Math: Object.assign(Object.create(Math), { random: () => 0 }) });
  for (const name of ['../LetterMap.js', '../glyphData.js', '../lexicon.js', '../translationModule.js', 'biomes.js', 'typingEcology.js', 'landAnimals.js', 'fliers.js', 'events.js']) {
    vm.runInContext(readFileSync(new URL(name, import.meta.url), 'utf8'), context, { filename: name });
  }
  return vm.runInContext('({ Fliers, FLIER_SPECIES, TypingEvents, SULAT_STORMS, TypingEcology, TranslationEngine, LandAnimals, LAND_SPECIES, SULAT_KEYS, SULAT_BIOMES, SULAT_GROUPS, LETTER_TO_BIOME })', context);
}

function row(types, distance = 1, bounds) {
  return {
    distance,
    cells: types.map((type, i) => ({ id: `${distance}:${i}`, char: type ? '木' : ' ', className: type ? `${type} tile` : '' })),
    bounds: bounds || types.map((_, i) => ({ left: i / 30, right: (i + 1) / 30 }))
  };
}

test('isolated terrain and spaces do not acquire unrelated biomes', () => {
  const { TypingEcology } = setup();
  const ecology = new TypingEcology({ random: () => 0 });
  const lines = [row(['temperate_forest', '', 'sand'])];
  for (let i = 0; i < 10; i++) ecology.step(lines);
  assert.equal(ecology.biome(lines[0].cells[2]), 'sand');
  assert.equal(lines[0].cells[1].char, ' ');
});

test('persistent water/forest contact creates estuary, with a cooldown', () => {
  const { TypingEcology } = setup();
  const ecology = new TypingEcology({ random: () => 0 });
  const lines = [row(['water', 'temperate_forest'])];
  assert.equal(ecology.step(lines).mutations, 0);
  assert.equal(ecology.step(lines).mutations, 1);
  assert.equal(ecology.biome(lines[0].cells[0]), 'estuary');
  assert.equal(lines[0].cells[0].cooldown, 4);
});

test('a changed neighbor cannot trigger a cascade within the same snapshot', () => {
  const { TypingEcology } = setup();
  const ecology = new TypingEcology({ random: () => 0 });
  const lines = [row(['temperate_forest', 'sand', 'sand'])];
  ecology.step(lines);
  ecology.step(lines);
  assert.equal(ecology.biome(lines[0].cells[1]), 'temperate_forest');
  assert.equal(ecology.biome(lines[0].cells[2]), 'sand');
  ecology.step(lines);
  assert.equal(ecology.biome(lines[0].cells[2]), 'sand');
  ecology.step(lines);
  assert.equal(ecology.biome(lines[0].cells[2]), 'temperate_forest');
});

test('cross-row contact follows rendered overlap rather than token index', () => {
  const { TypingEcology } = setup();
  const ecology = new TypingEcology({ random: () => 0 });
  const lines = [
    row(['sand'], 1, [{ left: 0.3, right: 0.4 }]),
    row(['water', 'temperate_forest'], 2, [{ left: 0, right: 0.1 }, { left: 0.3, right: 0.4 }])
  ];
  ecology.step(lines);
  ecology.step(lines);
  assert.equal(ecology.biome(lines[0].cells[0]), 'temperate_forest');
  assert.equal(ecology.biome(lines[1].cells[0]), 'estuary');
});

test('an empty row slot breaks vertical contact', () => {
  const { TypingEcology } = setup();
  const ecology = new TypingEcology({ random: () => 0 });
  const lines = [row(['sand'], 1), row(['water'], 3)];
  for (let i = 0; i < 8; i++) ecology.step(lines);
  assert.equal(ecology.biome(lines[0].cells[0]), 'sand');
});

test('only a contiguous forest patch can release a bird', () => {
  const { TypingEcology } = setup();
  const ecology = new TypingEcology({ random: () => 0 });
  assert.equal(ecology.step([row(['temperate_forest', '', 'temperate_forest'])]).births.length, 0);
  const birth = ecology.step([row(['temperate_forest', 'temperate_forest', 'temperate_forest'])]).births[0];
  assert.equal(birth.distance, 1);
  assert.equal(birth.x, 0.05);
});

test('existing translation changes the script while preserving the habitat', () => {
  const { TranslationEngine } = setup();
  const translator = new TranslationEngine();
  const cells = [{ char: '木', className: 'temperate_forest tile' }];
  assert.equal(translator.semantic(cells, 0), true);
  assert.equal(cells.map(cell => cell.char).join(''), 'ᜉᜓᜈᜓ');
  assert.ok(cells.every(cell => cell.className === 'temperate_forest tile'));
});

test('all 36 Sulat biomes have keys and one palette group without changing letter keys', () => {
  const { SULAT_KEYS, SULAT_BIOMES, SULAT_GROUPS, LETTER_TO_BIOME } = setup();
  assert.equal(Object.keys(SULAT_BIOMES).length, 36);
  assert.equal(new Set(Object.values(SULAT_KEYS).map(entry => entry.biome)).size, 36);
  const grouped = Object.values(SULAT_GROUPS).flat();
  assert.equal(grouped.length, 36);
  assert.equal(new Set(grouped).size, 36);
  assert.ok(grouped.every(biome => biome in SULAT_BIOMES));
  for (const [key, entry] of Object.entries(LETTER_TO_BIOME)) assert.equal(SULAT_KEYS[key].biome, entry.biome);
});

test('every biome draws its glyphs from several scripts, and none is only Hanzi', () => {
  const { SULAT_BIOMES } = setup();
  const script = glyph => [['Baybayin', /\p{Script_Extensions=Tagalog}/u], ['Kana', /[\p{Script_Extensions=Katakana}\p{Script_Extensions=Hiragana}]/u], ['Jawi', /\p{Script_Extensions=Arabic}/u], ['Devanagari', /\p{Script_Extensions=Devanagari}/u], ['Hanzi', /\p{Script_Extensions=Han}/u]].find(([, test]) => test.test(glyph))?.[0] || 'mark';
  for (const [biome, { glyphs }] of Object.entries(SULAT_BIOMES)) {
    const scripts = glyphs.map(script);
    assert.ok(new Set(scripts).size >= 5, `${biome} uses ${[...new Set(scripts)]}`);
    assert.ok(scripts.filter(name => name === 'Hanzi').length <= 2, `${biome} leans on Hanzi`);
    assert.ok(scripts.includes('Baybayin'), `${biome} has no Baybayin`);
    assert.ok(glyphs.every(glyph => !/^\p{Mark}+$/u.test(glyph)), `${biome} has a bare combining mark`);
  }
});

test('persistent lava/water and river/grass contacts change their biomes', () => {
  const { TypingEcology } = setup();
  const ecology = new TypingEcology({ random: () => 0 });
  const lines = [row(['lava', 'water', '', 'river', 'grass'])];
  ecology.step(lines);
  ecology.step(lines);
  assert.equal(ecology.biome(lines[0].cells[0]), 'rock');
  assert.equal(ecology.biome(lines[0].cells[4]), 'marsh');
  assert.equal(lines[0].cells[0].id, '1:0');
});

test('land routes stop at water, spaces, and lava', () => {
  const { LandAnimals } = setup();
  const walkers = new LandAnimals({ random: () => 0 });
  walkers.sync([row(['forest', 'forest', 'water', 'forest', '', 'forest', 'lava', 'forest'])]);
  assert.deepEqual([...walkers.nodes.get('1:0').neighbors], ['1:1']);
  for (const id of ['1:3', '1:5', '1:7']) assert.equal(walkers.nodes.get(id).neighbors.length, 0);
});

test('animals spawn in their habitats and continuously cross connected rows', () => {
  const { LandAnimals, LAND_SPECIES } = setup();
  const walkers = new LandAnimals({ random: () => 0 });
  const lines = [row(['rock'], 1), row(['mountain'], 2)];
  walkers.sync(lines);
  walkers.spawn();
  assert.equal(walkers.animals.length, 1);
  assert.equal(walkers.animals[0].species.name, 'goat');
  walkers.advance(1.6); // Choose an adjacent destination.
  walkers.advance(0.8);
  const position = walkers.position(walkers.animals[0]);
  assert.equal(position.y, 1.5);
  assert.equal(position.walking, true);
  // Terrain's whole-row movement carries the continuous route with it.
  lines.forEach(line => line.distance++);
  walkers.sync(lines);
  assert.equal(walkers.position(walkers.animals[0]).y, 2.5);
  assert.ok(walkers.allowed(LAND_SPECIES[2], walkers.nodes.get('1:0')));
});

test('flooding, pruning, or opening a row gap removes invalid routes', () => {
  const { LandAnimals } = setup();
  for (const invalidate of [
    lines => { lines[1].cells[0].className = 'water'; },
    lines => lines.pop(),
    lines => { lines[1].distance = 3; }
  ]) {
    const walkers = new LandAnimals({ random: () => 0 });
    const lines = [row(['rock'], 1), row(['mountain'], 2)];
    walkers.sync(lines);
    walkers.spawn();
    walkers.advance(1.6);
    invalidate(lines);
    walkers.sync(lines);
    assert.equal(walkers.animals.length, 0);
  }
});

test('vertical paths cross inside the shared width, and ignore separate islands', () => {
  const { LandAnimals } = setup();
  const walkers = new LandAnimals({ random: () => 0 });
  walkers.sync([
    row(['rock'], 1, [{ left: 0.1, right: 0.5 }]),
    row(['mountain', 'rock'], 2, [{ left: 0.4, right: 0.6 }, { left: 0.8, right: 0.9 }])
  ]);
  assert.deepEqual([...walkers.nodes.get('1:0').neighbors], ['2:0']);
  walkers.spawn();
  walkers.advance(1.6);
  walkers.advance(0.8);
  const position = walkers.position(walkers.animals[0]);
  assert.ok(position.x >= 0.4 && position.x <= 0.5);
});

test('combining marks remain part of the underlying land glyph', () => {
  const { LandAnimals } = setup();
  const walkers = new LandAnimals({ random: () => 0 });
  const line = row(['forest', 'forest', 'forest']);
  line.cells[1].char = 'ᜓ';
  line.bounds[1] = line.bounds[0];
  line.bounds[2] = { left: 1 / 30, right: 2 / 30 };
  walkers.sync([line]);
  assert.equal(walkers.nodes.size, 2);
  assert.deepEqual([...walkers.nodes.get('1:0').neighbors], ['1:2']);
});

test('cold mountain borders, dry river borders, and cool reefs acquire regional biomes', () => {
  const { TypingEcology } = setup();
  const ecology = new TypingEcology({ random: () => 0 });
  const lines = [row(['snow', 'mountain', '', 'desert', 'river', '', 'reef', 'coldwater'])];
  ecology.step(lines);
  ecology.step(lines);
  assert.equal(ecology.biome(lines[0].cells[0]), 'glacier');
  assert.equal(ecology.biome(lines[0].cells[1]), 'alpine');
  assert.equal(ecology.biome(lines[0].cells[3]), 'oasis');
  assert.equal(ecology.biome(lines[0].cells[6]), 'kelp');
});

test('snow cools lava and forest takes priority over ocean depth at a water edge', () => {
  const { TypingEcology } = setup();
  const ecology = new TypingEcology({ random: () => 0 });
  assert.equal(ecology.target('lava', ['snow']), 'rock');
  assert.equal(ecology.target('water', ['deepwater']), 'deepwater');
  assert.equal(ecology.target('water', ['deepwater', 'forest']), 'estuary');
});

test('hares, camels, and fish spawn in connected cold, dry, and water habitats', () => {
  const { LandAnimals } = setup();
  const animals = new LandAnimals({ random: () => 0 });
  animals.sync([row(['snow', 'snow', 'water', 'deepwater', 'sand', 'desert', 'dunes'])]);
  animals.spawn();
  assert.deepEqual(Array.from(animals.animals, animal => animal.species.name).sort(), ['camel', 'fish', 'hare', 'whale']);
  assert.deepEqual([...animals.nodes.get('1:2').neighbors], ['1:3']);
  animals.advance(1.6);
  animals.advance(0.8);
  const fish = animals.animals.find(animal => animal.species.name === 'fish');
  assert.equal(fish.from, '1:2');
  assert.equal(fish.to, '1:3');
  assert.ok(animals.position(fish).x > 2 / 30 && animals.position(fish).x < 4 / 30);
});

test('fish cannot cross dry ground and disappear when their water freezes', () => {
  const { LandAnimals, LAND_SPECIES } = setup();
  const animals = new LandAnimals({ random: () => 0 });
  const lines = [row(['water', 'deepwater', 'sand', 'reef', 'kelp'])];
  animals.sync(lines);
  const fishSpecies = LAND_SPECIES.find(species => species.name === 'fish');
  assert.deepEqual(Array.from(animals.destinations(fishSpecies, animals.nodes.get('1:1')), node => node.id), ['1:0']);
  animals.spawn();
  animals.advance(1.6);
  lines[0].cells[1].className = 'ice';
  animals.sync(lines);
  assert.equal(animals.animals.filter(animal => animal.species.name === 'fish').length, 0);
});

test('a glacier left as a tip calves into cold water and launches an iceberg', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  const lines = [row(['mountain', 'glacier', 'glacier', 'water', 'water'])];
  assert.equal(events.calve(lines), 0);
  assert.equal(events.calve(lines), 0);
  assert.equal(events.calve(lines), 1);
  assert.equal(events.biome(lines[0].cells[1]), 'glacier');
  assert.equal(events.biome(lines[0].cells[2]), 'coldwater');
  assert.equal(events.icebergs.length, 1);
  assert.equal(events.icebergs[0].direction, 1);
});

test('an enclosed glacier does not calve', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  const lines = [row(['mountain', 'glacier', 'mountain'])];
  for (let i = 0; i < 8; i++) assert.equal(events.calve(lines), 0);
});

test('an iceberg cools water under it and stops at land', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  const lines = [row(['water', 'reef', 'sand'])];
  events.icebergs.push({ line: lines[0], x: 0.5 / 30, direction: 1, age: 0 });
  assert.equal(events.chill(lines), 1);
  assert.equal(events.biome(lines[0].cells[0]), 'coldwater');
  events.icebergs[0].x = 1.5 / 30;
  events.chill(lines);
  assert.equal(events.biome(lines[0].cells[1]), 'kelp');
  events.icebergs[0].x = 2.5 / 30;
  events.chill(lines);
  assert.equal(events.icebergs.length, 0);
  assert.equal(events.biome(lines[0].cells[2]), 'sand');
});

test('water circulates within its run, keeps cell ids, and leaves lakes and land still', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0.9 });
  const lines = [row(['river', 'water', 'water', 'lake', 'sand'])];
  const ids = lines[0].cells.map(cell => cell.id);
  assert.equal(events.flow(lines), 0);
  assert.equal(events.flow(lines), 1);
  assert.deepEqual(lines[0].cells.map(cell => events.biome(cell)), ['water', 'river', 'water', 'lake', 'sand']);
  assert.deepEqual(lines[0].cells.map(cell => cell.id), ids);
});

test('an earthquake changes terrain near its epicenter, opens a gap, and then rests', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  events.sinceQuake = events.quakeRest;
  const far = Array(20).fill('sand').concat(['mountain']);
  const lines = [row(['mountain', 'rock', 'volcanic', 'sand', 'cave', 'glacier', ...far.slice(6)], 1), row(far, 2), row(far, 9)];
  const quake = events.quake(lines);
  assert.equal(quake.rows.length, 2);
  assert.equal(lines[0].cells[0].char, ' ');
  assert.deepEqual(lines[0].cells.slice(1, 7).map(cell => events.biome(cell)), ['rock', 'cave', 'lava', 'sand', 'rock', 'coldwater']);
  assert.equal(events.biome(lines[0].cells[21]), 'mountain');
  assert.equal(events.icebergs.length, 1);
  assert.equal(events.quake(lines), null);
});

test('small landscapes do not have earthquakes', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  events.sinceQuake = 99;
  assert.equal(events.quake([row(['mountain', 'rock'])]), null);
});

const biomes = (events, line) => line.cells.map(cell => events.biome(cell));

test('the tide covers shore beside the sea, then returns the same ground', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  const lines = [row(['water', 'sand', 'sand', 'grass']), row(['coast', 'rock', 'lake', 'sand'], 2)];
  const before = lines.map(line => line.cells.map(cell => cell.char + cell.className));
  for (let i = 1; i < 8; i++) assert.equal(events.tide(lines), null);
  assert.equal(events.tide(lines), 'high');
  assert.deepEqual(biomes(events, lines[0]), ['water', 'water', 'sand', 'grass']);
  assert.deepEqual(biomes(events, lines[1]), ['water', 'rock', 'lake', 'sand']);
  for (let i = 9; i < 16; i++) assert.equal(events.tide(lines), null);
  assert.equal(events.tide(lines), 'low');
  assert.deepEqual(lines.map(line => line.cells.map(cell => cell.char + cell.className)), before);
});

test('a flood spreads one cell per step from fresh water, stops at high ground, and leaves silt', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0.99 });
  const lines = [row(['river', 'desert', 'grass', 'sand', 'flower', 'flower', 'mountain', 'grass', 'water', 'sand'])];
  assert.equal(events.startFlood(lines), true);
  assert.equal(events.flooding(lines).spread, 1);
  assert.deepEqual(biomes(events, lines[0]).slice(0, 3), ['river', 'river', 'grass']);
  events.flooding(lines);
  events.flooding(lines);
  assert.equal(events.flooding(lines).spread, 0);
  assert.deepEqual(biomes(events, lines[0]), ['river', 'river', 'river', 'river', 'flower', 'flower', 'mountain', 'grass', 'water', 'sand']);
  for (let i = 0; i < 3; i++) events.flooding(lines);
  assert.equal(events.flooding(lines).receded, 3);
  assert.deepEqual(biomes(events, lines[0]).slice(0, 5), ['river', 'grass', 'marsh', 'marsh', 'flower']);
  assert.equal(events.flood, null);
});

test('a flood needs a river or lake', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  assert.equal(events.startFlood([row(['water', 'sand', 'grass'])]), false);
});

test('storm types depend on the terrain that is present', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  assert.deepEqual([...events._stormTypes([row(['grass', 'grass', 'forest'])])], ['rain', 'thunder']);
  assert.deepEqual([...events._stormTypes([row(['snow', 'ice', 'tundra', 'desert', 'dunes', 'badlands'])])], ['rain', 'thunder', 'blizzard', 'sandstorm']);
  assert.deepEqual([...events._stormTypes([row(Array(6).fill('water'))])], ['rain', 'thunder', 'typhoon']);
});

test('a storm changes only cells under it in its three rows, and rain over a river starts a flood', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  const strip = ['desert', 'lava', 'river', 'grass'].concat(Array(20).fill('desert'));
  const lines = [row(strip, 1), row(strip, 2), row(strip, 4)];
  events.storm = { type: 'rain', anchor: lines[0], direction: 1, x: 2 / 30, age: 0 };
  const result = events.storming(lines);
  assert.equal(result.flooded, true);
  assert.deepEqual(biomes(events, lines[0]).slice(0, 4), ['grass', 'rock', 'river', 'grass']);
  assert.deepEqual(biomes(events, lines[1]).slice(0, 2), ['grass', 'rock']);
  assert.equal(events.biome(lines[0].cells[20]), 'desert');
  assert.deepEqual(biomes(events, lines[2]).slice(0, 2), ['desert', 'lava']);
});

test('a thunderstorm strikes one cell per step and a storm ends past the field edge', () => {
  const { TypingEvents } = setup();
  const events = new TypingEvents({ random: () => 0 });
  const lines = [row(['forest', 'forest', 'forest', 'forest'])];
  events.storm = { type: 'thunder', anchor: lines[0], direction: 1, x: 2 / 30, age: 0 };
  assert.equal(events.storming(lines).changes, 1);
  assert.deepEqual(biomes(events, lines[0]), ['plain', 'forest', 'forest', 'forest']);
  assert.equal(typeof events.storm.strike, 'number');
  events.drift(60);
  assert.equal(events.storm, null);
});

test('a storm forms on its own once the landscape is large enough', () => {
  const { TypingEvents, SULAT_STORMS } = setup();
  const events = new TypingEvents({ random: () => 0 });
  events.sinceStorm = events.stormRest;
  assert.equal(events.storming([row(['grass', 'grass'])]).started, null);
  const started = events.storming([row(Array(14).fill('grass'))]).started;
  assert.ok(SULAT_STORMS[started]);
  assert.equal(events.storm.x < 0, true);
});

test('every flier is a three-part word', () => {
  const { FLIER_SPECIES } = setup();
  for (const species of FLIER_SPECIES) assert.equal(species.word.length, 3, species.name);
});

test('a flier sits folded, opens in flight, and folds again on dry ground', () => {
  const { Fliers, FLIER_SPECIES } = setup();
  const fliers = new Fliers({ random: () => 0 });
  const lines = [row(['flower', 'flower', 'flower', 'water'])];
  fliers.spawn(lines);
  const flier = fliers.fliers.find(entry => entry.species.name === 'butterfly');
  assert.ok(flier);
  assert.equal(flier.state, 'perched');
  assert.equal(flier.spread, 0);
  for (let i = 0; i < 12; i++) fliers.advance(0.1, lines);
  assert.equal(flier.state, 'flying');
  assert.equal(flier.spread, 1);
  flier.x = 0.5 / 30; flier.y = 1; flier.timer = 0;
  fliers.advance(0.01, lines);
  assert.equal(flier.state, 'perched');
  for (let i = 0; i < 5; i++) fliers.advance(0.1, lines);
  assert.equal(flier.spread, 0);
  assert.ok(FLIER_SPECIES.length >= 6);
});

test('fliers do not land on water, and leave with their row', () => {
  const { Fliers } = setup();
  const fliers = new Fliers({ random: () => 0 });
  const lines = [row(['flower', 'water', 'water'])];
  fliers.spawn(lines);
  const flier = fliers.fliers[0];
  for (let i = 0; i < 12; i++) fliers.advance(0.1, lines);
  flier.x = 1.5 / 30; flier.y = 1; flier.timer = 0;
  fliers.advance(0.01, lines);
  assert.equal(flier.state, 'flying');
  const other = new Fliers({ random: () => 0 });
  other.spawn(lines);
  other.advance(0.1, []);
  assert.equal(other.fliers.length, 0);
});

test('bats rise only from caves and birds only from forest births', () => {
  const { Fliers } = setup();
  const fliers = new Fliers({ random: () => 0 });
  const lines = [row(['cave', 'rock', 'rock'])];
  assert.equal(fliers.spawn(lines, [{ x: 0.05, distance: 1 }]), 1);
  assert.deepEqual(Array.from(fliers.fliers, flier => flier.species.name).sort(), ['bat', 'bird']);
});

test('megafauna appear singly, and a tiger removes the deer it meets', () => {
  const { LandAnimals, LAND_SPECIES } = setup();
  const walkers = new LandAnimals({ random: () => 0 });
  const lines = [row(Array(30).fill('forest'))];
  walkers.sync(lines);
  const tiger = LAND_SPECIES.find(species => species.name === 'tiger');
  const deer = LAND_SPECIES.find(species => species.name === 'deer');
  walkers.animals = [
    { species: tiger, from: '1:0', to: '1:0', previous: null, progress: 0, age: 0 },
    { species: deer, from: '1:0', to: '1:1', previous: null, progress: 0, age: 0 }
  ];
  walkers.advance(0.1);
  assert.deepEqual(Array.from(walkers.animals, animal => animal.species.name), ['tiger']);
  assert.equal(walkers.caught, 1);
  for (let i = 0; i < 4; i++) walkers.spawn();
  assert.equal(walkers.animals.filter(animal => animal.species.mega && animal.species.name === 'elephant').length, 1);
  assert.ok(walkers.animals.length <= walkers.limit);
});

test('an elephant can open the forest cell it leaves into grass and keep walking', () => {
  const { LandAnimals, LAND_SPECIES } = setup();
  const walkers = new LandAnimals({ random: () => 0 });
  const lines = [row(['forest', 'forest', 'forest'])];
  walkers.sync(lines);
  const elephant = LAND_SPECIES.find(species => species.name === 'elephant');
  walkers.animals = [{ species: elephant, from: '1:0', to: '1:1', previous: null, progress: 0, age: 0 }];
  walkers.advance(3.3);
  assert.equal(lines[0].cells[0].className, 'grass tile');
  assert.equal(walkers.trampled, 1);
  walkers.sync(lines);
  assert.equal(walkers.animals.length, 1);
});

test('insects and bats can change the ground they settle on, and dragonflies take mosquitoes', () => {
  const { Fliers, FLIER_SPECIES } = setup();
  const fliers = new Fliers({ random: () => 0 });
  const find = name => FLIER_SPECIES.find(species => species.name === name);
  const lines = [row(['grass', 'grass', 'marsh', 'rock'])];
  const aloft = (name, column) => ({ species: find(name), x: (column + 0.5) / 30, y: 1, state: 'flying', spread: 1, age: 0, timer: 0, phase: 0, velocity: 0 });
  fliers.fliers = [aloft('butterfly', 0), aloft('bat', 1), aloft('firefly', 2), aloft('bee', 3)];
  fliers.advance(0.01, lines);
  assert.deepEqual(lines[0].cells.map(cell => cell.className), ['flower tile', 'forest tile', 'mangrove tile', 'rock tile']);
  assert.equal(fliers.changed, 3);
  assert.ok(fliers.fliers.every(flier => flier.state === 'perched'));
  const hunt = new Fliers({ random: () => 0 });
  hunt.fliers = [{ ...aloft('dragonfly', 5), timer: 5 }, { ...aloft('mosquito', 5), timer: 5 }, { ...aloft('mosquito', 20), timer: 5 }];
  hunt.advance(0.01, lines);
  assert.deepEqual(Array.from(hunt.fliers, flier => flier.species.name), ['dragonfly', 'mosquito']);
  assert.equal(hunt.caught, 1);
});
