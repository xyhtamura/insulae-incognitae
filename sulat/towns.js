// Towns are not built by the person typing. They found themselves on open
// ground beside water, clear nearby forest into fields, and send boats to
// other towns across connected water. A boat that arrives can leave its own
// word for "town" behind, so names travel between languages by trade.
// Authored rules, not a model of settlement.
const TOWN_KINDS = [
  { lang: 'Tagalog', town: 'ᜊᜌᜈ᜔', boat: 'ᜊᜅ᜔ᜃ' },                 // bayan, bangka
  { lang: 'Malay', town: 'بندر', boat: 'ڤراهو' },                   // bandar, perahu (Jawi)
  { lang: 'Japanese', town: 'ムラ', boat: 'フネ' },                 // mura, fune
  { lang: 'Hindi', town: 'नगर', boat: 'नाव' },                     // nagar, nav
  { lang: 'Thai', town: 'บ้าน', boat: 'เรือ' },                     // ban, ruea
  { lang: 'Hanzi', town: '村', boat: '船' }
];
const TOWN_GROUND = new Set(['sand', 'coast', 'grass', 'plain', 'flower', 'oasis', 'marsh', 'tropical_savanna', 'steppe', 'mangrove']);
const TOWN_CLEARS = { forest: 'grass', temperate_forest: 'grass', tropical_rainforest: 'tropical_savanna', boreal_taiga: 'plain' };

class Towns {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.towns = [];
    this.boats = [];
    this.limit = 4;
    this.foundChance = 0.08;
    this.clearChance = 0.1;
    this.sailChance = 0.2;
    this.adoptChance = 0.5;
    this.founded = 0;
    this.arrivals = 0;
  }

  // Nodes beside a node in its row, or overlapping it one row away.
  _beside(node, nodes) {
    return [...nodes.values()].filter(other => other !== node && (
      (other.line === node.line && Math.abs(other.column - node.column) === 1) ||
      (Math.abs(other.y - node.y) === 1 && Math.min(other.right, node.right) - Math.max(other.left, node.left) > 0.001)));
  }

  _ports(town, nodes) {
    const node = nodes.get(town.id);
    return node ? this._beside(node, nodes).filter(other => other.domain === 'water') : [];
  }

  // A town whose cell is deleted, rewritten, flooded, or buried is gone.
  prune(nodes) {
    this.towns = this.towns.filter(town => TOWN_GROUND.has(nodes.get(town.id)?.biome));
    const standing = new Set(this.towns);
    this.boats = this.boats.filter(boat => standing.has(boat.to) && boat.path.every(id => nodes.get(id)?.domain === 'water'));
    for (const town of this.towns) {
      const node = nodes.get(town.id);
      node.line.cells[node.column].settled = true; // the tide leaves settled ground
    }
  }

  // Shortest water route from one town's shore to another's.
  _route(town, nodes) {
    const goals = new Map();
    for (const other of this.towns) if (other !== town) for (const port of this._ports(other, nodes)) goals.set(port.id, other);
    const starts = this._ports(town, nodes);
    const from = new Map(starts.map(port => [port.id, null]));
    const queue = starts.map(port => port.id);
    while (queue.length) {
      const id = queue.shift();
      if (goals.has(id)) {
        const path = [];
        for (let at = id; at !== null; at = from.get(at)) path.unshift(at);
        return { to: goals.get(id), path };
      }
      for (const next of nodes.get(id).neighbors) if (!from.has(next) && nodes.get(next)?.domain === 'water') { from.set(next, id); queue.push(next); }
    }
    return null;
  }

  step(nodes) {
    this.prune(nodes);
    const result = { founded: null, cleared: 0, sailed: 0 };
    if (this.towns.length < this.limit && this.random() < this.foundChance) {
      const taken = new Set(this.towns.map(town => town.id));
      const sites = [...nodes.values()].filter(node => node.domain === 'land' && TOWN_GROUND.has(node.biome) && !taken.has(node.id) &&
        this._beside(node, nodes).some(other => other.domain === 'water') && !this._beside(node, nodes).some(other => taken.has(other.id)));
      const unused = TOWN_KINDS.filter(kind => !this.towns.some(town => town.kind === kind));
      if (sites.length && unused.length) {
        const town = { id: sites[Math.floor(this.random() * sites.length)].id, kind: unused[Math.floor(this.random() * unused.length)], age: 0 };
        this.towns.push(town);
        this.founded++;
        result.founded = town;
        nodes.get(town.id).line.cells[nodes.get(town.id).column].settled = true;
      }
    }
    for (const town of this.towns) {
      town.age++;
      if (this.random() < this.clearChance) {
        const woods = this._beside(nodes.get(town.id), nodes).filter(other => TOWN_CLEARS[other.biome] && !(other.line.cells[other.column].cooldown > 0));
        if (woods.length) {
          const node = woods[Math.floor(this.random() * woods.length)];
          const target = TOWN_CLEARS[node.biome];
          const glyphs = SULAT_BIOMES[target].glyphs;
          node.line.cells[node.column] = {
            id: node.id, char: glyphs[Math.floor(this.random() * glyphs.length)],
            className: `${target} tile`, cooldown: 4, mutation: 'event'
          };
          node.biome = target;
          result.cleared++;
        }
      }
      if (this.boats.some(boat => boat.from === town) || this.random() >= this.sailChance) continue;
      const route = this._route(town, nodes);
      if (!route) continue;
      this.boats.push({ from: town, to: route.to, kind: town.kind, path: route.path, index: 0, progress: 0, age: 0 });
      result.sailed++;
    }
    return result;
  }

  advance(seconds, nodes) {
    for (const boat of this.boats) {
      boat.age += seconds;
      boat.progress += seconds / 1.1;
      while (boat.progress >= 1 && !boat.done) {
        boat.progress--;
        boat.index++;
        if (boat.index < boat.path.length - 1) continue;
        boat.done = true;
        this.arrivals++;
        // Trade leaves a word behind.
        if (this.towns.includes(boat.to) && this.random() < this.adoptChance) boat.to.kind = boat.kind;
      }
    }
    this.boats = this.boats.filter(boat => !boat.done && boat.path.every(id => nodes.get(id)?.domain === 'water'));
  }

  center(node) { return (node.left + node.right) / 2; }

  boatPosition(boat, nodes) {
    const a = nodes.get(boat.path[boat.index]), b = nodes.get(boat.path[Math.min(boat.index + 1, boat.path.length - 1)]);
    const t = boat.progress;
    return { x: this.center(a) + (this.center(b) - this.center(a)) * t, y: a.y + (b.y - a.y) * t };
  }
}
