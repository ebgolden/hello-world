// Rules engine for The Hunt for the Ring (a Stratego-style game of hidden
// ranks). Pure functions over a serializable state, in the style of the
// other engines in this repo.

export const SIZE = 10;

export const HUNT_FACTIONS = [
  { name: 'The Fellowship', color: '#5a6b80' },
  { name: 'Mordor', color: '#9c2a18' },
];

// The Dead Marshes: two 2x2 impassable squares.
export function isMarsh(r, c) {
  return (r === 4 || r === 5) && (c === 2 || c === 3 || c === 6 || c === 7);
}

// Classic 40-piece roster. rank 0 = the Ring (flag), rank 11 = Watchtower
// (bomb); fighting ranks run 1 (spy) through 10 (marshal).
export const ROSTER = [
  { kind: 'flag', rank: 0, count: 1 },
  { kind: 'bomb', rank: 11, count: 6 },
  { kind: 'spy', rank: 1, count: 1 },
  { kind: 'scout', rank: 2, count: 8 },
  { kind: 'miner', rank: 3, count: 5 },
  { kind: 'normal', rank: 4, count: 4 },
  { kind: 'normal', rank: 5, count: 4 },
  { kind: 'normal', rank: 6, count: 4 },
  { kind: 'normal', rank: 7, count: 3 },
  { kind: 'normal', rank: 8, count: 2 },
  { kind: 'normal', rank: 9, count: 1 },
  { kind: 'normal', rank: 10, count: 1 },
];

const RANK_NAMES = {
  4: 'Soldier',
  5: 'Captain',
  6: 'Champion',
  7: 'Lord',
  8: 'Wraith-lord',
  9: 'Warden',
};

export function pieceName(piece, p) {
  if (piece.kind === 'flag') return 'The Ring';
  if (piece.kind === 'bomb') return 'Watchtower';
  if (piece.kind === 'spy') return p === 0 ? 'Gollum' : 'Gríma';
  if (piece.kind === 'scout') return 'Rider';
  if (piece.kind === 'miner') return 'Dwarf-delver';
  if (piece.rank === 10) return p === 0 ? 'Aragorn' : 'The Witch-king';
  return RANK_NAMES[piece.rank] || `Rank ${piece.rank}`;
}

export function pieceIcon(piece) {
  if (piece.kind === 'flag') return 'ring';
  if (piece.kind === 'bomb') return 'tower';
  if (piece.kind === 'spy') return 'spy';
  if (piece.kind === 'scout') return 'horse';
  if (piece.kind === 'miner') return 'dwarf';
  if (piece.rank === 10) return 'crown';
  return 'crossedswords';
}

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function log(state, msg) {
  state.log = [...state.log.slice(-59), msg];
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Random deployment of player p's 40 pieces into their back four rows.
// Player 0 (the Fellowship) holds rows 6-9, player 1 (Mordor) rows 0-3.
function deploy(board, p) {
  const rows = p === 0 ? [6, 7, 8, 9] : [0, 1, 2, 3];
  const cells = [];
  for (const r of rows) for (let c = 0; c < SIZE; c++) cells.push([r, c]);
  const spots = shuffle(cells);
  let i = 0;
  for (const { kind, rank, count } of ROSTER) {
    for (let n = 0; n < count; n++) {
      const [r, c] = spots[i++];
      board[r][c] = { p, rank, kind, revealed: false };
    }
  }
}

function clearSide(board, p) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (board[r][c] && board[r][c].p === p) board[r][c] = null;
}

export function newGame() {
  const board = emptyBoard();
  deploy(board, 0);
  deploy(board, 1);
  return {
    board,
    phase: 'setup',
    current: 0,
    ready: [false, false],
    captured: [[], []],
    lastCombat: null,
    winner: null,
    log: ['The hunt is called. Each side hides the Ring among its host.'],
  };
}

export function legalMoves(state, [r, c]) {
  const board = state.board;
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return [];
  const piece = board[r][c];
  if (!piece || piece.kind === 'flag' || piece.kind === 'bomb') return [];
  const moves = [];
  for (const [dr, dc] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !isMarsh(nr, nc)) {
      const t = board[nr][nc];
      if (t === null) {
        moves.push([nr, nc]);
      } else {
        if (t.p !== piece.p) moves.push([nr, nc]);
        break;
      }
      if (piece.kind !== 'scout') break;
      nr += dr;
      nc += dc;
    }
  }
  return moves;
}

function hasAnyMove(state, p) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const piece = state.board[r][c];
      if (piece && piece.p === p && legalMoves(state, [r, c]).length > 0) return true;
    }
  return false;
}

// After the turn passes to `state.current`, end the game if they are frozen.
function checkStalemate(state) {
  const cur = state.current;
  const curCan = hasAnyMove(state, cur);
  if (curCan) return;
  const foeCan = hasAnyMove(state, 1 - cur);
  state.phase = 'game-over';
  if (!foeCan) {
    state.winner = null;
    log(state, 'The hunt ends in stalemate. Neither host can stir.');
  } else {
    state.winner = 1 - cur;
    log(
      state,
      `${HUNT_FACTIONS[cur].name} can move no piece. ${HUNT_FACTIONS[1 - cur].name} claims the hunt!`
    );
  }
}

export function reduce(prev, action) {
  if (prev.phase === 'game-over') return prev;
  const state = structuredClone(prev);

  switch (action.type) {
    case 'REDEPLOY': {
      const p = action.p;
      if (state.phase !== 'setup' || (p !== 0 && p !== 1) || state.ready[p]) return prev;
      clearSide(state.board, p);
      deploy(state.board, p);
      log(state, `${HUNT_FACTIONS[p].name} re-orders the host by lantern-light.`);
      return state;
    }

    case 'SWAP': {
      const p = action.p;
      if (state.phase !== 'setup' || (p !== 0 && p !== 1) || state.ready[p]) return prev;
      if (!Array.isArray(action.a) || !Array.isArray(action.b)) return prev;
      const zoneMin = p === 0 ? 6 : 0;
      const zoneMax = p === 0 ? 9 : 3;
      const [ar, ac] = action.a;
      const [br, bc] = action.b;
      const inZone = (r, c) =>
        Number.isInteger(r) && Number.isInteger(c) && r >= zoneMin && r <= zoneMax && c >= 0 && c < SIZE;
      if (!inZone(ar, ac) || !inZone(br, bc) || (ar === br && ac === bc)) return prev;
      const pa = state.board[ar][ac];
      const pb = state.board[br][bc];
      if (!pa || !pb || pa.p !== p || pb.p !== p) return prev;
      state.board[ar][ac] = pb;
      state.board[br][bc] = pa;
      return state;
    }

    case 'READY': {
      const p = action.p;
      if (state.phase !== 'setup' || (p !== 0 && p !== 1) || state.ready[p]) return prev;
      state.ready[p] = true;
      log(state, `${HUNT_FACTIONS[p].name} stands ready upon the field.`);
      if (state.ready[0] && state.ready[1]) {
        state.phase = 'play';
        state.current = 0;
        log(state, 'Horns sound across the Dead Marshes. The Fellowship moves first.');
      }
      return state;
    }

    case 'MOVE': {
      if (state.phase !== 'play' || state.lastCombat !== null) return prev;
      const { from, to } = action;
      if (!Array.isArray(from) || !Array.isArray(to)) return prev;
      const [fr, fc] = from;
      const [tr, tc] = to;
      const piece = state.board[fr] && state.board[fr][fc];
      if (!piece || piece.p !== state.current) return prev;
      if (!legalMoves(state, [fr, fc]).some(([r, c]) => r === tr && c === tc)) return prev;

      const me = HUNT_FACTIONS[state.current].name;
      const foeP = 1 - state.current;
      const foe = HUNT_FACTIONS[foeP].name;
      const target = state.board[tr][tc];

      if (target === null) {
        state.board[tr][tc] = piece;
        state.board[fr][fc] = null;
        state.current = foeP;
        checkStalemate(state);
        return state;
      }

      // Combat: both pieces stand revealed.
      piece.revealed = true;
      target.revealed = true;
      const aName = pieceName(piece, piece.p);
      const dName = pieceName(target, target.p);
      let text;

      const capture = (victim) => {
        state.captured[victim.p].push({ rank: victim.rank, kind: victim.kind });
      };
      const advance = () => {
        state.board[tr][tc] = piece;
        state.board[fr][fc] = null;
      };

      if (target.kind === 'flag') {
        capture(target);
        advance();
        state.phase = 'game-over';
        state.winner = state.current;
        text = `${aName} of ${me} seizes the Ring of ${foe}!`;
        log(state, text);
        state.lastCombat = { from, to, text };
        return state;
      } else if (target.kind === 'bomb') {
        if (piece.kind === 'miner') {
          capture(target);
          advance();
          text = `${aName} of ${me} undermines a Watchtower of ${foe} and brings it down.`;
        } else {
          capture(piece);
          state.board[fr][fc] = null;
          text = `${aName} of ${me} storms a Watchtower of ${foe} and is thrown down.`;
        }
      } else if (piece.kind === 'spy' && target.rank === 10) {
        capture(target);
        advance();
        text = `${aName} slips a knife into ${dName}! The marshal of ${foe} falls.`;
      } else if (target.kind === 'spy') {
        capture(target);
        advance();
        text = `${aName} of ${me} unmasks ${dName}, the creeping spy of ${foe}.`;
      } else if (piece.rank > target.rank) {
        capture(target);
        advance();
        text = `${aName} of ${me} (rank ${piece.rank}) cuts down ${dName} of ${foe} (rank ${target.rank}).`;
      } else if (piece.rank < target.rank) {
        capture(piece);
        state.board[fr][fc] = null;
        text = `${aName} of ${me} (rank ${piece.rank}) is slain by ${dName} of ${foe} (rank ${target.rank}).`;
      } else {
        capture(piece);
        capture(target);
        state.board[fr][fc] = null;
        state.board[tr][tc] = null;
        text = `${aName} of ${me} and ${dName} of ${foe} (rank ${piece.rank}) slay one another.`;
      }
      log(state, text);
      state.lastCombat = { from, to, text };
      return state;
    }

    case 'ACK': {
      if (state.phase !== 'play' || state.lastCombat === null) return prev;
      state.lastCombat = null;
      state.current = 1 - state.current;
      checkStalemate(state);
      return state;
    }

    default:
      return prev;
  }
}
