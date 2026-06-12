// Rules engine for "There and Back Again" — a Ticket-to-Ride-style journey
// game across Middle-earth. Pure functions over a serializable state.

import { PLACES, ROUTES, TICKETS } from './map.js';

export { PLACES, ROUTES, TICKETS, MAP_W, MAP_H, ROUTE_COLORS } from './map.js';

export const FACTIONS = [
  { name: 'Gondor', color: '#5a6b80' },
  { name: 'Mordor', color: '#9c2a18' },
  { name: 'Rohan', color: '#3e7d44' },
  { name: 'Isengard', color: '#7a5f9c' },
];

export const CARD_COLORS = ['red', 'green', 'blue', 'gold'];

// Points scored for claiming a road of each length.
export const POINTS = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 10, 6: 15 };

const START_PONIES = 30;
const START_HAND = 4;

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

// Draw one pony card, reshuffling the discard pile when the deck runs dry.
// Returns null when no cards remain anywhere outside hands and market.
function drawCard(state) {
  if (state.deck.length === 0 && state.discard.length > 0) {
    state.deck = shuffle(state.discard);
    state.discard = [];
  }
  return state.deck.length ? state.deck.pop() : null;
}

function marketEagles(state) {
  return state.market.filter((c) => c === 'eagle').length;
}

// Top up the face-up market to five; if three or more Eagles show, sweep all
// five to the discard and deal again (guarded so a deck of mostly Eagles
// cannot loop forever).
function refillMarket(state) {
  while (state.market.length < 5) {
    const c = drawCard(state);
    if (!c) break;
    state.market.push(c);
  }
  let guard = 0;
  while (state.market.length === 5 && marketEagles(state) >= 3 && guard < 6) {
    const nonEaglesOutside =
      state.deck.filter((c) => c !== 'eagle').length +
      state.discard.filter((c) => c !== 'eagle').length;
    if (nonEaglesOutside < 3) break;
    state.discard.push(...state.market.splice(0));
    log(state, 'Too many Eagles wheel above the market — the stalls are swept and restocked.');
    while (state.market.length < 5) {
      const c = drawCard(state);
      if (!c) break;
      state.market.push(c);
    }
    guard++;
  }
}

// Are the two places joined by the player's own claimed roads?
export function connected(state, pid, from, to) {
  if (from === to) return true;
  const adj = {};
  for (const r of state.routes) {
    if (r.owner !== pid) continue;
    (adj[r.a] = adj[r.a] || []).push(r.b);
    (adj[r.b] = adj[r.b] || []).push(r.a);
  }
  const seen = new Set([from]);
  const queue = [from];
  while (queue.length) {
    const x = queue.pop();
    if (x === to) return true;
    for (const y of adj[x] || []) {
      if (!seen.has(y)) {
        seen.add(y);
        queue.push(y);
      }
    }
  }
  return false;
}

// Longest continuous trail (each road used at most once) over a player's
// claimed network, measured in road lengths. Exhaustive DFS — player
// networks are small.
export function longestTrail(state, pid) {
  const edges = state.routes.filter((r) => r.owner === pid);
  if (edges.length === 0) return 0;
  const adj = new Map();
  edges.forEach((r, i) => {
    if (!adj.has(r.a)) adj.set(r.a, []);
    if (!adj.has(r.b)) adj.set(r.b, []);
    adj.get(r.a).push({ i, to: r.b, len: r.len });
    adj.get(r.b).push({ i, to: r.a, len: r.len });
  });
  let best = 0;
  const used = new Array(edges.length).fill(false);
  const dfs = (node, total) => {
    if (total > best) best = total;
    for (const e of adj.get(node) || []) {
      if (!used[e.i]) {
        used[e.i] = true;
        dfs(e.to, total + e.len);
        used[e.i] = false;
      }
    }
  };
  for (const node of adj.keys()) dfs(node, 0);
  return best;
}

// Ways the player could pay for a road right now: use as many matching-colour
// ponies as possible, Eagles filling the rest. Grey roads offer one option
// per viable colour (plus an all-Eagles option at most once).
export function paymentOptions(hand, route) {
  const len = route.len;
  const colors = route.color === 'grey' ? CARD_COLORS : [route.color];
  const opts = [];
  let pureEagles = false;
  for (const c of colors) {
    const use = Math.min(hand[c] || 0, len);
    const eagles = len - use;
    if (eagles > (hand.eagle || 0)) continue;
    if (use === 0) {
      if (pureEagles) continue;
      pureEagles = true;
    }
    opts.push({ color: c, colorCount: use, eagles });
  }
  return opts;
}

export function newGame(numPlayers) {
  const n = Math.min(4, Math.max(2, numPlayers));
  const cards = [];
  for (const c of CARD_COLORS) for (let i = 0; i < 12; i++) cards.push(c);
  for (let i = 0; i < 10; i++) cards.push('eagle');
  const deck = shuffle(cards);

  const players = [];
  for (let i = 0; i < n; i++) {
    const hand = { red: 0, green: 0, blue: 0, gold: 0, eagle: 0 };
    for (let k = 0; k < START_HAND; k++) hand[deck.pop()]++;
    players.push({
      id: i,
      name: FACTIONS[i].name,
      color: FACTIONS[i].color,
      hand,
      tickets: [],
      ponies: START_PONIES,
      score: 0,
    });
  }

  const state = {
    players,
    market: [],
    deck,
    discard: [],
    ticketDeck: shuffle(TICKETS.map((t) => ({ ...t }))),
    routes: ROUTES.map((r) => ({ ...r, owner: null })),
    current: 0,
    phase: 'pick-tickets',
    pendingTickets: null,
    drawsLeft: 2,
    finalTurnsLeft: null,
    lastToMove: null,
    winners: null,
    results: null,
    turn: 1,
    log: ['The road goes ever on: the companies gather, ponies saddled and maps unrolled.'],
  };
  refillMarket(state);
  state.pendingTickets = state.ticketDeck.splice(0, 2);
  log(state, `${players[0].name} ponders two journey cards.`);
  return state;
}

function checkTickets(state, player) {
  for (const t of player.tickets) {
    if (!t.done && connected(state, player.id, t.from, t.to)) t.done = true;
  }
}

// Can this player do anything at the start of a fresh turn?
function hasAnyMove(state, pid) {
  if (state.market.length > 0 || state.deck.length > 0 || state.discard.length > 0) return true;
  if (state.ticketDeck.length > 0) return true;
  const p = state.players[pid];
  return state.routes.some(
    (r) => r.owner === null && r.len <= p.ponies && paymentOptions(p.hand, r).length > 0
  );
}

// After the first of two card draws, is a second draw even possible?
function canSecondDraw(state) {
  if (state.deck.length > 0 || state.discard.length > 0) return true;
  return state.market.some((c) => c !== 'eagle');
}

// No unclaimed road can be afforded pony-wise by anyone: the map is ridden out.
function noClaimsPossible(state) {
  return state.routes.every(
    (r) => r.owner !== null || state.players.every((p) => p.ponies < r.len)
  );
}

function finishGame(state) {
  state.phase = 'game-over';
  const trails = state.players.map((p) => longestTrail(state, p.id));
  const maxTrail = Math.max(...trails);
  state.results = state.players.map((p, i) => {
    let ticketPlus = 0;
    let ticketMinus = 0;
    for (const t of p.tickets) {
      t.done = connected(state, p.id, t.from, t.to);
      if (t.done) ticketPlus += t.points;
      else ticketMinus += t.points;
    }
    const bonus = maxTrail > 0 && trails[i] === maxTrail ? 10 : 0;
    return {
      routePts: p.score,
      ticketPlus,
      ticketMinus,
      trail: trails[i],
      bonus,
      total: p.score + ticketPlus - ticketMinus + bonus,
    };
  });
  const best = Math.max(...state.results.map((r) => r.total));
  state.winners = state.players.filter((_, i) => state.results[i].total === best).map((p) => p.id);
  const names = state.winners.map((i) => state.players[i].name).join(' and ');
  log(
    state,
    `The journeys are done. ${names} ${state.winners.length > 1 ? 'share the longest tale' : 'tells the longest tale'}!`
  );
}

function advance(state) {
  const n = state.players.length;
  for (let i = 1; i <= n; i++) {
    state.current = (state.current + 1) % n;
    state.drawsLeft = 2;
    if (hasAnyMove(state, state.current)) {
      state.turn++;
      return;
    }
    log(state, `${state.players[state.current].name} can do nothing and waits by the roadside.`);
    if (state.finalTurnsLeft !== null) {
      state.finalTurnsLeft--;
      if (state.finalTurnsLeft <= 0) {
        finishGame(state);
        return;
      }
    }
  }
  finishGame(state);
}

function endTurn(state) {
  const me = state.players[state.current];
  if (state.finalTurnsLeft === null) {
    if (me.ponies <= 2) {
      state.finalTurnsLeft = state.players.length - 1;
      state.lastToMove = me.id;
      log(state, `${me.name}'s stable is nearly empty — one last turn for every other company!`);
    } else if (noClaimsPossible(state)) {
      log(state, 'Every road that could be ridden has been ridden. The tale is told.');
      finishGame(state);
      return;
    }
  } else {
    state.finalTurnsLeft--;
    if (state.finalTurnsLeft <= 0) {
      finishGame(state);
      return;
    }
  }
  advance(state);
}

export function reduce(prev, action) {
  const state = structuredClone(prev);
  const me = state.players[state.current];

  switch (action.type) {
    case 'KEEP_TICKETS': {
      if (!state.pendingTickets) return prev;
      const idx = [...new Set(action.indices || [])].filter(
        (i) => Number.isInteger(i) && i >= 0 && i < state.pendingTickets.length
      );
      if (idx.length < 1) return prev;
      const keep = idx.map((i) => state.pendingTickets[i]);
      const rest = state.pendingTickets.filter((_, i) => !idx.includes(i));
      for (const t of keep) {
        me.tickets.push({
          from: t.from,
          to: t.to,
          points: t.points,
          done: connected(state, me.id, t.from, t.to),
        });
      }
      state.ticketDeck.push(...rest); // discarded tickets go to the bottom
      state.pendingTickets = null;
      log(state, `${me.name} swears to ${keep.length} journey${keep.length > 1 ? 's' : ''}.`);
      if (state.phase === 'pick-tickets') {
        if (state.current + 1 < state.players.length) {
          state.current++;
          state.pendingTickets = state.ticketDeck.splice(0, 2);
          log(state, `${state.players[state.current].name} ponders two journey cards.`);
        } else {
          state.phase = 'turn';
          state.current = 0;
          state.drawsLeft = 2;
          log(state, `The journeys begin in earnest. ${state.players[0].name} takes the road.`);
        }
      } else {
        endTurn(state);
      }
      return state;
    }

    case 'DRAW_TICKETS': {
      if (state.phase !== 'turn' || state.pendingTickets || state.drawsLeft !== 2) return prev;
      if (state.ticketDeck.length === 0) return prev;
      state.pendingTickets = state.ticketDeck.splice(0, Math.min(2, state.ticketDeck.length));
      log(state, `${me.name} studies fresh journey cards.`);
      return state;
    }

    case 'DRAW_MARKET': {
      if (state.phase !== 'turn' || state.pendingTickets) return prev;
      const i = action.index;
      if (!Number.isInteger(i) || i < 0 || i >= state.market.length) return prev;
      const card = state.market[i];
      // A face-up Eagle may only be taken as the first pick, and ends the turn.
      if (card === 'eagle' && state.drawsLeft !== 2) return prev;
      state.market.splice(i, 1);
      me.hand[card]++;
      refillMarket(state);
      if (card === 'eagle') {
        log(state, `${me.name} whistles down a Great Eagle from the market.`);
        endTurn(state);
      } else {
        log(state, `${me.name} buys a ${card} pony at the market.`);
        state.drawsLeft--;
        if (state.drawsLeft <= 0 || !canSecondDraw(state)) endTurn(state);
      }
      return state;
    }

    case 'DRAW_BLIND': {
      if (state.phase !== 'turn' || state.pendingTickets) return prev;
      const card = drawCard(state);
      if (!card) return prev;
      me.hand[card]++;
      log(state, `${me.name} draws a card from the saddlebags.`);
      state.drawsLeft--;
      if (state.drawsLeft <= 0 || !canSecondDraw(state)) endTurn(state);
      return state;
    }

    case 'CLAIM': {
      if (state.phase !== 'turn' || state.pendingTickets || state.drawsLeft !== 2) return prev;
      const route = state.routes.find((r) => r.id === action.routeId);
      if (!route || route.owner !== null) return prev;
      // The engine computes the payment: as many matching-colour ponies as
      // the hand holds, Eagles covering the remainder.
      if (!CARD_COLORS.includes(action.color)) return prev;
      if (route.color !== 'grey' && action.color !== route.color) return prev;
      const colorCount = Math.min(me.hand[action.color], route.len);
      const eagles = route.len - colorCount;
      if (me.hand.eagle < eagles) return prev;
      if (me.ponies < route.len) return prev;
      me.hand[action.color] -= colorCount;
      for (let k = 0; k < colorCount; k++) state.discard.push(action.color);
      me.hand.eagle -= eagles;
      for (let k = 0; k < eagles; k++) state.discard.push('eagle');
      route.owner = me.id;
      me.ponies -= route.len;
      me.score += POINTS[route.len];
      log(
        state,
        `${me.name} rides the road from ${PLACES[route.a].name} to ${PLACES[route.b].name} (+${POINTS[route.len]}).`
      );
      checkTickets(state, me);
      endTurn(state);
      return state;
    }

    default:
      return prev;
  }
}
