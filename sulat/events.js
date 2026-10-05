// Authored events for the typing artwork, not a geophysical model: water
// circulates along its row, glacier tips calve icebergs, tides and floods
// cover and uncover ground, storms cross the field, and earthquakes change
// terrain around an epicenter. Positions are field coordinates taken from the
// rendered bounds; rows are integer distances.
const SULAT_SEA = new Set(['water', 'coldwater', 'deepwater', 'estuary', 'reef', 'kelp']);
const SULAT_FLOODABLE = new Set(['grass', 'plain', 'flower', 'steppe', 'tropical_savanna', 'sand', 'coast', 'marsh', 'desert', 'dunes', 'badlands', 'oasis']);
// What a flood leaves where it stood.
const SULAT_SILT = {
  desert: 'grass', dunes: 'grass', badlands: 'grass', sand: 'marsh',
  grass: 'marsh', plain: 'marsh', steppe: 'grass', tropical_savanna: 'marsh'
};
// Storms are drawn in punctuation and marks from the same scripts: commas and
// dandas for rain, hooks for lightning, stars for snow, dots for dust, and
// spirals for a typhoon.
const SULAT_CLOUD = ['⌒', 'へ', 'ᜎ', 'ں', '︵'];
// A storm type forms only over a landscape that holds enough of its terrain.
const SULAT_STORMS = {
  rain: {
    label: 'Rain', glyphs: [',', '،', '।', 'ヽ', '᜵', '、'], floods: true,
    changes: { lava: 'rock', volcanic: 'rock', desert: 'grass', badlands: 'grass', dunes: 'desert', snow: 'tundra' }
  },
  thunder: {
    label: 'Thunderstorm', glyphs: ['ऽ', 'ء', 'レ', 'ヘ', 'ᜑ', '⌁'], strikes: true,
    changes: { tropical_rainforest: 'tropical_savanna', temperate_forest: 'plain', boreal_taiga: 'tundra', forest: 'plain', mangrove: 'marsh', grass: 'steppe', flower: 'grass' }
  },
  blizzard: {
    label: 'Blizzard', glyphs: ['*', '٭', '※', '⁂', 'ゞ', 'ॱ'], needs: ['snow', 'ice', 'glacier', 'tundra', 'alpine', 'boreal_taiga'], count: 3,
    changes: { grass: 'snow', plain: 'snow', tundra: 'snow', steppe: 'tundra', marsh: 'tundra', flower: 'grass', mountain: 'alpine', water: 'coldwater', river: 'coldwater', coldwater: 'ice', lake: 'ice' }
  },
  sandstorm: {
    label: 'Sandstorm', glyphs: ['.', '٠', '·', '॰', '゜', '᜶'], needs: ['desert', 'dunes', 'badlands'], count: 3,
    changes: { grass: 'sand', flower: 'sand', marsh: 'sand', plain: 'steppe', steppe: 'desert', tropical_savanna: 'desert', sand: 'dunes', coast: 'dunes', oasis: 'desert' }
  },
  typhoon: {
    label: 'Typhoon', glyphs: ['の', 'و', 'ᜏ', 'ゐ', '६', '@'], needs: [...SULAT_SEA], count: 6, floods: true,
    changes: { coast: 'water', sand: 'coast', reef: 'water', kelp: 'water', mangrove: 'swamp', tropical_rainforest: 'swamp', forest: 'swamp', grass: 'marsh', plain: 'marsh' }
  }
};
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
    this.tideAge = 0;
    this.tidePeriod = 16;     // steps; the second half is high water
    this.flood = null;
    this.sinceFlood = 0;
    this.floodChance = 0.02;
    this.floodRest = 20;
    this.floodSpread = 3;     // steps of rising water
    this.floodLength = 8;     // steps until it recedes
    this.storm = null;
    this.sinceStorm = 0;
    this.stormChance = 0.06;
    this.stormRest = 8;
    this.stormWidth = 0.24;   // share of the field width
    this.stormSpeed = 0.04;   // field widths per second
    this.stormReach = 0.25;   // chance per covered cell, per step
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
    this.icebergs.push({ line, x, direction, age: 0, char: line.cells[column].char });
  }

  // Cells beside this one in its row, and overlapping cells one row away.
  _touching(lines, line, column) {
    const result = [];
    for (const side of [-1, 1]) if (line.cells[column + side]) result.push({ line, column: column + side });
    const bounds = line.bounds?.[column];
    if (!bounds) return result;
    for (const other of lines) {
      if (Math.abs(other.distance - line.distance) !== 1) continue;
      other.cells.forEach((cell, c) => {
        const adjacent = other.bounds?.[c];
        if (adjacent && Math.min(bounds.right, adjacent.right) - Math.max(bounds.left, adjacent.left) > 0.001) result.push({ line: other, column: c });
      });
    }
    return result;
  }

  _each(lines, visit) {
    for (const line of lines) for (let c = 0; c < line.cells.length; c++) visit(line, c, line.cells[c], this.biome(line.cells[c]));
  }

  // Covered ground keeps what it was, so the water can leave again.
  _submerge(line, column, biome, kind) {
    const { char, className } = line.cells[column];
    this._replace(line, column, biome);
    line.cells[column].submerged = { char, className, kind };
  }

  // Uncover every cell of one kind. Water that contact has since changed stays.
  _uncover(lines, kind, silt = {}) {
    let count = 0;
    this._each(lines, (line, c, cell, biome) => {
      if (cell.submerged?.kind !== kind) return;
      const { char, className } = cell.submerged;
      delete cell.submerged;
      if (!SULAT_AQUATIC.has(biome)) return;
      const left = silt[className.split(' ')[0]];
      if (left) this._replace(line, c, left);
      else Object.assign(cell, { char, className, mutation: undefined });
      count++;
    });
    return count;
  }

  // High water covers sand and coast beside the sea for half of each period.
  tide(lines) {
    this.tideAge++;
    const phase = this.tideAge % this.tidePeriod;
    if (phase === 0) return this._uncover(lines, 'tide') ? 'low' : null;
    if (phase !== this.tidePeriod / 2) return null;
    const shore = [];
    this._each(lines, (line, c, cell, biome) => {
      if ((biome === 'sand' || biome === 'coast') && !cell.settled && this._touching(lines, line, c).some(next => SULAT_SEA.has(this.biome(next.line.cells[next.column])))) shore.push([line, c]);
    });
    for (const [line, c] of shore) this._submerge(line, c, 'water', 'tide');
    return shore.length ? 'high' : null;
  }

  startFlood(lines) {
    if (this.flood || !lines.some(line => line.cells.some(cell => ['river', 'lake'].includes(this.biome(cell))))) return false;
    this.flood = { age: 0 };
    this.sinceFlood = 0;
    return true;
  }

  // Rivers and lakes spread one cell per step over low ground, stand, then
  // recede and leave silt.
  flooding(lines) {
    this.sinceFlood++;
    let started = false;
    if (!this.flood && this.sinceFlood >= this.floodRest && this.random() < this.floodChance) started = this.startFlood(lines);
    if (!this.flood) return { started, spread: 0, receded: 0 };
    this.flood.age++;
    if (this.flood.age >= this.floodLength) {
      this.flood = null;
      return { started, spread: 0, receded: this._uncover(lines, 'flood', SULAT_SILT) };
    }
    const reached = [];
    if (this.flood.age <= this.floodSpread) this._each(lines, (line, c, cell, biome) => {
      if (!SULAT_FLOODABLE.has(biome)) return;
      const wet = this._touching(lines, line, c).some(next => {
        const source = next.line.cells[next.column];
        return source.submerged?.kind === 'flood' || (!source.submerged && ['river', 'lake'].includes(this.biome(source)));
      });
      if (wet) reached.push([line, c]);
    });
    for (const [line, c] of reached) this._submerge(line, c, 'river', 'flood');
    return { started, spread: reached.length, receded: 0 };
  }

  _stormTypes(lines) {
    const counts = {};
    this._each(lines, (line, c, cell, biome) => { counts[biome] = (counts[biome] || 0) + 1; });
    return Object.keys(SULAT_STORMS).filter(type => {
      const storm = SULAT_STORMS[type];
      return !storm.needs || storm.needs.reduce((sum, biome) => sum + (counts[biome] || 0), 0) >= storm.count;
    });
  }

  // One storm at a time enters from a side and crosses three rows.
  storming(lines) {
    this.sinceStorm++;
    let started = null;
    if (!this.storm) {
      const solid = lines.reduce((sum, line) => sum + line.cells.filter(cell => this._solid(cell)).length, 0);
      if (solid < 12 || this.sinceStorm < this.stormRest || this.random() >= this.stormChance) return { started, changes: 0 };
      const types = this._stormTypes(lines);
      const direction = this.random() < 0.5 ? 1 : -1;
      this.storm = {
        type: types[Math.floor(this.random() * types.length)],
        anchor: lines[Math.floor(this.random() * lines.length)],
        direction, x: direction > 0 ? -this.stormWidth / 2 : 1 + this.stormWidth / 2, age: 0
      };
      started = this.storm.type;
    }
    const storm = this.storm;
    if (!lines.includes(storm.anchor)) { this.storm = null; return { started, changes: 0 }; }
    const kind = SULAT_STORMS[storm.type];
    const covered = [];
    let overFresh = false;
    for (const line of lines) {
      if (Math.abs(line.distance - storm.anchor.distance) > 1) continue;
      line.cells.forEach((cell, c) => {
        const center = this._center(line, c);
        if (center === null || Math.abs(center - storm.x) > this.stormWidth / 2) return;
        const biome = this.biome(cell);
        if (['river', 'lake'].includes(biome)) overFresh = true;
        if (kind.changes[biome] && !(cell.cooldown > 0)) covered.push([line, c, kind.changes[biome]]);
      });
    }
    let changes = 0;
    if (kind.strikes) {
      // Lightning takes one cell per step.
      if (covered.length) {
        const [line, c, target] = covered[Math.floor(this.random() * covered.length)];
        storm.strike = this._center(line, c);
        this._replace(line, c, target);
        changes++;
      }
    } else for (const [line, c, target] of covered) {
      if (this.random() >= this.stormReach) continue;
      this._replace(line, c, target);
      changes++;
    }
    const flooded = !!kind.floods && overFresh && this.startFlood(lines);
    return { started, changes, flooded };
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

  // Drop icebergs and a storm whose row is gone.
  prune(lines) {
    this.icebergs = this.icebergs.filter(berg => lines.includes(berg.line));
    if (this.storm && !lines.includes(this.storm.anchor)) this.storm = null;
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
    if (!this.storm) return;
    this.storm.age += seconds;
    this.storm.x += this.storm.direction * this.stormSpeed * seconds;
    if (this.storm.x < -this.stormWidth || this.storm.x > 1 + this.stormWidth) { this.storm = null; this.sinceStorm = 0; }
  }

  step(lines) {
    const moved = this.flow(lines);
    const calved = this.calve(lines);
    // Read iceberg positions before a fault shifts a row's columns.
    const cooled = this.chill(lines);
    const tide = this.tide(lines);
    const storm = this.storming(lines);
    const flood = this.flooding(lines);
    if (storm.flooded) flood.started = true;
    const quake = this.quake(lines);
    return { moved, calved, quake, cooled, tide, storm, flood, mutations: calved + cooled + storm.changes + flood.spread + flood.receded + (quake ? quake.changes : 0) };
  }
}
