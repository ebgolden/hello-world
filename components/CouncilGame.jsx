'use client';

import { useState } from 'react';
import {
  PROVINCES,
  NEIGHBORS,
  EDGES,
  CENTER_IDS,
  COUNCIL_MAP,
  MAP_W,
  MAP_H,
} from '@/lib/council/map';
import { newGame, reduce, validOrders, MAX_ROUNDS, VICTORY_CENTERS } from '@/lib/council/engine';
import Handoff from '@/components/Handoff';
import { GIcon, BoardIcon } from '@/components/Icon';

const pname = (id) => PROVINCES[id].name;

function orderText(o) {
  if (!o) return 'no orders (will hold)';
  if (o.type === 'hold') return 'hold fast';
  if (o.type === 'move') return `march → ${pname(o.to)}`;
  return o.to == null ? `support ${pname(o.prov)} holding` : `support ${pname(o.prov)} → ${pname(o.to)}`;
}

function MapBoard({ state, onProv, highlights, selUnit, shownOrders }) {
  const unitAt = {};
  for (const u of state.units) unitAt[u.prov] = u;
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
      <defs>
        <radialGradient id="cg-parch" cx="50%" cy="42%" r="80%">
          <stop offset="0%" stopColor="#eee0ba" />
          <stop offset="100%" stopColor="#d9c48f" />
        </radialGradient>
        <radialGradient id="cg-vignette" cx="50%" cy="50%" r="72%">
          <stop offset="0%" stopColor="rgba(88,58,20,0)" />
          <stop offset="78%" stopColor="rgba(88,58,20,0.05)" />
          <stop offset="100%" stopColor="rgba(74,46,14,0.4)" />
        </radialGradient>
        <filter id="cf-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" />
        </filter>
        <filter id="cf-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.34 0 0 0 0 0.24 0 0 0 0 0.10 0 0 0 0.07 0" />
        </filter>
        <filter id="cf-blotch">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0 0.10 0 0 0 0.11 0" />
        </filter>
        <filter id="cf-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#3a2510" floodOpacity="0.45" />
        </filter>
        <marker id="cg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a2a18" />
        </marker>
      </defs>

      <rect x="0" y="0" width={MAP_W} height={MAP_H} rx="14" fill="url(#cg-parch)" />

      <g opacity="0.45">
        <BoardIcon name="compass" x={86} y={540} s={54} color="#5e4426" />
        <BoardIcon name="throne" x={700} y={70} s={32} color="#5e4426" />
        <BoardIcon name="oak" x={120} y={400} s={26} color="#6b5436" />
      </g>

      {/* borders (whole group inked; no lone axis-aligned lines get a filter) */}
      <g filter="url(#cf-ink)">
        {EDGES.map(([a, b], k) => (
          <line
            key={k}
            x1={PROVINCES[a].x}
            y1={PROVINCES[a].y}
            x2={PROVINCES[b].x}
            y2={PROVINCES[b].y}
            stroke="#5e4426"
            strokeWidth="2.2"
            opacity="0.6"
          />
        ))}
      </g>

      <rect x="0" y="0" width={MAP_W} height={MAP_H} filter="url(#cf-grain)" pointerEvents="none" />
      <rect x="0" y="0" width={MAP_W} height={MAP_H} filter="url(#cf-blotch)" pointerEvents="none" />

      {/* the shown power's penned orders */}
      {shownOrders.map(({ unit, order }, k) => {
        const a = PROVINCES[unit.prov];
        if (order.type === 'move') {
          const b = PROVINCES[order.to];
          return (
            <line
              key={k}
              x1={a.x}
              y1={a.y}
              x2={b.x - (b.x - a.x) * 0.18}
              y2={b.y - (b.y - a.y) * 0.18}
              stroke={state.powers[unit.power].color}
              strokeWidth="3"
              opacity="0.85"
              markerEnd="url(#cg-arrow)"
            />
          );
        }
        if (order.type === 'support') {
          const t = PROVINCES[order.to == null ? order.prov : order.to];
          return (
            <line
              key={k}
              x1={a.x}
              y1={a.y}
              x2={t.x}
              y2={t.y}
              stroke={state.powers[unit.power].color}
              strokeWidth="2.4"
              strokeDasharray="6 5"
              opacity="0.8"
            />
          );
        }
        return (
          <circle
            key={k}
            cx={a.x}
            cy={a.y}
            r="20"
            fill="none"
            stroke={state.powers[unit.power].color}
            strokeWidth="2.4"
            opacity="0.8"
          />
        );
      })}

      {PROVINCES.map((p) => {
        const hl = highlights[p.id];
        const unit = unitAt[p.id];
        const owner = p.center ? state.centers[p.id] : undefined;
        const isSel = unit && selUnit === unit.id;
        return (
          <g key={p.id} style={{ cursor: hl || unit ? 'pointer' : 'default' }} onClick={() => onProv(p.id)}>
            <circle cx={p.x} cy={p.y} r="24" fill="transparent" />
            {hl && (
              <circle
                cx={p.x}
                cy={p.y}
                r="21"
                fill="none"
                stroke="#3e7d44"
                strokeWidth="2.6"
                strokeDasharray="5 4"
              />
            )}
            {p.center && (
              <circle
                cx={p.x}
                cy={p.y}
                r="16.5"
                fill="none"
                stroke={owner == null ? '#8a6f44' : state.powers[owner].color}
                strokeWidth="2.4"
                strokeDasharray={owner == null ? '3 3' : 'none'}
              />
            )}
            <g filter="url(#cf-shadow)">
              <circle cx={p.x} cy={p.y} r="12" fill="#e3d3a6" stroke="#4a3722" strokeWidth="1.5" />
              {unit ? (
                <>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="10.5"
                    fill={state.powers[unit.power].color}
                    stroke={isSel ? '#f0cf7e' : '#2c2014'}
                    strokeWidth={isSel ? 2.6 : 1.6}
                  />
                  <BoardIcon name="crossedswords" x={p.x} y={p.y} s={13} color="#f4e7c4" />
                </>
              ) : (
                p.center && <BoardIcon name="castle" x={p.x} y={p.y} s={13} color="#6b5436" />
              )}
            </g>
            <text
              x={p.x}
              y={p.y + 27}
              textAnchor="middle"
              fontSize="9.5"
              fill="#4f3b22"
              style={{ fontStyle: 'italic', letterSpacing: 0.3, paintOrder: 'stroke' }}
              stroke="rgba(238,224,186,0.75)"
              strokeWidth="2.5"
            >
              {p.name}
            </text>
          </g>
        );
      })}

      <rect
        x="0"
        y="0"
        width={MAP_W}
        height={MAP_H}
        rx="14"
        fill="url(#cg-vignette)"
        pointerEvents="none"
      />
    </svg>
  );
}

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">THE COUNCIL OF THE FREE PEOPLES</h1>
      <p className="subtitle">Secret orders, open betrayals</p>
      <div className="ring">
        <GIcon
          name="tiedscroll"
          size={84}
          color="#e8c34a"
          style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }}
        />
      </div>
      <p>
        Gondor, Mordor, Rohan and Isengard contend for 12 strongholds across 16 provinces. Each
        season every power secretly orders its hosts to hold, march, or lend support — then all
        orders are unsealed and resolved at once. Supports may be cut, marches bounce, and
        dislodged hosts are scattered to the winds. Claim {VICTORY_CENTERS} strongholds to rule
        Middle-earth.
      </p>
      <div className="lobby-buttons">
        {[2, 3, 4].map((n) => (
          <button key={n} onClick={() => onStart(n)}>
            {n} Powers
          </button>
        ))}
      </div>
      <p className="lobby-note">
        Hot-seat play: each power pens its orders in private behind the handoff screen, then
        passes the device on. The war ends after {MAX_ROUNDS} seasons at the latest.
      </p>
    </div>
  );
}

export default function CouncilGame() {
  const [state, setState] = useState(null);
  const [sel, setSel] = useState(null); // selected unit id
  const [mode, setMode] = useState(null); // null | 'move' | 'support'

  if (!state) {
    return (
      <div className="app">
        <a className="back-link" href="/">
          ⟵ The Hall of Games
        </a>
        <Lobby
          onStart={(n) => {
            setState(newGame(n));
            setSel(null);
            setMode(null);
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
      if (next.orderTurn !== state.orderTurn || next.phase !== state.phase) {
        setSel(null);
        setMode(null);
      }
    }
  };

  const phase = state.phase;
  const power = state.powers[state.orderTurn];
  const myUnits = state.units.filter((u) => u.power === state.orderTurn);
  const myOrders = state.ordersByPower[state.orderTurn] || {};
  const selUnit = myUnits.find((u) => u.id === sel) || null;

  const highlights = {};
  if (phase === 'orders' && mode === 'move' && selUnit) {
    for (const d of NEIGHBORS[selUnit.prov]) highlights[d] = 'move';
  }

  const onProv = (provId) => {
    if (phase !== 'orders') return;
    if (mode === 'move' && selUnit && highlights[provId]) {
      dispatch({ type: 'SET_ORDER', unitId: selUnit.id, order: { type: 'move', to: provId } });
      setMode(null);
      return;
    }
    const u = myUnits.find((x) => x.prov === provId);
    if (u) {
      setSel(u.id);
      setMode(null);
    }
  };

  const shownOrders =
    phase === 'orders'
      ? myUnits.filter((u) => myOrders[u.id]).map((u) => ({ unit: u, order: myOrders[u.id] }))
      : [];

  const supportOpts = selUnit
    ? validOrders(state, COUNCIL_MAP, selUnit.id).filter((o) => o.type === 'support')
    : [];

  const centerCount = (p) => CENTER_IDS.filter((c) => state.centers[c] === p).length;

  const prompt =
    phase === 'orders'
      ? `${power.name}: pen secret orders for each host, then seal them.`
      : phase === 'resolution-review'
        ? `Season ${state.round}: the orders are unsealed.`
        : 'The war is ended.';

  const content = (
    <>
      <h1 className="title" style={{ fontSize: 22 }}>
        THE COUNCIL OF THE FREE PEOPLES
      </h1>
      <div className="layout">
        <div className="board-wrap" style={{ maxWidth: 860, flexBasis: 640 }}>
          <MapBoard
            state={state}
            onProv={onProv}
            highlights={highlights}
            selUnit={sel}
            shownOrders={shownOrders}
          />
        </div>

        <div className="side">
          <div className="panel">
            <div className="prompt">{prompt}</div>

            {phase === 'orders' && (
              <>
                {myUnits.map((u) => (
                  <div key={u.id} className="row" style={{ marginTop: 6 }}>
                    <button
                      className={sel === u.id ? 'active' : ''}
                      onClick={() => {
                        setSel(u.id);
                        setMode(null);
                      }}
                    >
                      <GIcon name="crossedswords" color={power.color} /> {pname(u.prov)}
                    </button>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                      {orderText(myOrders[u.id])}
                    </span>
                  </div>
                ))}

                {selUnit && (
                  <div className="picker">
                    <div style={{ fontSize: 13.5, fontWeight: 'bold' }}>
                      The host of {pname(selUnit.prov)}
                    </div>
                    <div className="row">
                      <button
                        onClick={() => {
                          dispatch({
                            type: 'SET_ORDER',
                            unitId: selUnit.id,
                            order: { type: 'hold' },
                          });
                          setMode(null);
                        }}
                      >
                        <GIcon name="tower" /> Hold
                      </button>
                      <button
                        className={mode === 'move' ? 'active' : ''}
                        onClick={() => setMode(mode === 'move' ? null : 'move')}
                      >
                        <GIcon name="boot" /> March…
                      </button>
                      <button
                        className={mode === 'support' ? 'active' : ''}
                        disabled={supportOpts.length === 0}
                        onClick={() => setMode(mode === 'support' ? null : 'support')}
                      >
                        <GIcon name="flag" /> Support…
                      </button>
                    </div>
                    {mode === 'move' && (
                      <div style={{ fontSize: 12.5, marginTop: 8, color: 'var(--muted)' }}>
                        Click a bordering province on the map.
                      </div>
                    )}
                    {mode === 'support' && (
                      <div className="row">
                        {supportOpts.map((o, i) => {
                          const tu = state.units.find((x) => x.prov === o.prov);
                          return (
                            <button
                              key={i}
                              style={{ fontSize: 11.5, padding: '4px 8px' }}
                              onClick={() => {
                                dispatch({ type: 'SET_ORDER', unitId: selUnit.id, order: o });
                                setMode(null);
                              }}
                            >
                              <GIcon
                                name="meeple"
                                color={state.powers[tu.power].color}
                                size={12}
                              />{' '}
                              {o.to == null ? `${pname(o.prov)} holds` : `${pname(o.prov)} → ${pname(o.to)}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="row">
                  <button onClick={() => dispatch({ type: 'SEAL' })}>
                    <GIcon name="tiedscroll" /> Seal Orders
                  </button>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Unordered hosts hold fast.
                  </span>
                </div>
              </>
            )}

            {phase === 'resolution-review' && (
              <>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    maxHeight: 220,
                    overflowY: 'auto',
                    marginTop: 8,
                  }}
                >
                  {state.lastResolution.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
                <div className="row">
                  <button onClick={() => dispatch({ type: 'CONTINUE' })}>
                    <GIcon name="scroll" /> Next Season
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="panel players">
            <div className="section-title">
              The Powers — Season {state.round} of {MAX_ROUNDS}
            </div>
            {state.powers.map((p, i) => (
              <div
                key={i}
                className={`player ${phase === 'orders' && i === state.orderTurn ? 'current' : ''}`}
              >
                <div className="player-head">
                  <span className="player-name" style={{ color: p.color }}>
                    {phase === 'orders' && i === state.orderTurn ? '▶ ' : ''}
                    {p.name}
                    {p.alive ? '' : ' ☠'}
                  </span>
                  <span className="player-meta">
                    🏰 {centerCount(i)} strongholds · ⚔ {state.units.filter((u) => u.power === i).length} hosts
                  </span>
                </div>
              </div>
            ))}
            <div className="costs">
              First to {VICTORY_CENTERS} of {CENTER_IDS.length} strongholds rules Middle-earth.
              Dislodged hosts are scattered; strongholds muster new hosts each season.
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
                if (phase === 'game-over' || window.confirm('Dissolve this council and start anew?')) {
                  setState(null);
                  setSel(null);
                  setMode(null);
                }
              }}
            >
              ↺ New Council
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="app">
      <a className="back-link" href="/">
        ⟵ The Hall of Games
      </a>
      {phase === 'orders' ? (
        <Handoff player={power.name} color={power.color}>
          {content}
        </Handoff>
      ) : (
        content
      )}

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
              {state.winners.map((w) => state.powers[w].name).join(' and ')}{' '}
              {state.winners.length > 1 ? 'share dominion over' : 'rules'} Middle-earth!
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
              The war ends in season {state.round}.
            </p>
            <button onClick={() => setState(null)}>Play Again</button>
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
      A fan-made hot-seat strategy game inspired by classic games of secret orders and shifting
      alliances, set in the world of J.R.R. Tolkien. Not affiliated with Hasbro or Middle-earth
      Enterprises.
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
