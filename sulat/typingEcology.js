// Authored contact rules for the typing artwork, not a climate model.
// Read one snapshot before writing changes so traversal order cannot spread a
// biome through a whole row in a single tick. Distances are integer row slots;
// horizontal bounds are measured from the rendered text, in field coordinates.
class TypingEcology {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.forests = new Set(['forest', 'tropical_rainforest', 'temperate_forest', 'boreal_taiga']);
    this.wet = new Set(['water', 'coldwater', 'reef', 'estuary', 'swamp']);
    this.open = new Set(['sand', 'plain', 'steppe', 'tropical_savanna']);
    this.glyphs = { ...WATERY, ...LAND6, ...CLASSIC };
  }

  biome(cell) { return cell?.className?.split(' ')[0] || ''; }

  neighbors(snapshot, row, column) {
    const line = snapshot[row];
    const result = [line.cells[column - 1], line.cells[column + 1]];
    const bounds = line.bounds[column];
    for (const other of snapshot) {
      if (Math.abs(other.distance - line.distance) !== 1) continue;
      for (let i = 0; i < other.cells.length; i++) {
        const adjacent = other.bounds[i];
        if (bounds && adjacent && Math.min(bounds.right, adjacent.right) - Math.max(bounds.left, adjacent.left) > 0.001) {
          result.push(other.cells[i]);
        }
      }
    }
    return result.filter(cell => cell && cell.char.trim()).map(cell => this.biome(cell));
  }

  target(biome, neighbors) {
    const forest = neighbors.find(type => this.forests.has(type));
    const wet = neighbors.some(type => this.wet.has(type));
    if (biome === 'water' && neighbors.includes('ice')) return 'coldwater';
    if (biome === 'coldwater' && neighbors.includes('ice')) return 'ice';
    if (biome === 'ice' && (forest || neighbors.includes('water'))) return 'coldwater';
    if (biome === 'water' && forest) return 'estuary';
    if (this.open.has(biome) && wet) return 'swamp';
    if (this.open.has(biome) && forest) return forest;
    if (biome === 'swamp' && forest && !neighbors.some(type => ['water', 'coldwater', 'reef', 'estuary'].includes(type))) return forest;
    return null;
  }

  step(lines) {
    const snapshot = lines.map(line => ({
      distance: line.distance,
      bounds: line.bounds,
      cells: line.cells.map(cell => ({ ...cell }))
    }));
    let mutations = 0;
    const births = [];
    for (let r = 0; r < snapshot.length; r++) {
      const source = snapshot[r];
      let forestRun = [];
      const release = () => {
        // One birth opportunity per contiguous forest patch, not per tree.
        if (forestRun.length >= 3 && this.random() < 0.35) {
          const center = source.bounds[forestRun[Math.floor(forestRun.length / 2)]];
          if (center) births.push({ x: (center.left + center.right) / 2, distance: source.distance });
        }
        forestRun = [];
      };
      for (let c = 0; c < source.cells.length; c++) {
        const before = source.cells[c];
        const cell = lines[r].cells[c];
        const biome = this.biome(before);
        if (this.forests.has(biome)) forestRun.push(c);
        else release();
        if (!before.char.trim()) continue;
        if (before.cooldown > 0) { cell.cooldown = before.cooldown - 1; continue; }
        const target = this.target(biome, this.neighbors(snapshot, r, c));
        cell.contactAge = target && target === before.contactTarget ? (before.contactAge || 0) + 1 : 1;
        cell.contactTarget = target;
        if (!target || cell.contactAge < 2 || this.random() >= 0.4) continue;
        const glyphs = this.glyphs[target].glyphs;
        lines[r].cells[c] = {
          char: glyphs[Math.floor(this.random() * glyphs.length)],
          className: `${target}${LAND_BIOMES.has(target) ? ' tile' : ''}`,
          cooldown: 4,
          mutation: 'ecology'
        };
        mutations++;
      }
      release();
    }
    return { mutations, births };
  }
}
