// Fliers are three-part words: the first and last parts are wings. Wings fold
// while the animal is perched and spread in flight, so the word can be read
// only in the air. Positions are field coordinates; heights are row units.
// `lands` is what a species can leave where it settles: pollinators raise
// flowers, bats drop seed, fireflies and mosquitoes follow wet ground.
const FLIER_SPECIES = [
  // ibon (Tagalog). Birds are released by forest patches, not by habitat.
  { name: 'bird', word: ['ᜁ', 'ᜊᜓ', 'ᜈ᜔'], cap: 2, life: 18, leaves: true },
  // tutubi (Tagalog)
  { name: 'dragonfly', word: ['ᜆᜓ', 'ᜆᜓ', 'ᜊᜒ'], habitats: ['marsh', 'lake', 'river', 'swamp', 'estuary'], hunts: ['mosquito'], lands: { swamp: 'marsh' } },
  // titli (Hindi)
  { name: 'butterfly', word: ['ति', 'त', 'ली'], habitats: ['flower', 'grass', 'tropical_savanna'], lands: { grass: 'flower', plain: 'flower', tropical_savanna: 'flower' } },
  // hotaru (Japanese)
  { name: 'firefly', word: ['ホ', 'タ', 'ル'], habitats: ['mangrove', 'tropical_rainforest', 'swamp', 'marsh'], lands: { swamp: 'mangrove', marsh: 'mangrove' } },
  // lebah (Malay, in Jawi). Joiners keep each letter in its connected form.
  { name: 'bee', word: ['ل‍', '‍ب‍', '‍ه'], rtl: true, habitats: ['flower', 'oasis', 'forest', 'temperate_forest'], lands: { grass: 'flower', plain: 'flower' } },
  // lamok (Tagalog)
  { name: 'mosquito', word: ['ᜎ', 'ᜋᜓ', 'ᜃ᜔'], habitats: ['swamp', 'marsh', 'lake', 'mangrove'], lands: { marsh: 'swamp', grass: 'marsh' } },
  // paniki (Tagalog). Bats hang inverted in caves.
  { name: 'bat', word: ['ᜉ', 'ᜈᜒ', 'ᜃᜒ'], habitats: ['cave'], hangs: true, lands: { grass: 'forest', plain: 'forest', tropical_savanna: 'forest' } }
];

class Fliers {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.fliers = [];
    // One flier per `spread` terrain cells, never more than the limit.
    this.limit = 5;
    this.spread = 40;
    this.landChance = 0.5;
    this.changed = 0;
    this.caught = 0;
  }

  biome(cell) { return cell?.className?.split(' ')[0] || ''; }

  count(species) { return this.fliers.filter(flier => flier.species === species).length; }

  _perch(species, line, x) {
    this.fliers.push({
      species, line, x, y: line.distance, state: 'perched', spread: 0, age: 0,
      timer: 0.6 + this.random() * 1.2, phase: this.random() * Math.PI * 2,
      velocity: (this.random() < 0.5 ? -1 : 1) * (0.04 + this.random() * 0.035)
    });
  }

  // Forest births release birds; every other species emerges from its habitat.
  spawn(lines, births = [], maxRows = Infinity) {
    let birds = 0;
    const bird = FLIER_SPECIES[0];
    const cells = lines.reduce((sum, line) => sum + line.cells.filter(cell => cell.char.trim()).length, 0);
    const room = Math.min(this.limit, Math.ceil(cells / this.spread));
    for (const birth of births) {
      const line = lines.find(candidate => candidate.distance === birth.distance);
      if (!line || this.fliers.length >= room || this.count(bird) >= bird.cap || birth.distance + 1 >= maxRows) continue;
      this._perch(bird, line, birth.x);
      birds++;
    }
    for (const species of FLIER_SPECIES) {
      if (!species.habitats || this.fliers.length >= room || this.count(species) >= 1 || this.random() >= 0.12) continue;
      const homes = [];
      for (const line of lines) line.cells.forEach((cell, column) => {
        if (species.habitats.includes(this.biome(cell)) && line.bounds?.[column]) homes.push([line, column]);
      });
      if (!homes.length) continue;
      const [line, column] = homes[Math.floor(this.random() * homes.length)];
      this._perch(species, line, (line.bounds[column].left + line.bounds[column].right) / 2);
    }
    return birds;
  }

  // Drop what has lost its place: a perched flier whose row is gone, and
  // everything once no terrain is left.
  prune(lines) {
    this.fliers = lines.length ? this.fliers.filter(flier => flier.state !== 'perched' || lines.includes(flier.line)) : [];
  }

  // Dry terrain under a point, if any.
  _ground(lines, x, y) {
    const line = lines.find(candidate => candidate.distance === Math.round(y));
    const column = line?.bounds?.findIndex(bounds => bounds && x >= bounds.left && x <= bounds.right);
    if (!line || column < 0) return null;
    const cell = line.cells[column];
    const biome = this.biome(cell);
    return cell.char.trim() && !SULAT_AQUATIC.has(biome) && biome !== 'lava' ? { line, column } : null;
  }

  advance(seconds, lines, maxRows = Infinity) {
    for (const flier of this.fliers) {
      flier.age += seconds;
      flier.timer -= seconds;
      const flying = flier.state === 'flying';
      flier.spread = Math.max(0, Math.min(1, flier.spread + (flying ? 4 : -4) * seconds));
      if (!flying) {
        if (!lines.includes(flier.line)) { flier.gone = true; continue; }
        flier.y = flier.line.distance;
        if (flier.timer <= 0) { flier.state = 'flying'; flier.timer = 3 + this.random() * 3; }
        continue;
      }
      if (flier.species.leaves) {
        flier.x += flier.velocity * seconds;
        flier.y += (0.45 + Math.cos(flier.age * 2 + flier.phase) * 0.8) * seconds;
        continue;
      }
      // Other fliers stay with the row they rose from, which moves with the
      // terrain, and circle over it until they look for ground.
      if (!lines.includes(flier.line)) { flier.gone = true; continue; }
      flier.x += Math.cos(flier.age * 1.3 + flier.phase) * 0.05 * seconds;
      flier.y = flier.line.distance + 0.6 + Math.sin(flier.age * 1.7 + flier.phase) * 1.1;
      if (flier.timer > 0) continue;
      const ground = this._ground(lines, flier.x, flier.y);
      if (!ground) { flier.timer = 1; continue; }
      const { line, column } = ground;
      Object.assign(flier, { line, y: line.distance, state: 'perched', timer: 2 + this.random() * 2 });
      const cell = line.cells[column];
      const target = flier.species.lands?.[this.biome(cell)];
      if (!target || cell.cooldown > 0 || this.random() >= this.landChance) continue;
      const glyphs = SULAT_BIOMES[target].glyphs;
      line.cells[column] = {
        id: cell.id, char: glyphs[Math.floor(this.random() * glyphs.length)],
        className: `${target}${SULAT_LAND.has(target) ? ' tile' : ''}`, cooldown: 4, mutation: 'event'
      };
      this.changed++;
    }
    // A hunter in flight removes prey flying within reach.
    for (const hunter of this.fliers) {
      if (!hunter.species.hunts || hunter.state !== 'flying') continue;
      for (const prey of this.fliers) {
        if (prey.gone || prey.state !== 'flying' || !hunter.species.hunts.includes(prey.species.name)) continue;
        if (Math.abs(prey.x - hunter.x) < 0.04 && Math.abs(prey.y - hunter.y) < 0.8) { prey.gone = true; this.caught++; }
      }
    }
    this.fliers = this.fliers.filter(flier => !flier.gone && flier.age < (flier.species.life || 24) &&
      flier.x > -0.05 && flier.x < 1.05 && flier.y > -1 && flier.y < maxRows + 1);
  }
}
