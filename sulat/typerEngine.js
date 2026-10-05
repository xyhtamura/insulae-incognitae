// Completed terrain advances in whole rows; birds have a continuous clock.
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
    this.birds = [];
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
    this._fly(seconds);
    if (this.ecologyEnabled) this.events.drift(seconds);
    this.walkers.advance(seconds);
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
      for (const birth of result.births) this._releaseBird(birth);
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
    if (this.ecologyEnabled) this.walkers.spawn();
    this._drawAnimals();
  }

  _visibleRows() {
    const size = parseFloat(getComputedStyle(this.container).fontSize);
    return Math.min(this.rows, this.container.clientHeight / size);
  }

  _releaseBird({ x, distance }) {
    if (!this.flightLayer || this.birds.length >= 8 || distance + 1 >= this._visibleRows()) return;
    const element = document.createElement('span');
    element.className = 'bird';
    element.textContent = 'ᜁᜊᜓᜈ᜔'; // ibon
    this.flightLayer.appendChild(element);
    this.birds.push({
      element, x, origin: distance + 1, age: 0,
      velocity: (this.random() < 0.5 ? -1 : 1) * (0.04 + this.random() * 0.035),
      phase: this.random() * Math.PI * 2
    });
    this.stats.birdsReleased++;
  }

  _fly(seconds) {
    const visibleRows = this._visibleRows();
    for (const bird of this.birds) {
      bird.age += seconds;
      bird.x += bird.velocity * seconds;
      const height = bird.origin + bird.age * 0.45 + Math.sin(bird.age * 2 + bird.phase) * 0.4;
      bird.height = height;
      bird.element.style.left = `${bird.x * 100}%`;
      bird.element.style.bottom = `${height}em`;
      bird.element.style.transform = `rotate(${Math.sin(bird.age * 6 + bird.phase) * 12}deg)`;
    }
    this.birds = this.birds.filter(bird => {
      const alive = bird.age < 18 && bird.x > -0.05 && bird.x < 1.05 && bird.height < visibleRows + 1;
      if (!alive) bird.element.remove();
      return alive;
    });
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
      if (width > field.width) p.style.transform = `scaleX(${field.width / width})`;
    }
    for (const line of this.completed) {
      line.bounds = line.element.cellElements.map(span => {
        const rect = span.getBoundingClientRect();
        return { left: (rect.left - field.left) / field.width, right: (rect.right - field.left) / field.width };
      });
    }
    this.walkers.sync(this.completed);
    this._drawAnimals();
  }

  _drawAnimals() {
    if (!this.flightLayer) return;
    const alive = new Set(this.walkers.animals);
    for (const element of this.flightLayer.querySelectorAll('.land-animal')) {
      if (!alive.has(element.animal)) element.remove();
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
        animal.element.animal = animal;
        this.flightLayer.appendChild(animal.element);
      }
      const position = this.walkers.position(animal);
      animal.element.style.left = `${position.x * 100}%`;
      animal.element.style.bottom = `${position.y + 0.25}em`;
      animal.element.style.transform = `translateX(-50%) rotate(${position.walking ? Math.sin(animal.age * 12) * 5 : 0}deg)`;
    }
  }
}
