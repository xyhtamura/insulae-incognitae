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
    this.translationEnabled = true;
    this.ecologyEnabled = true;
    this.stepInterval = 2;
    this.stepTime = 0;
    this.birds = [];
    this.flightLayer = flightLayer;
    this.stats = { steps: 0, translations: 0, biomeChanges: 0, birdsReleased: 0 };

    this._render();
    // Controls keep their native keys; typing belongs to this surface.
    this.container.addEventListener('keydown', (e) => this._onKey(e));
  }

  setPlaying(playing) { this.playing = playing; }

  advance(seconds) {
    if (!this.playing || seconds <= 0) return;
    this.stepTime += seconds;
    while (this.stepTime >= this.stepInterval) {
      this.stepTime -= this.stepInterval;
      this._step();
    }
    this._fly(seconds);
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
  }

  _visibleRows() {
    const size = parseFloat(getComputedStyle(this.container).fontSize);
    return Math.min(this.rows, this.container.clientHeight / size);
  }

  _releaseBird({ x, distance }) {
    if (!this.flightLayer || this.birds.length >= 8 || distance + 1 >= this._visibleRows()) return;
    const element = document.createElement('span');
    element.className = 'bird';
    element.textContent = '鳥';
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
    const mapping = LETTER_TO_BIOME[ch];
    if (!mapping) return;
    e.preventDefault();

    const glyphs = mapping.glyphs;
    const char = glyphs[Math.floor(Math.random() * glyphs.length)];
    const biome = mapping.biome;

    const classes = this._classesForBiome(biome);
    this._typeCell({ char, className: classes });
  }

  _classesForBiome(biome) {
    const list = [biome];
    if (LAND_BIOMES.has(biome)) list.push('tile'); // padded background
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
      if (cell.mutation) span.dataset.mutation = cell.mutation;
      p.appendChild(span);
      p.cellElements.push(span);
    }
    return p;
  }

  _render() {
    const frag = document.createDocumentFragment();
    for (const line of this.completed) {
      const p = this._makeParagraph(line.cells);
      p.className = 'completed-line';
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
  }
}
