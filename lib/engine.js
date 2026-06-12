// Game rules engine. Pure functions over a serializable state object.
// Geometry (vertices/edges) is derived from state.board.hexes via buildGeometry
// and passed in alongside the state.

import { RESOURCES, RESOURCE_INFO, TERRAIN_INFO, FACTIONS, COSTS, VP_TO_WIN } from './constants';
import { generateBoard } from './board';

const DEV_DECK = [
  ...Array(14).fill('knight'),
  ...Array(5).fill('vp'),
  'roads', 'roads',
  'plenty', 'plenty',
  'monopoly', 'monopoly',
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyResources() {
  return { wood: 0, clay: 0, wool: 0, grain: 0, ore: 0 };
}

export function newGame(numPlayers) {
  const board = generateBoard();
  const players = [];
  for (let i = 0; i < numPlayers; i++) {
    players.push({
      id: i,
      name: FACTIONS[i].name,
      color: FACTIONS[i].color,
      resources: emptyResources(),
      devCards: [], // { type, boughtOnTurn }
      knightsPlayed: 0,
    });
  }
  const setupQueue = [];
  for (let i = 0; i < numPlayers; i++) setupQueue.push(i);
  for (let i = numPlayers - 1; i >= 0; i--) setupQueue.push(i);
  return {
    board,
    players,
    buildings: {}, // vid -> { player, type: 'settlement' | 'city' }
    roads: {}, // eid -> player
    phase: 'setup-settlement',
    current: 0,
    setupIndex: 0,
    setupQueue,
    lastSetupSettlement: null,
    dice: null,
    turn: 0,
    devDeck: shuffle(DEV_DECK),
    devPlayedThisTurn: false,
    freeRoads: 0,
    robberFromKnight: false,
    longestRoadHolder: null,
    largestArmyHolder: null,
    winner: null,
    log: ['The fellowship of settlers gathers. Place your first village.'],
  };
}

function log(state, msg) {
  state.log = [...state.log.slice(-60), msg];
}

function playerName(state, pid) {
  return state.players[pid].name;
}

export function totalCards(player) {
  return RESOURCES.reduce((s, r) => s + player.resources[r], 0);
}

export function canAfford(player, cost) {
  return Object.entries(cost).every(([r, n]) => player.resources[r] >= n);
}

function pay(player, cost) {
  for (const [r, n] of Object.entries(cost)) player.resources[r] -= n;
}

// ---------- legality ----------

function vertexFreeWithDistance(state, geom, v) {
  if (state.buildings[v]) return false;
  return (geom.vertexNeighbors[v] || []).every((n) => !state.buildings[n]);
}

export function legalSetupSettlements(state, geom) {
  return Object.keys(geom.vertices).filter((v) => vertexFreeWithDistance(state, geom, v));
}

export function legalSetupRoads(state, geom) {
  const anchor = state.lastSetupSettlement;
  if (!anchor) return [];
  return (geom.vertexEdges[anchor] || []).filter((e) => !state.roads[e]);
}

// A player may build a road on an empty edge touching their road network or a
// building; expansion through a vertex held by an opponent is blocked.
export function legalRoads(state, geom, pid) {
  const out = [];
  for (const e of Object.values(geom.edges)) {
    if (state.roads[e.id] !== undefined) continue;
    let ok = false;
    for (const v of [e.a, e.b]) {
      const b = state.buildings[v];
      if (b && b.player === pid) ok = true;
      if (b && b.player !== pid) continue; // blocked through opponent building
      if (!b && (geom.vertexEdges[v] || []).some((other) => state.roads[other] === pid)) ok = true;
    }
    if (ok) out.push(e.id);
  }
  return out;
}

export function legalSettlements(state, geom, pid) {
  return Object.keys(geom.vertices).filter(
    (v) =>
      vertexFreeWithDistance(state, geom, v) &&
      (geom.vertexEdges[v] || []).some((e) => state.roads[e] === pid)
  );
}

export function legalCities(state, pid) {
  return Object.entries(state.buildings)
    .filter(([, b]) => b.player === pid && b.type === 'settlement')
    .map(([v]) => v);
}

// ---------- longest road / largest army ----------

function longestRoadLength(state, geom, pid) {
  const own = Object.keys(state.roads).filter((e) => state.roads[e] === pid);
  if (own.length === 0) return 0;
  const ownSet = new Set(own);
  let best = 0;

  const walk = (v, used) => {
    const b = state.buildings[v];
    if (b && b.player !== pid && used.size > 0) return 0; // opponent building cuts the path
    let max = 0;
    for (const e of geom.vertexEdges[v] || []) {
      if (!ownSet.has(e) || used.has(e)) continue;
      used.add(e);
      const edge = geom.edges[e];
      const next = edge.a === v ? edge.b : edge.a;
      max = Math.max(max, 1 + walk(next, used));
      used.delete(e);
    }
    return max;
  };

  const starts = new Set();
  for (const e of own) {
    starts.add(geom.edges[e].a);
    starts.add(geom.edges[e].b);
  }
  for (const v of starts) best = Math.max(best, walk(v, new Set()));
  return best;
}

function updateLongestRoad(state, geom) {
  const lens = state.players.map((p) => longestRoadLength(state, geom, p.id));
  const holder = state.longestRoadHolder;
  if (holder !== null && lens[holder] >= 5) {
    // Holder keeps it unless someone strictly exceeds them.
    let best = holder;
    for (const p of state.players) {
      if (lens[p.id] > lens[best]) best = p.id;
    }
    if (best !== holder) {
      state.longestRoadHolder = best;
      log(state, `${playerName(state, best)} now holds the Longest Road (${lens[best]}).`);
    }
    return;
  }
  // No valid holder: award to the unique leader with >= 5, if any.
  let max = 0;
  for (const l of lens) max = Math.max(max, l);
  if (max < 5) {
    if (holder !== null) {
      state.longestRoadHolder = null;
      log(state, 'The Longest Road has been broken.');
    }
    return;
  }
  const leaders = state.players.filter((p) => lens[p.id] === max);
  if (leaders.length === 1) {
    state.longestRoadHolder = leaders[0].id;
    log(state, `${leaders[0].name} claims the Longest Road (${max}).`);
  } else if (holder !== null) {
    state.longestRoadHolder = null;
    log(state, 'The Longest Road is contested and claimed by no one.');
  }
}

function updateLargestArmy(state, pid) {
  const n = state.players[pid].knightsPlayed;
  if (n < 3) return;
  const holder = state.largestArmyHolder;
  if (holder === null || (holder !== pid && n > state.players[holder].knightsPlayed)) {
    state.largestArmyHolder = pid;
    log(state, `${playerName(state, pid)} commands the Mightiest Host (${n} Riders).`);
  }
}

// ---------- victory points ----------

export function computeVP(state, pid) {
  let vp = 0;
  for (const b of Object.values(state.buildings)) {
    if (b.player !== pid) continue;
    vp += b.type === 'city' ? 2 : 1;
  }
  vp += state.players[pid].devCards.filter((c) => c.type === 'vp').length;
  if (state.longestRoadHolder === pid) vp += 2;
  if (state.largestArmyHolder === pid) vp += 2;
  return vp;
}

function checkWin(state, pid) {
  if (state.winner === null && computeVP(state, pid) >= VP_TO_WIN) {
    state.winner = pid;
    state.phase = 'game-over';
    log(state, `👑 ${playerName(state, pid)} has united Middle-earth and wins!`);
  }
}

// ---------- resource flow ----------

function hexResource(state, hexId) {
  const hex = state.board.hexes.find((h) => h.id === hexId);
  return TERRAIN_INFO[hex.terrain].resource;
}

function distribute(state, geom, roll) {
  const gains = state.players.map(() => emptyResources());
  for (const hex of state.board.hexes) {
    if (hex.token !== roll || hex.id === state.board.robberHex) continue;
    const res = TERRAIN_INFO[hex.terrain].resource;
    if (!res) continue;
    for (const [v, b] of Object.entries(state.buildings)) {
      if (!geom.vertices[v].hexes.includes(hex.id)) continue;
      gains[b.player][res] += b.type === 'city' ? 2 : 1;
    }
  }
  for (const p of state.players) {
    const parts = [];
    for (const r of RESOURCES) {
      if (gains[p.id][r] > 0) {
        p.resources[r] += gains[p.id][r];
        parts.push(`${gains[p.id][r]} ${RESOURCE_INFO[r].name}`);
      }
    }
    if (parts.length) log(state, `${p.name} gathers ${parts.join(', ')}.`);
  }
}

function discardHalves(state) {
  for (const p of state.players) {
    const total = totalCards(p);
    if (total <= 7) continue;
    const toDrop = Math.floor(total / 2);
    const pool = [];
    for (const r of RESOURCES) for (let i = 0; i < p.resources[r]; i++) pool.push(r);
    const dropped = shuffle(pool).slice(0, toDrop);
    for (const r of dropped) p.resources[r]--;
    log(state, `${p.name} loses ${toDrop} cards to the shadow.`);
  }
}

function stealAdjacent(state, geom, hexId) {
  const victims = new Set();
  for (const [v, b] of Object.entries(state.buildings)) {
    if (b.player === state.current) continue;
    if (!geom.vertices[v].hexes.includes(hexId)) continue;
    if (totalCards(state.players[b.player]) > 0) victims.add(b.player);
  }
  if (victims.size === 0) return;
  const list = [...victims];
  const victim = state.players[list[Math.floor(Math.random() * list.length)]];
  const pool = [];
  for (const r of RESOURCES) for (let i = 0; i < victim.resources[r]; i++) pool.push(r);
  const r = pool[Math.floor(Math.random() * pool.length)];
  victim.resources[r]--;
  state.players[state.current].resources[r]++;
  log(state, `${playerName(state, state.current)} steals ${RESOURCE_INFO[r].name} from ${victim.name}.`);
}

// ---------- reducer ----------

export function reduce(prev, geom, action) {
  const state = structuredClone(prev);
  const me = state.players[state.current];

  switch (action.type) {
    case 'PLACE_SETUP_SETTLEMENT': {
      if (state.phase !== 'setup-settlement') return prev;
      if (!vertexFreeWithDistance(state, geom, action.vid)) return prev;
      state.buildings[action.vid] = { player: state.current, type: 'settlement' };
      state.lastSetupSettlement = action.vid;
      const secondRound = state.setupIndex >= state.players.length;
      if (secondRound) {
        for (const hexId of geom.vertices[action.vid].hexes) {
          if (hexId === state.board.robberHex) continue;
          const res = hexResource(state, hexId);
          if (res) me.resources[res]++;
        }
      }
      log(state, `${me.name} founds a village.`);
      state.phase = 'setup-road';
      return state;
    }

    case 'PLACE_SETUP_ROAD': {
      if (state.phase !== 'setup-road') return prev;
      if (!legalSetupRoads(state, geom).includes(action.eid)) return prev;
      state.roads[action.eid] = state.current;
      state.lastSetupSettlement = null;
      state.setupIndex++;
      if (state.setupIndex >= state.setupQueue.length) {
        state.phase = 'roll';
        state.current = 0;
        state.turn = 1;
        log(state, '⚔️ The age of expansion begins. Gondor, roll the dice!');
      } else {
        state.current = state.setupQueue[state.setupIndex];
        state.phase = 'setup-settlement';
      }
      return state;
    }

    case 'ROLL': {
      if (state.phase !== 'roll') return prev;
      const d1 = 1 + Math.floor(Math.random() * 6);
      const d2 = 1 + Math.floor(Math.random() * 6);
      state.dice = [d1, d2];
      const roll = d1 + d2;
      log(state, `${me.name} rolls ${roll}.`);
      if (roll === 7) {
        discardHalves(state);
        state.phase = 'move-robber';
        log(state, `A Nazgûl takes wing! ${me.name} must send it to a new land.`);
      } else {
        distribute(state, geom, roll);
        state.phase = 'main';
      }
      return state;
    }

    case 'MOVE_ROBBER': {
      if (state.phase !== 'move-robber') return prev;
      if (action.hexId === state.board.robberHex) return prev;
      state.board.robberHex = action.hexId;
      const hex = state.board.hexes.find((h) => h.id === action.hexId);
      log(state, `The Nazgûl descends upon ${TERRAIN_INFO[hex.terrain].name}.`);
      stealAdjacent(state, geom, action.hexId);
      state.phase = 'main';
      return state;
    }

    case 'BUILD_ROAD': {
      if (state.phase !== 'main') return prev;
      if (!legalRoads(state, geom, state.current).includes(action.eid)) return prev;
      const free = state.freeRoads > 0;
      if (!free && !canAfford(me, COSTS.road)) return prev;
      if (free) state.freeRoads--;
      else pay(me, COSTS.road);
      state.roads[action.eid] = state.current;
      log(state, `${me.name} lays a road${free ? ' (Great East Road)' : ''}.`);
      updateLongestRoad(state, geom);
      checkWin(state, state.current);
      return state;
    }

    case 'BUILD_SETTLEMENT': {
      if (state.phase !== 'main') return prev;
      if (!canAfford(me, COSTS.settlement)) return prev;
      if (!legalSettlements(state, geom, state.current).includes(action.vid)) return prev;
      pay(me, COSTS.settlement);
      state.buildings[action.vid] = { player: state.current, type: 'settlement' };
      log(state, `${me.name} founds a village.`);
      updateLongestRoad(state, geom); // a new settlement can sever a road
      checkWin(state, state.current);
      return state;
    }

    case 'BUILD_CITY': {
      if (state.phase !== 'main') return prev;
      if (!canAfford(me, COSTS.city)) return prev;
      const b = state.buildings[action.vid];
      if (!b || b.player !== state.current || b.type !== 'settlement') return prev;
      pay(me, COSTS.city);
      b.type = 'city';
      log(state, `${me.name} raises a stronghold.`);
      checkWin(state, state.current);
      return state;
    }

    case 'BUY_DEV': {
      if (state.phase !== 'main') return prev;
      if (state.devDeck.length === 0 || !canAfford(me, COSTS.dev)) return prev;
      pay(me, COSTS.dev);
      const type = state.devDeck.pop();
      me.devCards.push({ type, boughtOnTurn: state.turn });
      log(state, `${me.name} learns a Tale of Old.`);
      checkWin(state, state.current); // a Palantír can win on the spot
      return state;
    }

    case 'PLAY_DEV': {
      if (state.phase !== 'main' || state.devPlayedThisTurn) return prev;
      const card = me.devCards[action.index];
      if (!card || card.type === 'vp' || card.boughtOnTurn === state.turn) return prev;
      me.devCards.splice(action.index, 1);
      state.devPlayedThisTurn = true;
      switch (card.type) {
        case 'knight':
          me.knightsPlayed++;
          log(state, `${me.name} sends forth a Rider of Rohan!`);
          updateLargestArmy(state, state.current);
          state.phase = 'move-robber';
          checkWin(state, state.current);
          break;
        case 'roads':
          state.freeRoads = 2;
          log(state, `${me.name} opens the Great East Road: two free roads.`);
          break;
        case 'plenty': {
          me.resources[action.a]++;
          me.resources[action.b]++;
          log(
            state,
            `${me.name} receives Galadriel's Gift: ${RESOURCE_INFO[action.a].name} and ${RESOURCE_INFO[action.b].name}.`
          );
          break;
        }
        case 'monopoly': {
          let taken = 0;
          for (const p of state.players) {
            if (p.id === state.current) continue;
            taken += p.resources[action.res];
            p.resources[action.res] = 0;
          }
          me.resources[action.res] += taken;
          log(
            state,
            `${me.name} wields the One Ring and seizes all ${RESOURCE_INFO[action.res].name} (${taken} cards).`
          );
          break;
        }
        default:
          break;
      }
      return state;
    }

    case 'TRADE_BANK': {
      if (state.phase !== 'main') return prev;
      if (action.give === action.get || me.resources[action.give] < 4) return prev;
      me.resources[action.give] -= 4;
      me.resources[action.get]++;
      log(
        state,
        `${me.name} trades 4 ${RESOURCE_INFO[action.give].name} for 1 ${RESOURCE_INFO[action.get].name}.`
      );
      return state;
    }

    case 'END_TURN': {
      if (state.phase !== 'main') return prev;
      checkWin(state, state.current);
      if (state.winner !== null) return state;
      state.current = (state.current + 1) % state.players.length;
      state.turn++;
      state.phase = 'roll';
      state.dice = null;
      state.devPlayedThisTurn = false;
      state.freeRoads = 0;
      log(state, `${playerName(state, state.current)}'s turn.`);
      return state;
    }

    default:
      return prev;
  }
}
