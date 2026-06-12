// Rules engine for The Beacon Hills (a Battleship-style duel of hidden
// encampments). Pure functions over a serializable state, in the style of
// the other engines in this repo.

export const SIZE = 10;
export const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export const BEACON_FACTIONS = [
  { name: 'Gondor', color: '#5a6b80' },
  { name: 'Mordor', color: '#9c2a18' },
];

export const FLEET = [
  { name: 'Grand Host', size: 5 },
  { name: 'War Camp', size: 4 },
  { name: 'Outpost', size: 3 },
  { name: 'Outpost', size: 3 },
  { name: 'Scout Tent', size: 2 },
];

export const TOTAL_CELLS = FLEET.reduce((s, f) => s + f.size, 0); // 17

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function log(state, msg) {
  state.log = [...state.log.slice(-59), msg];
}

// Randomly place the five encampments, straight and non-overlapping.
function deployCamps() {
  for (;;) {
    const board = emptyGrid();
    const ships = [];
    let ok = true;
    for (let s = 0; s < FLEET.length; s++) {
      const { name, size } = FLEET[s];
      let placed = false;
      for (let tries = 0; tries < 300 && !placed; tries++) {
        const horiz = Math.random() < 0.5;
        const x = Math.floor(Math.random() * (horiz ? SIZE - size + 1 : SIZE));
        const y = Math.floor(Math.random() * (horiz ? SIZE : SIZE - size + 1));
        const cells = [];
        let free = true;
        for (let i = 0; i < size; i++) {
          const cx = horiz ? x + i : x;
          const cy = horiz ? y : y + i;
          if (board[cy][cx] !== null) {
            free = false;
            break;
          }
          cells.push([cx, cy]);
        }
        if (!free) continue;
        for (const [cx, cy] of cells) board[cy][cx] = s;
        ships.push({ name, size, cells, hits: 0 });
        placed = true;
      }
      if (!placed) {
        ok = false;
        break;
      }
    }
    if (ok) return { board, ships };
  }
}

export function newGame() {
  const players = BEACON_FACTIONS.map((f) => {
    const { board, ships } = deployCamps();
    return { name: f.name, color: f.color, board, ships, shots: emptyGrid() };
  });
  return {
    players,
    phase: 'setup',
    current: 0,
    ready: [false, false],
    lastShot: null,
    winner: null,
    log: ['The watch is set upon the Beacon Hills. Hide your camps well.'],
  };
}

export function reduce(prev, action) {
  if (prev.phase === 'game-over') return prev;
  const state = structuredClone(prev);

  switch (action.type) {
    case 'REDEPLOY': {
      const p = action.p;
      if (state.phase !== 'setup' || (p !== 0 && p !== 1) || state.ready[p]) return prev;
      const { board, ships } = deployCamps();
      state.players[p].board = board;
      state.players[p].ships = ships;
      log(state, `${state.players[p].name} strikes camp and pitches anew under cover of dark.`);
      return state;
    }

    case 'READY': {
      const p = action.p;
      if (state.phase !== 'setup' || (p !== 0 && p !== 1) || state.ready[p]) return prev;
      state.ready[p] = true;
      log(state, `${state.players[p].name} douses the cookfires; the camps lie hidden.`);
      if (state.ready[0] && state.ready[1]) {
        state.phase = 'play';
        state.current = 0;
        log(state, 'The palantír awakens. Gondor scries first.');
      }
      return state;
    }

    case 'FIRE': {
      if (state.phase !== 'play' || state.lastShot !== null) return prev;
      const { x, y } = action;
      if (
        !Number.isInteger(x) ||
        !Number.isInteger(y) ||
        x < 0 ||
        x >= SIZE ||
        y < 0 ||
        y >= SIZE
      )
        return prev;
      const me = state.players[state.current];
      const foe = state.players[1 - state.current];
      if (me.shots[y][x] !== null) return prev;
      const coord = `${ROWS[y]}${x + 1}`;
      const shipIdx = foe.board[y][x];
      if (shipIdx === null) {
        me.shots[y][x] = 'miss';
        state.lastShot = { x, y, result: 'miss', sunk: null };
        log(state, `${me.name} scries ${coord} — only mist and empty heather.`);
      } else {
        me.shots[y][x] = 'hit';
        const ship = foe.ships[shipIdx];
        ship.hits += 1;
        const sunk = ship.hits >= ship.size;
        state.lastShot = { x, y, result: 'hit', sunk: sunk ? ship.name : null };
        log(state, `${me.name} scries ${coord} — flame leaps among the tents!`);
        if (sunk) log(state, `The ${ship.name} of ${foe.name} burns!`);
        const totalHits = foe.ships.reduce((s, sh) => s + sh.hits, 0);
        if (totalHits >= TOTAL_CELLS) {
          state.phase = 'game-over';
          state.winner = state.current;
          log(state, `Every camp of ${foe.name} lies in ashes. ${me.name} holds the hills!`);
        }
      }
      return state;
    }

    case 'NEXT': {
      if (state.phase !== 'play' || state.lastShot === null) return prev;
      state.lastShot = null;
      state.current = 1 - state.current;
      return state;
    }

    default:
      return prev;
  }
}
