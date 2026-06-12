// Rules engine for The Founding of the Shire — a Carcassonne-like
// tile-laying game. Pure functions over a serializable state, in the
// style of the other engines in this repo: newGame() builds a plain
// JSON state, reduce(prev, action) structuredClones, applies, returns
// (or returns prev unchanged for illegal actions).
//
// Actions:
//   { type: 'PLACE', x, y, rot }            rot in quarter-turns clockwise (0..3)
//   { type: 'MEEPLE', feature }             feature: index into the placed
//                                           tile's feature list, 'inn', or
//                                           null/undefined to skip
//
// legalPlacements(state[, typeId]) returns ALL legal {x, y, rot} for the
// drawn tile across all four rotations (callers may filter by rotation).

import { TILE_TYPES, START_TILE, buildDeck } from './tiles.js';

export const SHIRE_FAMILIES = [
  { name: 'Baggins', color: '#5a6b80' },
  { name: 'Took', color: '#9c2a18' },
  { name: 'Brandybuck', color: '#3e7d44' },
  { name: 'Boffin', color: '#7a5f9c' },
];

export const MEEPLES_PER_PLAYER = 7;

// World directions 0=N, 1=E, 2=S, 3=W and their grid offsets.
const DIRS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

const key = (x, y) => `${x},${y}`;

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

// Edge type ('road'|'town'|'grass') shown at world direction d by a tile
// of the given type at the given rotation.
export function edgeAt(typeId, rot, d) {
  return TILE_TYPES[typeId].edges[(d - rot + 4) % 4];
}

// Index of the tile feature occupying world direction d, or null (grass).
export function featureAtWorldEdge(typeId, rot, d) {
  const local = (d - rot + 4) % 4;
  const feats = TILE_TYPES[typeId].features;
  for (let i = 0; i < feats.length; i++) {
    if (feats[i].edges.includes(local)) return i;
  }
  return null;
}

// --- union-find over merged features (no path compression: state must
// --- stay readable outside reduce without mutation) ---

function find(state, fid) {
  let f = fid;
  while (state.parent[f] !== f) f = state.parent[f];
  return f;
}

export function rootFeature(state, fid) {
  return state.features[find(state, fid)];
}

// ---------------------------------------------------------------------------

export function newGame(numPlayers) {
  const n = Math.max(2, Math.min(4, numPlayers));
  const players = SHIRE_FAMILIES.slice(0, n).map((f, i) => ({
    id: i,
    name: f.name,
    color: f.color,
    meeples: MEEPLES_PER_PLAYER,
    score: 0,
  }));
  const state = {
    players,
    current: 0,
    phase: 'place', // 'place' | 'meeple' | 'game-over'
    turn: 1,
    deck: shuffle(buildDeck()),
    drawn: null,
    placed: {}, // "x,y" -> { x, y, type, rot, fids, inn, innMeeple, innDone }
    features: {}, // root fid -> { type, open, tiles, meeples, scored }
    parent: {}, // union-find parent links
    nextFid: 1,
    pending: null, // { key } tile awaiting the hobbit decision
    discarded: 0,
    winners: null,
    log: ['The first wagons roll in from Bree, and the founding of the Shire begins.'],
  };
  placeTileOnBoard(state, 0, 0, START_TILE, 0);
  drawNext(state);
  return state;
}

// Structural placement: register the tile, create its feature instances,
// and merge them with matching neighbours. No scoring, no meeples.
function placeTileOnBoard(state, x, y, typeId, rot) {
  const k = key(x, y);
  const tt = TILE_TYPES[typeId];
  const tile = {
    x,
    y,
    type: typeId,
    rot,
    fids: [],
    inn: !!tt.inn,
    innMeeple: null,
    innDone: false,
  };
  state.placed[k] = tile;
  tt.features.forEach((feat, fi) => {
    const fid = state.nextFid++;
    state.parent[fid] = fid;
    state.features[fid] = {
      type: feat.type,
      open: feat.edges.length,
      tiles: [k],
      meeples: [],
      scored: false,
    };
    tile.fids[fi] = fid;
  });
  for (let d = 0; d < 4; d++) {
    const nb = state.placed[key(x + DIRS[d][0], y + DIRS[d][1])];
    if (!nb) continue;
    const myFi = featureAtWorldEdge(typeId, rot, d);
    if (myFi === null) continue; // grass edge: nothing to join
    const theirFi = featureAtWorldEdge(nb.type, nb.rot, (d + 2) % 4);
    if (theirFi === null) continue; // cannot happen on a legal placement
    const a = find(state, tile.fids[myFi]);
    const b = find(state, nb.fids[theirFi]);
    // This edge pair is now closed on both sides (if a === b, the same
    // feature loses two open edges — both decrements hit one record).
    state.features[a].open--;
    state.features[b].open--;
    if (a !== b) {
      const fa = state.features[a];
      const fb = state.features[b];
      fa.open += fb.open;
      for (const tk of fb.tiles) if (!fa.tiles.includes(tk)) fa.tiles.push(tk);
      fa.meeples.push(...fb.meeples);
      state.parent[b] = a;
      delete state.features[b];
    }
  }
}

function canPlace(state, x, y, typeId, rot) {
  if (state.placed[key(x, y)]) return false;
  let touches = false;
  for (let d = 0; d < 4; d++) {
    const nb = state.placed[key(x + DIRS[d][0], y + DIRS[d][1])];
    if (!nb) continue;
    touches = true;
    if (edgeAt(typeId, rot, d) !== edgeAt(nb.type, nb.rot, (d + 2) % 4)) return false;
  }
  return touches;
}

// Every legal {x, y, rot} for the given tile type (defaults to the drawn
// tile), across ALL four rotations.
export function legalPlacements(state, typeId = state.drawn) {
  if (!typeId) return [];
  const spots = [];
  const frontier = new Set();
  for (const k of Object.keys(state.placed)) {
    const t = state.placed[k];
    for (const [dx, dy] of DIRS) {
      const nk = key(t.x + dx, t.y + dy);
      if (!state.placed[nk]) frontier.add(nk);
    }
  }
  for (const fk of frontier) {
    const [x, y] = fk.split(',').map(Number);
    for (let rot = 0; rot < 4; rot++) {
      if (canPlace(state, x, y, typeId, rot)) spots.push({ x, y, rot });
    }
  }
  return spots;
}

// Where may the current player settle a hobbit on the just-placed tile?
// Returns [{ kind: 'feature', fi, type }] plus { kind: 'inn' } if free.
export function meepleOptions(state) {
  if (state.phase !== 'meeple' || !state.pending) return [];
  const tile = state.placed[state.pending.key];
  const opts = [];
  tile.fids.forEach((fid, fi) => {
    const f = state.features[find(state, fid)];
    if (!f.scored && f.meeples.length === 0) {
      opts.push({ kind: 'feature', fi, type: f.type });
    }
  });
  if (tile.inn && tile.innMeeple === null && !tile.innDone) opts.push({ kind: 'inn' });
  return opts;
}

function innNeighbors(state, tile) {
  let n = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      if (state.placed[key(tile.x + dx, tile.y + dy)]) n++;
    }
  }
  return n;
}

// All tied majority holders receive the full points.
function awardMajority(state, meeples, pts, what) {
  if (meeples.length === 0) return;
  const counts = {};
  for (const m of meeples) counts[m.pid] = (counts[m.pid] || 0) + 1;
  const best = Math.max(...Object.values(counts));
  for (const pidKey of Object.keys(counts)) {
    if (counts[pidKey] === best) {
      const p = state.players[Number(pidKey)];
      p.score += pts;
      log(state, `${p.name} earns ${pts} points for ${what}.`);
    }
  }
}

function scoreCompletions(state, k) {
  const tile = state.placed[k];
  const seen = new Set();
  for (const fid of tile.fids) {
    const root = find(state, fid);
    if (seen.has(root)) continue;
    seen.add(root);
    const f = state.features[root];
    if (f.scored || f.open > 0) continue;
    f.scored = true;
    const pts = (f.type === 'town' ? 2 : 1) * f.tiles.length;
    awardMajority(
      state,
      f.meeples,
      pts,
      f.type === 'town'
        ? `a finished homestead of ${f.tiles.length} tiles`
        : `a finished lane of ${f.tiles.length} tiles`
    );
    for (const m of f.meeples) state.players[m.pid].meeples++;
    f.meeples = [];
  }
  // Any inn may have just gained its final neighbour.
  for (const ik of Object.keys(state.placed)) {
    const it = state.placed[ik];
    if (!it.inn || it.innDone) continue;
    if (innNeighbors(state, it) === 8) {
      it.innDone = true;
      if (it.innMeeple !== null) {
        const p = state.players[it.innMeeple];
        p.score += 9;
        p.meeples++;
        it.innMeeple = null;
        log(state, `${p.name}'s inn stands ringed by fields: 9 points, and the keeper strolls home.`);
      }
    }
  }
}

function finishTurn(state) {
  scoreCompletions(state, state.pending.key);
  state.pending = null;
  state.phase = 'place';
  state.current = (state.current + 1) % state.players.length;
  state.turn++;
  drawNext(state);
}

// Draw the next placeable tile, discarding any that fit nowhere.
function drawNext(state) {
  while (state.deck.length > 0) {
    const t = state.deck.pop();
    if (legalPlacements(state, t).length > 0) {
      state.drawn = t;
      return;
    }
    state.discarded++;
    log(state, `A tile bearing ${TILE_TYPES[t].label} fits nowhere and is set aside.`);
  }
  endGame(state);
}

function endGame(state) {
  state.drawn = null;
  state.pending = null;
  log(state, 'The satchel is empty; the surveyors walk the bounds of the young Shire.');
  // Unfinished lanes and homesteads: 1 point per tile to the majority.
  for (const rootKey of Object.keys(state.features)) {
    const f = state.features[rootKey];
    if (f.scored || f.meeples.length === 0) continue;
    f.scored = true;
    awardMajority(
      state,
      f.meeples,
      f.tiles.length,
      f.type === 'town'
        ? `an unfinished homestead of ${f.tiles.length} tiles`
        : `an unfinished lane of ${f.tiles.length} tiles`
    );
    // Hobbits stay on the map for the final tableau; no need to return them.
  }
  // Unfinished inns: 1 + one per neighbouring tile already in place.
  for (const k of Object.keys(state.placed)) {
    const tile = state.placed[k];
    if (tile.inn && !tile.innDone && tile.innMeeple !== null) {
      const pts = 1 + innNeighbors(state, tile);
      const p = state.players[tile.innMeeple];
      p.score += pts;
      log(state, `${p.name}'s half-kept inn still earns ${pts} points.`);
    }
  }
  const best = Math.max(...state.players.map((p) => p.score));
  state.winners = state.players.filter((p) => p.score === best).map((p) => p.id);
  state.phase = 'game-over';
  const names = state.winners.map((id) => state.players[id].name);
  log(
    state,
    state.winners.length === 1
      ? `${names[0]} has founded the fairest corner of the Shire!`
      : `${names.join(' and ')} share the honour of founding the Shire!`
  );
}

export function reduce(prev, action) {
  const state = structuredClone(prev);
  switch (action.type) {
    case 'PLACE': {
      if (state.phase !== 'place' || !state.drawn) return prev;
      const { x, y } = action;
      if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(action.rot)) return prev;
      const rot = ((action.rot % 4) + 4) % 4;
      if (!canPlace(state, x, y, state.drawn, rot)) return prev;
      const typeId = state.drawn;
      const me = state.players[state.current];
      placeTileOnBoard(state, x, y, typeId, rot);
      state.drawn = null;
      state.pending = { key: key(x, y) };
      state.phase = 'meeple';
      log(state, `${me.name} lays ${TILE_TYPES[typeId].label}.`);
      // No hobbit to spare, or nowhere to put one: resolve at once.
      if (me.meeples === 0 || meepleOptions(state).length === 0) {
        finishTurn(state);
      }
      return state;
    }

    case 'MEEPLE': {
      if (state.phase !== 'meeple' || !state.pending) return prev;
      const me = state.players[state.current];
      const tile = state.placed[state.pending.key];
      const choice = action.feature;
      if (choice === null || choice === undefined) {
        log(state, `${me.name} lets the new ground lie unclaimed.`);
        finishTurn(state);
        return state;
      }
      if (me.meeples <= 0) return prev;
      if (choice === 'inn') {
        if (!tile.inn || tile.innMeeple !== null || tile.innDone) return prev;
        tile.innMeeple = me.id;
        me.meeples--;
        log(state, `${me.name} installs an innkeeper beneath the new sign.`);
      } else {
        if (!Number.isInteger(choice) || choice < 0 || choice >= tile.fids.length) return prev;
        const f = state.features[find(state, tile.fids[choice])];
        if (f.scored || f.meeples.length > 0) return prev;
        f.meeples.push({ pid: me.id, key: state.pending.key, fi: choice });
        me.meeples--;
        log(
          state,
          f.type === 'town'
            ? `${me.name} sends kin to settle the homestead.`
            : `${me.name} sets a hobbit to ward the lane.`
        );
      }
      finishTurn(state);
      return state;
    }

    default:
      return prev;
  }
}
