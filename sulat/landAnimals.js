// Routes use rendered bounds. Land and water form separate habitat networks.
// Animals are short words rather than terrain glyphs, one language per
// species. They are propositions, open to correction. `mega` animals are
// drawn larger, walk slower, and appear one at a time; `tramples` is what
// they can leave behind; `hunts` names the species they remove on contact.
const LAND_SPECIES = [
  // usa (Tagalog)
  { name: 'deer', glyph: 'ᜂᜐ', habitats: ['forest', 'temperate_forest', 'tropical_rainforest', 'boreal_taiga', 'plain', 'grass', 'flower', 'tropical_savanna'] },
  // kitsune (Japanese)
  { name: 'fox', glyph: 'キツネ', hunts: ['hare'], habitats: ['forest', 'temperate_forest', 'boreal_taiga', 'plain', 'grass', 'steppe', 'tundra', 'tropical_savanna'] },
  // bakri (Hindi)
  { name: 'goat', glyph: 'बकरी', habitats: ['mountain', 'rock', 'steppe', 'plain', 'tundra', 'desert', 'alpine', 'badlands'] },
  // kani (Japanese)
  { name: 'crab', glyph: 'カニ', habitats: ['sand', 'coast', 'mangrove', 'marsh'] },
  { name: 'hare', glyph: '兔', habitats: ['snow', 'tundra', 'alpine', 'grass', 'plain'] },
  // unt (Hindi)
  { name: 'camel', glyph: 'ऊँट', habitats: ['desert', 'dunes', 'oasis', 'badlands'] },
  // ikan (Malay, in Jawi)
  { name: 'fish', glyph: 'ايکن', aquatic: true, habitats: [...SULAT_AQUATIC] },
  // ling (Thai)
  { name: 'monkey', glyph: 'ลิง', habitats: ['tropical_rainforest', 'forest', 'mangrove'] },
  // baboy (Tagalog)
  { name: 'boar', glyph: 'ᜊᜊᜓᜌ᜔', habitats: ['forest', 'tropical_rainforest', 'temperate_forest', 'grass', 'marsh'] },
  // musang (Tagalog and Malay), the palm civet
  { name: 'civet', glyph: 'ᜋᜓᜐᜅ᜔', habitats: ['tropical_rainforest', 'forest', 'temperate_forest', 'mangrove'] },
  // kuma (Japanese)
  { name: 'bear', glyph: 'クマ', habitats: ['boreal_taiga', 'temperate_forest', 'tundra'] },
  // chang (Thai)
  { name: 'elephant', glyph: 'ช้าง', mega: true, habitats: ['tropical_rainforest', 'forest', 'tropical_savanna', 'grass', 'plain'],
    tramples: { tropical_rainforest: 'tropical_savanna', forest: 'grass' } },
  // kalabaw (Tagalog), the water buffalo
  { name: 'carabao', glyph: 'ᜃᜎᜊᜏ᜔', mega: true, habitats: ['grass', 'plain', 'marsh', 'tropical_savanna', 'flower'],
    tramples: { grass: 'marsh', plain: 'marsh', flower: 'grass' } },
  // puli (Telugu)
  { name: 'tiger', glyph: 'పులి', mega: true, hunts: ['deer', 'boar', 'monkey'], habitats: ['tropical_rainforest', 'forest', 'mangrove', 'tropical_savanna', 'grass'] },
  // badhak (Javanese)
  { name: 'rhinoceros', glyph: 'ꦧꦝꦏ꧀', mega: true, habitats: ['tropical_rainforest', 'tropical_savanna', 'grass', 'marsh'],
    tramples: { tropical_rainforest: 'tropical_savanna' } },
  // kujira (Japanese)
  { name: 'whale', glyph: 'クジラ', mega: true, aquatic: true, hunts: ['squid'], habitats: ['deepwater', 'water', 'coldwater'] },
  // buwaya (Tagalog; buaya in Malay)
  { name: 'crocodile', glyph: 'ᜊᜓᜏᜌ', mega: true, aquatic: true, hunts: ['fish', 'koi', 'milkfish'], habitats: ['estuary', 'river', 'lake', 'water'] },
  // bangus (Tagalog)
  { name: 'milkfish', glyph: 'ᜊᜅᜓᜐ᜔', aquatic: true, habitats: ['estuary', 'water', 'river'] },
  // pating (Tagalog)
  { name: 'shark', glyph: 'ᜉᜆᜒᜅ᜔', aquatic: true, hunts: ['fish', 'milkfish', 'squid'], habitats: ['deepwater', 'water', 'reef'] },
  // pawikan (Tagalog), the sea turtle
  { name: 'turtle', glyph: 'ᜉᜏᜒᜃᜈ᜔', aquatic: true, hunts: ['jellyfish'], habitats: ['reef', 'water', 'kelp', 'estuary'] },
  // dugong (Tagalog; duyung in Malay). It grazes kelp down to open water.
  { name: 'dugong', glyph: 'ᜇᜓᜄᜓᜅ᜔', mega: true, aquatic: true, habitats: ['kelp', 'reef', 'estuary', 'water'], tramples: { kelp: 'water' } },
  // tako (Japanese)
  { name: 'octopus', glyph: 'タコ', aquatic: true, hunts: ['shrimp'], habitats: ['reef', 'kelp'] },
  // iruka (Japanese)
  { name: 'dolphin', glyph: 'イルカ', aquatic: true, hunts: ['squid', 'milkfish'], habitats: ['water', 'deepwater', 'estuary'] },
  // pusit (Tagalog)
  { name: 'squid', glyph: 'ᜉᜓᜐᜒᜆ᜔', aquatic: true, hunts: ['shrimp'], habitats: ['deepwater', 'water'] },
  // kurage (Japanese)
  { name: 'jellyfish', glyph: 'クラゲ', aquatic: true, habitats: ['water', 'coldwater', 'deepwater'] },
  // jhinga (Hindi)
  { name: 'shrimp', glyph: 'झींगा', aquatic: true, habitats: ['estuary', 'river', 'kelp', 'reef'] },
  // koi (Japanese)
  { name: 'koi', glyph: 'コイ', aquatic: true, habitats: ['lake', 'river'] },
  // pla (Thai), a river fish
  { name: 'riverfish', glyph: 'ปลา', aquatic: true, habitats: ['river', 'lake', 'estuary'] }
];

class LandAnimals {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.nodes = new Map();
    this.animals = [];
    // Density follows the terrain: one walker per `spread` land cells and one
    // swimmer per `spread` water cells, never more than the limits.
    this.limit = 6;       // walkers on land
    this.waterLimit = 4;  // swimmers
    this.spread = 30;
    this.caught = 0;
    this.trampled = 0;
  }

  sync(lines) {
    this.nodes = new Map();
    for (const line of lines) line.cells.forEach((cell, column) => {
      const bounds = line.bounds[column];
      const biome = cell.className?.split(' ')[0];
      if (!cell.id || !bounds || !cell.char.trim() || /^\p{Mark}+$/u.test(cell.char) || (!SULAT_LAND.has(biome) && !SULAT_AQUATIC.has(biome)) || biome === 'lava') return;
      this.nodes.set(cell.id, { id: cell.id, biome, domain: SULAT_AQUATIC.has(biome) ? 'water' : 'land', line, column, ...bounds, y: line.distance, neighbors: [] });
    });
    const nodes = [...this.nodes.values()];
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      if (a.domain !== b.domain) continue;
      const overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const between = a.line === b.line ? a.line.cells.slice(a.column + 1, b.column) : [];
      const horizontal = a.line === b.line && between.every(cell => /^\p{Mark}+$/u.test(cell.char)) && overlap >= -0.001;
      const vertical = Math.abs(a.y - b.y) === 1 && overlap > 0.001;
      if (horizontal || vertical) { a.neighbors.push(b.id); b.neighbors.push(a.id); }
    }
    // A rewritten or flooded habitat cannot leave a walker in empty space.
    this.animals = this.animals.filter(animal => {
      const from = this.nodes.get(animal.from), to = this.nodes.get(animal.to);
      return this.allowed(animal.species, from) && this.allowed(animal.species, to) &&
        (animal.from === animal.to || from.neighbors.includes(animal.to));
    });
  }

  allowed(species, node) { return !!node && species.habitats.includes(node.biome); }

  destinations(species, node) {
    return node.neighbors.map(id => this.nodes.get(id)).filter(next => this.allowed(species, next));
  }

  spawn() {
    // Start at a different species each step, so the cap favors none.
    const first = Math.floor(this.random() * LAND_SPECIES.length);
    for (let i = 0; i < LAND_SPECIES.length; i++) {
      const species = LAND_SPECIES[(first + i) % LAND_SPECIES.length];
      const domain = this.animals.filter(animal => !!animal.species.aquatic === !!species.aquatic).length;
      const room = [...this.nodes.values()].filter(node => (node.domain === 'water') === !!species.aquatic).length;
      if (domain >= Math.min(species.aquatic ? this.waterLimit : this.limit, Math.ceil(room / this.spread))) continue;
      if (this.animals.some(animal => animal.species === species) || this.random() >= (species.mega ? 0.08 : 0.2)) continue;
      const occupied = new Set(this.animals.flatMap(animal => [animal.from, animal.to]));
      const candidates = [...this.nodes.values()].filter(node => !occupied.has(node.id) && this.allowed(species, node) && this.destinations(species, node).length);
      if (!candidates.length) continue;
      const node = candidates[Math.floor(this.random() * candidates.length)];
      this.animals.push({ species, from: node.id, to: node.id, previous: null, progress: 0, age: 0 });
    }
  }

  advance(seconds) {
    for (const animal of this.animals) {
      animal.age += seconds;
      animal.progress += seconds / (animal.species.mega ? 3.2 : 1.6);
      // Complete routes even when a test or caller supplies a long frame.
      while (animal.progress >= 1) {
        animal.progress--;
        const last = animal.from;
        animal.from = animal.to;
        const node = this.nodes.get(animal.from);
        this._trample(animal.species, this.nodes.get(last));
        const choices = this.destinations(animal.species, node);
        const onward = choices.filter(next => next.id !== last && next.id !== animal.previous);
        const pool = onward.length ? onward : choices;
        animal.previous = last;
        animal.to = pool.length ? pool[Math.floor(this.random() * pool.length)].id : animal.from;
      }
    }
    // A hunter removes prey that stands on the cell it stands on.
    for (const hunter of this.animals) {
      if (!hunter.species.hunts) continue;
      for (const prey of this.animals) {
        if (!prey.caught && hunter.species.hunts.includes(prey.species.name) && [prey.from, prey.to].includes(hunter.from)) { prey.caught = true; this.caught++; }
      }
    }
    this.animals = this.animals.filter(animal => !animal.caught && animal.age < (animal.species.mega ? 48 : 36));
  }

  // Heavy animals can change the cell they leave. Targets stay inside the
  // animal's own habitats, so its route survives the change.
  _trample(species, node) {
    const target = species.tramples?.[node?.biome];
    const cell = node?.line.cells[node.column];
    if (!target || cell?.id !== node.id || cell.cooldown > 0 || this.random() >= 0.25) return;
    const glyphs = SULAT_BIOMES[target].glyphs;
    node.line.cells[node.column] = {
      id: cell.id, char: glyphs[Math.floor(this.random() * glyphs.length)],
      className: `${target}${SULAT_LAND.has(target) ? ' tile' : ''}`, cooldown: 4, mutation: 'event'
    };
    node.biome = target;
    this.trampled++;
  }

  position(animal) {
    const a = this.nodes.get(animal.from), b = this.nodes.get(animal.to);
    const ax = (a.left + a.right) / 2, bx = (b.left + b.right) / 2;
    const t = animal.progress;
    if (a.y === b.y) return { x: ax + (bx - ax) * t, y: a.y, walking: a.id !== b.id };
    // Cross between rows inside their shared width, then move to the center.
    const bridge = (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2;
    if (t < 0.25) return { x: ax + (bridge - ax) * t * 4, y: a.y, walking: true };
    if (t < 0.75) return { x: bridge, y: a.y + (b.y - a.y) * (t - 0.25) * 2, walking: true };
    return { x: bridge + (bx - bridge) * (t - 0.75) * 4, y: b.y, walking: true };
  }
}
