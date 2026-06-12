// Rules engine for The Battle of the Pelennor (chess).
// A thin, serializable wrapper around chess.js: the state holds only plain
// JSON (fen, SAN history, result, log); every reduce rebuilds a Chess
// instance from the move history so repetition draws are detected correctly.

import { Chess } from 'chess.js';

const SIDE_NAME = { w: 'The Free Peoples', b: 'The Host of Mordor' };

function pushLog(state, msg) {
  state.log = [...state.log.slice(-59), msg];
}

export function newGame() {
  const chess = new Chess();
  return {
    fen: chess.fen(),
    history: [],
    over: null, // { result: 'white' | 'black' | 'draw', reason }
    log: [
      'The hosts are arrayed beneath the walls of the White City.',
      'The Free Peoples move first.',
    ],
  };
}

function replay(history) {
  const chess = new Chess();
  for (const san of history) chess.move(san);
  return chess;
}

function settleOutcome(state, chess, moverColor) {
  const mover = SIDE_NAME[moverColor];
  if (chess.isCheckmate()) {
    state.over = { result: moverColor === 'w' ? 'white' : 'black', reason: 'checkmate' };
    pushLog(state, `The enemy king has fallen — ${mover} carry the field!`);
  } else if (chess.isStalemate()) {
    state.over = { result: 'draw', reason: 'stalemate' };
    pushLog(state, 'No lawful move remains. The armies withdraw — a draw.');
  } else if (chess.isThreefoldRepetition()) {
    state.over = { result: 'draw', reason: 'threefold repetition' };
    pushLog(state, 'Thrice the same field of battle. The armies withdraw — a draw.');
  } else if (chess.isInsufficientMaterial()) {
    state.over = { result: 'draw', reason: 'insufficient material' };
    pushLog(state, 'Too few warriors remain to force a victory — a draw.');
  } else if (chess.isDraw()) {
    state.over = { result: 'draw', reason: 'fifty-move rule' };
    pushLog(state, 'Fifty marches without blood or banner — a draw.');
  } else if (chess.isCheck()) {
    pushLog(state, 'The king is threatened!');
  }
}

export function reduce(prev, action) {
  if (!action) return prev;
  if (action.type === 'RESET') return newGame();
  if (action.type !== 'MOVE' || prev.over) return prev;

  const state = structuredClone(prev);
  const chess = replay(state.history);
  let mv;
  try {
    mv = chess.move({
      from: action.from,
      to: action.to,
      promotion: action.promotion || 'q',
    });
  } catch {
    return prev;
  }
  if (!mv) return prev;

  state.fen = chess.fen();
  state.history.push(mv.san);

  const mover = SIDE_NAME[mv.color];
  let msg = `${mover}: ${mv.san}`;
  if (mv.san.includes('x')) msg += ' — steel rings across the field.';
  else if (mv.san.startsWith('O-O')) msg += ' — the king takes shelter behind the wall.';
  else if (mv.promotion) msg += ' — a humble soldier is raised to greatness.';
  pushLog(state, msg);

  settleOutcome(state, chess, mv.color);
  return state;
}

// Legal destination squares for the piece on `square` (deduplicated; the four
// promotion choices collapse to one target).
export function getLegalTargets(fen, square) {
  try {
    const chess = new Chess(fen);
    return [...new Set(chess.moves({ square, verbose: true }).map((m) => m.to))];
  } catch {
    return [];
  }
}

export function isPromotionMove(fen, from, to) {
  try {
    const chess = new Chess(fen);
    return chess
      .moves({ square: from, verbose: true })
      .some((m) => m.to === to && m.promotion);
  } catch {
    return false;
  }
}

// 8x8 array (rank 8 first) of { square, type, color } | null, for rendering.
export function getBoard(fen) {
  return new Chess(fen).board();
}

export function turnOf(fen) {
  return fen.split(' ')[1];
}

export function inCheck(fen) {
  return new Chess(fen).isCheck();
}
