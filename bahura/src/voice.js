// Web Audio: one strike is a few decaying sine partials.

import { PARTIALS, DECAY_FALLOFF, ATTACK } from '../data/voice.js';

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

  // `decay` is the seconds the fundamental takes to fall by 60 dB; `bright` is
  // the gain ratio between successive partials.
  function strike(hz, { decay, bright }, gain = 1) {
    ensure();
    const now = ctx.currentTime;
    let total = 0;
    PARTIALS.forEach((_, k) => { total += bright ** k; });
    PARTIALS.forEach((ratio, k) => {
      const f = hz * ratio;
      if (f > 16000) return;
      const length = decay / (1 + k * DECAY_FALLOFF * 2);
      const osc = ctx.createOscillator(), amp = ctx.createGain();
      osc.frequency.value = f;
      amp.gain.setValueAtTime(0, now);
      amp.gain.linearRampToValueAtTime(0.32 * gain * bright ** k / total, now + ATTACK);
      amp.gain.setTargetAtTime(0, now + ATTACK, length / 6.9);
      osc.connect(amp); amp.connect(master);
      osc.start(now); osc.stop(now + ATTACK + length * 1.5);
    });
  }

  function setLevel(value) {
    level = value;
    if (master) master.gain.value = value;
  }

  return { strike, setLevel };
}
