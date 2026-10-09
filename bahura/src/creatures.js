// Which creatures are out, where, and what they do next. No DOM and no sound:
// `step` and `disturb` return events and the page draws and plays them.
//
// Events are { type, creature, from?, to? } with type one of
//   'appear'  a creature comes out on creature.key
//   'sound'   it sounds where it is
//   'move'    it goes from one key to a touching one, and sounds
//   'leave'   it goes

import { neighbours } from './board.js';
import { CREATURES, CROWD, WALK_CHANCE } from '../data/creatures.js';

const between = ([low, high], random) => low + random() * (high - low);
const keyOf = (board, char) => board.keys.find(k => k.char === char);
const suits = (kind, key) => kind.habitats.includes(key.habitat);

export function createCreatures(board, random = Math.random) {
  const out = [];
  let serial = 0, last = null;

  const occupied = char => out.some(c => c.key === char);

  function appear(now) {
    const places = board.keys.filter(key => !occupied(key.char) && CREATURES.some(kind => suits(kind, key)));
    if (!places.length) return null;
    const key = places[Math.floor(random() * places.length)];
    const kinds = CREATURES.filter(kind => suits(kind, key));
    const kind = kinds[Math.floor(random() * kinds.length)];
    const creature = { id: ++serial, kind, key: key.char, leavesAt: now + between(kind.stays, random), soundsAt: now + between(kind.every, random) };
    out.push(creature);
    return { type: 'appear', creature };
  }

  function leave(creature) {
    out.splice(out.indexOf(creature), 1);
    return { type: 'leave', creature };
  }

  // A touching key the creature could go to, or null.
  function wayOut(creature) {
    const here = keyOf(board, creature.key);
    const ways = neighbours(board, here).filter(key => suits(creature.kind, key) && !occupied(key.char));
    return ways.length ? ways[Math.floor(random() * ways.length)] : null;
  }

  function go(creature, to) {
    const from = creature.key;
    creature.key = to.char;
    return { type: 'move', creature, from, to: to.char };
  }

  // Moves the creatures on to time `now`, in seconds, and returns what happened.
  function step(now) {
    const events = [];
    const seconds = last == null ? 0 : now - last;
    last = now;
    for (const creature of [...out]) {
      // A creature whose ground has changed under it goes at once.
      if (now >= creature.leavesAt || !suits(creature.kind, keyOf(board, creature.key))) { events.push(leave(creature)); continue; }
      if (now < creature.soundsAt) continue;
      creature.soundsAt = now + between(creature.kind.every, random);
      const to = creature.kind.walks && random() < WALK_CHANCE ? wayOut(creature) : null;
      events.push(to ? go(creature, to) : { type: 'sound', creature });
    }
    if (out.length < CROWD.most && random() < 1 - (1 - CROWD.chance) ** seconds) {
      const event = appear(now);
      if (event) events.push(event);
    }
    return events;
  }

  // The key a creature is on has been played: it sounds, and a walker goes to
  // a touching key if there is one. Either way it leaves sooner.
  function disturb(char, now) {
    const creature = out.find(c => c.key === char);
    if (!creature) return [];
    creature.leavesAt = Math.min(creature.leavesAt, now + between([4, 12], random));
    creature.soundsAt = now + between(creature.kind.every, random);
    const to = creature.kind.walks ? wayOut(creature) : null;
    return [to ? go(creature, to) : { type: 'sound', creature }];
  }

  return { step, disturb, appear, get out() { return out; } };
}
