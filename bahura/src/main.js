// Steps 1 to 4 of SPEC.md: draws the shoals, plays them from the keyboard and
// the pointer, changes the terrain by playing and by time, and holds the
// Audition panel.

import { generateBoard, neighbours } from './board.js';
import { unit } from './hash.js';
import { view, centre, outline } from './shape.js';
import { contact } from './contact.js';
import { createClock } from './clock.js';
import { createVoice } from './voice.js';
import { habitat } from '../data/habitats.js';
import { ENVELOPES, scriptOf } from '../data/envelopes.js';
import { SYMPATHY } from '../data/voice.js';
import { CONTACT, TICK, SPEEDS } from '../data/rates.js';
import { SATURATION, TEXTURES } from '../data/look.js';
import { TUNINGS, REGISTERS, WINDOW, frequency, drawSettings } from '../data/tuning.js';

const SVG = 'http://www.w3.org/2000/svg';
const $ = id => document.getElementById(id);
const boardEl = $('board'), readout = $('readout');
const voice = createVoice();
const params = new URLSearchParams(location.search);

let board = null;
let settings = null;
let pinned = {};             // Audition choices that override what the seed drew
const shapes = new Map();    // key character -> its outline element
const sounding = new Map();  // key character -> { releases, marks }
let sympathy = SYMPATHY.initial;
let last = null;             // the last key struck, for the beat readout
let clock = null;            // terrain time for this board
let speed = SPEEDS[0];       // the Audition panel's multiplier on the contact chance

// A narrow upright screen has no keyboard under it, so the board is turned to run down it.
const narrow = matchMedia('(orientation: portrait) and (max-width: 700px)');

const svg = (name, attrs = {}) => {
  const el = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};
// Shading shared by every shoal, after Ombak Lock's layered radial gradients:
// a soft highlight up and to the left, and a darkening down and to the right,
// so each shoal reads as a low boss. Both sit over the habitat's flat colour.
// The grain is generated noise, standing in until photographed textures exist.
function defs() {
  const el = svg('defs');
  const gradient = (id, cx, cy, r, stops) => {
    const g = svg('radialGradient', { id, cx, cy, r });
    for (const [offset, color, opacity] of stops) g.append(svg('stop', { offset, 'stop-color': color, 'stop-opacity': opacity }));
    el.append(g);
  };
  gradient('boss', '0.36', '0.28', '0.6', [['0', '#fff', 0.42], ['0.55', '#fff', 0.08], ['1', '#fff', 0]]);
  gradient('depth', '0.62', '0.78', '1.05', [['0', '#1b2440', 0], ['0.55', '#1b2440', 0.06], ['1', '#1b2440', 0.34]]);
  const grain = svg('filter', { id: 'grain', x: 0, y: 0, width: 1, height: 1 });
  grain.append(
    svg('feTurbulence', { type: 'fractalNoise', baseFrequency: 9, numOctaves: 3, seed: board.seed % 997 }),
    svg('feColorMatrix', { type: 'matrix', values: '0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.9 0.9 0.9 0 -0.95' }),
  );
  el.append(grain);
  for (const [id, texture] of Object.entries(TEXTURES)) {
    const pattern = svg('pattern', { id: `texture-${id}`, patternUnits: 'userSpaceOnUse', width: texture.size, height: texture.size });
    pattern.append(svg('image', { href: texture.src, width: texture.size, height: texture.size, preserveAspectRatio: 'xMidYMid slice' }));
    el.append(pattern);
  }
  return el;
}

const hzOf = key => frequency(key, board.offsets, settings);

// The address bar holds the seed and any pinned choice, so a board can be returned to.
function writeAddress() {
  history.replaceState(null, '', `?${new URLSearchParams({ seed: board.seed, ...pinned })}`);
}

function load(seed) {
  board = generateBoard(seed);
  clock = createClock(board);
  settings = { ...drawSettings(seed, unit), ...pinned };
  last = null;
  readout.textContent = 'No key struck yet.';
  draw();
  showTide();
  showSettings();
  writeAddress();
}

function draw() {
  for (const { releases } of sounding.values()) releases.forEach(release => release());
  sounding.clear();
  shapes.clear();
  const upright = narrow.matches, size = view(upright);
  boardEl.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
  boardEl.classList.toggle('upright', upright);
  const land = svg('g'), shade = svg('g', { class: 'shade' }), text = svg('g', { class: 'labels' }), marks = svg('g', { id: 'marks' });
  for (const key of board.keys) {
    const at = centre(key, board.seed, upright);
    const shape = svg('path', { d: outline(key, board.seed, at), class: 'key', role: 'button', tabindex: 0 });
    shape.dataset.char = key.char;
    land.append(shape);
    // Over the flat colour: a photographed texture where the habitat has one,
    // then the highlight and the darkening.
    const d = shape.getAttribute('d');
    shape.textureLayer = svg('path', { d, class: 'texture' });
    shade.append(shape.textureLayer, svg('path', { d, fill: 'url(#depth)' }), svg('path', { d, fill: 'url(#boss)' }));
    shapes.set(key.char, shape);
    const label = (cls, y, value = '') => {
      const el = svg('text', { class: cls, x: at.x, y: at.y + y });
      el.textContent = value;
      text.append(el);
      return el;
    };
    shape.glyphLabel = label('glyph', 0.1);
    shape.charLabel = label('char', 0.36, key.char);
    shape.hzLabel = label('hz', -0.3);
    // Shown while a key has changed and has not been played since: a ring
    // with a dot, so the state does not rest on colour.
    shape.badge = svg('g', { class: 'changed', transform: `translate(${at.x + 0.3} ${at.y - 0.3})` });
    shape.badge.append(svg('circle', { r: 0.1 }), svg('circle', { r: 0.035, class: 'dot' }));
    shape.badge.style.display = 'none';
    marks.append(shape.badge);
    paint(key);
  }
  // Wider than the view box, because an upright board is letterboxed inside its element.
  const grain = svg('rect', { class: 'grain', x: -size.width, y: -size.height, width: size.width * 3, height: size.height * 3, filter: 'url(#grain)' });
  const coloured = svg('g', { class: 'coloured' });
  coloured.append(land, shade, grain, text);
  boardEl.replaceChildren(defs(), coloured, marks);
  $('seed').textContent = `Board ${board.seed}`;
  label();
}

// A key's colours and glyph follow its habitat, which contact can change.
function paint(key) {
  const shape = shapes.get(key.char), kind = habitat(key.habitat);
  shape.setAttribute('fill', kind.bg);
  const textured = key.habitat in TEXTURES;
  shape.textureLayer.setAttribute('fill', textured ? `url(#texture-${key.habitat})` : 'none');
  shape.glyphLabel.textContent = key.glyph;
  for (const el of [shape.glyphLabel, shape.charLabel, shape.hzLabel]) el.setAttribute('fill', kind.fg);
  shape.badge.style.display = key.changed ? '' : 'none';
}

// Frequencies depend on the settings, so the labels are rewritten when one changes.
function label() {
  for (const key of board.keys) {
    const shape = shapes.get(key.char), hz = hzOf(key);
    shape.hzLabel.textContent = hz.toFixed(1);
    shape.setAttribute('aria-label', `${key.char}: ${habitat(key.habitat).name}, ${ENVELOPES[scriptOf(key.glyph)].label}, ${hz.toFixed(1)} hertz${key.changed ? ', changed' : ''}`);
  }
}

function press(char) {
  const key = board.keys.find(k => k.char === char);
  if (!key || sounding.has(char)) return;
  const hz = hzOf(key), kind = habitat(key.habitat), envelope = ENVELOPES[scriptOf(key.glyph)];
  // The struck outline is redrawn on top, so a neighbour's overlap cannot hide it.
  const outlineOf = (c, cls) => {
    const mark = svg('path', { d: shapes.get(c).getAttribute('d'), class: cls });
    $('marks').append(mark);
    return mark;
  };
  const releases = [voice.start(hz, kind, envelope)], marks = [outlineOf(char, 'mark')];
  // Neighbours of the same habitat ring with it, each at its own pitch and
  // envelope, and stop when this key does.
  const ringing = sympathy > 0 ? neighbours(board, key).filter(n => n.habitat === key.habitat) : [];
  for (const n of ringing) {
    releases.push(voice.start(hzOf(n), kind, ENVELOPES[scriptOf(n.glyph)], sympathy, SYMPATHY.attack));
    marks.push(outlineOf(n.char, 'mark sympathetic'));
  }
  sounding.set(char, { releases, marks });

  let text = `${key.char}  ${kind.name}  ${hz.toFixed(2)} Hz  ${envelope.label}: attack ${envelope.attack} s, sustain ${envelope.sustain}, ${envelope.release == null ? 'rings out' : `release ${envelope.release} s`}`;
  if (last && last.char !== key.char) {
    const gap = Math.abs(hz - hzOf(last));
    if (gap < 20) text += `   ${gap.toFixed(2)} Hz from ${last.char}`;
  }
  if (ringing.length) text += `   rings with ${ringing.map(n => `${n.char} (${n.row === key.row ? `${Math.abs(hz - hzOf(n)).toFixed(2)} Hz` : 'other row'})`).join(', ')}`;
  // Playing a key clears its own changed mark, then gives it and its
  // neighbours one contact opportunity each.
  key.changed = false;
  paint(key);
  const changes = speed.factor
    ? contact(board, [key, ...neighbours(board, key)], { ...CONTACT, chance: CONTACT.chance * speed.factor })
    : [];
  readout.textContent = text + apply(changes);
  last = key;
}

// Shows changes on the board and returns a line naming them. A key that is
// sounding keeps the note it was played with until it is lifted.
function apply(changes) {
  if (!changes.length) return '';
  for (const { key } of changes) { key.changed = true; paint(key); }
  label();
  return changes.map(c => `   ${c.key.char} changed${c.cause === 'contact' ? '' : ` by ${c.cause}`}: ${habitat(c.from).name} to ${habitat(c.to).name}`).join('');
}

function showTide() {
  $('tide').textContent = clock.tideIn ? 'Tide in' : 'Tide out';
  boardEl.classList.toggle('tide-in', clock.tideIn);
}

// Terrain time. One timer moves the board's clock on; the Audition speed
// multiplies how much terrain time each real tick is worth. A hidden page
// stands still.
setInterval(() => {
  if (document.hidden || !speed.factor) return;
  const line = apply(clock.advance(TICK.seconds * speed.factor));
  showTide();
  if (line) readout.textContent = `Terrain:${line}`;
}, TICK.seconds * 1000);

function lift(char) {
  const note = sounding.get(char);
  if (!note) return;
  note.releases.forEach(release => release());
  note.marks.forEach(mark => mark.remove());
  sounding.delete(char);
}
const liftAll = () => [...sounding.keys()].forEach(lift);

// Keyboard. A held key does not repeat, and shortcuts pass through.
const typing = target => target instanceof HTMLSelectElement
  || (target instanceof HTMLInputElement && target.type !== 'range' && target.type !== 'checkbox');
window.addEventListener('keydown', e => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
  // Enter or Space plays a focused shoal, for keyboard-only use of the on-screen keys.
  const focused = e.target.closest?.('.key');
  const char = focused && (e.key === 'Enter' || e.key === ' ') ? focused.dataset.char : e.key.toLowerCase();
  if (!shapes.has(char)) return;
  e.preventDefault();
  press(char);
});
window.addEventListener('keyup', e => {
  const focused = e.target.closest?.('.key');
  lift(focused && (e.key === 'Enter' || e.key === ' ') ? focused.dataset.char : e.key.toLowerCase());
});
window.addEventListener('blur', liftAll);

// Pointer. Each finger plays the shoal it lands on and stops it on leaving.
boardEl.addEventListener('pointerdown', e => {
  const el = e.target.closest('.key');
  if (!el) return;
  e.preventDefault();
  press(el.dataset.char);
});
for (const type of ['pointerup', 'pointercancel', 'pointerout']) {
  boardEl.addEventListener(type, e => {
    const el = e.target.closest?.('.key');
    if (el) lift(el.dataset.char);
  });
}

narrow.addEventListener('change', draw);

$('reshuffle').addEventListener('click', () => load(Math.floor(Math.random() * 1e6)));
$('volume').addEventListener('input', e => voice.setLevel(Number(e.target.value)));

// Audition panel. A reshuffle draws the tuning, registers, and beat band from
// the seed; choosing one here pins it across reshuffles until Unpin.
for (const item of TUNINGS) $('tuning').add(new Option(item.label, item.id));
for (const item of REGISTERS) $('registers').add(new Option(item.label, item.id));
const windowEl = $('window');
Object.assign(windowEl, { min: WINDOW.min, max: WINDOW.max, step: WINDOW.step });

function showSettings() {
  $('tuning').value = settings.tuning;
  $('registers').value = settings.registers;
  windowEl.value = settings.window;
  $('window-value').textContent = `${settings.window} Hz`;
  const names = Object.keys(pinned);
  $('pinned').textContent = names.length ? `Pinned: ${names.join(', ')}. Reshuffle keeps these.` : 'Reshuffle draws all three.';
  $('unpin').disabled = !names.length;
}
function pin(name, value) {
  pinned[name] = value;
  settings[name] = value;
  liftAll();
  label();
  showSettings();
  writeAddress();
}
$('tuning').addEventListener('change', e => pin('tuning', e.target.value));
$('registers').addEventListener('change', e => pin('registers', e.target.value));
windowEl.addEventListener('input', e => pin('window', Number(e.target.value)));
$('unpin').addEventListener('click', () => { pinned = {}; load(board.seed); });
const sympathyEl = $('sympathy');
Object.assign(sympathyEl, { min: SYMPATHY.min, max: SYMPATHY.max, step: SYMPATHY.step, value: sympathy });
const showSympathy = () => { $('sympathy-value').textContent = sympathy ? `${Math.round(sympathy * 100)}%` : 'off'; };
showSympathy();
sympathyEl.addEventListener('input', e => { sympathy = Number(e.target.value); liftAll(); showSympathy(); });
for (const item of SPEEDS) $('speed').add(new Option(item.label, item.id));
$('speed').addEventListener('change', e => { speed = SPEEDS.find(s => s.id === e.target.value); });
const event = changes => { const line = apply(changes); showTide(); readout.textContent = line ? `Terrain:${line}` : 'Nothing changed.'; };
$('turn-tide').addEventListener('click', () => event(clock.turnTide()));
$('shake').addEventListener('click', () => event(clock.shake()));
const saturationEl = $('saturation');
Object.assign(saturationEl, { min: SATURATION.min, max: SATURATION.max, step: SATURATION.step, value: SATURATION.initial });
const showSaturation = () => {
  boardEl.style.setProperty('--saturation', saturationEl.value);
  $('saturation-value').textContent = `${Math.round(saturationEl.value * 100)}%`;
};
showSaturation();
saturationEl.addEventListener('input', showSaturation);
$('show-hz').addEventListener('change', e => boardEl.classList.toggle('show-hz', e.target.checked));

// Choices in the address are pinned, if they name something that exists.
if (TUNINGS.some(t => t.id === params.get('tuning'))) pinned.tuning = params.get('tuning');
if (REGISTERS.some(r => r.id === params.get('registers'))) pinned.registers = params.get('registers');
const band = Number(params.get('window'));
if (params.has('window') && band >= WINDOW.min && band <= WINDOW.max) pinned.window = band;

const asked = Number(params.get('seed'));
load(params.has('seed') && Number.isInteger(asked) ? asked : 5);
