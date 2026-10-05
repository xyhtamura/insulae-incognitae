// Completed terrain advances in whole rows; animals have a continuous clock.
class TyperEngine {
  constructor({ container, flightLayer, cols = 30, rows = 30, random = Math.random }) {
    this.container = container;
    this.cols = cols;
    this.rows = rows;

    this.line = [];
    this.completed = [];
    this.playing = false;
    this.random = random;
    this.translator = new TranslationEngine();
    this.ecology = new TypingEcology({ random });
    this.events = new TypingEvents({ random });
    this.onEvent = null;
    this.clock = 0;
    this.translationEnabled = true;
    this.ecologyEnabled = true;
    this.stepInterval = 2;
    this.stepTime = 0;
    this.fliers = new Fliers({ random });
    this.towns = new Towns({ random });
    this.stillWings = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.walkers = new LandAnimals({ random });
    this.nextCellId = 1;
    this.flightLayer = flightLayer;
    this.stats = { steps: 0, translations: 0, biomeChanges: 0, birdsReleased: 0, calvings: 0, quakes: 0, storms: 0, floods: 0 };

    this._render();
    // Controls keep their native keys; typing belongs to this surface.
    this.container.addEventListener('keydown', (e) => this._onKey(e));
  }

  setPlaying(playing) {
    this.playing = playing;
    this.container.classList.toggle('playing', playing);
  }

  advance(seconds) {
    if (!this.playing || seconds <= 0) return;
    this.clock += seconds;
    this.stepTime += seconds;
    while (this.stepTime >= this.stepInterval) {
      this.stepTime -= this.stepInterval;
      this._step();
    }
    this.fliers.advance(seconds, this.completed, this._visibleRows());
    if (this.ecologyEnabled) this.events.drift(seconds);
    this.walkers.advance(seconds);
    this.towns.advance(seconds, this.walkers.nodes);
    this._drawAnimals();
  }

  _step() {
    this.stats.steps++;
    for (const line of this.completed) {
      line.distance++;
    }
    const visibleRows = this._visibleRows();
    this.completed = this.completed.filter(line => line.distance < visibleRows);
    this._render();
    if (this.ecologyEnabled) {
      const result = this.ecology.step(this.completed);
      this.stats.biomeChanges += result.mutations;
      this.stats.birdsReleased += this.fliers.spawn(this.completed, result.births, this._visibleRows());
      const events = this.events.step(this.completed);
      this.stats.biomeChanges += events.mutations;
      this.stats.calvings += events.calved;
      if (events.quake) {
        this.stats.quakes++;
        for (const line of events.quake.rows) line.quakeUntil = this.clock + 0.9;
      }
      if (events.storm.started) this.stats.storms++;
      if (events.flood.started) this.stats.floods++;
      if (this.events.storm?.strike !== undefined) {
        this.events.storm.flashUntil = this.clock + 0.5;
        this.events.storm.flashAt = this.events.storm.strike;
        delete this.events.storm.strike;
      }
      const report = [
        events.storm.started && `${SULAT_STORMS[events.storm.started].label} entering from the ${this.events.storm.direction > 0 ? 'left' : 'right'}.`,
        events.flood.started && 'Flood: rivers and lakes are rising.',
        events.flood.receded && `Flood receded from ${events.flood.receded} ${events.flood.receded === 1 ? 'cell' : 'cells'}.`,
        events.tide === 'high' && 'High tide.',
        events.tide === 'low' && 'Low tide.',
        events.quake && `Earthquake: ${events.quake.changes} ${events.quake.changes === 1 ? 'cell' : 'cells'} changed and a gap opened.`,
        events.calved && `Glacier calved: ${events.calved} ${events.calved === 1 ? 'iceberg' : 'icebergs'}.`
      ].filter(Boolean).join(' ');
      if (report && this.onEvent) this.onEvent(report);
    }
    if (this.translationEnabled) {
      for (const line of this.completed) {
        const before = line.cells;
        const candidate = before.map(cell => ({ ...cell }));
        const retained = new Set(candidate);
        const after = this.translator.translateLineData(candidate);
        // Reject an oversized rewrite as a whole rather than cutting a word.
        if (after.length > this.cols * 3) continue;
        if (after.length !== before.length || after.some((cell, i) => cell.char !== before[i]?.char || cell.className !== before[i]?.className)) {
          this.stats.translations++;
          line.cells = after.map(cell => ({ ...cell, mutation: retained.has(cell) ? cell.mutation : 'translation' }));
        }
      }
    }
    this._render();
    if (this.ecologyEnabled) {
      this.walkers.spawn();
      const towns = this.towns.step(this.walkers.nodes);
      if (towns.founded && this.onEvent) this.onEvent(`A town was founded: ${towns.founded.kind.town}.`);
    }
    this._drawAnimals();
  }

  // Remove all terrain and everything living on it.
  reset() {
    this.line = [];
    this.completed = [];
    this.stepTime = 0;
    this.events = new TypingEvents({ random: this.random });
    this.fliers = new Fliers({ random: this.random });
    this.towns = new Towns({ random: this.random });
    this.walkers.animals = [];
    for (const key of Object.keys(this.stats)) this.stats[key] = 0;
    this._render();
  }

  _visibleRows() {
    const size = parseFloat(getComputedStyle(this.container).fontSize);
    return Math.min(this.rows, this.container.clientHeight / size);
  }

  _onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    const key = e.key;

    if (key === 'Enter')     { e.preventDefault(); this._newline();   return; }
    if (key === 'Backspace') { e.preventDefault(); this._backspace(); return; }
    if (key === ' ')         { e.preventDefault(); this._space();     return; }

    if (key.length > 1) return;

    const ch = key.toLowerCase();
    const mapping = SULAT_KEYS[ch];
    if (!mapping) return;
    e.preventDefault();

    this.typeBiome(mapping.biome);
  }

  typeBiome(biome) {
    const glyphs = SULAT_BIOMES[biome]?.glyphs;
    if (!glyphs) return;
    this._typeCell({ char: glyphs[Math.floor(this.random() * glyphs.length)], className: this._classesForBiome(biome) });
  }

  _classesForBiome(biome) {
    const list = [biome];
    if (SULAT_LAND.has(biome)) list.push('tile'); // padded background
    return list.join(' ');
  }

  _typeCell(cell) {
    if (this.line.length >= this.cols) this._newline();
    this.line.push(cell);
    this._render();
  }

  _space() {
    this._typeCell({ char: ' ', className: '' });
  }

  _newline() {
    // Make room for a submitted line even while the field is paused.
    let distance = 1;
    for (let i = this.completed.length - 1; i >= 0; i--) {
      this.completed[i].distance = Math.max(this.completed[i].distance, distance + 1);
      distance = this.completed[i].distance;
    }
    this.completed.push({ cells: this.line, distance: 1 });
    this.completed = this.completed.filter(line => line.distance < this._visibleRows());
    this.line = [];
    this._render();
  }

  _backspace() {
    if (this.line.length) {
      this.line.pop();
    } else if (this.completed.length) {
      // Recover the most recent visible line for editing.
      this.line = this.completed.pop().cells;
    }
    this._render();
  }

  _makeParagraph(cells) {
    const p = document.createElement('p');
    p.cellElements = [];
    for (const cell of cells) {
      // Keep kudlit and other combining marks attached to the preceding glyph.
      if (/^\p{Mark}+$/u.test(cell.char) && p.lastElementChild) {
        p.lastElementChild.textContent += cell.char;
        p.cellElements.push(p.lastElementChild);
        continue;
      }
      const span = document.createElement('span');
      span.className = cell.className || 'unknown';
      span.textContent = cell.char;
      // Phase comes from the play clock, so a rebuilt row keeps its ripple.
      if (SULAT_AQUATIC.has(cell.className?.split(' ')[0])) span.style.animationDelay = `-${((this.clock + p.cellElements.length * 0.35) % 2.4).toFixed(2)}s`;
      if (cell.mutation) span.dataset.mutation = cell.mutation;
      p.appendChild(span);
      p.cellElements.push(span);
    }
    return p;
  }

  _render() {
    for (const cells of [...this.completed.map(line => line.cells), this.line]) {
      for (const cell of cells) if (!cell.id) cell.id = this.nextCellId++;
    }
    const frag = document.createDocumentFragment();
    for (const line of this.completed) {
      const p = this._makeParagraph(line.cells);
      p.className = line.quakeUntil > this.clock ? 'completed-line quake' : 'completed-line';
      p.style.bottom = `${line.distance}em`;
      line.element = p;
      frag.appendChild(p);
    }
    const active = this._makeParagraph(this.line);
    active.className = 'active-line';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = ' ';
    active.appendChild(cursor);
    frag.appendChild(active);
    this.container.replaceChildren(frag);
    // Translation can lengthen a row. Fit the complete text instead of clipping
    // it; use the resulting visual positions for cross-row ecological contact.
    const field = this.container.getBoundingClientRect();
    for (const p of this.container.children) {
      const width = p.getBoundingClientRect().width;
      if (width <= field.width) continue;
      // A row wider than the field cannot be centered by its margins; it
      // starts at the left edge, so that is the side to scale from.
      p.style.transform = `scaleX(${field.width / width})`;
      if (this.container.dataset.align === 'center') p.style.transformOrigin = 'left bottom';
    }
    for (const line of this.completed) {
      line.bounds = line.element.cellElements.map(span => {
        const rect = span.getBoundingClientRect();
        return { left: (rect.left - field.left) / field.width, right: (rect.right - field.left) / field.width };
      });
    }
    this.walkers.sync(this.completed);
    this.fliers.prune(this.completed);
    this.events.prune(this.completed);
    this.towns.prune(this.walkers.nodes);
    this._drawAnimals();
  }

  // A long word is scaled down to about two cells.
  _wordScale(word) {
    return Math.min(1, 2 / [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word)].length);
  }

  // Keep one element per item in the flight layer, and return it.
  _mark(item, className, text) {
    if (!item.element) {
      item.element = document.createElement('span');
      item.element.className = className;
      item.element.owner = item;
      this.flightLayer.appendChild(item.element);
    }
    if (item.element.textContent !== text) item.element.textContent = text;
    return item.element;
  }

  _drawAnimals() {
    if (!this.flightLayer) return;
    const kept = new Set([...this.towns.towns, ...this.towns.boats]);
    for (const element of this.flightLayer.querySelectorAll('.town, .boat')) {
      if (!kept.has(element.owner)) element.remove();
    }
    for (const town of this.towns.towns) {
      const node = this.walkers.nodes.get(town.id);
      if (!node) continue;
      const element = this._mark(town, 'town', town.kind.town);
      element.dir = 'auto';
      element.style.left = `${(node.left + node.right) * 50}%`;
      element.style.bottom = `${node.y + 0.1}em`;
      element.style.transform = `translateX(-50%) scale(${this._wordScale(town.kind.town) * 1.15})`;
    }
    for (const boat of this.towns.boats) {
      const position = this.towns.boatPosition(boat, this.walkers.nodes);
      const element = this._mark(boat, 'boat', boat.kind.boat);
      element.dir = 'auto';
      element.style.left = `${position.x * 100}%`;
      element.style.bottom = `${position.y + 0.2}em`;
      element.style.transform = `translateX(-50%) rotate(${Math.sin(boat.age * 3) * 6}deg) scale(${this._wordScale(boat.kind.boat)})`;
    }
    const alive = new Set(this.walkers.animals);
    for (const element of this.flightLayer.querySelectorAll('.land-animal')) {
      if (!alive.has(element.animal)) element.remove();
    }
    const aloft = new Set(this.fliers.fliers);
    for (const element of this.flightLayer.querySelectorAll('.flier')) {
      if (!aloft.has(element.flier)) element.remove();
    }
    for (const flier of this.fliers.fliers) {
      if (!flier.element) {
        flier.element = document.createElement('span');
        flier.element.className = 'flier';
        flier.element.dataset.species = flier.species.name;
        if (flier.species.rtl) flier.element.dir = 'rtl';
        flier.species.word.forEach((part, i) => {
          const span = document.createElement('span');
          span.className = i === 1 ? 'body' : 'wing';
          span.textContent = part;
          flier.element.appendChild(span);
        });
        flier.element.flier = flier;
        this.flightLayer.appendChild(flier.element);
      }
      // Folded wings are narrow and turned in over the body, so the word
      // cannot be read; in flight they open and beat.
      const open = flier.spread;
      const beat = flier.state === 'flying' && !this.stillWings ? 0.8 + 0.2 * Math.sin(flier.age * 16) : 1;
      const side = flier.species.rtl ? -1 : 1;
      const [first, , last] = flier.element.children;
      first.style.transform = `rotate(${side * (1 - open) * 75}deg) scaleX(${0.15 + 0.85 * open * beat})`;
      last.style.transform = `rotate(${-side * (1 - open) * 75}deg) scaleX(${0.15 + 0.85 * open * beat})`;
      first.style.margin = last.style.margin = `0 ${-(1 - open) * 0.3}em`;
      flier.element.dataset.state = flier.state;
      flier.element.style.left = `${flier.x * 100}%`;
      flier.element.style.bottom = `${flier.y + 0.2}em`;
      const hang = flier.species.hangs && flier.state === 'perched' ? 180 : Math.sin(flier.age * 6 + flier.phase) * 10 * open;
      flier.element.style.transform = `translateX(-50%) rotate(${hang}deg) scale(0.7)`;
    }
    const afloat = new Set(this.events.icebergs);
    for (const element of this.flightLayer.querySelectorAll('.iceberg')) {
      if (!afloat.has(element.berg)) element.remove();
    }
    for (const berg of this.events.icebergs) {
      if (!berg.element) {
        berg.element = document.createElement('span');
        berg.element.className = 'iceberg';
        berg.element.textContent = berg.char; // the glyph that broke off
        berg.element.berg = berg;
        this.flightLayer.appendChild(berg.element);
      }
      berg.element.style.left = `${berg.x * 100}%`;
      berg.element.style.bottom = `${berg.line.distance + Math.sin(berg.age * 1.7) * 0.06}em`;
      berg.element.style.transform = `translateX(-50%) rotate(${Math.sin(berg.age * 1.1) * 7}deg)`;
    }
    const storm = this.events.storm;
    for (const element of this.flightLayer.querySelectorAll('.storm')) {
      if (element.storm !== storm) element.remove();
    }
    if (storm) {
      if (!storm.element) {
        const draw = set => Array.from({ length: 5 }, () => set[Math.floor(this.random() * set.length)]).join(' ');
        const marks = SULAT_STORMS[storm.type].glyphs;
        storm.element = document.createElement('span');
        storm.element.className = 'storm';
        storm.element.dataset.type = storm.type;
        storm.element.textContent = `${draw(SULAT_CLOUD)}\n${draw(marks)}\n ${draw(marks)}`;
        storm.element.storm = storm;
        this.flightLayer.appendChild(storm.element);
      }
      const width = this.events.stormWidth;
      storm.element.style.left = `${(storm.x - width / 2) * 100}%`;
      storm.element.style.width = `${width * 100}%`;
      storm.element.style.bottom = `${storm.anchor.distance - 1}em`;
      storm.element.classList.toggle('flash', storm.flashUntil > this.clock);
    }
    for (const animal of this.walkers.animals) {
      if (!animal.element) {
        animal.element = document.createElement('span');
        animal.element.className = 'land-animal';
        animal.element.dataset.species = animal.species.name;
        if (animal.species.aquatic) animal.element.dataset.mode = 'swimming';
        animal.element.textContent = animal.species.glyph;
        // Megafauna are drawn larger.
        if (animal.species.mega) animal.element.dataset.size = 'mega';
        animal.scale = this._wordScale(animal.species.glyph) * (animal.species.mega ? 1.6 : 1);
        animal.element.animal = animal;
        this.flightLayer.appendChild(animal.element);
      }
      const position = this.walkers.position(animal);
      animal.element.style.left = `${position.x * 100}%`;
      animal.element.style.bottom = `${position.y + 0.25}em`;
      animal.element.style.transform = `translateX(-50%) rotate(${position.walking ? Math.sin(animal.age * 12) * 5 : 0}deg) scale(${animal.scale})`;
    }
  }
}
