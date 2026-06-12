// Rules engine for The Leaves of Lórien (Dominion-style deck-builder).
// Pure serializable reducer: newGame() builds a plain JSON state, reduce()
// structuredClones, applies an action, and returns the new state (or the
// previous state unchanged for illegal actions).

import { CARDS, SUPPLY_ORDER } from './cards.js';

export const FACTIONS = [
  { name: 'Gondor', color: '#5a6b80' },
  { name: 'Mordor', color: '#9c2a18' },
  { name: 'Rohan', color: '#3e7d44' },
  { name: 'Isengard', color: '#7a5f9c' },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pushLog(state, msg) {
  state.log = [...state.log.slice(-59), msg];
}

function drawCards(state, player, n) {
  let drawn = 0;
  for (let i = 0; i < n; i++) {
    if (player.deck.length === 0) {
      if (player.discard.length === 0) break;
      player.deck = shuffle(player.discard);
      player.discard = [];
    }
    player.hand.push(player.deck.pop());
    drawn++;
  }
  return drawn;
}

export function newGame(numPlayers) {
  const n = Math.max(1, Math.min(4, numPlayers));
  const players = [];
  for (let i = 0; i < n; i++) {
    const start = [
      'lembas', 'lembas', 'lembas', 'lembas', 'lembas', 'lembas', 'lembas',
      'glade', 'glade', 'glade',
    ];
    players.push({
      name: FACTIONS[i].name,
      color: FACTIONS[i].color,
      deck: shuffle(start),
      hand: [],
      discard: [],
      inPlay: [],
    });
  }
  const victoryCount = n === 2 ? 8 : 12;
  const piles = {
    lembas: 46,
    mithril: 26,
    arkenstone: 26,
    glade: victoryCount,
    haven: victoryCount,
    realm: victoryCount,
    shadow: Math.min(30, n * 10),
  };
  for (const k of SUPPLY_ORDER) if (CARDS[k].type === 'action') piles[k] = 10;

  const state = {
    players,
    piles,
    current: 0,
    phase: 'action',
    actions: 1,
    buys: 1,
    gold: 0,
    turn: 1,
    over: null, // { scores: [{ name, score }], winners: [indices] }
    pendingChoice: null,
    trash: [],
    log: [
      'Beneath the mallorn boughs the stewards gather golden leaves.',
      `${players[0].name} takes the first turn.`,
    ],
  };
  for (const p of state.players) drawCards(state, p, 5);
  return state;
}

export function scoreOf(player) {
  const all = [...player.deck, ...player.hand, ...player.discard, ...player.inPlay];
  return all.reduce((s, k) => s + (CARDS[k].vp || 0), 0);
}

function emptyPileCount(state) {
  return Object.values(state.piles).filter((c) => c === 0).length;
}

function gameShouldEnd(state) {
  return state.piles.realm === 0 || emptyPileCount(state) >= 3;
}

function finishGame(state) {
  const scores = state.players.map((p) => ({ name: p.name, score: scoreOf(p) }));
  const best = Math.max(...scores.map((s) => s.score));
  const winners = scores
    .map((s, i) => (s.score === best ? i : -1))
    .filter((i) => i >= 0);
  state.over = { scores, winners };
  if (state.piles.realm === 0) pushLog(state, 'The last Realm is claimed — the gathering ends.');
  else pushLog(state, 'Three stores stand empty — the gathering ends.');
  if (winners.length === 1) {
    pushLog(state, `${state.players[winners[0]].name} holds the most leaves (${best}) and rules the glade!`);
  } else {
    pushLog(
      state,
      `${winners.map((i) => state.players[i].name).join(' and ')} hold ${best} leaves alike and share the rule.`
    );
  }
}

function cleanupAndAdvance(state) {
  const me = state.players[state.current];
  me.discard.push(...me.hand, ...me.inPlay);
  me.hand = [];
  me.inPlay = [];
  drawCards(state, me, 5);

  if (gameShouldEnd(state)) {
    finishGame(state);
    return;
  }

  state.current = (state.current + 1) % state.players.length;
  if (state.current === 0) state.turn++;
  state.phase = 'action';
  state.actions = 1;
  state.buys = 1;
  state.gold = 0;
  state.pendingChoice = null;
  pushLog(state, `${state.players[state.current].name} takes the turn.`);
}

function applyCardEffects(state, key) {
  const me = state.players[state.current];
  const card = CARDS[key];
  if (card.actions) state.actions += card.actions;
  if (card.buys) state.buys += card.buys;
  if (card.gold) state.gold += card.gold;
  if (card.cards) drawCards(state, me, card.cards);

  if (card.attack === 'discard') {
    for (let i = 1; i < state.players.length; i++) {
      const p = state.players[(state.current + i) % state.players.length];
      let dropped = 0;
      while (p.hand.length > 3) {
        // Auto-discard the highest-cost card.
        let best = 0;
        for (let j = 1; j < p.hand.length; j++) {
          if (CARDS[p.hand[j]].cost > CARDS[p.hand[best]].cost) best = j;
        }
        p.discard.push(p.hand.splice(best, 1)[0]);
        dropped++;
      }
      if (dropped > 0) pushLog(state, `${p.name} loses ${dropped} card${dropped > 1 ? 's' : ''} to the raiders.`);
    }
  }
  if (card.attack === 'shadow') {
    for (let i = 1; i < state.players.length; i++) {
      const p = state.players[(state.current + i) % state.players.length];
      if (state.piles.shadow > 0) {
        state.piles.shadow--;
        p.discard.push('shadow');
        pushLog(state, `A Shadow settles over ${p.name}.`);
      }
    }
  }
  if (card.special === 'reforge' && me.hand.length > 0) {
    state.pendingChoice = { type: 'reforge-trash' };
  }
  if (card.special === 'havens' && me.hand.length > 0) {
    state.pendingChoice = { type: 'havens-trash' };
  }
}

export function reduce(prev, action) {
  if (!action || prev.over) return prev;
  const state = structuredClone(prev);
  const me = state.players[state.current];

  switch (action.type) {
    case 'PLAY_ACTION': {
      if (state.phase !== 'action' || state.pendingChoice || state.actions < 1) return prev;
      const key = me.hand[action.index];
      if (!key || CARDS[key].type !== 'action') return prev;
      me.hand.splice(action.index, 1);
      me.inPlay.push(key);
      state.actions--;
      pushLog(state, `${me.name} plays ${CARDS[key].name}.`);
      applyCardEffects(state, key);
      return state;
    }

    case 'CHOOSE': {
      const pc = state.pendingChoice;
      if (!pc) return prev;
      if (pc.type === 'reforge-trash') {
        const key = me.hand[action.index];
        if (!key) return prev;
        me.hand.splice(action.index, 1);
        state.trash.push(key);
        state.pendingChoice = { type: 'reforge-gain', maxCost: CARDS[key].cost + 2 };
        pushLog(state, `${me.name} casts ${CARDS[key].name} into the forge-fire.`);
        return state;
      }
      if (pc.type === 'reforge-gain') {
        if (action.skip) {
          state.pendingChoice = null;
          pushLog(state, `${me.name} takes nothing from the anvil.`);
          return state;
        }
        const key = action.cardKey;
        if (!CARDS[key] || !(state.piles[key] > 0) || CARDS[key].cost > pc.maxCost) return prev;
        state.piles[key]--;
        me.discard.push(key);
        state.pendingChoice = null;
        pushLog(state, `${me.name} reforges it into ${CARDS[key].name}.`);
        return state;
      }
      if (pc.type === 'havens-trash') {
        const indices = Array.isArray(action.indices) ? action.indices : [];
        const unique = [...new Set(indices)];
        if (unique.length !== indices.length || indices.length > 4) return prev;
        if (indices.some((i) => !Number.isInteger(i) || i < 0 || i >= me.hand.length)) return prev;
        const sorted = [...indices].sort((a, b) => b - a);
        const names = [];
        for (const i of sorted) {
          names.unshift(CARDS[me.hand[i]].name);
          state.trash.push(me.hand.splice(i, 1)[0]);
        }
        state.pendingChoice = null;
        if (names.length) pushLog(state, `${me.name} lets go of ${names.join(', ')} at the Havens.`);
        else pushLog(state, `${me.name} keeps every card.`);
        return state;
      }
      return prev;
    }

    case 'PLAY_TREASURES': {
      if (state.pendingChoice) return prev;
      if (state.phase === 'action') state.phase = 'buy';
      if (state.phase !== 'buy') return prev;
      let total = 0;
      let played = 0;
      for (let i = me.hand.length - 1; i >= 0; i--) {
        if (CARDS[me.hand[i]].type === 'treasure') {
          total += CARDS[me.hand[i]].gold;
          me.inPlay.push(me.hand.splice(i, 1)[0]);
          played++;
        }
      }
      if (played === 0 && prev.phase === 'buy') return prev;
      state.gold += total;
      if (played > 0) pushLog(state, `${me.name} lays out treasures worth ${total} gold.`);
      return state;
    }

    case 'BUY': {
      if (state.phase !== 'buy' || state.pendingChoice || state.buys < 1) return prev;
      const key = action.cardKey;
      const card = CARDS[key];
      if (!card || !(state.piles[key] > 0) || state.gold < card.cost) return prev;
      state.piles[key]--;
      state.gold -= card.cost;
      state.buys--;
      me.discard.push(key);
      pushLog(state, `${me.name} gains ${card.name} for ${card.cost} gold.`);
      return state;
    }

    case 'END_PHASE': {
      if (state.pendingChoice) return prev;
      if (state.phase === 'action') {
        state.phase = 'buy';
        pushLog(state, `${me.name} goes to market.`);
        return state;
      }
      cleanupAndAdvance(state);
      return state;
    }

    case 'END_TURN': {
      if (state.pendingChoice) return prev;
      cleanupAndAdvance(state);
      return state;
    }

    default:
      return prev;
  }
}
