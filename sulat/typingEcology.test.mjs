// From the workspace root: node --test insulaeincognita/sulat/typingEcology.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function setup() {
  const context = vm.createContext({ Math: Object.assign(Object.create(Math), { random: () => 0 }) });
  for (const name of ['../LetterMap.js', '../glyphData.js', '../lexicon.js', '../translationModule.js', 'biomes.js', 'typingEcology.js', 'landAnimals.js']) {
    vm.runInContext(readFileSync(new URL(name, import.meta.url), 'utf8'), context, { filename: name });
  }
  return vm.runInContext('({ TypingEcology, TranslationEngine, LandAnimals, LAND_SPECIES, SULAT_KEYS, SULAT_BIOMES, LETTER_TO_BIOME })', context);
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

test('all 26 Sulat biomes are reachable without changing existing letter keys', () => {
  const { SULAT_KEYS, SULAT_BIOMES, LETTER_TO_BIOME } = setup();
  assert.equal(Object.keys(SULAT_BIOMES).length, 26);
  assert.equal(new Set(Object.values(SULAT_KEYS).map(entry => entry.biome)).size, 26);
  for (const [key, entry] of Object.entries(LETTER_TO_BIOME)) assert.equal(SULAT_KEYS[key], entry);
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
