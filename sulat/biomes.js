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
  coast: { glyphs: ['岸', '汀'] },
  snow: { glyphs: ['雪', '❅'] },
  glacier: { glyphs: ['氷', '冰'] },
  alpine: { glyphs: ['峰', '嶺'] },
  oasis: { glyphs: ['泉', '棕'] },
  badlands: { glyphs: ['丘', '崖'] },
  cave: { glyphs: ['穴', '窟'] },
  deepwater: { glyphs: ['海', '淵'] },
  kelp: { glyphs: ['藻', '茎'] },
  dunes: { glyphs: ['沙', '丘'] },
  volcanic: { glyphs: ['熔', '礫'] }
};
const SULAT_LAND = new Set([...LAND_BIOMES, 'grass', 'flower', 'lava', 'mangrove', 'marsh', 'coast', 'snow', 'glacier', 'alpine', 'oasis', 'badlands', 'cave', 'dunes', 'volcanic']);
const SULAT_AQUATIC = new Set(['water', 'coldwater', 'reef', 'estuary', 'river', 'lake', 'deepwater', 'kelp']);
const SULAT_KEYS = { ...LETTER_TO_BIOME };
for (const [key, biome] of Object.entries({
  1: 'desert', 2: 'rock', 3: 'forest', 4: 'grass', 5: 'flower',
  6: 'lava', 7: 'mangrove', 8: 'marsh', 9: 'river', 0: 'lake', '-': 'coast',
  '=': 'snow', '[': 'glacier', ']': 'alpine', ';': 'oasis', "'": 'badlands',
  ',': 'cave', '.': 'deepwater', '/': 'kelp', '\\': 'dunes', '`': 'volcanic'
})) SULAT_KEYS[key] = { biome, glyphs: SULAT_BIOMES[biome].glyphs };
const SULAT_LABELS = {
  tropical_rainforest: 'Rainforest', tropical_savanna: 'Savanna',
  temperate_forest: 'Temperate forest', boreal_taiga: 'Taiga', coldwater: 'Cold water',
  deepwater: 'Deep ocean', alpine: 'Alpine', volcanic: 'Volcanic ground'
};
const SULAT_GROUPS = {
  'Water and shores': ['water', 'coldwater', 'reef', 'estuary', 'river', 'lake', 'deepwater', 'kelp', 'coast', 'sand', 'mangrove', 'marsh', 'swamp'],
  'Forests and grasslands': ['tropical_rainforest', 'temperate_forest', 'boreal_taiga', 'forest', 'grass', 'flower', 'plain', 'steppe', 'tropical_savanna'],
  'Snow and mountains': ['ice', 'snow', 'glacier', 'alpine', 'tundra', 'mountain', 'rock', 'cave'],
  'Deserts and volcanic ground': ['desert', 'dunes', 'oasis', 'badlands', 'lava', 'volcanic']
};
