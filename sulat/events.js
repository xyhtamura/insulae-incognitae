// Authored events for the typing artwork, not a geophysical model: water
// circulates along its row, glacier tips calve icebergs, and earthquakes
// change terrain around an epicenter. Positions are field coordinates taken
// from the rendered bounds; rows are integer distances.
class TypingEvents {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.icebergs = [];
    this.sinceQuake = 0;
    this.calveAfter = 3;      // steps a glacier must stay a tip
    this.calveChance = 0.25;
    this.quakeChance = 0.03;
    this.quakeRest = 15;      // steps between earthquakes
    this.quakeRadius = 0.18;  // share of the field width
    this.flowEvery = 2;       // steps between current shifts
    this.shaken = {
      mountain: 'rock', alpine: 'rock', rock: 'cave', badlands: 'cave',
      cave: 'rock', volcanic: 'lava', glacier: 'coldwater'
    };
  }

  biome(cell) { return cell?.className?.split(' ')[0] || ''; }

  _solid(cell) { return !!cell && !!cell.char.trim(); }

  _replace(line, column, biome) {
    const before = line.cells[column];
    const glyphs = SULAT_BIOMES[biome].glyphs;
    line.cells[column] = {
      id: before.id,
      char: glyphs[Math.floor(this.random() * glyphs.length)],
      className: `${biome}${SULAT_LAND.has(biome) ? ' tile' : ''}`,
      cooldown: 4,
      mutation: 'event'
    };
  }

  _center(line, column) {
    const bounds = line.bounds?.[column];
    return bounds ? (bounds.left + bounds.right) / 2 : null;
  }

  _launch(line, column, direction) {
    const x = this._center(line, column);
    if (x === null || this.icebergs.length >= 6) return;
    this.icebergs.push({ line, x, direction, age: 0 });
  }

  // Lakes stay still and divide a row's water into separate runs. Each run
  // moves one cell along the row's direction and re-enters at its other end.
  flow(lines) {
    let moved = 0;
    for (const line of lines) {
      line.flow ||= this.random() < 0.5 ? -1 : 1;
      line.flowAge = (line.flowAge || 0) + 1;
      if (line.flowAge % this.flowEvery) continue;
      let run = [];
      const shift = () => {
        const varied = run.some(c => line.cells[c].char !== line.cells[run[0]].char || line.cells[c].className !== line.cells[run[0]].className);
        if (run.length > 1 && varied) {
          const water = run.map(c => ({ char: line.cells[c].char, className: line.cells[c].className }));
          run.forEach((c, i) => Object.assign(line.cells[c], water[(i - line.flow + run.length) % run.length]));
          moved++;
        }
        run = [];
      };
      line.cells.forEach((cell, c) => {
        const biome = this.biome(cell);
        if (/^\p{Mark}+$/u.test(cell.char)) return;
        if (SULAT_AQUATIC.has(biome) && biome !== 'lake') run.push(c);
        else shift();
      });
      shift();
    }
    return moved;
  }

  // A tip is a glacier cell with open water, a gap, or the row end beside it.
  calve(lines) {
    let calved = 0;
    for (const line of lines) {
      for (let c = 0; c < line.cells.length; c++) {
        const cell = line.cells[c];
        if (this.biome(cell) !== 'glacier') continue;
        const open = [-1, 1].filter(side => {
          const next = line.cells[c + side];
          return !this._solid(next) || SULAT_AQUATIC.has(this.biome(next));
        });
        cell.tipAge = open.length ? (cell.tipAge || 0) + 1 : 0;
        if (cell.tipAge < this.calveAfter || this.random() >= this.calveChance) continue;
        this._launch(line, c, open[Math.floor(this.random() * open.length)]);
        this._replace(line, c, 'coldwater');
        calved++;
      }
    }
    return calved;
  }

  quake(lines) {
    this.sinceQuake++;
    const cells = lines.flatMap(line => line.cells.map((cell, column) => ({ line, column, cell })).filter(entry => this._solid(entry.cell)));
    if (cells.length < 12 || this.sinceQuake < this.quakeRest || this.random() >= this.quakeChance) return null;
    this.sinceQuake = 0;
    const origin = cells[Math.floor(this.random() * cells.length)];
    const x = this._center(origin.line, origin.column);
    if (x === null) return null;
    const rows = lines.filter(line => Math.abs(line.distance - origin.line.distance) <= 2);
    let changes = 0;
    for (const line of rows) {
      for (let c = 0; c < line.cells.length; c++) {
        const biome = this.biome(line.cells[c]);
        const center = this._center(line, c);
        if (!this.shaken[biome] || center === null || Math.abs(center - x) > this.quakeRadius || this.random() >= 0.5) continue;
        if (biome === 'glacier') this._launch(line, c, center < x ? -1 : 1);
        this._replace(line, c, this.shaken[biome]);
        changes++;
      }
    }
    // The fault opens a gap in the epicenter row, which breaks routes there.
    if (origin.line.cells.length < 90) origin.line.cells.splice(origin.column, 0, { char: ' ', className: '' });
    return { x, distance: origin.line.distance, rows, changes };
  }

  // Icebergs cool the water they pass over and stop at land or a row end.
  chill(lines) {
    let cooled = 0;
    this.icebergs = this.icebergs.filter(berg => {
      if (!lines.includes(berg.line)) return false;
      const column = berg.line.bounds.findIndex(bounds => bounds && berg.x >= bounds.left && berg.x <= bounds.right);
      if (column < 0) return true;
      const biome = this.biome(berg.line.cells[column]);
      const target = { water: 'coldwater', estuary: 'coldwater', river: 'coldwater', reef: 'kelp' }[biome];
      if (target) { this._replace(berg.line, column, target); cooled++; }
      return !this._solid(berg.line.cells[column]) || SULAT_AQUATIC.has(biome);
    });
    return cooled;
  }

  drift(seconds) {
    for (const berg of this.icebergs) {
      berg.age += seconds;
      berg.x += berg.direction * 0.012 * seconds;
    }
    this.icebergs = this.icebergs.filter(berg => berg.age < 24 && berg.x > -0.02 && berg.x < 1.02);
  }

  step(lines) {
    const moved = this.flow(lines);
    const calved = this.calve(lines);
    // Read iceberg positions before a fault shifts a row's columns.
    const cooled = this.chill(lines);
    const quake = this.quake(lines);
    return { moved, calved, quake, cooled, mutations: calved + cooled + (quake ? quake.changes : 0) };
  }
}
