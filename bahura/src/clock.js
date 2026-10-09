// Terrain time: the slow tick, the tide, and the earthquake, on one clock that
// the page and the simulation both drive. No DOM, and no timer of its own.

import { contact, drift } from './contact.js';
import { flood, ebb, quake } from './events.js';
import { TICK, TIDE, QUAKE } from '../data/rates.js';

const between = ([low, high], random) => low + random() * (high - low);

export function createClock(board, random = Math.random) {
  let now = 0, nextTick = TICK.seconds;
  let tideIn = false, nextTide = between(TIDE.every, random);
  let nextQuake = between(QUAKE.every, random);

  const turnTide = () => {
    tideIn = !tideIn;
    nextTide = now + between(tideIn ? TIDE.stays : TIDE.every, random);
    return tideIn ? flood(board, TIDE, random) : ebb(board, TIDE, random);
  };
  const shake = () => {
    nextQuake = now + between(QUAKE.every, random);
    return quake(board, QUAKE, random);
  };

  // Moves terrain time on by `seconds` and returns every change that fell due.
  function advance(seconds) {
    const end = now + seconds, changes = [];
    while (nextTick <= end) {
      now = nextTick;
      nextTick += TICK.seconds;
      changes.push(...contact(board, board.keys, TICK.contact, random), ...drift(board, TICK.drift, random));
      if (now >= nextTide) changes.push(...turnTide());
      if (now >= nextQuake) changes.push(...shake());
    }
    now = end;
    return changes;
  }

  return { advance, turnTide, shake, get tideIn() { return tideIn; } };
}
