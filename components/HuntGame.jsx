'use client';

import { useState } from 'react';
import useCellSize from '@/components/useCellSize';
import {
  newGame,
  reduce,
  legalMoves,
  isMarsh,
  pieceName,
  pieceIcon,
  SIZE,
  HUNT_FACTIONS,
} from '@/lib/hunt/engine';
import { GIcon } from '@/components/Icon';
import Handoff from '@/components/Handoff';

const PARCH = '#ecdfb8';
const DARK = '#3a2a18';

function rankLabel(piece) {
  return piece.kind === 'flag' || piece.kind === 'bomb' ? null : piece.rank;
}

// A piece badge. mode: 'own' (face-up), 'hidden' (face-down), 'revealed'.
function Badge({ piece, color, mode, size }) {
  const base = {
    width: size - 8,
    height: size - 8,
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #2c2014',
    boxShadow: '0 1px 2px rgba(0,0,0,0.35)',
    lineHeight: 1,
  };
  if (mode === 'own') {
    const rank = rankLabel(piece);
    return (
      <div style={{ ...base, background: color, color: '#f4e7c4' }}>
        {rank !== null && <span style={{ fontSize: 13, fontWeight: 'bold' }}>{rank}</span>}
        <GIcon name={pieceIcon(piece)} size={rank !== null ? 11 : 18} color="#f4e7c4" />
      </div>
    );
  }
  if (mode === 'revealed') {
    const rank = rankLabel(piece);
    return (
      <div style={{ ...base, background: DARK, color: '#cdb98a' }}>
        {rank !== null ? (
          <span style={{ fontSize: 14, fontWeight: 'bold', opacity: 0.75 }}>{rank}</span>
        ) : (
          <GIcon name={pieceIcon(piece)} size={15} color="#cdb98a" style={{ opacity: 0.75 }} />
        )}
      </div>
    );
  }
  return (
    <div style={{ ...base, background: DARK }}>
      <GIcon name="eye" size={15} color="#9b8b66" />
    </div>
  );
}

function CapturedList({ pieces, faction }) {
  const sorted = pieces
    .slice()
    .sort((a, b) => b.rank - a.rank);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4, minHeight: 18 }}>
      {sorted.length === 0 && (
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>No losses yet.</span>
      )}
      {sorted.map((pc, i) => (
        <span
          key={i}
          title={pieceName(pc, faction)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            border: '1px solid #a8895a',
            borderRadius: 4,
            padding: '1px 4px',
            fontSize: 11,
            background: 'rgba(255,246,220,0.4)',
          }}
        >
          <GIcon name={pieceIcon(pc)} size={11} color="var(--accent)" />
          {rankLabel(pc) !== null ? rankLabel(pc) : ''}
        </span>
      ))}
    </div>
  );
}

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">THE HUNT FOR THE RING</h1>
      <p className="subtitle">Forty banners, one secret burden</p>
      <div className="ring">
        <GIcon
          name="ring"
          size={84}
          color="#e8c34a"
          style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }}
        />
      </div>
      <p>
        Two hidden armies face each other across the Dead Marshes. Among each host of forty —
        riders, dwarf-delvers, lords, wraith-lords and one mighty marshal — a single bearer
        carries the Ring, guarded by watchtowers. Probe the enemy lines, unmask their ranks in
        battle, and seize the enemy&apos;s Ring before they find yours.
      </p>
      <div className="lobby-buttons">
        <button onClick={onStart}>Begin the Hunt</button>
      </div>
      <p className="lobby-note">
        Hot-seat play for two: pass the device between the Fellowship and Mordor. The screen
        is covered at each handoff — enemy ranks stay hidden until battle reveals them.
      </p>
    </div>
  );
}

export default function HuntGame() {
  const [state, setState] = useState(null);
  const [sel, setSel] = useState(null);
  const cellSize = useCellSize(42, 10, 100);

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
    }
  };

  const setupP = state.ready[0] ? 1 : 0;
  const viewerIdx = state.phase === 'setup' ? setupP : state.current;
  const viewer = HUNT_FACTIONS[viewerIdx];
  const combat = state.lastCombat;

  const targets = new Set();
  if (sel && state.phase === 'play' && !combat) {
    for (const [r, c] of legalMoves(state, sel)) targets.add(`${r},${c}`);
  }

  const onCell = (r, c) => {
    if (state.phase !== 'play' || combat || state.winner !== null) return;
    const piece = state.board[r][c];
    if (targets.has(`${r},${c}`)) {
      dispatch({ type: 'MOVE', from: sel, to: [r, c] });
      return;
    }
    if (piece && piece.p === viewerIdx) {
      setSel(sel && sel[0] === r && sel[1] === c ? null : [r, c]);
    } else {
      setSel(null);
    }
  };

  const prompt =
    state.phase === 'setup'
      ? `${viewer.name}: your host is drawn up in secret. Redeploy until it pleases you, then stand ready.`
      : state.phase === 'game-over'
        ? state.winner === null
          ? 'The hunt ends in stalemate.'
          : `${HUNT_FACTIONS[state.winner].name} has taken the Ring!`
        : combat
          ? combat.text
          : sel
            ? `${viewer.name}: choose where the piece marches.`
            : `${viewer.name}: choose one of your pieces to move.`;

  return (
    <div className="app">
      <a className="back-link" href="/">
        ⟵ The Hall of Games
      </a>
      <Handoff player={viewer.name} color={viewer.color}>
        <h1 className="title" style={{ fontSize: 22 }}>
          THE HUNT FOR THE RING
        </h1>
        <div className="layout">
          <div className="board-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                background: 'linear-gradient(160deg, #eee0ba, #dcc795)',
                border: '1px solid #a8895a',
                borderRadius: 10,
                padding: 10,
                boxShadow: 'inset 0 0 0 3px rgba(138,90,22,0.12), 0 2px 8px rgba(0,0,0,0.45)',
              }}
            >
              <div
                style={{
                  display: 'inline-grid',
                  gridTemplateColumns: `repeat(${SIZE}, ${cellSize}px)`,
                  gridAutoRows: `${cellSize}px`,
                  gap: 2,
                }}
              >
                {Array.from({ length: SIZE * SIZE }, (_, i) => {
                  const r = Math.floor(i / SIZE);
                  const c = i % SIZE;
                  const marsh = isMarsh(r, c);
                  const piece = state.board[r][c];
                  const isSel = sel && sel[0] === r && sel[1] === c;
                  const isTarget = targets.has(`${r},${c}`);
                  const combatCell =
                    combat &&
                    ((combat.to[0] === r && combat.to[1] === c) ||
                      (combat.from[0] === r && combat.from[1] === c));
                  const clickable =
                    !marsh &&
                    state.phase === 'play' &&
                    !combat &&
                    state.winner === null &&
                    (isTarget || (piece && piece.p === viewerIdx));
                  let content = null;
                  if (marsh) {
                    content = <GIcon name="swamp" size={20} color="#5d6b42" style={{ opacity: 0.7 }} />;
                  } else if (piece) {
                    const mine = piece.p === viewerIdx;
                    content = (
                      <Badge
                        piece={piece}
                        color={HUNT_FACTIONS[piece.p].color}
                        mode={mine ? 'own' : piece.revealed ? 'revealed' : 'hidden'}
                        size={cellSize}
                      />
                    );
                  }
                  return (
                    <div
                      key={i}
                      onClick={clickable ? () => onCell(r, c) : undefined}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        border: marsh ? '1px solid #6b7a4e' : '1px solid #8a6f44',
                        borderRadius: 3,
                        background: marsh ? '#aab584' : PARCH,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: clickable ? 'pointer' : 'default',
                        boxShadow: isSel
                          ? 'inset 0 0 0 3px #8a5a16'
                          : isTarget
                            ? 'inset 0 0 0 2px #3e7d44'
                            : combatCell
                              ? 'inset 0 0 0 2px #9c2a18'
                              : 'none',
                      }}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="side">
            <div className="panel">
              <div className="prompt">{prompt}</div>
              {state.phase === 'setup' && (
                <div className="row">
                  <button onClick={() => dispatch({ type: 'REDEPLOY', p: setupP })}>
                    <GIcon name="flag" /> Redeploy
                  </button>
                  <button onClick={() => dispatch({ type: 'READY', p: setupP })}>
                    <GIcon name="sword" /> Ready
                  </button>
                </div>
              )}
              {state.phase === 'play' && combat && (
                <div className="row">
                  <button onClick={() => dispatch({ type: 'ACK' })}>
                    <GIcon name="eye" /> Pass the device
                  </button>
                </div>
              )}
            </div>

            <div className="panel players">
              <div className="section-title">The Two Hosts</div>
              {HUNT_FACTIONS.map((f, i) => {
                const isTurn = state.phase === 'play' && i === state.current;
                let alive = 0;
                for (const row of state.board) for (const v of row) if (v && v.p === i) alive++;
                return (
                  <div key={i} className={`player ${isTurn ? 'current' : ''}`}>
                    <div className="player-head">
                      <span className="player-name" style={{ color: f.color }}>
                        {isTurn ? '▶ ' : ''}
                        {f.name}
                      </span>
                      <span className="player-meta">
                        {state.phase === 'setup'
                          ? state.ready[i]
                            ? 'host arrayed'
                            : 'mustering…'
                          : `⚔ ${alive} pieces afield · ${state.captured[i].length} lost`}
                      </span>
                    </div>
                    <CapturedList pieces={state.captured[i]} faction={i} />
                  </div>
                );
              })}
              <div className="costs">
                <GIcon name="crown" color="var(--accent)" /> 10 Marshal ·{' '}
                <GIcon name="crossedswords" color="var(--accent)" /> 4–9 fighters ·{' '}
                <GIcon name="dwarf" color="var(--accent)" /> 3 Dwarf-delver (defuses towers) ·{' '}
                <GIcon name="horse" color="var(--accent)" /> 2 Rider (rides far) ·{' '}
                <GIcon name="spy" color="var(--accent)" /> 1 Spy (slays the Marshal) ·{' '}
                <GIcon name="tower" color="var(--accent)" /> Watchtower ·{' '}
                <GIcon name="ring" color="var(--accent)" /> The Ring
              </div>
            </div>

            <div className="panel">
              <div className="section-title">Chronicle</div>
              <div className="log">
                {state.log.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            </div>

            <div className="row" style={{ justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (
                    state.phase === 'game-over' ||
                    window.confirm('Abandon this hunt and start anew?')
                  ) {
                    setState(null);
                    setSel(null);
                  }
                }}
              >
                ↺ New Hunt
              </button>
            </div>
          </div>
        </div>

        {state.phase === 'game-over' && (
          <div className="winner-overlay">
            <div className="winner-box">
              <GIcon
                name="ring"
                size={64}
                color="#a8821e"
                style={{ filter: 'drop-shadow(0 0 14px rgba(168,130,30,0.7))' }}
              />
              {state.winner !== null ? (
                <>
                  <h2>{HUNT_FACTIONS[state.winner].name} has taken the Ring!</h2>
                  <p style={{ color: 'var(--muted)', marginBottom: 18 }}>The hunt is ended.</p>
                </>
              ) : (
                <>
                  <h2>The hunt ends in stalemate.</h2>
                  <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
                    Neither host can stir another step.
                  </p>
                </>
              )}
              <button
                onClick={() => {
                  setState(null);
                  setSel(null);
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </Handoff>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      A fan-made hot-seat game inspired by classic hidden-rank battlefield board games and the
      world of J.R.R. Tolkien. Not affiliated with Hasbro or Middle-earth Enterprises.
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
