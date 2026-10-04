// From the workspace root: node --test insulaeincognita/sulat/typingEcology.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function setup() {
  const context = vm.createContext({ Math: Object.assign(Object.create(Math), { random: () => 0 }) });
  for (const name of ['../LetterMap.js', '../glyphData.js', '../lexicon.js', '../translationModule.js', 'typingEcology.js']) {
    vm.runInContext(readFileSync(new URL(name, import.meta.url), 'utf8'), context, { filename: name });
  }
  return vm.runInContext('({ TypingEcology, TranslationEngine })', context);
}

function row(types, distance = 1, bounds) {
  return {
    distance,
    cells: types.map(type => ({ char: type ? '木' : ' ', className: type ? `${type} tile` : '' })),
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
