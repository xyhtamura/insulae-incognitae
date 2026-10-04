// Completed lines scroll above a fixed, editable typing line.
class TyperEngine {
  constructor({ container, cols = 30, rows = 30 }) {
    this.container = container;
    this.cols = cols;
    this.rows = rows;

    this.line = [];
    this.completed = [];
    this.playing = false;

    this._render();
    // Controls keep their native keys; typing belongs to this surface.
    this.container.addEventListener('keydown', (e) => this._onKey(e));
  }

  setPlaying(playing) { this.playing = playing; }

  advance(seconds) {
    if (!this.playing || seconds <= 0) return;
    for (const line of this.completed) {
      line.distance += seconds; // One line height per second.
      line.element.style.bottom = `${line.distance}em`;
    }
    while (this.completed[0]?.distance >= this.rows) {
      this.completed.shift().element.remove();
    }
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
    this.completed = this.completed.filter(line => line.distance < this.rows);
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
    for (const cell of cells) {
      const span = document.createElement('span');
      span.className = cell.className || 'unknown';
      span.textContent = cell.char;
      p.appendChild(span);
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
  }
}
