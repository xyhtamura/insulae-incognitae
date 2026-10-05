// Routes use rendered bounds. Land and water form separate habitat networks.
// Animals are short words rather than terrain glyphs, one language per species:
// usa (Tagalog), kitsune and kani (Japanese), bakri and unt (Hindi), 兔 (Hanzi),
// ikan (Malay, in Jawi). They are propositions, open to correction.
const LAND_SPECIES = [
  { name: 'deer', glyph: 'ᜂᜐ', habitats: ['forest', 'temperate_forest', 'tropical_rainforest', 'boreal_taiga', 'plain', 'grass', 'flower', 'tropical_savanna'] },
  { name: 'fox', glyph: 'キツネ', habitats: ['forest', 'temperate_forest', 'boreal_taiga', 'plain', 'grass', 'steppe', 'tundra', 'tropical_savanna'] },
  { name: 'goat', glyph: 'बकरी', habitats: ['mountain', 'rock', 'steppe', 'plain', 'tundra', 'desert', 'alpine', 'badlands'] },
  { name: 'crab', glyph: 'カニ', habitats: ['sand', 'coast', 'mangrove', 'marsh'] },
  { name: 'hare', glyph: '兔', habitats: ['snow', 'tundra', 'alpine', 'grass', 'plain'] },
  { name: 'camel', glyph: 'ऊँट', habitats: ['desert', 'dunes', 'oasis', 'badlands'] },
  { name: 'fish', glyph: 'ايکن', aquatic: true, habitats: [...SULAT_AQUATIC] }
];

class LandAnimals {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.nodes = new Map();
    this.animals = [];
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
    for (const species of LAND_SPECIES) {
      if (this.animals.filter(animal => animal.species === species).length >= 2 || this.random() >= 0.55) continue;
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
      animal.progress += seconds / 1.6;
      // Complete routes even when a test or caller supplies a long frame.
      while (animal.progress >= 1) {
        animal.progress--;
        const last = animal.from;
        animal.from = animal.to;
        const node = this.nodes.get(animal.from);
        const choices = this.destinations(animal.species, node);
        const onward = choices.filter(next => next.id !== last && next.id !== animal.previous);
        const pool = onward.length ? onward : choices;
        animal.previous = last;
        animal.to = pool.length ? pool[Math.floor(this.random() * pool.length)].id : animal.from;
      }
    }
    this.animals = this.animals.filter(animal => animal.age < 36);
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
