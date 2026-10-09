// Habitats: Sulat's world biomes renamed at shoal scale (SPEC.md section 5).
// Glyph sets are copied from ../sulat/biomes.js, keyed there by the `sulat` id.
// `shore` is where a habitat tends to start: 0 at the landward top row, 1 at
// the seaward bottom row. `decay` is seconds and `bright` is the gain ratio
// between successive partials; both are placeholders for the ear.
// The order of HABITATS is the shore order that data/tuning.js indexes.

export const HABITATS = [
  { id: 'mangrove',  name: 'mangrove',         sulat: 'mangrove',  shore: 0.00, decay: 0.9, bright: 0.45, bg: '#416557', fg: '#e3ead3', glyphs: ['⌿', 'ᜈ', 'ネ', 'ڤ', 'म', '根'] },
  { id: 'marsh',     name: 'marsh',            sulat: 'marsh',     shore: 0.10, decay: 1.2, bright: 0.40, bg: '#808b53', fg: '#202d26', glyphs: ['ⸯ', 'ᜊ', 'ᜐ', 'サ', 'ب', 'स'] },
  { id: 'mudflat',   name: 'mudflat',          sulat: 'swamp',     shore: 0.18, decay: 0.6, bright: 0.25, bg: '#5d6a4b', fg: '#e4e6cf', glyphs: ['≈', 'ᜅ', 'ぬ', 'ڽ', 'ञ', '沼'] },
  { id: 'creek',     name: 'creek mouth',      sulat: 'river',     shore: 0.30, decay: 1.8, bright: 0.50, bg: '#c4dbe6', fg: '#2c6d92', glyphs: ['≀', 'ᜇ', 'リ', 'ر', '।', '川'] },
  { id: 'channel',   name: 'brackish channel', sulat: 'estuary',   shore: 0.42, decay: 2.2, bright: 0.50, bg: '#b3cfd6', fg: '#2f6272', glyphs: ['≋', 'ᜎ', 'ン', 'ى', 'ल', '入'] },
  { id: 'sandbar',   name: 'sandbar',          sulat: 'sand',      shore: 0.50, decay: 1.0, bright: 0.35, bg: '#cdbf95', fg: '#40321f', glyphs: ['.', '٠', 'ᜈ', 'ノ', 'ث', 'ब', '砂', 'อ', 'ဝ'] },
  { id: 'tideline',  name: 'tide line',        sulat: 'coast',     shore: 0.55, decay: 1.4, bright: 0.45, bg: '#c5b998', fg: '#365c62', glyphs: ['⌒', 'ᜎ', 'つ', 'ں', 'ट'] },
  { id: 'tidepool',  name: 'tide pool',        sulat: 'lake',      shore: 0.60, decay: 2.6, bright: 0.40, bg: '#aebfd6', fg: '#34557f', glyphs: ['○', 'ᜂ', 'ロ', 'ه', '०'] },
  { id: 'shallows',  name: 'shallows',         sulat: 'water',     shore: 0.74, decay: 2.4, bright: 0.55, bg: '#a9cbdc', fg: '#285a73', glyphs: ['~', 'ᜏ', 'ツ', '川', 'و', 'س', 'व', 'ల', 'น', 'ရေ', 'ꦮ'] },
  { id: 'seagrass',  name: 'seagrass',         sulat: 'kelp',      shore: 0.82, decay: 1.6, bright: 0.35, bg: '#7fae9c', fg: '#1f4a3c', glyphs: ['⌇', 'ᜌ', 'ソ', 'ئ', 'ऽ'] },
  { id: 'coral',     name: 'coral head',       sulat: 'reef',      shore: 0.90, decay: 2.0, bright: 0.75, bg: '#5fb9a6', fg: '#123f37', glyphs: ['⋰', 'ᜑ', 'ミ', 'ڠ', 'झ', '珊'] },
  { id: 'dropoff',   name: 'drop-off',         sulat: 'deepwater', shore: 1.00, decay: 3.5, bright: 0.30, bg: '#33557d', fg: '#dbe6f1', glyphs: ['≋', 'ᜋ', 'ヲ', 'م', 'ळ', '淵'] },
];

// Unusual terrain: the rest of Sulat's set, about two keys in forty.
export const UNUSUAL = [
  { id: 'lava',     name: 'lava',            sulat: 'lava',     decay: 0.5, bright: 0.90, bg: '#b64a2e', fg: '#ffe3a0', glyphs: ['▒', 'ᜇ', 'メ', 'ش', 'ज', '火'] },
  { id: 'ice',      name: 'ice',             sulat: 'ice',      decay: 3.0, bright: 0.85, bg: '#d6e6ee', fg: '#3d6a84', glyphs: ['❄', 'ᜃ', 'キ', 'ث', 'क', '冰'] },
  { id: 'glacier',  name: 'glacier',         sulat: 'glacier',  decay: 3.2, bright: 0.70, bg: '#b9d9e5', fg: '#385c73', glyphs: ['▱', 'ᜃ', 'ク', 'خ', 'क', '氷'] },
  { id: 'snow',     name: 'snow',            sulat: 'snow',     decay: 1.1, bright: 0.20, bg: '#e9eef2', fg: '#546b7d', glyphs: ['❅', '⁂', 'ᜐ', 'ゞ', 'ٿ', 'श'] },
  { id: 'desert',   name: 'desert',          sulat: 'desert',   decay: 0.8, bright: 0.60, bg: '#d9bf73', fg: '#111111', glyphs: ['⋱', 'ᜇ', 'ハ', 'د', 'द'] },
  { id: 'dunes',    name: 'dunes',           sulat: 'dunes',    decay: 0.9, bright: 0.50, bg: '#dcc090', fg: '#795c37', glyphs: ['⌢', 'ᜈ', 'へ', 'ٮ', 'न', '沙'] },
  { id: 'cave',     name: 'cave',            sulat: 'cave',     decay: 4.0, bright: 0.35, bg: '#393543', fg: '#cbc4d5', glyphs: ['∩', 'ᜉ', 'ユ', 'ح', 'ढ'] },
  { id: 'volcanic', name: 'volcanic ground', sulat: 'volcanic', decay: 0.7, bright: 0.80, bg: '#62514d', fg: '#f1c3a1', glyphs: ['▞', 'ᜅ', 'ヌ', 'ض', 'घ'] },
  { id: 'flower',   name: 'flower',          sulat: 'flower',   decay: 1.3, bright: 0.65, bg: '#dfb7c7', fg: '#762e52', glyphs: ['✿', 'ᜁ', 'ゑ', 'ة', 'ई'] },
  { id: 'rock',     name: 'rock',            sulat: 'rock',     decay: 0.4, bright: 0.70, bg: '#474747', fg: '#f2f2f2', glyphs: ['▤', 'ᜄ', 'エ', 'ط', 'ठ', '岩'] },
];

export const UNUSUAL_RATE = 0.05;

const BY_ID = new Map([...HABITATS, ...UNUSUAL].map(h => [h.id, h]));
export const habitat = id => BY_ID.get(id);
