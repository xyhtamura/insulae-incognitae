// Habitats: Sulat's world biomes renamed at shoal scale (SPEC.md section 5).
// Glyph sets are copied from ../sulat/biomes.js, keyed there by the `sulat` id.
// The woods, stones, oxide, coloured sands, and extra corals borrow the glyph
// sets of Sulat biomes that have no place on a shoal, for their shapes.
// `shore` is where a habitat tends to start: 0 at the landward top row, 1 at
// the seaward bottom row. `decay` is seconds and `bright` is the gain ratio
// between successive partials; both are placeholders for the ear.
// The order of HABITATS is the shore order that data/tuning.js indexes.

export const HABITATS = [
  { id: "mangrove", name: "mangrove", sulat: "mangrove", shore: 0.00, decay: 0.9, bright: 0.45, bg: "#2f5a45", fg: "#e3f2d8", glyphs: ["⌿", "ᜈ", "ネ", "ڤ", "म", "根"] },
  { id: "ironwood", name: "ironwood", sulat: "forest", shore: 0.04, decay: 0.5, bright: 0.55, bg: "#4a2c1c", fg: "#f3d9bd", glyphs: ["木", "林", "ᜄ", "オ", "ق", "ज्ञ", "ꦒ"] },
  { id: "driftwood", name: "driftwood", sulat: "temperate_forest", shore: 0.08, decay: 0.7, bright: 0.50, bg: "#9a6f42", fg: "#2a1a0c", glyphs: ["†", "木", "ᜉ", "ホ", "چ", "फ", "ไม้"] },
  { id: "marsh", name: "marsh", sulat: "marsh", shore: 0.12, decay: 1.2, bright: 0.40, bg: "#6f8a2f", fg: "#18240f", glyphs: ["ⸯ", "ᜊ", "ᜐ", "サ", "ب", "स"] },
  { id: "mudflat", name: "mudflat", sulat: "swamp", shore: 0.18, decay: 0.6, bright: 0.25, bg: "#4f5a34", fg: "#e6ead0", glyphs: ["≈", "ᜅ", "ぬ", "ڽ", "ञ", "沼"] },
  { id: "oxide", name: "red oxide bank", sulat: "badlands", shore: 0.24, decay: 1.1, bright: 0.80, bg: "#c23f22", fg: "#ffe9d2", glyphs: ["▚", "ᜃ", "ヨ", "ك", "ख"] },
  { id: "creek", name: "creek mouth", sulat: "river", shore: 0.30, decay: 1.8, bright: 0.50, bg: "#4aa6c9", fg: "#eaf8fc", glyphs: ["≀", "ᜇ", "リ", "ر", "।", "川"] },
  { id: "ochre", name: "ochre sand", sulat: "steppe", shore: 0.36, decay: 0.9, bright: 0.45, bg: "#e09a1a", fg: "#3a2400", glyphs: ["‒", "═", "ᜎ", "ー", "ـ", "र"] },
  { id: "channel", name: "brackish channel", sulat: "estuary", shore: 0.42, decay: 2.2, bright: 0.50, bg: "#3f93a6", fg: "#e4f6f8", glyphs: ["≋", "ᜎ", "ン", "ى", "ल", "入"] },
  { id: "whitesand", name: "white sand", sulat: "plain", shore: 0.46, decay: 0.8, bright: 0.30, bg: "#f2e2b4", fg: "#6b5a3a", glyphs: ["⎽", "⎼", "ᜂ", "コ", "ب", "उ"] },
  { id: "sandbar", name: "sandbar", sulat: "sand", shore: 0.50, decay: 1, bright: 0.35, bg: "#d9b86a", fg: "#3d2e12", glyphs: [".", "٠", "ᜈ", "ノ", "ث", "ब", "砂", "อ", "ဝ"] },
  { id: "pinksand", name: "pink sand", sulat: "oasis", shore: 0.53, decay: 1, bright: 0.40, bg: "#ef8f92", fg: "#5c1d24", glyphs: ["◦", "ᜂ", "の", "ۃ", "ऊ"] },
  { id: "tideline", name: "tide line", sulat: "coast", shore: 0.56, decay: 1.4, bright: 0.45, bg: "#c9a25a", fg: "#1f4a52", glyphs: ["⌒", "ᜎ", "つ", "ں", "ट"] },
  { id: "limestone", name: "limestone", sulat: "alpine", shore: 0.60, decay: 0.45, bright: 0.65, bg: "#cfc59a", fg: "#45432f", glyphs: ["▲", "ᜆ", "ム", "أ", "ऋ", "峰"] },
  { id: "tidepool", name: "tide pool", sulat: "lake", shore: 0.62, decay: 2.6, bright: 0.40, bg: "#3e78c2", fg: "#e8f1ff", glyphs: ["○", "ᜂ", "ロ", "ه", "०"] },
  { id: "blacksand", name: "black sand", sulat: "tundra", shore: 0.66, decay: 0.9, bright: 0.30, bg: "#23212a", fg: "#dcd6c6", glyphs: ["·", "ᜌ", "ヾ", "ن", "ङ", "苔"] },
  { id: "basalt", name: "basalt", sulat: "mountain", shore: 0.70, decay: 0.4, bright: 0.75, bg: "#37414a", fg: "#e6eef2", glyphs: ["△", "山", "ᜆ", "ヘ", "ک", "म", "٧"] },
  { id: "shallows", name: "shallows", sulat: "water", shore: 0.74, decay: 2.4, bright: 0.55, bg: "#35b8c4", fg: "#eafcfd", glyphs: ["~", "ᜏ", "ツ", "川", "و", "س", "व", "ల", "น", "ရေ", "ꦮ"] },
  { id: "anemone", name: "anemone", sulat: "grass", shore: 0.78, decay: 1.7, bright: 0.60, bg: "#ff3f86", fg: "#fff0f5", glyphs: ["*", "艹", "ᜀ", "サ", "ت", "ए", "ꦱ"] },
  { id: "seagrass", name: "seagrass", sulat: "kelp", shore: 0.82, decay: 1.6, bright: 0.35, bg: "#2fa06c", fg: "#eafff2", glyphs: ["⌇", "ᜌ", "ソ", "ئ", "ऽ"] },
  { id: "braincoral", name: "brain coral", sulat: "tropical_savanna", shore: 0.86, decay: 2.2, bright: 0.60, bg: "#f2c21f", fg: "#3d3000", glyphs: ["\"", "艹", "ᜀ", "サ", "ٮ", "ए"] },
  { id: "coral", name: "coral head", sulat: "reef", shore: 0.90, decay: 2, bright: 0.75, bg: "#17b59a", fg: "#052f29", glyphs: ["⋰", "ᜑ", "ミ", "ڠ", "झ", "珊"] },
  { id: "firecoral", name: "fire coral", sulat: "tropical_rainforest", shore: 0.93, decay: 1.8, bright: 0.85, bg: "#ff6a1f", fg: "#3a1200", glyphs: ["▓", "林", "森", "ᜋ", "ホ", "ڠ", "क्ष", "ป่า"] },
  { id: "seafan", name: "sea fan", sulat: "boreal_taiga", shore: 0.96, decay: 2.6, bright: 0.70, bg: "#a23fd0", fg: "#f9ecff", glyphs: ["↟", "杉", "ᜆ", "イ", "ا", "त"] },
  { id: "dropoff", name: "drop-off", sulat: "deepwater", shore: 1.00, decay: 3.5, bright: 0.30, bg: "#14457f", fg: "#dbe9f7", glyphs: ["≋", "ᜋ", "ヲ", "م", "ळ", "淵"] },
];

// Groups the contact rules and the tide read.
export const SANDS = ["sandbar", "ochre", "whitesand", "pinksand", "blacksand"];
export const CORALS = ["coral", "braincoral", "firecoral", "seafan", "anemone"];

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
