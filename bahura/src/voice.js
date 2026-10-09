// Web Audio: a key is a few sine partials under an attack, decay, sustain, and
// release envelope.

import { PARTIALS, DECAY_FALLOFF } from '../data/voice.js';

export function createVoice() {
  let ctx = null, master = null, level = 0.7;

  // The context is made on the first strike, which is the user gesture the browser asks for.
  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -12; limiter.ratio.value = 8;
      master = ctx.createGain(); master.gain.value = level;
      master.connect(limiter); limiter.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  // Starts a note and returns the function that releases it. `decay` is the
  // seconds the fundamental takes to settle; `bright` is the gain ratio between
  // successive partials. Higher partials decay and release faster.
  // `gain` scales the whole note, and `minAttack` softens its start: a neighbour
  // set ringing by another key is quieter and is not struck.
  function start(hz, { decay, bright }, envelope, gain = 1, minAttack = 0) {
    ensure();
    const now = ctx.currentTime, peakAt = now + Math.max(envelope.attack, minAttack);
    const settle = decay * envelope.decay;
    let total = 0;
    PARTIALS.forEach((_, k) => { total += bright ** k; });
    const parts = [];
    PARTIALS.forEach((ratio, k) => {
      if (hz * ratio > 16000) return;
      const faster = 1 + k * DECAY_FALLOFF * 2, peak = 0.32 * gain * bright ** k / total;
      const osc = ctx.createOscillator(), amp = ctx.createGain();
      osc.frequency.value = hz * ratio;
      amp.gain.setValueAtTime(0, now);
      amp.gain.linearRampToValueAtTime(peak, peakAt);
      amp.gain.setTargetAtTime(peak * envelope.sustain, peakAt, settle / faster / 5);
      osc.connect(amp); amp.connect(master);
      osc.start(now);
      // A plain strike ends by itself; a sustained note waits for its release.
      if (!envelope.sustain) osc.stop(peakAt + settle / faster * 1.6);
      parts.push({ osc, amp, faster });
    });

    let released = false;
    return function release() {
      if (released || envelope.release == null) return;
      released = true;
      const t = ctx.currentTime;
      for (const { osc, amp, faster } of parts) {
        if (amp.gain.cancelAndHoldAtTime) amp.gain.cancelAndHoldAtTime(t);
        else { const held = amp.gain.value; amp.gain.cancelScheduledValues(t); amp.gain.setValueAtTime(held, t); }
        amp.gain.setTargetAtTime(0, t, envelope.release / faster / 5);
        try { osc.stop(t + envelope.release / faster * 1.6); } catch { /* already stopped */ }
      }
    };
  }

  // True once a key has been played. Creatures appear on a timer, and a timer
  // is not a gesture the browser accepts for starting audio, so until then they
  // are silent.
  const ready = () => Boolean(ctx) && ctx.state === 'running';

  // Turns a rendered pair of channels into a buffer for `play`.
  function buffer(rendered) {
    const made = ctx.createBuffer(2, rendered.left.length, rendered.sampleRate);
    made.copyToChannel(rendered.left, 0);
    made.copyToChannel(rendered.right, 1);
    return made;
  }

  // Plays a buffer once. `pan` runs from -1 at the left to 1 at the right, and
  // `rate` is the playback speed.
  function play(made, { gain = 1, pan = 0, rate = 1 } = {}) {
    const source = ctx.createBufferSource(), amp = ctx.createGain(), place = ctx.createStereoPanner();
    source.buffer = made;
    source.playbackRate.value = rate;
    amp.gain.value = gain;
    place.pan.value = pan;
    source.connect(amp); amp.connect(place); place.connect(master);
    source.start();
  }

  function setLevel(value) {
    level = value;
    if (master) master.gain.value = value;
  }

  return { start, setLevel, ready, buffer, play, get sampleRate() { return ctx.sampleRate; } };
}
