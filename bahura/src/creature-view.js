// Draws the creatures and keeps them moving. Each is a word on a coloured
// tag, as Sulat draws its animals, wandering about the shoal it is on and
// rocking as it goes. The rules for who is out and where are in creatures.js;
// this file only draws.
//
// One animation loop runs while anything is out and stops when nothing is.
// The "Creatures move" setting turns the loop off; creatures are then placed
// and stay put. The setting starts from the system's reduced-motion setting
// (src/main.js), so this file does not read that itself.

const SVG = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}) => {
  const made = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) made.setAttribute(k, v);
  return made;
};
const between = (low, high) => low + Math.random() * (high - low);

// `layer()` returns the SVG group to draw in, and `home(creature)` the centre
// of the shoal the creature is on, both asked for afresh because a redraw
// replaces them.
// `moving()` says whether creatures should move at the moment.
export function createCreatureView({ layer, home, moving }) {
  const still = { get matches() { return !moving(); } };
  const shown = new Map();   // creature id -> what is drawn for it
  let frame = 0, last = 0;

  function add(creature) {
    const style = creature.kind.motion, at = home(creature);
    const group = el('g', { class: 'creature arriving' });
    const tag = el('rect', { fill: creature.kind.colour[0], rx: 0.05 });
    const word = el('text', { fill: creature.kind.colour[1] });
    word.textContent = creature.kind.glyph;
    group.append(tag, word);
    layer().append(group);
    // The tag is sized to the word once it has been laid out.
    const width = (word.getComputedTextLength?.() || creature.kind.glyph.length * 0.2) + 0.1;
    tag.setAttribute('x', -width / 2); tag.setAttribute('width', width);
    tag.setAttribute('y', -0.15); tag.setAttribute('height', 0.3);
    const view = { creature, group, style, x: at.x, y: at.y - 0.28, toX: at.x, toY: at.y - 0.28, wait: 0, age: Math.random() * 10, moving: false, gone: false };
    shown.set(creature.id, view);
    draw(view);
    // Leaving the class a frame later lets the fade-in run.
    requestAnimationFrame(() => group.classList.remove('arriving'));
    run();
    return view;
  }

  // Picks the next point to head for: somewhere within the creature's range
  // of the top of its shoal. A scuttler keeps to a line.
  function wander(view) {
    const at = home(view.creature), r = view.style.range;
    view.toX = at.x + between(-r, r);
    view.toY = at.y - 0.28 + (view.style.sideways ? between(-r, r) * 0.2 : between(-r, r) * 0.6);
    view.wait = between(...view.style.rests);
  }

  function draw(view) {
    const s = view.style, t = view.age;
    const rock = view.moving ? Math.sin(t * 12) * s.rock : 0;
    const sway = s.sway ? Math.sin(t * 1.3) * s.sway : 0;
    const bob = s.bob ? Math.sin(t * 2.2) * s.bob : 0;
    // Bubbles climb and start again from the bottom.
    const rise = s.rise ? -((t * 0.25) % 1) * s.rise : 0;
    const pulse = s.pulse ? 1 + Math.sin(t * 2.2) * s.pulse : 1;
    view.group.setAttribute('transform', `translate(${view.x.toFixed(3)} ${(view.y + bob + rise).toFixed(3)}) rotate(${(rock + sway).toFixed(2)}) scale(${(1 / pulse).toFixed(3)} ${pulse.toFixed(3)})`);
    if (s.rise) view.group.style.opacity = view.group.classList.contains('arriving') || view.gone ? '' : String(1 - ((t * 0.25) % 1) * 0.7);
  }

  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    for (const view of shown.values()) {
      view.age += dt;
      const dx = view.toX - view.x, dy = view.toY - view.y, far = Math.hypot(dx, dy);
      view.moving = far > 0.01;
      if (view.moving) {
        const step = Math.min(far, view.style.speed * dt);
        view.x += dx / far * step;
        view.y += dy / far * step;
      } else if ((view.wait -= dt) <= 0 && !view.gone) wander(view);
      draw(view);
    }
    frame = shown.size && !still.matches ? requestAnimationFrame(tick) : 0;
  }
  function run() {
    if (frame || still.matches) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  // The creature has moved to another shoal: head there now.
  function go(creature) {
    const view = shown.get(creature.id);
    if (!view) return;
    const at = home(creature);
    view.toX = at.x; view.toY = at.y - 0.28;
    view.wait = between(...view.style.rests);
    if (still.matches) { view.x = view.toX; view.y = view.toY; draw(view); }
  }

  function flash(creature) {
    const group = shown.get(creature.id)?.group;
    if (!group) return;
    group.classList.remove('sounding');
    void group.getBoundingClientRect();
    group.classList.add('sounding');
  }

  function remove(creature) {
    const view = shown.get(creature.id);
    if (!view) return;
    view.gone = true;
    view.group.style.opacity = '';
    view.group.classList.add('leaving');
    // Dropped from the loop when the fade is over, or after a second if the
    // page is hidden and the fade never reports.
    const drop = () => { view.group.remove(); shown.delete(creature.id); };
    view.group.addEventListener('transitionend', drop, { once: true });
    setTimeout(drop, 1000);
  }

  function clear() {
    for (const view of shown.values()) view.group.remove();
    shown.clear();
  }

  // Called when the control changes: start the loop, or put each creature
  // where it was heading and leave it there.
  function refresh() {
    if (!still.matches) { run(); return; }
    for (const view of shown.values()) { view.x = view.toX; view.y = view.toY; view.moving = false; draw(view); }
  }

  return { add, go, flash, remove, clear, refresh, has: id => shown.has(id) && !shown.get(id).gone };
}
