// Step 1 of SPEC.md: a playable board with no mutation. Draws the shoals, plays
// them from the keyboard and the pointer, and holds the Audition panel.

import { generateBoard } from './board.js';
import { unit } from './hash.js';
import { VIEW, centre, outline, ripples } from './shape.js';
import { createVoice } from './voice.js';
import { habitat } from '../data/habitats.js';
import { ENVELOPES, scriptOf } from '../data/envelopes.js';
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
const sounding = new Map();  // key character -> { release, mark }
let last = null;             // the last key struck, for the beat readout

const svg = (name, attrs = {}) => {
  const el = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};
const hzOf = key => frequency(key, board.offsets, settings);

// The address bar holds the seed and any pinned choice, so a board can be returned to.
function writeAddress() {
  history.replaceState(null, '', `?${new URLSearchParams({ seed: board.seed, ...pinned })}`);
}

function load(seed) {
  board = generateBoard(seed);
  settings = { ...drawSettings(seed, unit), ...pinned };
  last = null;
  readout.textContent = 'No key struck yet.';
  draw();
  showSettings();
  writeAddress();
}

function draw() {
  for (const { release } of sounding.values()) release();
  sounding.clear();
  shapes.clear();
  boardEl.setAttribute('viewBox', `0 0 ${VIEW.width} ${VIEW.height}`);
  const water = svg('g', { class: 'water' }), land = svg('g'), text = svg('g', { class: 'labels' }), marks = svg('g', { id: 'marks' });
  for (const d of ripples(board.seed)) water.append(svg('path', { d }));
  for (const key of board.keys) {
    const kind = habitat(key.habitat), at = centre(key, board.seed);
    const shape = svg('path', { d: outline(key, board.seed, at), class: 'key', fill: kind.bg, role: 'button', tabindex: 0 });
    shape.dataset.char = key.char;
    land.append(shape);
    shapes.set(key.char, shape);
    const label = (cls, y, value) => {
      const el = svg('text', { class: cls, x: at.x, y: at.y + y, fill: kind.fg });
      el.textContent = value;
      text.append(el);
      return el;
    };
    label('glyph', 0.1, key.glyph);
    label('char', 0.36, key.char);
    shape.hzLabel = label('hz', -0.3, '');
  }
  boardEl.replaceChildren(water, land, text, marks);
  $('seed').textContent = `Board ${board.seed}`;
  label();
}

// Frequencies depend on the settings, so the labels are rewritten when one changes.
function label() {
  for (const key of board.keys) {
    const shape = shapes.get(key.char), hz = hzOf(key);
    shape.hzLabel.textContent = hz.toFixed(1);
    shape.setAttribute('aria-label', `${key.char}: ${habitat(key.habitat).name}, ${ENVELOPES[scriptOf(key.glyph)].label}, ${hz.toFixed(1)} hertz`);
  }
}

function press(char) {
  const key = board.keys.find(k => k.char === char);
  if (!key || sounding.has(char)) return;
  const hz = hzOf(key), kind = habitat(key.habitat), envelope = ENVELOPES[scriptOf(key.glyph)];
  // The struck outline is redrawn on top, so a neighbour's overlap cannot hide it.
  const mark = svg('path', { d: shapes.get(char).getAttribute('d'), class: 'mark' });
  $('marks').append(mark);
  sounding.set(char, { release: voice.start(hz, kind, envelope), mark });

  let text = `${key.char}  ${kind.name}  ${hz.toFixed(2)} Hz  ${envelope.label}: attack ${envelope.attack} s, sustain ${envelope.sustain}, ${envelope.release == null ? 'rings out' : `release ${envelope.release} s`}`;
  if (last && last.char !== key.char) {
    const gap = Math.abs(hz - hzOf(last));
    if (gap < 20) text += `   ${gap.toFixed(2)} Hz from ${last.char}`;
  }
  readout.textContent = text;
  last = key;
}

function lift(char) {
  const note = sounding.get(char);
  if (!note) return;
  note.release();
  note.mark.remove();
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
$('show-hz').addEventListener('change', e => boardEl.classList.toggle('show-hz', e.target.checked));

// Choices in the address are pinned, if they name something that exists.
if (TUNINGS.some(t => t.id === params.get('tuning'))) pinned.tuning = params.get('tuning');
if (REGISTERS.some(r => r.id === params.get('registers'))) pinned.registers = params.get('registers');
const band = Number(params.get('window'));
if (params.has('window') && band >= WINDOW.min && band <= WINDOW.max) pinned.window = band;

const asked = Number(params.get('seed'));
load(params.has('seed') && Number.isInteger(asked) ? asked : 5);
