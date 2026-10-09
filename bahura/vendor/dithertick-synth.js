// VENDORED COPY. Do not edit: change the source and copy it again.
// Source: F:/xyh/dithertick/synth.js (workspace path dithertick/synth.js)
// Source SHA-256: a475ef8bec66db4a609d09009c545366a730e3228abfa868ef19e5a27143bd18
// Copied: 2026-10-09. The source folder is not under version control, so there is no commit to name.
// Everything below the line of dashes is the source file, byte for byte.
// Re-vendor and drift check: see DEPENDENCIES.md at the workspace root, and scripts/check_creatures.mjs here.
// ---------------------------------------------------------------------------
export const FAMILY_COLOURS = {
  shard: "#00a6c2",
  foil: "#e84a98",
  lattice: "#91b51a",
  fizz: "#e57d2c",
  handshake: "#477ed8",
  latency: "#b58d08",
  tear: "#df4d58",
  chroma: "#8f55d4",
  underflow: "#4a4f58"
};

export const FAMILY_LIST = Object.keys(FAMILY_COLOURS);
const FAMILY_GAIN = {
  shard: 1.12,
  foil: 1,
  lattice: 0.68,
  fizz: 0.92,
  handshake: 0.78,
  latency: 1.72,
  tear: 0.9,
  chroma: 0.64,
  underflow: 0.52
};
const TAU = Math.PI * 2;

function hashSeed(value) {
  let h = 2166136261 >>> 0;
  const text = String(value);
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const randRange = (random, min, max) => lerp(min, max, random());

function weightedFamily(random, previous, memory, bias = null, forbidden = null, pool = FAMILY_LIST) {
  const candidates = pool.filter((family) => family !== forbidden);
  if (!candidates.length) return null;
  const weights = candidates.map((family) => {
    let weight = 1;
    if (family === previous) weight *= 1 - memory * 0.93;
    if (bias === family) weight *= 1.55;
    return weight;
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let needle = random() * total;
  if (total <= 0) return candidates[Math.min(candidates.length - 1, Math.floor(needle * candidates.length))];
  for (let i = 0; i < candidates.length; i++) {
    needle -= weights[i];
    if (needle <= 0) return candidates[i];
  }
  return candidates.at(-1);
}

// Per-note-class overrides: {family, tail, brightness} keyed by MIDI note
// number. A class is a voice in the kit, so a locked family beats the muted
// pool: muting is a pool control, locking is an assignment.
function classFor(settings, note) {
  const table = settings.classes;
  if (!table) return null;
  const entry = table[note] ?? table[String(note)];
  if (!entry) return null;
  return {
    family: FAMILY_COLOURS[entry.family] ? entry.family : null,
    tail: Number.isFinite(entry.tail) ? clamp(entry.tail, 0.15, 6) : 1,
    brightness: Number.isFinite(entry.brightness) ? clamp(entry.brightness, -1, 1) : 0
  };
}

function activeFamilies(settings) {
  const requested = Array.isArray(settings.families)
    ? settings.families.filter((family) => FAMILY_COLOURS[family])
    : null;
  return requested && requested.length ? requested : FAMILY_LIST;
}

// Displaces onsets off the MIDI grid before any gap is measured, so tail fitting
// and lead spans see the slipped time. Own RNG stream: the same seed keeps its
// families and spectra when slip changes.
function applySlip(ordered, settings) {
  const amount = settings.slip ?? 0;
  if (amount <= 0 || !ordered.length) return;
  const slipRandom = mulberry32(hashSeed(`${settings.seed}:slip`));
  const maxOffset = amount * 0.055;
  const times = ordered.map((note) => note.time);
  let previousTime = -Infinity;
  let earliest = Infinity;
  for (let i = 0; i < ordered.length; i++) {
    const before = i > 0 ? times[i] - times[i - 1] : 0.5;
    const after = i < ordered.length - 1 ? times[i + 1] - times[i] : 0.5;
    const room = Math.min(before, after) * 0.35;
    const weight = 1 - ordered[i].velocity * 0.55;
    const offset = randRange(slipRandom, -1, 1) * Math.min(maxOffset * weight, room);
    ordered[i].time = Math.max(previousTime + 0.004, times[i] + offset);
    previousTime = ordered[i].time;
    earliest = Math.min(earliest, ordered[i].time);
  }
  if (earliest < 0) ordered.forEach((note) => { note.time -= earliest; });
}

export function buildPlan(notes, settings, forcedFamily = null) {
  if (!notes.length) return { events: [], preRoll: 0, duration: 0.5, seed: settings.seed };
  const random = mulberry32(hashSeed(settings.seed));
  const ordered = notes
    .map((note) => ({ ...note }))
    .sort((a, b) => a.time - b.time || a.note - b.note);
  const origin = ordered[0].time;
  ordered.forEach((note) => { note.time -= origin; });
  applySlip(ordered, settings);
  const pool = forcedFamily ? FAMILY_LIST : activeFamilies(settings);

  const events = [];
  let previousFamily = null;
  let previousBrightness = settings.brightness;
  let maxLead = 0;
  for (let i = 0; i < ordered.length; i++) {
    const note = ordered[i];
    const previous = ordered[i - 1];
    const next = ordered[i + 1];
    const gapBefore = previous ? Math.max(0, note.time - previous.time) : 0.5;
    const gapAfter = next ? Math.max(0.012, next.time - note.time) : Math.max(0.35, note.duration);
    const density = clamp(1 - Math.min(gapBefore, gapAfter) / 0.38, 0, 1);
    const noteTilt = clamp((note.note - 36) / 40, 0, 1);
    const openHat = note.note === 46 || note.duration > 0.22;
    const pedalHat = note.note === 44;
    const midiOpenness = openHat ? 1 : pedalHat ? 0.46 : clamp(note.duration / 0.3, 0, 0.38);
    const openness = clamp(midiOpenness * 0.78 + settings.openness * 0.64, 0, 1);
    const phraseDrift = Math.sin((i / Math.max(1, ordered.length - 1)) * Math.PI * 2 + random() * 0.4) * settings.drift;
    const noteClass = classFor(settings, note.note);
    const localBrightness = clamp(
      settings.brightness * 0.68 + noteTilt * 0.3 + phraseDrift * 0.12 + randRange(random, -0.12, 0.12) * settings.colour +
        (noteClass?.brightness ?? 0) * 0.5,
      0.04,
      1
    );
    const contrast = Math.abs(localBrightness - previousBrightness);
    const bias = density > 0.72 ? "lattice" : openHat ? "foil" : note.velocity > 0.82 ? "shard" : null;
    // Drawn even when the class locks a family, so the RNG stream keeps its
    // shape: locking one class must not respell every event after it.
    const drawnFamily = weightedFamily(random, previousFamily, settings.memory, bias, null, pool);
    const family = forcedFamily || noteClass?.family || drawnFamily;
    const forecastPriority = clamp(
      settings.foreknowledge *
      (0.5 + note.velocity * 0.35 + contrast * 0.35 + (next && next.velocity > note.velocity + 0.18 ? 0.22 : 0)),
      0,
      0.96
    );
    const hasLead = gapBefore > 0.025 && random() < forecastPriority;
    const leadJitter = randRange(
      random,
      Math.max(0.12, 1 - settings.leadJitter * 0.82),
      1 + settings.leadJitter * 1.28
    );
    const leadDuration = hasLead
      ? Math.min(gapBefore * 0.82, (settings.lead / 1000) * leadJitter)
      : 0;
    maxLead = Math.max(maxLead, leadDuration);

    const closedTail = randRange(random, 0.022, 0.105);
    const openTail = randRange(random, 0.19, 0.72);
    const tailJitter = randRange(
      random,
      Math.max(0.16, 1 - settings.tailJitter * 0.72),
      1 + settings.tailJitter * 1.5
    );
    const naturalTail = lerp(closedTail, openTail, openness) * settings.tailScale * tailJitter;
    const fitted = lerp(naturalTail, Math.min(naturalTail, gapAfter * randRange(random, 0.5, 0.88)), settings.gapFit);
    // Applied after gap fitting, so a class asking for a long tail is allowed to
    // ring past the next onset. Lower gap fitting if that is not wanted.
    const tail = clamp(
      fitted * lerp(0.72, 1.48, settings.body) * lerp(0.85, 1.12, note.velocity) * (noteClass?.tail ?? 1),
      0.014,
      1.8
    );
    const leadType = ["rise", "chirp", "crumb"][Math.floor(random() * 3)];
    const pan = randRange(random, -settings.width, settings.width);
    const secondaryFamily = random() < settings.hybridity
      ? weightedFamily(random, previousFamily, settings.memory, null, family, pool)
      : null;
    const secondaryMix = secondaryFamily
      ? clamp(settings.mixLevel * randRange(random, 0.72, 1.18), 0.04, 1)
      : 0;

    events.push({
      ...note,
      index: i,
      family,
      time: note.time,
      colour: FAMILY_COLOURS[family],
      brightness: localBrightness,
      edge: clamp(settings.edge + randRange(random, -0.18, 0.18) * settings.colour, 0, 1),
      body: clamp(settings.body + randRange(random, -0.2, 0.2) * settings.colour, 0, 1),
      pan,
      tail,
      density,
      hasLead,
      leadDuration,
      leadType,
      leadLevel: settings.leadLevel,
      secondaryFamily,
      secondaryMix,
      variantSeed: Math.floor(random() * 0xffffffff) >>> 0,
      secondarySeed: Math.floor(random() * 0xffffffff) >>> 0
    });
    previousFamily = family;
    previousBrightness = localBrightness;
  }

  const preRoll = maxLead ? maxLead + 0.025 : 0.025;
  const duration = events.reduce((max, event) => Math.max(max, event.time + event.tail), 0) + preRoll + 0.12;
  return { events, preRoll, duration, seed: settings.seed };
}

// Set for the length of a loop render, so a lead that starts before the first
// beat lands at the end of the file and a tail that runs past the last one lands
// at the head. Module-level because every synthesis family writes through
// addStereo and threading a parameter through all of them buys nothing; renderPlan
// is the only writer and JavaScript gives it the whole call stack to itself.
let writeWrap = 0;

function addStereo(left, right, index, value, pan) {
  let index_ = index;
  if (writeWrap > 0) index_ = ((index_ % writeWrap) + writeWrap) % writeWrap;
  else if (index_ < 0 || index_ >= left.length) return;
  const index__ = index_;
  const angle = (clamp(pan, -1, 1) + 1) * Math.PI * 0.25;
  left[index__] += value * Math.cos(angle);
  right[index__] += value * Math.sin(angle);
}

function envelope(t, duration, attack, shape = 4) {
  if (t < 0 || t >= duration) return 0;
  if (t < attack) return t / Math.max(attack, 1e-6);
  return Math.pow(1 - (t - attack) / Math.max(duration - attack, 1e-6), shape);
}

function synthShard(event, left, right, sampleRate, offset, random) {
  const duration = event.tail;
  const count = 5 + Math.floor(random() * 5);
  const base = lerp(3600, 7800, event.brightness) * randRange(random, 0.83, 1.16);
  const ratios = [];
  const phases = [];
  for (let p = 0; p < count; p++) {
    ratios.push(p === 0 ? 1 : randRange(random, 1.16 + p * 0.31, 1.58 + p * 0.61));
    phases.push(random() * TAU);
  }
  const start = Math.round(offset * sampleRate);
  const length = Math.ceil(duration * sampleRate);
  let low = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const amp = envelope(t, duration, 0.00035, lerp(2.8, 7.5, 1 - event.body));
    let metal = 0;
    for (let p = 0; p < count; p++) {
      const detune = 1 + Math.sin(t * (9 + p * 4) + phases[p]) * 0.0015 * event.edge;
      metal += Math.sin(TAU * base * ratios[p] * detune * t + phases[p]) / Math.pow(p + 1, 0.62);
    }
    const white = random() * 2 - 1;
    low += 0.08 * (white - low);
    const air = white - low;
    const click = i < sampleRate * 0.003 ? (random() * 2 - 1) * (1 - i / (sampleRate * 0.003)) : 0;
    const value = (metal * 0.12 + air * 0.34 * event.edge + click * 0.5) * amp * (0.34 + event.velocity * 0.46) * (event.level ?? 1);
    addStereo(left, right, start + i, value, event.pan);
  }
}

function synthFoil(event, left, right, sampleRate, offset, random) {
  const duration = event.tail * lerp(0.9, 1.4, event.body);
  const start = Math.round(offset * sampleRate);
  const length = Math.ceil(duration * sampleRate);
  let slow = 0;
  let fast = 0;
  let previous = 0;
  const slowAlpha = lerp(0.025, 0.12, event.brightness);
  const fastAlpha = lerp(0.18, 0.48, event.brightness);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const white = random() * 2 - 1;
    slow += slowAlpha * (white - slow);
    fast += fastAlpha * (white - fast);
    const band = fast - slow;
    const derivative = white - previous;
    previous = white;
    const shimmer = Math.sin(TAU * (6200 + event.brightness * 6400) * t + Math.sin(t * 91) * 1.7);
    const amp = envelope(t, duration, 0.0007, lerp(1.8, 5.8, 1 - event.body));
    const crinkle = 0.7 + 0.3 * Math.sign(Math.sin(TAU * randRange(random, 70, 170) * t));
    const value = (band * 0.74 + derivative * 0.14 * event.edge + shimmer * 0.08) * amp * crinkle * (0.3 + event.velocity * 0.48) * (event.level ?? 1);
    addStereo(left, right, start + i, value, event.pan + Math.sin(t * 23) * 0.08);
  }
}

function synthLattice(event, left, right, sampleRate, offset, random) {
  const duration = event.tail * lerp(0.58, 1.05, event.body);
  const start = Math.round(offset * sampleRate);
  const length = Math.ceil(duration * sampleRate);
  const f1 = randRange(random, 2900, 6700) * lerp(0.8, 1.35, event.brightness);
  const f2 = f1 * randRange(random, 1.31, 2.19);
  const bitDepth = Math.round(lerp(3, 7, 1 - event.edge));
  const levels = Math.pow(2, bitDepth);
  const hold = Math.max(1, Math.round(lerp(7, 1, event.brightness)));
  let held = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    if (i % hold === 0) {
      const logic =
        Math.sign(Math.sin(TAU * f1 * t + Math.sin(TAU * 117 * t) * 2.1)) *
        Math.sign(Math.sin(TAU * f2 * t));
      held = Math.round((logic * 0.62 + (random() * 2 - 1) * 0.38) * levels) / levels;
    }
    const amp = envelope(t, duration, 0.0002, lerp(3, 9, 1 - event.body));
    const gate = Math.sin(TAU * lerp(45, 260, event.edge) * t) > -0.45 ? 1 : 0.28;
    const value = held * amp * gate * (0.25 + event.velocity * 0.42) * (event.level ?? 1);
    addStereo(left, right, start + i, value, event.pan);
  }
}

function synthFizz(event, left, right, sampleRate, offset, random) {
  const duration = event.tail * lerp(0.7, 1.12, event.body);
  const start = Math.round(offset * sampleRate);
  const length = Math.ceil(duration * sampleRate);
  const packetRate = randRange(random, 90, 340);
  let low = 0;
  let packet = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    if (i % Math.max(1, Math.round(sampleRate / packetRate)) === 0) packet = randRange(random, 0.25, 1);
    packet *= 0.9992;
    const white = random() * 2 - 1;
    low += lerp(0.035, 0.18, event.brightness) * (white - low);
    const air = white - low;
    const carrier = Math.sin(TAU * randRange(random, 4200, 11800) * t);
    const amp = envelope(t, duration, 0.00025, lerp(2.5, 7, 1 - event.body));
    const value = (air * 0.62 + carrier * 0.1) * amp * packet * (0.38 + event.velocity * 0.47) * (event.level ?? 1);
    addStereo(left, right, start + i, value, event.pan + (random() - 0.5) * 0.04);
  }
}

function synthHandshake(event, left, right, sampleRate, offset, random) {
  const duration = Math.max(0.045, event.tail * lerp(0.62, 1.16, event.body));
  const start = Math.round(offset * sampleRate);
  const length = Math.ceil(duration * sampleRate);
  const symbolSamples = Math.max(9, Math.round(sampleRate / randRange(random, 95, 310)));
  const base = lerp(1450, 4100, event.brightness);
  const frequencySet = [1, 1.27, 1.91, 2.64].map((ratio) => base * ratio);
  let frequency = frequencySet[0];
  let phase = random() * TAU;
  let low = 0;
  for (let i = 0; i < length; i++) {
    if (i % symbolSamples === 0) frequency = frequencySet[Math.floor(random() * frequencySet.length)];
    phase += TAU * frequency / sampleRate;
    const t = i / sampleRate;
    const white = random() * 2 - 1;
    low += 0.09 * (white - low);
    const dataTone = Math.sin(phase + Math.sin(phase * 0.31) * event.edge * 2.2);
    const carrier = Math.sign(Math.sin(phase * 0.503)) * 0.16;
    const amp = envelope(t, duration, 0.00035, lerp(2.2, 5.6, 1 - event.body));
    const value = (dataTone * 0.36 + carrier + (white - low) * 0.13) * amp *
      (0.32 + event.velocity * 0.45) * (event.level ?? 1);
    addStereo(left, right, start + i, value, event.pan);
  }
}

function synthLatency(event, left, right, sampleRate, offset, random) {
  const duration = Math.max(0.05, event.tail * lerp(0.78, 1.35, event.body));
  const start = Math.round(offset * sampleRate);
  const length = Math.ceil(duration * sampleRate);
  const packetSamples = Math.max(24, Math.round(sampleRate * randRange(random, 0.006, 0.028)));
  const carrierFrequency = randRange(random, 3900, 9800) * lerp(0.8, 1.2, event.brightness);
  let packetLevel = 0;
  let packetTone = 1;
  let missing = false;
  for (let i = 0; i < length; i++) {
    if (i % packetSamples === 0) {
      missing = random() < 0.24 + event.edge * 0.28;
      packetLevel = missing ? 0 : randRange(random, 0.3, 1);
      packetTone = randRange(random, 0.76, 1.38);
    }
    const t = i / sampleRate;
    const inside = (i % packetSamples) / packetSamples;
    const packetEnv = Math.exp(-inside * randRange(random, 2.2, 6.5));
    const delayedCopy = Math.sin(TAU * carrierFrequency * packetTone * t) * 0.28;
    const bit = Math.sign(Math.sin(TAU * (carrierFrequency * 0.47) * t));
    const amp = envelope(t, duration, 0.00025, lerp(1.8, 4.8, 1 - event.body));
    const value = (delayedCopy + bit * 0.16 + (random() * 2 - 1) * 0.12) *
      packetLevel * packetEnv * amp * (0.36 + event.velocity * 0.46) * (event.level ?? 1);
    addStereo(left, right, start + i, value, event.pan + (missing ? 0 : Math.sin(t * 31) * 0.09));
  }
}

function synthTear(event, left, right, sampleRate, offset, random) {
  const duration = Math.max(0.035, event.tail * lerp(0.72, 1.24, event.body));
  const start = Math.round(offset * sampleRate);
  const length = Math.ceil(duration * sampleRate);
  const syncFrequency = randRange(random, 11800, 16800) * lerp(0.88, 1.07, event.brightness);
  const fieldRate = randRange(random, 47, 73);
  let low = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const white = random() * 2 - 1;
    low += 0.06 * (white - low);
    const sync = Math.sign(Math.sin(TAU * syncFrequency * t + Math.sin(TAU * fieldRate * t) * 2.8));
    const rip = Math.sin(TAU * randRange(random, 2600, 6400) * t);
    const dropout = Math.sin(TAU * fieldRate * 0.5 * t + 1.1) > lerp(0.86, 0.18, event.edge) ? 0.16 : 1;
    const amp = envelope(t, duration, 0.0002, lerp(2.4, 6.8, 1 - event.body));
    const value = (sync * 0.19 + rip * 0.12 + (white - low) * 0.42) * dropout * amp *
      (0.31 + event.velocity * 0.46) * (event.level ?? 1);
    addStereo(left, right, start + i, value, event.pan + Math.sin(TAU * fieldRate * t) * 0.07);
  }
}

function synthChroma(event, left, right, sampleRate, offset, random) {
  const duration = Math.max(0.035, event.tail * lerp(0.86, 1.38, event.body));
  const start = Math.round(offset * sampleRate);
  const length = Math.ceil(duration * sampleRate);
  const colour = Math.floor(random() * 4);
  let previous = 0;
  let previous2 = 0;
  let low = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const white = random() * 2 - 1;
    low += lerp(0.018, 0.15, event.brightness) * (white - low);
    let coloured;
    if (colour === 0) coloured = white;
    else if (colour === 1) coloured = (white - previous) * 0.72;
    else if (colour === 2) coloured = (white - 2 * previous + previous2) * 0.42;
    else coloured = (white - low) * 0.9 + Math.sin(TAU * 9100 * t) * 0.08;
    previous2 = previous;
    previous = white;
    const amp = envelope(t, duration, 0.00045, lerp(1.7, 5.3, 1 - event.body));
    const spectralBlink = 0.72 + Math.sin(TAU * randRange(random, 12, 42) * t) * 0.28 * event.edge;
    const value = coloured * amp * spectralBlink * (0.34 + event.velocity * 0.48) * (event.level ?? 1);
    addStereo(left, right, start + i, value, event.pan);
  }
}

// Ported from the kick grain in `critterances` (`makeKickGrain`,
// xyhtamura.github.io/critterances/critterances.js): a sine swept from high to
// low underneath a resonant lowpass whose cutoff starts shut, snaps open in a
// few milliseconds, and falls shut again. Critterances assembles that from Web
// Audio nodes; dithertick renders offline, so the biquad becomes a Chamberlin
// state-variable filter, which tolerates having its cutoff swept every sample
// where a recomputed RBJ biquad rings.
//
// This is the only family with energy below the hi-hat register. Brightness
// transposes the whole gesture, so one family covers a kick at the bottom of the
// range and a tom or a snare body at the top.
function synthUnderflow(event, left, right, sampleRate, offset, random) {
  const duration = Math.max(0.06, event.tail * lerp(1.05, 2.2, event.body));
  const start = Math.round(offset * sampleRate);
  const length = Math.ceil(duration * sampleRate);

  const tune = lerp(0.72, 2.4, event.brightness);
  const pitchStart = 110 * tune * randRange(random, 0.82, 1.22);
  const pitchEnd = 42 * tune * randRange(random, 0.82, 1.18);
  const sweep = randRange(random, 0.035, 0.08);
  const settle = duration * 0.38;

  const cutoffLow = randRange(random, 45, 140) * tune;
  const cutoffPeak = randRange(random, 900, 3800) * lerp(0.55, 1.3, event.brightness);
  const cutoffEnd = randRange(random, 55, 220) * tune;
  const attack = randRange(random, 0.005, 0.018);
  const decay = randRange(random, 0.024, 0.11);
  const damp = 1 / clamp(randRange(random, 1.6, 6) * lerp(0.7, 1.35, event.edge), 0.5, 12);

  // A short noise transient over the onset, the tick critterances fires 35% of
  // the time. Here the edge control decides how often instead of a flat chance.
  const tick = random() < 0.2 + event.edge * 0.45;
  const tickLength = Math.round(sampleRate * randRange(random, 0.004, 0.02));
  const tickLevel = randRange(random, 0.1, 0.34) * event.edge;

  const hold = duration * 0.18;
  const release = Math.max(24, Math.round(sampleRate * 0.004));
  let low = 0;
  let band = 0;
  let phase = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const pitch = t < sweep
      ? pitchStart * Math.pow(pitchEnd / pitchStart, t / sweep)
      : pitchEnd * (1 + 0.06 * Math.exp(-(t - sweep) / settle));
    phase += (TAU * pitch) / sampleRate;

    let cutoff;
    if (t < attack) cutoff = cutoffLow * Math.pow(cutoffPeak / cutoffLow, t / attack);
    else if (t < attack + decay) cutoff = cutoffPeak * Math.pow(cutoffEnd / cutoffPeak, (t - attack) / decay);
    else cutoff = cutoffEnd * lerp(1, 0.6, Math.min(1, (t - attack - decay) / Math.max(1e-6, duration * 0.3)));

    let input = Math.sin(phase);
    if (tick && i < tickLength) input += (random() * 2 - 1) * tickLevel * (1 - i / tickLength) ** 4;

    // Chamberlin SVF, lowpass tap. Cutoff is capped well under Nyquist because
    // the topology goes unstable as f approaches 2.
    const f = 2 * Math.sin(Math.PI * Math.min(cutoff, sampleRate * 0.22) / sampleRate);
    low += f * band;
    band += f * (input - low - damp * band);

    const decayed = t < hold ? 1 : Math.exp(-(t - hold) / Math.max(1e-6, duration * 0.22));
    const fade = i > length - release ? (length - i) / release : 1;
    const value = clamp(low, -4, 4) * decayed * fade * (0.3 + event.velocity * 0.5) * (event.level ?? 1);
    addStereo(left, right, start + i, value, event.pan * 0.45);
  }
}

function synthLead(event, left, right, sampleRate, hitOffset, random) {
  if (!event.hasLead || event.leadDuration <= 0) return;
  const duration = event.leadDuration;
  const start = Math.round((hitOffset - duration) * sampleRate);
  const length = Math.ceil(duration * sampleRate);
  let low = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const u = t / duration;
    const rise = Math.pow(u, 2.2) * (1 - Math.pow(u, 18));
    let value = 0;
    if (event.leadType === "chirp") {
      const f0 = lerp(950, 3100, event.brightness);
      const f1 = lerp(6800, 14800, event.brightness);
      const phase = TAU * (f0 * t + ((f1 - f0) / (2 * duration)) * t * t);
      value = Math.sin(phase) * 0.36 + (random() * 2 - 1) * 0.08;
    } else if (event.leadType === "crumb") {
      const cell = Math.floor(u * randRange(random, 9, 22));
      const gate = (cell % 3 === 0 || random() > 0.72) ? 1 : 0;
      value = (Math.sign(Math.sin(TAU * lerp(1800, 9400, u) * t)) + (random() * 2 - 1) * 0.3) * gate * 0.28;
    } else {
      const white = random() * 2 - 1;
      const alpha = lerp(0.025, 0.42, u * event.brightness);
      low += alpha * (white - low);
      value = (white - low) * 0.58;
    }
    addStereo(left, right, start + i, value * rise * event.velocity * 0.42 * event.leadLevel, event.pan * u);
  }
}

// `options.gain` overrides the peak-derived normalisation, which is how stems
// keep the balance the mixdown gave them instead of each floating to -0.5 dB.
//
// `options.loopLength`, in seconds, renders a seamless loop instead of a single
// pass: the buffer is exactly that long, hits are placed without the pre-roll
// offset, and everything that falls outside wraps around. Pre-onset sounds
// belonging to the first hit arrive at the end of the file, which is where they
// belong once the file repeats.
export function renderPlan(plan, settings, sampleRate = 44100, options = {}) {
  const looping = Number.isFinite(options.loopLength) && options.loopLength > 0;
  const length = looping
    ? Math.max(1, Math.round(options.loopLength * sampleRate))
    : Math.max(1, Math.ceil(plan.duration * sampleRate));
  const left = new Float32Array(length);
  const right = new Float32Array(length);
  const synths = {
    shard: synthShard,
    foil: synthFoil,
    lattice: synthLattice,
    fizz: synthFizz,
    handshake: synthHandshake,
    latency: synthLatency,
    tear: synthTear,
    chroma: synthChroma,
    underflow: synthUnderflow
  };

  writeWrap = looping ? length : 0;
  for (const event of plan.events) {
    const random = mulberry32(event.variantSeed);
    const hitOffset = looping ? event.time % options.loopLength : plan.preRoll + event.time;
    synthLead(event, left, right, sampleRate, hitOffset, random);
    const primaryLevel = (event.secondaryFamily ? Math.max(0.22, 1 - event.secondaryMix * 0.55) : 1) *
      FAMILY_GAIN[event.family];
    synths[event.family]({ ...event, level: primaryLevel }, left, right, sampleRate, hitOffset, random);
    if (event.secondaryFamily) {
      const secondaryRandom = mulberry32(event.secondarySeed);
      synths[event.secondaryFamily](
        {
          ...event,
          family: event.secondaryFamily,
          level: event.secondaryMix * 0.78 * FAMILY_GAIN[event.secondaryFamily],
          pan: -event.pan * 0.72
        },
        left,
        right,
        sampleRate,
        hitOffset,
        secondaryRandom
      );
    }
  }

  writeWrap = 0;

  let peak = 0;
  const drive = lerp(1.15, 2.7, settings.edge);
  // Terminal output stage: sample-and-hold decimation, then TPDF dither into a
  // coarse quantizer. Dither at 0 leaves the quantization distortion audible.
  const bits = clamp(Math.round(settings.bits ?? 16), 2, 16);
  const hold = Math.max(1, Math.round(settings.hold ?? 1));
  const ditherAmount = clamp(settings.dither ?? 0, 0, 1);
  const quantizing = bits < 16;
  const levels = Math.pow(2, bits - 1);
  const step = 1 / levels;
  const outputRandom = mulberry32(hashSeed(`${settings.seed}:output`));
  let heldLeft = 0;
  let heldRight = 0;
  for (let i = 0; i < length; i++) {
    let l = Math.tanh(left[i] * drive) / Math.tanh(drive);
    let r = Math.tanh(right[i] * drive) / Math.tanh(drive);
    if (hold > 1) {
      if (i % hold === 0) {
        heldLeft = l;
        heldRight = r;
      }
      l = heldLeft;
      r = heldRight;
    }
    if (quantizing) {
      if (ditherAmount > 0) {
        l += (outputRandom() + outputRandom() - 1) * step * ditherAmount;
        r += (outputRandom() + outputRandom() - 1) * step * ditherAmount;
      }
      l = Math.round(l * levels) / levels;
      r = Math.round(r * levels) / levels;
    }
    left[i] = l;
    right[i] = r;
    peak = Math.max(peak, Math.abs(l), Math.abs(r));
  }
  const gain = Number.isFinite(options.gain) ? options.gain : (peak > 0.94 ? 0.94 / peak : 1);
  if (gain !== 1) {
    for (let i = 0; i < length; i++) {
      left[i] *= gain;
      right[i] *= gain;
    }
  }
  return { left, right, sampleRate, duration: length / sampleRate, gain, peak };
}

// One render per species or per note class, all sharing the mixdown's length,
// pre-roll, and gain so the files drop into a DAW already lined up and balanced.
//
// They do not sum back to the mixdown sample-for-sample, and cannot: saturation,
// sample hold, and the quantizer are per-render and non-linear, so each stem gets
// the output stage applied to itself rather than to the sum. That is the useful
// behaviour for mixing, but it is an approximation of the mix, not a decomposition
// of it. A layered second species is rendered into its primary's stem.
export function renderStems(plan, settings, sampleRate = 44100, groupBy = "family", options = {}) {
  const keyOf = (event) => (groupBy === "note" ? String(event.note) : event.family);
  const groups = new Map();
  for (const event of plan.events) {
    const key = keyOf(event);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(event);
  }
  const mix = renderPlan(plan, settings, sampleRate, options);
  const stems = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([key, events]) => ({
      key,
      count: events.length,
      rendered: renderPlan({ ...plan, events }, settings, sampleRate, { ...options, gain: mix.gain })
    }));
  return { mix, stems };
}

export function toAudioBuffer(context, rendered) {
  const buffer = context.createBuffer(2, rendered.left.length, rendered.sampleRate);
  buffer.copyToChannel(rendered.left, 0);
  buffer.copyToChannel(rendered.right, 1);
  return buffer;
}

export function encodeWav(rendered) {
  const channels = 2;
  const bytesPerSample = 2;
  const dataBytes = rendered.left.length * channels * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(arrayBuffer);
  const writeText = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeText(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, rendered.sampleRate, true);
  view.setUint32(28, rendered.sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeText(36, "data");
  view.setUint32(40, dataBytes, true);
  let offset = 44;
  for (let i = 0; i < rendered.left.length; i++) {
    for (const sample of [rendered.left[i], rendered.right[i]]) {
      const clamped = clamp(sample, -1, 1);
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: "audio/wav" });
}
