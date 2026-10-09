// Renders a short voiced sound with the vendored Pink Trombone: a glottis
// feeding a vocal tract, with the tongue, lips, and pitch gliding from one
// setting to another. No DOM and no audio nodes; it returns samples.
//
// The loop follows AudioSystem.doScriptProcessor in the source page: blocks of
// 512 samples, the tract stepped twice per sample, and both objects told when a
// block ends. The page fed it noise through two Web Audio band-pass filters;
// here the same filters are computed directly.

import { Glottis, Tract, AudioSystem, setSampleRate, setAlwaysVoice, setAutoWobble } from '../vendor/pink-trombone.js';

const lerp = (a, b, t) => a + (b - a) * t;

// A band-pass filter with unity gain at its centre, which is the response the
// Web Audio BiquadFilterNode's "bandpass" type has.
function bandpass(hz, q, sampleRate) {
  const w = 2 * Math.PI * hz / sampleRate, alpha = Math.sin(w) / (2 * q), a0 = 1 + alpha;
  const b0 = alpha / a0, b2 = -alpha / a0, a1 = -2 * Math.cos(w) / a0, a2 = (1 - alpha) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return x => {
    const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

// The tongue as the source page shapes it: TractUI.setRestDiameter, with the
// page's grid offset of 1.7. `index` runs from about 12 at the back of the
// mouth to 29 at the front; `diameter` from about 2.05, close to the palate, to
// 3.5, low and open.
function shapeTongue(index, diameter) {
  for (let i = Tract.bladeStart; i < Tract.lipStart; i++) {
    const t = 1.1 * Math.PI * (index - i) / (Tract.tipStart - Tract.bladeStart);
    const fixed = 2 + (diameter - 2) / 1.5;
    let curve = (1.5 - fixed + 1.7) * Math.cos(t);
    if (i === Tract.bladeStart - 2 || i === Tract.lipStart - 1) curve *= 0.8;
    if (i === Tract.bladeStart || i === Tract.lipStart - 2) curve *= 0.94;
    Tract.restDiameter[i] = 1.5 - curve;
  }
}

// `shape` is { pitch: [from, to] in hertz, tongue: [[index, diameter], [index,
// diameter]], lips: [from, to] as an opening from about 0.4 (rounded) to 1.5
// (open), tense: 0 breathy to 1 pressed, seconds: how long it is voiced }.
// Returns a Float32Array, peaking at 0.9.
export function renderMouth(shape, sampleRate) {
  setSampleRate(sampleRate);
  setAlwaysVoice(false);
  setAutoWobble(false);

  // Both objects are single instances in the source, so each render starts
  // them again from rest.
  Tract.transients = [];
  Tract.lastObstruction = -1;
  Tract.init();
  Object.assign(Glottis, { timeInWaveform: 0, totalTime: 0, intensity: 0, isTouched: true, vibratoAmount: 0.005 });
  Glottis.UIFrequency = Glottis.smoothFrequency = Glottis.oldFrequency = Glottis.newFrequency = shape.pitch[0];
  Glottis.UITenseness = Glottis.oldTenseness = Glottis.newTenseness = shape.tense;
  Glottis.loudness = Math.pow(shape.tense, 0.25);
  // Glottis.init also draws the page's keyboard; this is the half of it that
  // concerns sound.
  Glottis.setupWaveform(0);

  const pose = t => {
    const [from, to] = shape.tongue;
    shapeTongue(lerp(from[0], to[0], t), lerp(from[1], to[1], t));
    for (let i = Tract.bladeStart; i < Tract.lipStart; i++) Tract.targetDiameter[i] = Tract.restDiameter[i];
    for (let i = Tract.lipStart; i < Tract.n; i++) Tract.targetDiameter[i] = lerp(shape.lips[0], shape.lips[1], t);
  };
  pose(0);
  // Start in the first pose, so the clip does not open with the mouth moving
  // there from rest.
  Tract.diameter.set(Tract.targetDiameter);
  Tract.calculateReflections();
  Tract.calculateReflections();

  const block = AudioSystem.blockLength;
  const voiced = Math.ceil(shape.seconds * sampleRate / block), tail = Math.ceil(0.25 * sampleRate / block);
  const out = new Float32Array((voiced + tail) * block);
  const aspirate = bandpass(500, 0.5, sampleRate), fricative = bandpass(1000, 0.5, sampleRate);

  for (let b = 0; b < voiced + tail; b++) {
    const t = Math.min(1, b / Math.max(1, voiced - 1));
    Glottis.isTouched = b < voiced;
    Glottis.UIFrequency = lerp(shape.pitch[0], shape.pitch[1], t);
    pose(t);
    for (let j = 0; j < block; j++) {
      const white = Math.random(), lambda1 = j / block, lambda2 = (j + 0.5) / block;
      const glottal = Glottis.runStep(lambda1, aspirate(white)), turbulence = fricative(white);
      let sample = 0;
      Tract.runStep(glottal, turbulence, lambda1);
      sample += Tract.lipOutput + Tract.noseOutput;
      Tract.runStep(glottal, turbulence, lambda2);
      sample += Tract.lipOutput + Tract.noseOutput;
      out[b * block + j] = sample * 0.125;
    }
    Glottis.finishBlock();
    Tract.finishBlock();
  }

  let peak = 0;
  for (const x of out) peak = Math.max(peak, Math.abs(x));
  const fade = Math.round(0.01 * sampleRate), gain = peak > 0 ? 0.9 / peak : 0;
  for (let i = 0; i < out.length; i++) out[i] *= gain * Math.min(1, (out.length - i) / fade);
  return out;
}
