// Rules engine for The Shadow Spreads, a fully cooperative Pandemic-style
// game. Pure serializable reducer in the style of the other engines here:
// newGame(...) returns plain JSON state, reduce(prev, action) clones and
// applies (returning prev unchanged for illegal actions).

import { LOCATIONS, NEIGHBORS, FRONTS, HAVENS, START_LOCATION } from './map.js';

export const RATES = [2, 2, 2, 3, 3, 4];
export const HAND_LIMIT = 7;
export const MAX_OUTBREAKS = 8;
export const RESERVE = 24;
export const NUM_EPIDEMICS = 4;

export const ROLES = [
  {
    key: 'ranger',
    name: 'Ranger of the North',
    icon: 'boot',
    desc: 'Banishes a Shadow with only 4 matching cards.',
  },
  {
    key: 'healer',
    name: 'Healer of the Houses',
    icon: 'hearttower',
    desc: 'Cleansing removes every cube of one front here.',
  },
  {
    key: 'pilgrim',
    name: 'Grey Pilgrim',
    icon: 'pointyhat',
    desc: 'Takes five actions each turn.',
  },
  {
    key: 'lorekeeper',
    name: 'Lorekeeper',
    icon: 'tiedscroll',
    desc: 'Counsel may pass any location card, not only this one.',
  },
];

export const HERO_COLORS = ['#a8821e', '#2e6e62', '#7a5f9c', '#a84a6e'];

const START_HAND = { 1: 4, 2: 4, 3: 3, 4: 2 };

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function log(state, msg) {
  state.log = [...state.log.slice(-59), msg];
}

export function actionsFor(role) {
  return role === 'pilgrim' ? 5 : 4;
}

export function banishCost(role) {
  return role === 'ranger' ? 4 : 5;
}

export function newGame(numHeroes) {
  const n = Math.max(1, Math.min(4, numHeroes || 2));
  const roleKeys = shuffle(ROLES.map((r) => r.key)).slice(0, n);
  const heroes = roleKeys.map((role, i) => ({
    id: i,
    role,
    name: ROLES.find((r) => r.key === role).name,
    color: HERO_COLORS[i],
    loc: START_LOCATION,
    hand: [],
  }));

  const state = {
    numHeroes: n,
    heroes,
    cubes: LOCATIONS.map(() => [0, 0, 0, 0]),
    reserves: [RESERVE, RESERVE, RESERVE, RESERVE],
    banished: [false, false, false, false],
    heroDeck: [],
    heroDiscard: [],
    corrDeck: shuffle(LOCATIONS.map((_, i) => i)),
    corrDiscard: [],
    rateIdx: 0,
    outbreaks: 0,
    epidemics: 0,
    current: 0,
    actionsLeft: actionsFor(roleKeys[0]),
    phase: 'actions', // 'actions' | 'discard' | 'game-over'
    discardHero: null,
    discardReturn: null, // 'actions' | 'draw' | 'end-turn'
    winner: null, // null | 'win' | 'lose'
    loseReason: null, // 'outbreaks' | 'reserve' | 'deck'
    turn: 1,
    log: ['A shadow stirs in the East. The Council sends its heroes out from Rivendell.'],
  };

  // Corruption seeding: 3/3/3 cubes, then 2/2/2, then 1/1/1.
  for (const count of [3, 3, 3, 2, 2, 2, 1, 1, 1]) {
    const loc = state.corrDeck.pop();
    const f = LOCATIONS[loc].front;
    state.cubes[loc][f] = count;
    state.reserves[f] -= count;
    state.corrDiscard.push(loc);
  }
  log(state, 'Whispers of corruption already taint nine far-flung lands.');

  // Hero deck: deal opening hands, then shuffle one Darkness Rises into each
  // of four stacked quarters (the classic method).
  let deck = shuffle(LOCATIONS.map((_, i) => i));
  for (const h of heroes) {
    for (let k = 0; k < START_HAND[n]; k++) h.hand.push(deck.pop());
  }
  const piles = [[], [], [], []];
  deck.forEach((c, i) => piles[i % 4].push(c));
  state.heroDeck = piles.map((pile) => shuffle([...pile, 'epi'])).flat();
  log(state, `${heroes[0].name} takes up the watch.`);
  return state;
}

function lose(state, reason, msg) {
  if (state.winner) return;
  state.winner = 'lose';
  state.loseReason = reason;
  state.phase = 'game-over';
  log(state, msg);
}

function placeCube(state, loc, front) {
  if (state.winner) return;
  if (state.reserves[front] <= 0) {
    lose(
      state,
      'reserve',
      `The hosts of ${FRONTS[front].name} grow beyond all counting. Middle-earth is overrun.`
    );
    return;
  }
  state.cubes[loc][front]++;
  state.reserves[front]--;
}

// An outbreak at `loc`: +1 cube of `front` on each neighbor; chains, but each
// location may outbreak at most once per resolution (the shared visited set).
function outbreak(state, loc, front, visited) {
  if (state.winner || visited.has(loc)) return;
  visited.add(loc);
  state.outbreaks++;
  log(state, `Darkness boils over at ${LOCATIONS[loc].name}!`);
  if (state.outbreaks >= MAX_OUTBREAKS) {
    lose(state, 'outbreaks', 'An eighth shadow-tide breaks the last defenses. All hope gutters out.');
    return;
  }
  for (const nb of NEIGHBORS[loc]) {
    if (state.winner) return;
    if (state.cubes[nb][front] >= 3) outbreak(state, nb, front, visited);
    else placeCube(state, nb, front);
  }
}

// Exported for tests (crafted outbreak-chain cases).
export function addCubes(state, loc, front, n, visited = new Set()) {
  for (let i = 0; i < n; i++) {
    if (state.winner) return;
    if (state.cubes[loc][front] >= 3) {
      outbreak(state, loc, front, visited);
      return;
    }
    placeCube(state, loc, front);
  }
}

function drawHeroCards(state) {
  const hero = state.heroes[state.current];
  for (let i = 0; i < 2; i++) {
    if (state.winner) return;
    if (state.heroDeck.length === 0) {
      lose(state, 'deck', 'The well of counsel runs dry — no more aid will come. The quest fails.');
      return;
    }
    const card = state.heroDeck.pop();
    if (card === 'epi') {
      state.epidemics++;
      state.rateIdx = Math.min(state.rateIdx + 1, RATES.length - 1);
      if (state.corrDeck.length === 0) {
        state.corrDeck = shuffle(state.corrDiscard);
        state.corrDiscard = [];
      }
      const loc = state.corrDeck.shift(); // the bottom card
      log(state, `Darkness rises over ${LOCATIONS[loc].name}!`);
      addCubes(state, loc, LOCATIONS[loc].front, 3);
      state.corrDiscard.push(loc);
      // Intensify: shuffle the corruption discard back onto the top.
      state.corrDeck.push(...shuffle(state.corrDiscard));
      state.corrDiscard = [];
    } else {
      hero.hand.push(card);
    }
  }
}

function corruptionStep(state) {
  const n = RATES[state.rateIdx];
  for (let i = 0; i < n; i++) {
    if (state.winner) return;
    if (state.corrDeck.length === 0) {
      if (state.corrDiscard.length === 0) return;
      state.corrDeck = shuffle(state.corrDiscard);
      state.corrDiscard = [];
      log(state, 'The old corruptions stir anew.');
    }
    const loc = state.corrDeck.pop();
    addCubes(state, loc, LOCATIONS[loc].front, 1);
    state.corrDiscard.push(loc);
  }
}

function nextHero(state) {
  if (state.winner) return;
  state.current = (state.current + 1) % state.numHeroes;
  state.actionsLeft = actionsFor(state.heroes[state.current].role);
  state.phase = 'actions';
  state.turn++;
  log(state, `${state.heroes[state.current].name} takes up the watch.`);
}

// Draw 2 hero cards, then (after any discard-down) the corruption spreads.
function endOfActions(state) {
  drawHeroCards(state);
  if (state.winner) return;
  if (state.heroes[state.current].hand.length > HAND_LIMIT) {
    state.phase = 'discard';
    state.discardHero = state.current;
    state.discardReturn = 'end-turn';
    log(state, `${state.heroes[state.current].name} carries too many burdens and must set some down.`);
    return;
  }
  corruptionStep(state);
  nextHero(state);
}

function spendAction(state) {
  if (state.winner) return;
  state.actionsLeft--;
  if (state.actionsLeft <= 0) endOfActions(state);
}

export function reduce(prev, action) {
  if (prev.phase === 'game-over') return prev;
  const state = structuredClone(prev);
  const hero = state.heroes[state.current];

  switch (action.type) {
    case 'MOVE': {
      if (state.phase !== 'actions') return prev;
      if (!NEIGHBORS[hero.loc].includes(action.to)) return prev;
      hero.loc = action.to;
      log(state, `${hero.name} journeys to ${LOCATIONS[action.to].name}.`);
      spendAction(state);
      return state;
    }

    case 'RIDE': {
      if (state.phase !== 'actions') return prev;
      const card = hero.hand[action.card];
      if (card == null || card === hero.loc) return prev;
      hero.hand.splice(action.card, 1);
      state.heroDiscard.push(card);
      hero.loc = card;
      log(state, `${hero.name} rides hard for ${LOCATIONS[card].name}.`);
      spendAction(state);
      return state;
    }

    case 'EAGLES': {
      if (state.phase !== 'actions') return prev;
      const card = hero.hand[action.card];
      if (card == null || card !== hero.loc) return prev;
      if (!Number.isInteger(action.to) || action.to < 0 || action.to >= LOCATIONS.length) return prev;
      if (action.to === hero.loc) return prev;
      hero.hand.splice(action.card, 1);
      state.heroDiscard.push(card);
      hero.loc = action.to;
      log(state, `The Eagles bear ${hero.name} away to ${LOCATIONS[action.to].name}.`);
      spendAction(state);
      return state;
    }

    case 'CLEANSE': {
      if (state.phase !== 'actions') return prev;
      const f = action.front;
      if (!Number.isInteger(f) || f < 0 || f > 3) return prev;
      if (state.cubes[hero.loc][f] <= 0) return prev;
      const all = state.banished[f] || hero.role === 'healer';
      const k = all ? state.cubes[hero.loc][f] : 1;
      state.cubes[hero.loc][f] -= k;
      state.reserves[f] += k;
      log(
        state,
        `${hero.name} cleanses ${LOCATIONS[hero.loc].name} of ${k} ${FRONTS[f].name} corruption${k > 1 ? 's' : ''}.`
      );
      spendAction(state);
      return state;
    }

    case 'COUNSEL': {
      if (state.phase !== 'actions') return prev;
      const other = state.heroes[action.other];
      if (!other || other.id === hero.id || other.loc !== hero.loc) return prev;
      const giver = action.dir === 'give' ? hero : action.dir === 'take' ? other : null;
      if (!giver) return prev;
      const receiver = giver === hero ? other : hero;
      const card = giver.hand[action.card];
      if (card == null) return prev;
      if (hero.role !== 'lorekeeper' && card !== hero.loc) return prev;
      giver.hand.splice(action.card, 1);
      receiver.hand.push(card);
      log(state, `${giver.name} entrusts the ${LOCATIONS[card].name} scroll to ${receiver.name}.`);
      state.actionsLeft--;
      if (receiver.hand.length > HAND_LIMIT) {
        state.phase = 'discard';
        state.discardHero = receiver.id;
        state.discardReturn = state.actionsLeft > 0 ? 'actions' : 'draw';
        log(state, `${receiver.name} carries too many burdens and must set some down.`);
      } else if (state.actionsLeft <= 0) {
        endOfActions(state);
      }
      return state;
    }

    case 'BANISH': {
      if (state.phase !== 'actions') return prev;
      const f = action.front;
      if (!Number.isInteger(f) || f < 0 || f > 3 || state.banished[f]) return prev;
      if (hero.loc !== HAVENS[f]) return prev;
      const cost = banishCost(hero.role);
      let use = action.cards;
      if (Array.isArray(use)) {
        const uniq = [...new Set(use)];
        if (
          uniq.length !== cost ||
          uniq.some((i) => hero.hand[i] == null || LOCATIONS[hero.hand[i]].front !== f)
        )
          return prev;
        use = uniq;
      } else {
        use = hero.hand
          .map((c, i) => (LOCATIONS[c].front === f ? i : -1))
          .filter((i) => i >= 0)
          .slice(0, cost);
        if (use.length < cost) return prev;
      }
      use
        .slice()
        .sort((a, b) => b - a)
        .forEach((i) => {
          state.heroDiscard.push(hero.hand[i]);
          hero.hand.splice(i, 1);
        });
      state.banished[f] = true;
      log(state, `At ${LOCATIONS[HAVENS[f]].name} the Shadow of ${FRONTS[f].name} is banished!`);
      if (state.banished.every(Boolean)) {
        state.winner = 'win';
        state.phase = 'game-over';
        log(state, 'The four Shadows are cast down. Light returns to Middle-earth!');
        return state;
      }
      spendAction(state);
      return state;
    }

    case 'PASS': {
      if (state.phase !== 'actions') return prev;
      log(state, `${hero.name} pauses to rest and take stock.`);
      state.actionsLeft = 0;
      endOfActions(state);
      return state;
    }

    case 'DISCARD': {
      if (state.phase !== 'discard') return prev;
      const h = state.heroes[state.discardHero];
      const card = h.hand[action.card];
      if (card == null) return prev;
      h.hand.splice(action.card, 1);
      state.heroDiscard.push(card);
      log(state, `${h.name} sets aside the ${LOCATIONS[card].name} scroll.`);
      if (h.hand.length > HAND_LIMIT) return state;
      const ret = state.discardReturn;
      state.discardHero = null;
      state.discardReturn = null;
      state.phase = 'actions';
      if (ret === 'draw') endOfActions(state);
      else if (ret === 'end-turn') {
        corruptionStep(state);
        nextHero(state);
      }
      return state;
    }

    default:
      return prev;
  }
}
