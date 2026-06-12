'use client';

import { useState } from 'react';
import useCellSize from '@/components/useCellSize';
import { newGame, reduce, ROWS, SIZE, FLEET } from '@/lib/beacons/engine';
import { GIcon } from '@/components/Icon';
import Handoff from '@/components/Handoff';

const PARCH = '#ecdfb8';
const INK_BORDER = '1px solid #8a6f44';

function coordName(x, y) {
  return `${ROWS[y]}${x + 1}`;
}

// A labelled 10x10 grid of divs on a parchment slab.
function CampGrid({ title, cellSize, renderCell, onCell }) {
  const label = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: Math.max(9, cellSize * 0.32),
    color: '#75603f',
    fontWeight: 'bold',
  };
  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #eee0ba, #dcc795)',
        border: '1px solid #a8895a',
        borderRadius: 10,
        padding: 10,
        boxShadow: 'inset 0 0 0 3px rgba(138,90,22,0.12), 0 2px 8px rgba(0,0,0,0.45)',
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: '#75603f',
            marginBottom: 6,
            textAlign: 'center',
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `${Math.round(cellSize * 0.6)}px repeat(${SIZE}, ${cellSize}px)`,
          gridAutoRows: `${cellSize}px`,
          gap: 2,
        }}
      >
        <div />
        {Array.from({ length: SIZE }, (_, x) => (
          <div key={`c${x}`} style={label}>
            {x + 1}
          </div>
        ))}
        {Array.from({ length: SIZE }, (_, y) => (
          <FragmentRow key={y} y={y} label={label} cellSize={cellSize} renderCell={renderCell} onCell={onCell} />
        ))}
      </div>
    </div>
  );
}

function FragmentRow({ y, label, cellSize, renderCell, onCell }) {
  return (
    <>
      <div style={label}>{ROWS[y]}</div>
      {Array.from({ length: SIZE }, (_, x) => {
        const { content, style, clickable } = renderCell(x, y);
        return (
          <div
            key={x}
            onClick={clickable ? () => onCell(x, y) : undefined}
            style={{
              width: cellSize,
              height: cellSize,
              border: INK_BORDER,
              borderRadius: 3,
              background: PARCH,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: clickable ? 'pointer' : 'default',
              ...style,
            }}
          >
            {content}
          </div>
        );
      })}
    </>
  );
}

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">THE BEACON HILLS</h1>
      <p className="subtitle">Hidden camps upon the heights</p>
      <div className="ring">
        <GIcon
          name="eye"
          size={84}
          color="#e8c34a"
          style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }}
        />
      </div>
      <p>
        Gondor and Mordor have pitched five secret encampments each among the misty beacon
        hills — a Grand Host, a War Camp, two Outposts, and a lone Scout Tent. Turn by turn,
        each commander bends a palantír upon the enemy hills, calling down fire on one square
        at a time. Burn every tent of the enemy before yours are found, and the hills are
        yours.
      </p>
      <div className="lobby-buttons">
        <button onClick={onStart}>Light the Beacons</button>
      </div>
      <p className="lobby-note">
        Hot-seat play for two: pass the device between Gondor and Mordor. The screen is
        covered at each handoff so no one glimpses the enemy camps.
      </p>
    </div>
  );
}

export default function BeaconsGame() {
  const [state, setState] = useState(null);
  const bigCell = useCellSize(34, 11, 100);

  if (!state) {
    return (
      <div className="app">
        <a className="back-link" href="/">
          ⟵ The Hall of Games
        </a>
        <Lobby onStart={() => setState(newGame())} />
        <Footer />
      </div>
    );
  }

  const dispatch = (action) => {
    const next = reduce(state, action);
    if (next !== state) setState(next);
  };

  const setupP = state.ready[0] ? 1 : 0;
  const viewerIdx = state.phase === 'setup' ? setupP : state.current;
  const viewer = state.players[viewerIdx];
  const foe = state.players[1 - viewerIdx];
  const last = state.lastShot;

  // Cells of fully burned enemy camps, revealed in outline.
  const sunkCells = new Set();
  for (const sh of foe.ships) {
    if (sh.hits >= sh.size) for (const [cx, cy] of sh.cells) sunkCells.add(`${cx},${cy}`);
  }

  const renderTarget = (x, y) => {
    const shot = viewer.shots[y][x];
    const sunk = sunkCells.has(`${x},${y}`);
    const isLast = last && last.x === x && last.y === y;
    let content = null;
    if (shot === 'miss') content = <GIcon name="wavecrest" size={16} color="#9b8b66" style={{ opacity: 0.65 }} />;
    if (shot === 'hit') content = <GIcon name="campfire" size={20} color="#9c2a18" />;
    return {
      content,
      clickable: state.phase === 'play' && !last && shot === null,
      style: {
        background: sunk ? 'rgba(156,42,24,0.22)' : shot === 'hit' ? 'rgba(156,42,24,0.12)' : PARCH,
        border: sunk ? '1.5px solid #9c2a18' : INK_BORDER,
        boxShadow: isLast ? 'inset 0 0 0 2px #8a5a16' : 'none',
      },
    };
  };

  const renderMine = (x, y) => {
    const shipIdx = viewer.board[y][x];
    const incoming = foe.shots[y][x];
    let content = null;
    if (incoming === 'hit') content = <GIcon name="campfire" size={13} color="#7e1f10" />;
    else if (incoming === 'miss')
      content = <span style={{ width: 4, height: 4, borderRadius: 2, background: '#9b8b66' }} />;
    return {
      content,
      clickable: false,
      style: {
        background: shipIdx !== null ? viewer.color : PARCH,
        opacity: shipIdx !== null && incoming !== 'hit' ? 0.92 : 1,
      },
    };
  };

  const prompt =
    state.phase === 'setup'
      ? `${viewer.name}: your camps are pitched in secret. Redeploy until they please you, then stand ready.`
      : state.phase === 'game-over'
        ? `The hills belong to ${state.players[state.winner].name}.`
        : last
          ? last.result === 'hit'
            ? last.sunk
              ? `Fire at ${coordName(last.x, last.y)} — the ${last.sunk} burns entire!`
              : `Fire takes hold at ${coordName(last.x, last.y)}! A camp is struck.`
            : `Only mist and heather at ${coordName(last.x, last.y)}.`
          : `${viewer.name}: scry the palantír — choose a square of the enemy hills.`;

  return (
    <div className="app">
      <a className="back-link" href="/">
        ⟵ The Hall of Games
      </a>
      <Handoff player={viewer.name} color={viewer.color}>
        <h1 className="title" style={{ fontSize: 22 }}>
          THE BEACON HILLS
        </h1>
        <div className="layout">
          <div className="board-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'flex-start' }}>
            {state.phase === 'setup' ? (
              <CampGrid title={`The camps of ${viewer.name}`} cellSize={bigCell} renderCell={renderMine} />
            ) : (
              <>
                <CampGrid
                  title={`The hills of ${foe.name}`}
                  cellSize={bigCell}
                  renderCell={renderTarget}
                  onCell={(x, y) => dispatch({ type: 'FIRE', x, y })}
                />
                <CampGrid title={`My camps (${viewer.name})`} cellSize={Math.min(20, bigCell)} renderCell={renderMine} />
              </>
            )}
          </div>

          <div className="side">
            <div className="panel">
              <div className="prompt">{prompt}</div>
              {state.phase === 'setup' && (
                <div className="row">
                  <button onClick={() => dispatch({ type: 'REDEPLOY', p: setupP })}>
                    <GIcon name="campfire" /> Redeploy
                  </button>
                  <button onClick={() => dispatch({ type: 'READY', p: setupP })}>
                    <GIcon name="flag" /> Ready
                  </button>
                </div>
              )}
              {state.phase === 'play' && last && (
                <div className="row">
                  <button onClick={() => dispatch({ type: 'NEXT' })}>
                    <GIcon name="eye" /> Pass the palantír
                  </button>
                </div>
              )}
            </div>

            <div className="panel players">
              <div className="section-title">Commanders of the Watch</div>
              {state.players.map((p, i) => {
                const standing = p.ships.filter((sh) => sh.hits < sh.size).length;
                const isTurn = state.phase === 'play' && i === state.current;
                return (
                  <div key={i} className={`player ${isTurn ? 'current' : ''}`}>
                    <div className="player-head">
                      <span className="player-name" style={{ color: p.color }}>
                        {isTurn ? '▶ ' : ''}
                        {p.name}
                      </span>
                      <span className="player-meta">
                        {state.phase === 'setup'
                          ? state.ready[i]
                            ? 'camps hidden'
                            : 'pitching camp…'
                          : `⛺ ${standing}/5 camps standing`}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="costs">
                {FLEET.map((f, i) => (
                  <span key={i} style={{ whiteSpace: 'nowrap', marginRight: 10 }}>
                    <GIcon name="campfire" color="var(--accent)" /> {f.name} ({f.size})
                  </span>
                ))}
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
                  if (state.winner !== null || window.confirm('Abandon the watch and begin anew?')) {
                    setState(null);
                  }
                }}
              >
                ↺ New Watch
              </button>
            </div>
          </div>
        </div>

        {state.winner !== null && (
          <div className="winner-overlay">
            <div className="winner-box">
              <GIcon
                name="campfire"
                size={64}
                color="#a8821e"
                style={{ filter: 'drop-shadow(0 0 14px rgba(168,130,30,0.7))' }}
              />
              <h2>{state.players[state.winner].name} holds the Beacon Hills!</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
                Every enemy camp lies in ashes.
              </p>
              <button onClick={() => setState(null)}>Play Again</button>
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
      A fan-made hot-seat game inspired by classic naval search-and-bombardment guessing games
      and the world of J.R.R. Tolkien. Not affiliated with Hasbro or Middle-earth Enterprises.
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
