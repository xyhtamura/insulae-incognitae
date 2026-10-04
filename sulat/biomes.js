// Sulat extends the parent's palette without changing its other pages.
const SULAT_BIOMES = {
  ...WATERY, ...LAND6, ...CLASSIC,
  grass: { glyphs: ['艸', '*'] },
  flower: { glyphs: ['花', '✿'] },
  lava: { glyphs: ['火', '灼'] },
  mangrove: { glyphs: ['根', '木'] },
  marsh: { glyphs: ['蒲', '苇'] },
  river: { glyphs: ['川', '流'] },
  lake: { glyphs: ['湖', '波'] },
  coast: { glyphs: ['岸', '汀'] }
};
const SULAT_LAND = new Set([...LAND_BIOMES, 'grass', 'flower', 'lava', 'mangrove', 'marsh', 'coast']);
const SULAT_KEYS = { ...LETTER_TO_BIOME };
for (const [key, biome] of Object.entries({
  1: 'desert', 2: 'rock', 3: 'forest', 4: 'grass', 5: 'flower',
  6: 'lava', 7: 'mangrove', 8: 'marsh', 9: 'river', 0: 'lake', '-': 'coast'
})) SULAT_KEYS[key] = { biome, glyphs: SULAT_BIOMES[biome].glyphs };
const SULAT_LABELS = {
  tropical_rainforest: 'Rainforest', tropical_savanna: 'Savanna',
  temperate_forest: 'Temperate forest', boreal_taiga: 'Taiga', coldwater: 'Cold water'
};
