// Sulat extends the parent's palette without changing its other pages.
// Glyphs are chosen for their shape, as in the parent work, and each biome
// draws on Baybayin, Kana, Jawi, Devanagari, punctuation, and at most a few
// Hanzi. Water, sand, grass, and forest also keep the Thai, Telugu, Burmese,
// and Javanese glyphs of ../lineGenerator.js; the two Thai words the lexicon
// knows sit in the forests. No set is a list of words for its biome. Several glyphs carry a
// phoneme in ../glyphData.js, so loose syllables can still fuse into words.
const SULAT_BIOMES = {
  // water: waves, strokes, and rings
  water:     { glyphs: ['~', 'ᜏ', 'ツ', '川', 'و', 'س', 'व', 'ల', 'น', 'ရေ', 'ꦮ'] },
  coldwater: { glyphs: ['﹌', '〰', 'ᜐ', 'シ', 'ش', 'श'] },
  reef:      { glyphs: ['⋰', 'ᜑ', 'ミ', 'ڠ', 'झ', '珊'] },
  estuary:   { glyphs: ['≋', 'ᜎ', 'ン', 'ى', 'ल', '入'] },
  river:     { glyphs: ['≀', 'ᜇ', 'リ', 'ر', '।', '川'] },
  lake:      { glyphs: ['○', 'ᜂ', 'ロ', 'ه', '०'] },
  deepwater: { glyphs: ['≋', 'ᜋ', 'ヲ', 'م', 'ळ', '淵'] },
  kelp:      { glyphs: ['⌇', 'ᜌ', 'ソ', 'ئ', 'ऽ'] },
  swamp:     { glyphs: ['≈', 'ᜅ', 'ぬ', 'ڽ', 'ञ', '沼'] },
  ice:       { glyphs: ['❄', 'ᜃ', 'キ', 'ث', 'क', '冰'] },
  // forests: dense and branching forms
  tropical_rainforest: { glyphs: ['▓', '林', '森', 'ᜋ', 'ホ', 'ڠ', 'क्ष', 'ป่า'] },
  temperate_forest:    { glyphs: ['†', '木', 'ᜉ', 'ホ', 'چ', 'फ', 'ไม้'] },
  boreal_taiga:        { glyphs: ['↟', '杉', 'ᜆ', 'イ', 'ا', 'त'] },
  forest:              { glyphs: ['木', '林', 'ᜄ', 'オ', 'ق', 'ज्ञ', 'ꦒ'] },
  mangrove:            { glyphs: ['⌿', 'ᜈ', 'ネ', 'ڤ', 'म', '根'] },
  // open ground: tufts, bars, and dots
  tropical_savanna: { glyphs: ['"', '艹', 'ᜀ', 'サ', 'ٮ', 'ए'] },
  grass:    { glyphs: ['*', '艹', 'ᜀ', 'サ', 'ت', 'ए', 'ꦱ'] },
  flower:   { glyphs: ['✿', 'ᜁ', 'ゑ', 'ة', 'ई'] },
  steppe:   { glyphs: ['‒', '═', 'ᜎ', 'ー', 'ـ', 'र'] },
  plain:    { glyphs: ['⎽', '⎼', 'ᜂ', 'コ', 'ب', 'उ'] },
  tundra:   { glyphs: ['·', 'ᜌ', 'ヾ', 'ن', 'ङ', '苔'] },
  // marsh carries ba and sa in three scripts; they can fuse into basa, "wet".
  marsh:    { glyphs: ['ⸯ', 'ᜊ', 'ᜐ', 'サ', 'ب', 'स'] },
  sand:     { glyphs: ['.', '٠', 'ᜈ', 'ノ', 'ث', 'ब', '砂', 'อ', 'ဝ'] },
  coast:    { glyphs: ['⌒', 'ᜎ', 'つ', 'ں', 'ट'] },
  desert:   { glyphs: ['⋱', 'ᜇ', 'ハ', 'د', 'द'] },
  dunes:    { glyphs: ['⌢', 'ᜈ', 'へ', 'ٮ', 'न', '沙'] },
  oasis:    { glyphs: ['◦', 'ᜂ', 'の', 'ۃ', 'ऊ'] },
  badlands: { glyphs: ['▚', 'ᜃ', 'ヨ', 'ك', 'ख'] },
  // high and hard ground: peaks, blocks, and hollows
  mountain: { glyphs: ['△', '山', 'ᜆ', 'ヘ', 'ک', 'म', '٧'] },
  alpine:   { glyphs: ['▲', 'ᜆ', 'ム', 'أ', 'ऋ', '峰'] },
  rock:     { glyphs: ['▤', 'ᜄ', 'エ', 'ط', 'ठ', '岩'] },
  cave:     { glyphs: ['∩', 'ᜉ', 'ユ', 'ح', 'ढ'] },
  snow:     { glyphs: ['❅', '⁂', 'ᜐ', 'ゞ', 'ٿ', 'श'] },
  glacier:  { glyphs: ['▱', 'ᜃ', 'ク', 'خ', 'क', '氷'] },
  lava:     { glyphs: ['▒', 'ᜇ', 'メ', 'ش', 'ज', '火'] },
  volcanic: { glyphs: ['▞', 'ᜅ', 'ヌ', 'ض', 'घ'] }
};
const SULAT_LAND = new Set([...LAND_BIOMES, 'grass', 'flower', 'lava', 'mangrove', 'marsh', 'coast', 'snow', 'glacier', 'alpine', 'oasis', 'badlands', 'cave', 'dunes', 'volcanic']);
const SULAT_AQUATIC = new Set(['water', 'coldwater', 'reef', 'estuary', 'river', 'lake', 'deepwater', 'kelp']);
const SULAT_KEYS = {};
for (const [key, { biome }] of Object.entries(LETTER_TO_BIOME)) SULAT_KEYS[key] = { biome, glyphs: SULAT_BIOMES[biome].glyphs };
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
