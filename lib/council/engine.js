// Rules engine for The Council of the Free Peoples — a simplified
// Diplomacy-style game of simultaneous secret orders. Pure serializable
// reducer: newGame(...) returns plain JSON, reduce(prev, action) clones and
// applies, returning prev for illegal actions.
//
// Adjudication is a deterministic simplification of Diplomacy (no convoys,
// no retreats — dislodged units are disbanded). See resolve() below.

import { PROVINCES, NEIGHBORS, POWERS, CENTER_IDS, HOME_CENTERS } from './map.js';

export const MAX_ROUNDS = 25;
export const VICTORY_CENTERS = 7;

function log(state, msg) {
  state.log = [...state.log.slice(-59), msg];
}

function provName(id) {
  return PROVINCES[id].name;
}

export function newGame(numPowers) {
  const n = Math.max(2, Math.min(4, numPowers || 2));
  const powers = POWERS.slice(0, n).map((p) => ({ name: p.name, color: p.color, alive: true }));
  const units = [];
  let id = 0;
  for (let p = 0; p < n; p++) {
    for (const prov of HOME_CENTERS[p]) units.push({ id: id++, power: p, prov });
  }
  const centers = {};
  for (const c of CENTER_IDS) centers[c] = null;
  for (let p = 0; p < n; p++) for (const prov of HOME_CENTERS[p]) centers[prov] = p;
  return {
    numPowers: n,
    powers,
    units,
    nextUnitId: id,
    centers,
    ordersByPower: powers.map(() => ({})),
    phase: 'orders', // 'orders' | 'resolution-review' | 'game-over'
    orderTurn: 0,
    round: 1,
    winners: null, // null | array of power indices
    lastResolution: [],
    log: [`The Council convenes. ${powers.map((p) => p.name).join(', ')} pen their secret designs.`],
  };
}

function ordersEqual(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === 'move') return a.to === b.to;
  if (a.type === 'support') return a.prov === b.prov && (a.to ?? null) === (b.to ?? null);
  return true; // hold
}

// All legal orders for a unit. Supports name an ADJACENT unit's specific move
// or hold, and the support target (the move's destination, or the held
// province) must also be adjacent to the supporter.
export function validOrders(state, map, unitId) {
  const u = state.units.find((x) => x.id === unitId);
  if (!u) return [];
  const adj = map.neighbors[u.prov];
  const orders = [{ type: 'hold' }];
  for (const d of adj) orders.push({ type: 'move', to: d });
  for (const o of state.units) {
    if (o.id === u.id || !adj.includes(o.prov)) continue;
    orders.push({ type: 'support', prov: o.prov, to: null }); // support its hold
    for (const d of map.neighbors[o.prov]) {
      if (d !== u.prov && adj.includes(d)) orders.push({ type: 'support', prov: o.prov, to: d });
    }
  }
  return orders;
}

function nextOrderPower(state, after) {
  for (let p = after + 1; p < state.numPowers; p++) {
    if (state.powers[p].alive && state.units.some((u) => u.power === p)) return p;
  }
  return null;
}

// ---- adjudication -------------------------------------------------------

export function resolve(state) {
  const byProv = {};
  for (const u of state.units) byProv[u.prov] = u;

  // Normalize orders: missing or structurally invalid orders become holds.
  const orders = {};
  for (const u of state.units) {
    let o = state.ordersByPower[u.power][u.id] || { type: 'hold' };
    if (o.type === 'move' && !NEIGHBORS[u.prov].includes(o.to)) o = { type: 'hold' };
    if (o.type === 'support' && (!byProv[o.prov] || byProv[o.prov].id === u.id)) o = { type: 'hold' };
    orders[u.id] = o;
  }

  // A support "matches" only if the supported unit actually ordered that
  // exact move (or, for hold-support, did not order a move).
  const matched = {};
  for (const u of state.units) {
    const o = orders[u.id];
    if (o.type !== 'support') continue;
    const t = byProv[o.prov];
    const to = orders[t.id];
    matched[u.id] = o.to == null ? to.type !== 'move' : to.type === 'move' && to.to === o.to;
  }

  // Cut supports: a support is cut if the supporter's province is attacked by
  // a unit of another power — except by an attack coming from the province the
  // support is directed against.
  const cut = {};
  for (const u of state.units) {
    const o = orders[u.id];
    if (o.type !== 'support') continue;
    cut[u.id] = false;
    for (const a of state.units) {
      const ao = orders[a.id];
      if (ao.type !== 'move' || ao.to !== u.prov) continue;
      if (a.power === u.power) continue;
      if (o.to != null && a.prov === o.to) continue;
      cut[u.id] = true;
      break;
    }
  }
  const supportCounts = (id) => matched[id] && !cut[id];

  // Attack strength of each move: 1 + valid supports.
  const moveStr = {};
  for (const u of state.units) {
    const o = orders[u.id];
    if (o.type !== 'move') continue;
    let s = 1;
    for (const v of state.units) {
      const vo = orders[v.id];
      if (vo.type === 'support' && vo.prov === u.prov && vo.to === o.to && supportCounts(v.id)) s++;
    }
    moveStr[u.id] = s;
  }
  // Hold strength: 1 + valid hold-supports; failed movers defend at 1.
  const holdStr = (unit) => {
    if (orders[unit.id].type === 'move') return 1;
    let s = 1;
    for (const v of state.units) {
      const vo = orders[v.id];
      if (vo.type === 'support' && vo.prov === unit.prov && vo.to == null && supportCounts(v.id)) s++;
    }
    return s;
  };

  const movers = state.units.filter((u) => orders[u.id].type === 'move');
  const st = {}; // unitId -> 'U' | 'S' | 'F'
  for (const u of movers) st[u.id] = 'U';
  const h2hLoserTo = {}; // loser unitId -> winner unitId

  // Pre-pass 1: head-to-head swaps bounce unless one strictly outguns the
  // other, in which case the weaker is dislodged when the stronger enters.
  for (const u of movers) {
    const o = orders[u.id];
    const occ = byProv[o.to];
    if (occ && orders[occ.id].type === 'move' && orders[occ.id].to === u.prov) {
      if (moveStr[u.id] === moveStr[occ.id]) {
        st[u.id] = 'F';
        st[occ.id] = 'F';
      } else if (moveStr[u.id] < moveStr[occ.id]) {
        st[u.id] = 'F';
        h2hLoserTo[u.id] = occ.id;
      }
    }
  }
  // Pre-pass 2: competition — a move must be strictly strongest among all
  // movers into its destination, or it bounces.
  for (const u of movers) {
    if (st[u.id] === 'F') continue;
    const o = orders[u.id];
    for (const v of movers) {
      if (v.id !== u.id && orders[v.id].to === o.to && moveStr[v.id] >= moveStr[u.id]) {
        st[u.id] = 'F';
        break;
      }
    }
  }

  // Iterative fixpoint over vacating chains.
  let changed = true;
  while (changed) {
    changed = false;
    for (const u of movers) {
      if (st[u.id] !== 'U') continue;
      const o = orders[u.id];
      const occ = byProv[o.to];
      if (!occ) {
        st[u.id] = 'S';
        changed = true;
        continue;
      }
      if (h2hLoserTo[occ.id] === u.id) {
        // Head-to-head winner enters; the weaker loser is dislodged.
        st[u.id] = 'S';
        changed = true;
        continue;
      }
      const occOrder = orders[occ.id];
      if (occOrder.type === 'move' && occOrder.to !== u.prov) {
        if (st[occ.id] === 'S') {
          st[u.id] = 'S';
          changed = true;
        } else if (st[occ.id] === 'F') {
          st[u.id] = moveStr[u.id] > 1 ? 'S' : 'F'; // failed mover defends at 1
          changed = true;
        }
        continue;
      }
      // Occupant is staying put (holding or supporting).
      st[u.id] = moveStr[u.id] > holdStr(occ) ? 'S' : 'F';
      changed = true;
    }
  }
  // Unresolved cycles (e.g. three-way rotations): every remaining unknown has
  // already passed its bounce checks and is only waiting on another unknown
  // mover to vacate — treat them as all-succeed.
  for (const u of movers) if (st[u.id] === 'U') st[u.id] = 'S';

  // Dislodgements: a unit is overrun if a successful move enters its province
  // while it is not itself moving away successfully.
  const dislodged = new Set();
  for (const u of movers) {
    if (st[u.id] !== 'S') continue;
    const occ = byProv[orders[u.id].to];
    if (occ && !(orders[occ.id].type === 'move' && st[occ.id] === 'S')) dislodged.add(occ.id);
  }

  // Readable adjudication summary, one line per unit.
  const lines = [];
  for (const u of state.units) {
    const o = orders[u.id];
    const who = `${state.powers[u.power].name} (${provName(u.prov)})`;
    if (o.type === 'move') {
      lines.push(
        st[u.id] === 'S'
          ? `${who} marches into ${provName(o.to)} — strength ${moveStr[u.id]}.`
          : `${who} is thrown back from ${provName(o.to)} — strength ${moveStr[u.id]}.`
      );
    } else if (o.type === 'support') {
      const what = o.to == null ? `the hold of ${provName(o.prov)}` : `${provName(o.prov)} → ${provName(o.to)}`;
      if (cut[u.id]) lines.push(`${who}: support for ${what} is cut by an attack!`);
      else if (!matched[u.id]) lines.push(`${who}: support for ${what} answers no order.`);
      else lines.push(`${who} lends its strength to ${what}.`);
    } else {
      lines.push(`${who} stands fast.`);
    }
    if (dislodged.has(u.id)) lines.push(`${who} is overrun and its host scattered.`);
  }
  state.lastResolution = lines;
  log(state, `Season ${state.round}: the sealed orders are opened and the armies move.`);

  // Apply movements and disband the dislodged (no retreats).
  state.units = state.units.filter((u) => !dislodged.has(u.id));
  for (const u of state.units) {
    if (orders[u.id].type === 'move' && st[u.id] === 'S') u.prov = orders[u.id].to;
  }

  // Stronghold ownership: occupied centers change hands; vacant keep owners.
  const occNow = {};
  for (const u of state.units) occNow[u.prov] = u;
  for (const c of CENTER_IDS) {
    const u = occNow[c];
    if (u && state.centers[c] !== u.power) {
      state.centers[c] = u.power;
      log(state, `${state.powers[u.power].name} claims the stronghold of ${provName(c)}.`);
    }
  }

  // Adjustments: disband newest units beyond centers owned; build new units
  // in owned, unoccupied home strongholds up to centers owned.
  for (let p = 0; p < state.numPowers; p++) {
    const owned = CENTER_IDS.filter((c) => state.centers[c] === p).length;
    let mine = state.units.filter((u) => u.power === p).sort((a, b) => a.id - b.id);
    while (mine.length > owned) {
      const gone = mine.pop();
      state.units = state.units.filter((u) => u.id !== gone.id);
      log(state, `${state.powers[p].name} disbands its newest host, in ${provName(gone.prov)}.`);
    }
    if (mine.length < owned) {
      const occupied = new Set(state.units.map((u) => u.prov));
      for (const home of HOME_CENTERS[p]) {
        if (mine.length >= owned) break;
        if (state.centers[home] === p && !occupied.has(home)) {
          const nu = { id: state.nextUnitId++, power: p, prov: home };
          state.units.push(nu);
          mine.push(nu);
          occupied.add(home);
          log(state, `${state.powers[p].name} musters a new host in ${provName(home)}.`);
        }
      }
    }
    state.powers[p].alive = state.units.some((u) => u.power === p);
  }

  // Victory: 7 of 12 strongholds, last power standing, or — after the final
  // season — whoever holds the most strongholds (ties shared).
  const counts = state.powers.map((_, p) => CENTER_IDS.filter((c) => state.centers[c] === p).length);
  let winners = [];
  counts.forEach((c, p) => {
    if (c >= VICTORY_CENTERS) winners.push(p);
  });
  const alive = state.powers.map((_, i) => i).filter((i) => state.powers[i].alive);
  if (winners.length === 0 && alive.length <= 1) {
    if (alive.length === 1) winners = [alive[0]];
    else {
      const m = Math.max(...counts);
      counts.forEach((c, p) => {
        if (c === m) winners.push(p);
      });
    }
  }
  if (winners.length === 0 && state.round >= MAX_ROUNDS) {
    const m = Math.max(...counts);
    counts.forEach((c, p) => {
      if (c === m) winners.push(p);
    });
    log(state, 'The long war gutters out; the Council weighs the strongholds held.');
  }
  if (winners.length > 0) {
    state.winners = winners;
    state.phase = 'game-over';
    log(state, `${winners.map((p) => state.powers[p].name).join(' and ')} prevail${winners.length > 1 ? '' : 's'} over Middle-earth!`);
  } else {
    state.phase = 'resolution-review';
  }
}

// ---- reducer ------------------------------------------------------------

export function reduce(prev, action) {
  if (prev.phase === 'game-over') return prev;
  const state = structuredClone(prev);

  switch (action.type) {
    case 'SET_ORDER': {
      if (state.phase !== 'orders') return prev;
      const u = state.units.find((x) => x.id === action.unitId);
      if (!u || u.power !== state.orderTurn) return prev;
      const ok = validOrders(state, { neighbors: NEIGHBORS }, u.id).some((o) =>
        ordersEqual(o, action.order)
      );
      if (!ok) return prev;
      state.ordersByPower[u.power][u.id] = action.order;
      return state;
    }

    case 'SEAL': {
      if (state.phase !== 'orders') return prev;
      const p = state.orderTurn;
      for (const u of state.units) {
        if (u.power === p && !state.ordersByPower[p][u.id]) {
          state.ordersByPower[p][u.id] = { type: 'hold' };
        }
      }
      log(state, `${state.powers[p].name} seals its orders.`);
      const next = nextOrderPower(state, p);
      if (next !== null) {
        state.orderTurn = next;
        return state;
      }
      resolve(state);
      return state;
    }

    case 'CONTINUE': {
      if (state.phase !== 'resolution-review') return prev;
      state.round++;
      state.ordersByPower = state.powers.map(() => ({}));
      state.lastResolution = [];
      state.orderTurn = nextOrderPower(state, -1);
      state.phase = 'orders';
      log(state, `Season ${state.round}: the Council convenes once more.`);
      return state;
    }

    default:
      return prev;
  }
}
