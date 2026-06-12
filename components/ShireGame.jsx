'use client';

import { useMemo, useState } from 'react';
import {
  newGame,
  reduce,
  legalPlacements,
  meepleOptions,
  TILE_TYPES,
  SHIRE_FAMILIES,
} from '@/lib/shire/engine';
import { GIcon, BoardIcon } from '@/components/Icon';

const TS = 64; // tile size in board units
const EDGE_MID = [
  [32, 0],
  [64, 32],
  [32, 64],
  [0, 32],
];

// ---- procedural tile artwork (local 0..64 coordinates) --------------------

function TownShape({ edges }) {
  let d;
  let k = 0;
  if (edges.length === 4) {
    d = 'M 0 0 L 64 0 L 64 64 L 0 64 Z';
  } else if (edges.length === 3) {
    // base covers N+E+W, open to the south; rotate so the gap lines up
    const open = [0, 1, 2, 3].find((e) => !edges.includes(e));
    k = (open + 2) % 4;
    d = 'M 0 0 L 64 0 L 64 64 Q 32 36 0 64 Z';
  } else if (edges.length === 2 && edges.includes((edges[0] + 2) % 4)) {
    // opposite edges: a pinched band, base running N to S
    k = edges.includes(0) ? 0 : 1;
    d = 'M 14 0 Q 27 32 14 64 L 50 64 Q 37 32 50 0 Z';
  } else if (edges.length === 2) {
    // adjacent corner, base covering N+E
    const s = edges.slice().sort((a, b) => a - b);
    k = s[0] === 0 && s[1] === 3 ? 3 : s[0];
    d = 'M 0 0 L 64 0 L 64 64 Q 38 26 0 0 Z';
  } else {
    // single cap, base at N
    k = edges[0];
    d = 'M 0 0 L 64 0 Q 32 30 0 0 Z';
  }
  return (
    <path
      d={d}
      transform={k ? `rotate(${k * 90} 32 32)` : undefined}
      fill="#bd9078"
      stroke="#5e4426"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  );
}

function RoadShape({ edges }) {
  let d;
  if (edges.length === 2) {
    const [a, b] = edges;
    d = `M ${EDGE_MID[a][0]} ${EDGE_MID[a][1]} Q 32 32 ${EDGE_MID[b][0]} ${EDGE_MID[b][1]}`;
  } else {
    d = `M ${EDGE_MID[edges[0]][0]} ${EDGE_MID[edges[0]][1]} L 32 32`;
  }
  return <path d={d} fill="none" stroke="#5e4426" strokeWidth="7" strokeLinecap="butt" />;
}

// Towns, roads and inn for one tile (the grass base is drawn separately so
// the hand-drawn wobble filter never opens seams between tiles).
function TileDecor({ type, rot }) {
  const tt = TILE_TYPES[type];
  const deadEnds = tt.features.filter((f) => f.type === 'road' && f.edges.length === 1).length;
  return (
    <g transform={rot ? `rotate(${rot * 90} 32 32)` : undefined}>
      {tt.features.map((f, i) => (f.type === 'town' ? <TownShape key={i} edges={f.edges} /> : null))}
      {tt.features.map((f, i) => (f.type === 'road' ? <RoadShape key={i} edges={f.edges} /> : null))}
      {deadEnds >= 2 && (
        <circle cx="32" cy="32" r="5.5" fill="#8a6f44" stroke="#5e4426" strokeWidth="1.5" />
      )}
      {tt.inn && (
        <g>
          <rect x="20" y="20" width="24" height="24" rx="3" fill="#e3d3a3" stroke="#5e4426" strokeWidth="2" />
          <BoardIcon name="village" x={32} y={32} s={18} color="#5e4426" />
        </g>
      )}
    </g>
  );
}

// Where on the tile (local coords, before tile rotation) a hobbit on
// feature `fi` should stand.
function featureAnchor(type, fi) {
  const f = TILE_TYPES[type].features[fi];
  let ax = 0;
  let ay = 0;
  for (const e of f.edges) {
    ax += EDGE_MID[e][0];
    ay += EDGE_MID[e][1];
  }
  ax /= f.edges.length;
  ay /= f.edges.length;
  const t = f.type === 'town' ? 0.62 : 0.5;
  return [32 + (ax - 32) * t, 32 + (ay - 32) * t];
}

function rotPoint([px, py], rot) {
  let dx = px - 32;
  let dy = py - 32;
  for (let i = 0; i < rot; i++) {
    const t = dx;
    dx = -dy;
    dy = t;
  }
  return [32 + dx, 32 + dy];
}

function InkFilter({ id }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
    </filter>
  );
}

function TilePreview({ type, rot }) {
  return (
    <svg viewBox="-3 -3 70 70" width="86" height="86" style={{ display: 'block' }}>
      <defs>
        <InkFilter id="sh-pv-ink" />
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="3" fill="#b7c98a" stroke="#5e4426" strokeWidth="2" />
      <g filter="url(#sh-pv-ink)">
        <TileDecor type={type} rot={rot} />
      </g>
    </svg>
  );
}

// ---- the board -------------------------------------------------------------

function Board({ state, slots, options, currentColor, onSlot, onOption }) {
  const tiles = Object.values(state.placed);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const t of tiles) {
    minX = Math.min(minX, t.x);
    minY = Math.min(minY, t.y);
    maxX = Math.max(maxX, t.x);
    maxY = Math.max(maxY, t.y);
  }
  for (const s of slots) {
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x);
    maxY = Math.max(maxY, s.y);
  }
  const M = 34;
  const x0 = minX * TS - M;
  const y0 = minY * TS - M;
  const w = (maxX - minX + 1) * TS + 2 * M;
  const h = (maxY - minY + 1) * TS + 2 * M;
  const pendingTile = state.pending ? state.placed[state.pending.key] : null;

  return (
    <svg viewBox={`${x0} ${y0} ${w} ${h}`}>
      <defs>
        <radialGradient id="sh-parch" cx="50%" cy="42%" r="80%">
          <stop offset="0%" stopColor="#eee0ba" />
          <stop offset="100%" stopColor="#d9c48f" />
        </radialGradient>
        <radialGradient id="sh-vignette" cx="50%" cy="50%" r="72%">
          <stop offset="0%" stopColor="rgba(88,58,20,0)" />
          <stop offset="78%" stopColor="rgba(88,58,20,0.05)" />
          <stop offset="100%" stopColor="rgba(74,46,14,0.4)" />
        </radialGradient>
        <InkFilter id="sh-ink" />
        <filter id="sh-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.34 0 0 0 0 0.24 0 0 0 0 0.10 0 0 0 0.07 0" />
        </filter>
        <filter id="sh-blotch">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0 0.10 0 0 0 0.11 0" />
        </filter>
      </defs>

      <rect x={x0} y={y0} width={w} height={h} rx="14" fill="url(#sh-parch)" />

      {/* grass bases, unfiltered so neighbouring tiles never gape */}
      {tiles.map((t) => (
        <rect
          key={`g${t.x},${t.y}`}
          x={t.x * TS}
          y={t.y * TS}
          width={TS}
          height={TS}
          fill="#b7c98a"
          stroke="#8d7a4e"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
      ))}

      {/* one shared wobble over every tile's inked artwork */}
      <g filter="url(#sh-ink)">
        {tiles.map((t) => (
          <g key={`d${t.x},${t.y}`} transform={`translate(${t.x * TS} ${t.y * TS})`}>
            <TileDecor type={t.type} rot={t.rot} />
          </g>
        ))}
      </g>

      {/* parchment grain over the artwork */}
      <rect x={x0} y={y0} width={w} height={h} filter="url(#sh-grain)" pointerEvents="none" />
      <rect x={x0} y={y0} width={w} height={h} filter="url(#sh-blotch)" pointerEvents="none" />

      {/* hobbits at work */}
      {Object.values(state.features).map((f) =>
        f.meeples.map((m) => {
          const t = state.placed[m.key];
          const [px, py] = rotPoint(featureAnchor(t.type, m.fi), t.rot);
          return (
            <BoardIcon
              key={`m${m.key}#${m.fi}#${m.pid}`}
              name="meeple"
              x={t.x * TS + px}
              y={t.y * TS + py}
              s={23}
              color={state.players[m.pid].color}
              stroke="#2c2014"
              strokeWidth={18}
            />
          );
        })
      )}
      {tiles
        .filter((t) => t.innMeeple !== null && t.innMeeple !== undefined)
        .map((t) => (
          <BoardIcon
            key={`im${t.x},${t.y}`}
            name="meeple"
            x={t.x * TS + 32}
            y={t.y * TS + 32}
            s={23}
            color={state.players[t.innMeeple].color}
            stroke="#2c2014"
            strokeWidth={18}
          />
        ))}

      {/* the freshly laid tile */}
      {pendingTile && (
        <rect
          x={pendingTile.x * TS + 1}
          y={pendingTile.y * TS + 1}
          width={TS - 2}
          height={TS - 2}
          fill="none"
          stroke="#8a5a16"
          strokeWidth="2.5"
          pointerEvents="none"
        />
      )}

      {/* dashed plots where the drawn tile (current rotation) may go */}
      {slots.map((s) => (
        <rect
          key={`s${s.x},${s.y}`}
          className="hex-target"
          x={s.x * TS + 3}
          y={s.y * TS + 3}
          width={TS - 6}
          height={TS - 6}
          rx="6"
          fill="rgba(168,130,30,0.13)"
          stroke="#8a5a16"
          strokeWidth="1.8"
          strokeDasharray="6 5"
          onClick={() => onSlot(s)}
        />
      ))}

      {/* hobbit-placement spots on the new tile */}
      {pendingTile &&
        options.map((o) => {
          const p =
            o.kind === 'inn' ? [32, 32] : rotPoint(featureAnchor(pendingTile.type, o.fi), pendingTile.rot);
          const cx = pendingTile.x * TS + p[0];
          const cy = pendingTile.y * TS + p[1];
          return (
            <g key={`o${o.kind}${o.fi ?? ''}`}>
              <circle
                className="vertex-spot"
                cx={cx}
                cy={cy}
                r="9.5"
                fill="rgba(255,246,220,0.88)"
                stroke="#2c2014"
                strokeWidth="1.8"
                onClick={() => onOption(o)}
              />
              <g pointerEvents="none">
                <BoardIcon name="meeple" x={cx} y={cy} s={13} color={currentColor} opacity={0.95} />
              </g>
            </g>
          );
        })}

      <rect x={x0} y={y0} width={w} height={h} rx="14" fill="url(#sh-vignette)" pointerEvents="none" />
    </svg>
  );
}

// ---- lobby and chrome ------------------------------------------------------

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">THE FOUNDING OF THE SHIRE</h1>
      <p className="subtitle">Lay the lanes, raise the homesteads, keep the inns</p>
      <div className="ring">
        <GIcon
          name="village"
          size={84}
          color="#e8c34a"
          style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }}
        />
      </div>
      <p>
        The old families have crossed the Brandywine with a satchel of sixty survey-tiles. Each
        turn, draw a tile and fit it to the growing map — lane to lane, homestead to homestead,
        meadow to meadow — then send out one of your seven hobbits to ward a lane, settle a
        homestead, or keep an inn. Finished works pay at once; half-finished ones pay a pittance
        when the satchel runs dry. The family with the most points founds the fairest corner of
        the Shire.
      </p>
      <div className="lobby-buttons">
        {[2, 3, 4].map((n) => (
          <button key={n} onClick={() => onStart(n)}>
            {n} Families
          </button>
        ))}
      </div>
      <p className="lobby-note">
        Hot-seat play with open information: pass the device between players. Families in order:{' '}
        {SHIRE_FAMILIES.map((f) => f.name).join(', ')}. Lanes score 1 a tile, homesteads 2, a
        finished inn 9.
      </p>
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      A fan-made hot-seat strategy game inspired by classic tile-laying board games and the world
      of J.R.R. Tolkien. Not affiliated with Hasbro or Middle-earth Enterprises.
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

// ---- main component ---------------------------------------------------------

export default function ShireGame() {
  const [state, setState] = useState(null);
  const [uiRot, setUiRot] = useState(0);

  const allSpots = useMemo(
    () => (state && state.phase === 'place' ? legalPlacements(state) : []),
    [state]
  );

  if (!state) {
    return (
      <div className="app">
        <a className="back-link" href="/">
          ⟵ The Hall of Games
        </a>
        <Lobby
          onStart={(n) => {
            setState(newGame(n));
            setUiRot(0);
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
      setUiRot(0);
    }
  };

  const me = state.players[state.current];
  const phase = state.phase;
  const slots = phase === 'place' ? allSpots.filter((s) => s.rot === uiRot) : [];
  const options = phase === 'meeple' ? meepleOptions(state) : [];

  const prompt =
    phase === 'place'
      ? slots.length > 0
        ? `${me.name}: choose a dashed plot for the drawn tile.`
        : `${me.name}: this tile fits nowhere at this turning — rotate it.`
      : phase === 'meeple'
        ? `${me.name}: settle a hobbit on the new tile, or let the ground lie.`
        : 'The Shire is founded.';

  return (
    <div className="app">
      <a className="back-link" href="/">
        ⟵ The Hall of Games
      </a>
      <h1 className="title" style={{ fontSize: 22 }}>
        THE FOUNDING OF THE SHIRE
      </h1>
      <div className="layout">
        <div className="board-wrap" style={{ maxWidth: 860, flexBasis: 640 }}>
          <Board
            state={state}
            slots={slots}
            options={options}
            currentColor={me.color}
            onSlot={(s) => dispatch({ type: 'PLACE', x: s.x, y: s.y, rot: s.rot })}
            onOption={(o) => dispatch({ type: 'MEEPLE', feature: o.kind === 'inn' ? 'inn' : o.fi })}
          />
        </div>

        <div className="side">
          <div className="panel">
            <div className="prompt">{prompt}</div>

            {phase === 'place' && state.drawn && (
              <div className="picker">
                <div className="row" style={{ marginTop: 0, alignItems: 'center' }}>
                  <TilePreview type={state.drawn} rot={uiRot} />
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 14 }}>
                      Drawn: <b>{TILE_TYPES[state.drawn].label}</b>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      {slots.length} plot{slots.length === 1 ? '' : 's'} fit this turning.
                    </div>
                    <div className="row" style={{ marginTop: 8 }}>
                      <button onClick={() => setUiRot((uiRot + 1) % 4)}>
                        <GIcon name="compass" /> Rotate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {phase === 'meeple' && (
              <div className="row">
                <button onClick={() => dispatch({ type: 'MEEPLE', feature: null })}>
                  <GIcon name="boot" /> Place no hobbit
                </button>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {me.meeples} hobbit{me.meeples === 1 ? '' : 's'} in your hole.
                </span>
              </div>
            )}

            <div className="row" style={{ fontSize: 13, color: 'var(--muted)' }}>
              <span>
                <GIcon name="tiedscroll" color="var(--gold)" /> Satchel: {state.deck.length} tile
                {state.deck.length === 1 ? '' : 's'} left
              </span>
              {state.discarded > 0 && <span>· {state.discarded} set aside</span>}
            </div>
          </div>

          <div className="panel players">
            <div className="section-title">The Old Families</div>
            {state.players.map((p) => (
              <div key={p.id} className={`player ${p.id === state.current && phase !== 'game-over' ? 'current' : ''}`}>
                <div className="player-head">
                  <span className="player-name" style={{ color: p.color }}>
                    {p.id === state.current && phase !== 'game-over' ? '▶ ' : ''}
                    {p.name}
                  </span>
                  <span className="player-meta">
                    <GIcon name="twocoins" /> {p.score} pts
                  </span>
                </div>
                <div style={{ marginTop: 4, minHeight: 16 }}>
                  {Array.from({ length: p.meeples }).map((_, i) => (
                    <GIcon key={i} name="meeple" size={14} color={p.color} style={{ marginRight: 3 }} />
                  ))}
                  {p.meeples === 0 && (
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>every hobbit afield</span>
                  )}
                </div>
              </div>
            ))}
            <div className="costs">
              Lane done: 1/tile · Homestead done: 2/tile · Inn ringed by 8 tiles: 9 · At the end —
              lanes &amp; homesteads 1/tile, inns 1 + neighbours.
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
                if (state.phase === 'game-over' || window.confirm('Roll up the survey and start anew?')) {
                  setState(null);
                  setUiRot(0);
                }
              }}
            >
              ↺ New Founding
            </button>
          </div>
        </div>
      </div>

      {phase === 'game-over' && state.winners && (
        <div className="winner-overlay">
          <div className="winner-box">
            <GIcon
              name="crown"
              size={64}
              color="#a8821e"
              style={{ filter: 'drop-shadow(0 0 14px rgba(168,130,30,0.7))' }}
            />
            <h2>
              {state.winners.map((id) => state.players[id].name).join(' & ')}{' '}
              {state.winners.length > 1 ? 'share the founding of the Shire!' : 'founds the Shire!'}
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
              {state.players
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((p) => `${p.name} ${p.score}`)
                .join(' · ')}
            </p>
            <button onClick={() => setState(null)}>Play Again</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
