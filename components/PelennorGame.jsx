'use client';

import { useState } from 'react';
import {
  newGame,
  reduce,
  getLegalTargets,
  isPromotionMove,
  getBoard,
  turnOf,
  inCheck,
} from '@/lib/pelennor/engine';
import { GIcon } from '@/components/Icon';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const PIECE_ICON = { p: 'sword', n: 'horse', b: 'pointyhat', r: 'tower', q: 'ring', k: 'crown' };
const PIECE_NAME = { p: 'Soldier', n: 'Rider', b: 'Wizard', r: 'Tower', q: 'Ring', k: 'King' };
const SIDES = {
  w: { name: 'The Free Peoples', badge: '#a8821e', piece: '#8a6a1e' },
  b: { name: 'The Host of Mordor', badge: '#9c2a18', piece: '#6e1d10' },
};
const PROMO_CHOICES = [
  { p: 'q', label: 'Ring-bearer' },
  { p: 'r', label: 'Tower' },
  { p: 'b', label: 'Wizard' },
  { p: 'n', label: 'Rider' },
];

function Square({ sq, piece, light, selected, target, capture, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: light ? '#e9dab4' : '#c9b282',
        cursor: piece || target ? 'pointer' : 'default',
        boxShadow: selected
          ? 'inset 0 0 0 3px #8a5a16'
          : capture
            ? 'inset 0 0 0 3px rgba(156,42,24,0.8)'
            : 'none',
      }}
    >
      {piece && (
        <GIcon
          name={PIECE_ICON[piece.type]}
          size={34}
          color={SIDES[piece.color].piece}
          style={{
            filter:
              piece.color === 'w'
                ? 'drop-shadow(0 1px 1px rgba(255,244,200,0.9)) drop-shadow(0 2px 2px rgba(58,42,24,0.45))'
                : 'drop-shadow(0 1px 1px rgba(58,42,24,0.35)) drop-shadow(0 2px 2px rgba(20,10,5,0.5))',
          }}
        />
      )}
      {target && !piece && (
        <span
          style={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'rgba(138,90,22,0.65)',
          }}
        />
      )}
      {sq[0] === 'a' && (
        <span style={{ position: 'absolute', top: 1, left: 3, fontSize: 9, color: '#5a4326' }}>
          {sq[1]}
        </span>
      )}
      {sq[1] === '1' && (
        <span style={{ position: 'absolute', bottom: 0, right: 3, fontSize: 9, color: '#5a4326' }}>
          {sq[0]}
        </span>
      )}
    </div>
  );
}

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">THE BATTLE OF THE PELENNOR</h1>
      <p className="subtitle">Two hosts, one field, no quarter</p>
      <div className="ring">
        <GIcon
          name="crossedswords"
          size={84}
          color="#e8c34a"
          style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }}
        />
      </div>
      <p>
        The Free Peoples and the Host of Mordor meet upon the chequered field before the White
        City. The full law of chess governs the fray — castling, en passant, promotion, and every
        draw of the old lore. Fell the enemy king and the day is yours.
      </p>
      <div className="lobby-buttons">
        <button onClick={onStart}>Form the Lines</button>
      </div>
      <p className="lobby-note">
        Hot-seat play: pass the device between players. The Free Peoples (gold) move first; the
        Host of Mordor (red) answers.
      </p>
    </div>
  );
}

export default function PelennorGame() {
  const [state, setState] = useState(null);
  const [sel, setSel] = useState(null);
  const [targets, setTargets] = useState([]);
  const [promo, setPromo] = useState(null); // { from, to }

  if (!state) {
    return (
      <div className="app">
        <a className="back-link" href="/">
          ⟵ The Hall of Games
        </a>
        <Lobby
          onStart={() => {
            setState(newGame());
            setSel(null);
            setTargets([]);
            setPromo(null);
          }}
        />
        <Footer />
      </div>
    );
  }

  const dispatch = (action) => {
    const next = reduce(state, action);
    if (next !== state) {
      setState(next);
      setSel(null);
      setTargets([]);
      setPromo(null);
    }
  };

  const board = getBoard(state.fen);
  const turn = turnOf(state.fen);
  const side = SIDES[turn];
  const check = !state.over && inCheck(state.fen);

  const pieceAt = {};
  for (const row of board) {
    for (const cell of row) if (cell) pieceAt[cell.square] = cell;
  }

  const onSquare = (sq) => {
    if (state.over || promo) return;
    const piece = pieceAt[sq];
    if (sel && targets.includes(sq)) {
      if (isPromotionMove(state.fen, sel, sq)) {
        setPromo({ from: sel, to: sq });
      } else {
        dispatch({ type: 'MOVE', from: sel, to: sq });
      }
      return;
    }
    if (piece && piece.color === turn) {
      setSel(sq);
      setTargets(getLegalTargets(state.fen, sq));
    } else {
      setSel(null);
      setTargets([]);
    }
  };

  const counts = { w: 0, b: 0 };
  for (const row of board) for (const cell of row) if (cell) counts[cell.color]++;

  const moveRows = [];
  for (let i = 0; i < state.history.length; i += 2) {
    moveRows.push(`${i / 2 + 1}. ${state.history[i]}${state.history[i + 1] ? '  ' + state.history[i + 1] : ''}`);
  }

  const prompt = state.over
    ? state.over.result === 'draw'
      ? `The armies withdraw — a draw (${state.over.reason}).`
      : `${SIDES[state.over.result === 'white' ? 'w' : 'b'].name} carry the field!`
    : promo
      ? `${side.name}: choose what your soldier becomes.`
      : `${side.name} to move.${check ? ' The king is threatened!' : ''}`;

  return (
    <div className="app">
      <a className="back-link" href="/">
        ⟵ The Hall of Games
      </a>
      <h1 className="title" style={{ fontSize: 22 }}>
        THE BATTLE OF THE PELENNOR
      </h1>
      <div className="layout">
        <div className="board-wrap" style={{ maxWidth: 620, flexBasis: 520 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              border: '3px solid #5a4326',
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 3px 10px rgba(0,0,0,0.45)',
            }}
          >
            {board.map((row, r) =>
              row.map((cell, f) => {
                const sq = FILES[f] + (8 - r);
                return (
                  <Square
                    key={sq}
                    sq={sq}
                    piece={cell}
                    light={(r + f) % 2 === 0}
                    selected={sel === sq}
                    target={targets.includes(sq)}
                    capture={targets.includes(sq) && Boolean(cell)}
                    onClick={() => onSquare(sq)}
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="side">
          <div className="panel">
            <div className="prompt">{prompt}</div>
            {promo && (
              <div className="picker">
                <div style={{ fontSize: 14, marginBottom: 6 }}>
                  The soldier reaches the far rank. Raise them as:
                </div>
                <div className="row" style={{ marginTop: 0 }}>
                  {PROMO_CHOICES.map((c) => (
                    <button
                      key={c.p}
                      onClick={() =>
                        dispatch({ type: 'MOVE', from: promo.from, to: promo.to, promotion: c.p })
                      }
                    >
                      <GIcon name={PIECE_ICON[c.p]} /> {c.label}
                    </button>
                  ))}
                  <button onClick={() => setPromo(null)}>Cancel</button>
                </div>
              </div>
            )}
            {!state.over && !promo && (
              <div className="row" style={{ fontSize: 13, color: 'var(--muted)' }}>
                Click one of your pieces, then a marked square to march.
              </div>
            )}
          </div>

          <div className="panel players">
            <div className="section-title">The Two Hosts</div>
            {['w', 'b'].map((c) => (
              <div key={c} className={`player ${!state.over && turn === c ? 'current' : ''}`}>
                <div className="player-head">
                  <span className="player-name" style={{ color: SIDES[c].badge }}>
                    {!state.over && turn === c ? '▶ ' : ''}
                    {SIDES[c].name}
                  </span>
                  <span className="player-meta">⚔ {counts[c]} warriors afield</span>
                </div>
              </div>
            ))}
            <div className="costs">
              {Object.entries(PIECE_ICON).map(([t, icon]) => (
                <span key={t} style={{ whiteSpace: 'nowrap', marginRight: 10 }}>
                  <GIcon name={icon} color="var(--gold)" /> {PIECE_NAME[t]}
                </span>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="section-title">Chronicle</div>
            <div className="log">
              {moveRows.length === 0 && <div>No blows yet struck.</div>}
              {moveRows.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (state.over || window.confirm('Abandon the field and form new lines?')) {
                  setState(null);
                  setSel(null);
                  setTargets([]);
                  setPromo(null);
                }
              }}
            >
              ↺ New Battle
            </button>
          </div>
        </div>
      </div>

      {state.over && (
        <div className="winner-overlay">
          <div className="winner-box">
            <GIcon
              name={state.over.result === 'draw' ? 'flag' : 'crown'}
              size={64}
              color="#a8821e"
              style={{ filter: 'drop-shadow(0 0 14px rgba(168,130,30,0.7))' }}
            />
            <h2>
              {state.over.result === 'draw'
                ? 'The armies withdraw — a draw.'
                : `${SIDES[state.over.result === 'white' ? 'w' : 'b'].name} carry the field!`}
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
              By {state.over.reason}, after {Math.ceil(state.history.length / 2)} moves.
            </p>
            <button onClick={() => setState(newGame())}>New Battle</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      A fan-made hot-seat game of classic chess dressed in the world of J.R.R. Tolkien. Not
      affiliated with Hasbro or Middle-earth Enterprises.
      <br />
      Icons by{' '}
      <a href="https://lorcblog.blogspot.com" target="_blank" rel="noreferrer">
        Lorc
      </a>{' '}
      and{' '}
      <a href="https://delapouite.com" target="_blank" rel="noreferrer">
        Delapouite
      </a>{' '}
      via{' '}
      <a href="https://game-icons.net" target="_blank" rel="noreferrer">
        game-icons.net
      </a>{' '}
      (
      <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
        CC BY 3.0
      </a>
      ).
    </div>
  );
}
