// Rules engine for the War of the Ring (Risk-style) game.
// Pure functions over a serializable state; the map (from buildRiskMap) is
// passed alongside the state, like the geometry in the settlers engine.

import { REALMS } from './map';

export const RISK_FACTIONS = [
  { name: 'Gondor', color: '#5a6b80' },
  { name: 'Mordor', color: '#9c2a18' },
  { name: 'Rohan', color: '#3e7d44' },
  { name: 'Isengard', color: '#7a5f9c' },
];

export const CARD_KINDS = ['sword', 'horse', 'eagle'];
export const CARD_INFO = {
  sword: { name: 'Swords', icon: 'sword' },
  horse: { name: 'Riders', icon: 'horse' },
  eagle: { name: 'Eagles', icon: 'eagle' },
  wild: { name: 'The One Ring', icon: 'ring' },
};

// Escalating trade-in values, as in the classic game.
const TRADE_VALUES = [4, 6, 8, 10, 12, 15];

export function tradeValue(setsTraded) {
  if (setsTraded < TRADE_VALUES.length) return TRADE_VALUES[setsTraded];
  return 15 + (setsTraded - TRADE_VALUES.length + 1) * 5;
}

const INITIAL_ARMIES = { 2: 40, 3: 35, 4: 30 };

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function log(state, msg) {
  state.log = [...state.log.slice(-60), msg];
}

export function newRiskGame(map, numPlayers) {
  const players = [];
  for (let i = 0; i < numPlayers; i++) {
    players.push({ ...RISK_FACTIONS[i], id: i, cards: [], eliminated: false });
  }
  const owner = {};
  const armies = {};
  const order = shuffle(map.territories.map((t) => t.id));
  order.forEach((tid, i) => {
    owner[tid] = i % numPlayers;
    armies[tid] = 1;
  });
  // Distribute the remaining starting armies at random.
  for (let p = 0; p < numPlayers; p++) {
    const owned = order.filter((tid) => owner[tid] === p);
    let left = INITIAL_ARMIES[numPlayers] - owned.length;
    while (left > 0) {
      armies[owned[Math.floor(Math.random() * owned.length)]]++;
      left--;
    }
  }
  const deck = shuffle(
    map.territories
      .map((t, i) => ({ kind: CARD_KINDS[i % 3], tid: t.id }))
      .concat([{ kind: 'wild', tid: null }, { kind: 'wild', tid: null }])
  );
  const state = {
    players,
    owner,
    armies,
    deck,
    discard: [],
    setsTraded: 0,
    phase: 'muster',
    current: 0,
    toPlace: 0,
    conqueredThisTurn: false,
    battle: null, // { from, to, roll: { a: [], d: [], lossA, lossD } }
    pendingOccupy: null, // { from, to, min }
    turn: 1,
    winner: null,
    log: ['The War of the Ring begins. Gondor musters its hosts.'],
  };
  beginMuster(state, map);
  return state;
}

export function territoriesOf(state, pid) {
  return Object.keys(state.owner)
    .filter((tid) => state.owner[tid] === pid)
    .map(Number);
}

export function reinforcementsFor(state, map, pid) {
  const owned = territoriesOf(state, pid);
  let n = Math.max(3, Math.floor(owned.length / 3));
  const set = new Set(owned);
  for (const [realm, tids] of Object.entries(map.realmTerritories)) {
    if (tids.every((t) => set.has(t))) n += REALMS[realm].bonus;
  }
  return n;
}

// Find a tradeable set: three of a kind or one of each, wilds count as any.
export function findSet(cards) {
  const idxByKind = { sword: [], horse: [], eagle: [], wild: [] };
  cards.forEach((c, i) => idxByKind[c.kind].push(i));
  const wilds = idxByKind.wild;
  for (const k of CARD_KINDS) {
    const pool = [...idxByKind[k], ...wilds];
    if (pool.length >= 3) return pool.slice(0, 3);
  }
  const oneEach = [];
  for (const k of CARD_KINDS) if (idxByKind[k].length) oneEach.push(idxByKind[k][0]);
  for (const w of wilds) if (oneEach.length < 3) oneEach.push(w);
  return oneEach.length >= 3 ? oneEach.slice(0, 3) : null;
}

function applyTrade(state, map, setIdx) {
  const me = state.players[state.current];
  const set = setIdx.map((i) => me.cards[i]);
  me.cards = me.cards.filter((_, i) => !setIdx.includes(i));
  state.discard.push(...set);
  const value = tradeValue(state.setsTraded);
  state.setsTraded++;
  state.toPlace += value;
  log(state, `${me.name} trades a set of banners for ${value} armies.`);
  // +2 on one owned territory shown on a traded card.
  for (const c of set) {
    if (c.tid !== null && state.owner[c.tid] === state.current) {
      state.armies[c.tid] += 2;
      log(state, `Two extra companies muster on ${map.territories[c.tid].name}.`);
      break;
    }
  }
}

function beginMuster(state, map) {
  const me = state.players[state.current];
  state.phase = 'muster';
  state.conqueredThisTurn = false;
  state.battle = null;
  state.pendingOccupy = null;
  state.toPlace = reinforcementsFor(state, map, state.current);
  // Forced trades while holding five or more cards.
  let set;
  while (me.cards.length >= 5 && (set = findSet(me.cards))) applyTrade(state, map, set);
  log(state, `${me.name} musters ${state.toPlace} armies.`);
}

function rollDice(n) {
  return Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 6)).sort((a, b) => b - a);
}

function resolveBattleRoll(state, map) {
  const { from, to } = state.battle;
  const aDice = Math.min(3, state.armies[from] - 1);
  const dDice = Math.min(2, state.armies[to]);
  const a = rollDice(aDice);
  const d = rollDice(dDice);
  let lossA = 0;
  let lossD = 0;
  for (let i = 0; i < Math.min(aDice, dDice); i++) {
    if (a[i] > d[i]) lossD++;
    else lossA++;
  }
  state.armies[from] -= lossA;
  state.armies[to] -= lossD;
  state.battle.roll = { a, d, lossA, lossD };

  if (state.armies[to] === 0) {
    const defender = state.owner[to];
    state.owner[to] = state.current;
    state.conqueredThisTurn = true;
    log(
      state,
      `${state.players[state.current].name} conquers ${map.territories[to].name}!`
    );
    // Elimination: the conqueror claims the fallen player's cards.
    if (territoriesOf(state, defender).length === 0) {
      const fallen = state.players[defender];
      fallen.eliminated = true;
      state.players[state.current].cards.push(...fallen.cards);
      fallen.cards = [];
      log(state, `💀 ${fallen.name} has been driven from Middle-earth!`);
    }
    if (state.players.every((p) => p.id === state.current || p.eliminated)) {
      state.winner = state.current;
      state.phase = 'game-over';
      state.battle = null;
      log(state, `👑 ${state.players[state.current].name} rules all of Middle-earth!`);
      return;
    }
    state.pendingOccupy = { from, to, min: Math.min(aDice, state.armies[from] - 1) };
    state.phase = 'occupy';
    state.battle = null;
  } else if (state.armies[from] === 1) {
    log(state, `The assault on ${map.territories[to].name} is repelled.`);
    state.battle = null;
  }
}

// Territories reachable from `from` through the current player's own lands.
export function connectedOwned(state, map, from) {
  const pid = state.owner[from];
  const seen = new Set([from]);
  const queue = [from];
  while (queue.length) {
    const t = queue.pop();
    for (const n of map.neighbors[t]) {
      if (state.owner[n] === pid && !seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }
  seen.delete(from);
  return [...seen];
}

function endTurn(state, map) {
  if (state.conqueredThisTurn && state.deck.length + state.discard.length > 0) {
    if (state.deck.length === 0) {
      state.deck = shuffle(state.discard);
      state.discard = [];
    }
    state.players[state.current].cards.push(state.deck.pop());
    log(state, `${state.players[state.current].name} earns a banner card.`);
  }
  do {
    state.current = (state.current + 1) % state.players.length;
  } while (state.players[state.current].eliminated);
  state.turn++;
  beginMuster(state, map);
}

export function reduceRisk(prev, map, action) {
  const state = structuredClone(prev);
  const me = state.players[state.current];

  switch (action.type) {
    case 'TRADE': {
      if (state.phase !== 'muster') return prev;
      const set = findSet(me.cards);
      if (!set) return prev;
      applyTrade(state, map, set);
      return state;
    }

    case 'PLACE': {
      if (state.phase !== 'muster' || state.toPlace <= 0) return prev;
      if (state.owner[action.tid] !== state.current) return prev;
      const n = Math.min(action.n || 1, state.toPlace);
      state.armies[action.tid] += n;
      state.toPlace -= n;
      return state;
    }

    case 'BEGIN_ATTACK': {
      if (state.phase !== 'muster' || state.toPlace > 0) return prev;
      state.phase = 'attack';
      log(state, `${me.name} marches to war.`);
      return state;
    }

    case 'BATTLE': {
      if (state.phase !== 'attack') return prev;
      const { from, to } = action;
      if (
        state.owner[from] !== state.current ||
        state.owner[to] === state.current ||
        state.armies[from] < 2 ||
        !map.neighbors[from].includes(to)
      )
        return prev;
      state.battle = { from, to, roll: null };
      if (action.blitz) {
        while (state.battle && state.armies[from] > 1) {
          resolveBattleRoll(state, map);
          if (state.phase !== 'attack') break;
        }
      } else {
        resolveBattleRoll(state, map);
      }
      return state;
    }

    case 'RETREAT': {
      if (state.phase !== 'attack') return prev;
      state.battle = null;
      return state;
    }

    case 'OCCUPY': {
      if (state.phase !== 'occupy' || !state.pendingOccupy) return prev;
      const { from, to, min } = state.pendingOccupy;
      const max = state.armies[from] - 1;
      const n = Math.max(Math.min(action.n, max), Math.min(min, max));
      state.armies[from] -= n;
      state.armies[to] += n;
      state.pendingOccupy = null;
      state.phase = 'attack';
      return state;
    }

    case 'END_ATTACK': {
      if (state.phase !== 'attack') return prev;
      state.battle = null;
      state.phase = 'fortify';
      return state;
    }

    case 'FORTIFY': {
      if (state.phase !== 'fortify') return prev;
      const { from, to, n } = action;
      if (
        state.owner[from] !== state.current ||
        state.owner[to] !== state.current ||
        state.armies[from] <= n ||
        n < 1 ||
        !connectedOwned(state, map, from).includes(to)
      )
        return prev;
      state.armies[from] -= n;
      state.armies[to] += n;
      log(state, `${me.name} marches ${n} armies to ${map.territories[to].name}.`);
      endTurn(state, map);
      return state;
    }

    case 'END_TURN': {
      if (state.phase !== 'fortify' && state.phase !== 'attack') return prev;
      state.battle = null;
      endTurn(state, map);
      return state;
    }

    default:
      return prev;
  }
}
