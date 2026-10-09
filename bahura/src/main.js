// Step 1 of SPEC.md: a playable board with no mutation. Draws the keys, strikes
// them from the keyboard and the pointer, and holds the Audition panel.

import { generateBoard, ROWS } from './board.js';
import { createVoice } from './voice.js';
import { habitat } from '../data/habitats.js';
import { TUNINGS, REGISTERS, WINDOW, frequency } from '../data/tuning.js';

const $ = id => document.getElementById(id);
const boardEl = $('board'), readout = $('readout');
const voice = createVoice();
const params = new URLSearchParams(location.search);

const settings = {
  tuning: params.get('tuning') ?? TUNINGS[0].id,
  registers: params.get('registers') ?? REGISTERS[0].id,
  window: Number(params.get('window') ?? WINDOW.initial),
};
if (!TUNINGS.some(t => t.id === settings.tuning)) settings.tuning = TUNINGS[0].id;
if (!REGISTERS.some(r => r.id === settings.registers)) settings.registers = REGISTERS[0].id;
if (!(settings.window >= WINDOW.min && settings.window <= WINDOW.max)) settings.window = WINDOW.initial;

let board = null;
const buttons = new Map();   // key character -> button
let last = null;             // the last key struck, for the beat readout

// The address bar always holds what is on screen, so a board can be returned to.
function writeAddress() {
  const next = new URLSearchParams({ seed: board.seed, tuning: settings.tuning, registers: settings.registers, window: settings.window });
  history.replaceState(null, '', `?${next}`);
}

const hzOf = key => frequency(key, board.offsets, settings);

function draw() {
  boardEl.replaceChildren();
  buttons.clear();
  ROWS.forEach((chars, row) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    board.keys.filter(k => k.row === row).forEach(key => {
      const kind = habitat(key.habitat), el = document.createElement('button');
      el.type = 'button';
      el.className = 'key';
      el.style.background = kind.bg;
      el.style.color = kind.fg;
      el.dataset.char = key.char;
      el.innerHTML = '<span class="char"></span><span class="glyph"></span><span class="hz"></span>';
      el.children[0].textContent = key.char;
      el.children[1].textContent = key.glyph;
      rowEl.append(el);
      buttons.set(key.char, el);
    });
    boardEl.append(rowEl);
  });
  label();
  $('seed').textContent = `Board ${board.seed}`;
  writeAddress();
}

// Frequencies depend on the Audition settings, so the labels are rewritten when one changes.
function label() {
  for (const key of board.keys) {
    const el = buttons.get(key.char), hz = hzOf(key);
    el.children[2].textContent = hz.toFixed(1);
    el.setAttribute('aria-label', `${key.char}: ${habitat(key.habitat).name}, ${hz.toFixed(1)} hertz`);
  }
}

function strike(char) {
  const key = board.keys.find(k => k.char === char);
  if (!key) return;
  const hz = hzOf(key), kind = habitat(key.habitat);
  voice.strike(hz, kind);
  buttons.get(char).classList.add('down');
  let text = `${key.char}  ${kind.name}  ${hz.toFixed(2)} Hz`;
  if (last && last.char !== key.char) {
    const gap = Math.abs(hz - hzOf(last));
    if (gap < 20) text += `   ${gap.toFixed(2)} Hz from ${last.char}`;
  }
  readout.textContent = text;
  last = key;
}
const release = char => buttons.get(char)?.classList.remove('down');

function reshuffle() {
  board = generateBoard(Math.floor(Math.random() * 1e6));
  last = null;
  readout.textContent = 'No key struck yet.';
  draw();
}

// Keyboard. A held key does not repeat, and shortcuts pass through.
window.addEventListener('keydown', e => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target instanceof HTMLSelectElement || (e.target instanceof HTMLInputElement && e.target.type !== 'range' && e.target.type !== 'checkbox')) return;
  const char = e.key.toLowerCase();
  if (!buttons.has(char)) return;
  e.preventDefault();
  strike(char);
});
window.addEventListener('keyup', e => release(e.key.toLowerCase()));
window.addEventListener('blur', () => buttons.forEach(el => el.classList.remove('down')));

// Pointer. Each finger strikes the key it lands on.
boardEl.addEventListener('pointerdown', e => {
  const el = e.target.closest('.key');
  if (!el) return;
  e.preventDefault();
  strike(el.dataset.char);
});
for (const type of ['pointerup', 'pointercancel', 'pointerout']) {
  boardEl.addEventListener(type, e => {
    const el = e.target.closest?.('.key');
    if (el) release(el.dataset.char);
  });
}
// A focused key is struck with Enter or Space, for keyboard-only use of the on-screen keys.
boardEl.addEventListener('click', e => {
  const el = e.target.closest('.key');
  if (el && e.detail === 0) { strike(el.dataset.char); release(el.dataset.char); }
});

$('reshuffle').addEventListener('click', reshuffle);
$('volume').addEventListener('input', e => voice.setLevel(Number(e.target.value)));

// Audition panel.
function fill(select, list, current) {
  for (const item of list) select.add(new Option(item.label, item.id, false, item.id === current));
}
fill($('tuning'), TUNINGS, settings.tuning);
fill($('registers'), REGISTERS, settings.registers);
const windowEl = $('window');
Object.assign(windowEl, { min: WINDOW.min, max: WINDOW.max, step: WINDOW.step, value: settings.window });
const showWindow = () => { $('window-value').textContent = `${settings.window} Hz`; };
showWindow();

function changed() { label(); writeAddress(); }
$('tuning').addEventListener('change', e => { settings.tuning = e.target.value; changed(); });
$('registers').addEventListener('change', e => { settings.registers = e.target.value; changed(); });
windowEl.addEventListener('input', e => { settings.window = Number(e.target.value); showWindow(); changed(); });
$('show-hz').addEventListener('change', e => boardEl.classList.toggle('show-hz', e.target.checked));

const asked = Number(params.get('seed'));
board = generateBoard(Number.isInteger(asked) && params.has('seed') ? asked : 5);
draw();
