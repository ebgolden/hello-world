'use client';

import { useMemo, useState } from 'react';
import { buildRiskMap, REALMS, COAST, MAP_W, MAP_H } from '@/lib/risk/map';
import {
  newRiskGame,
  reduceRisk,
  territoriesOf,
  reinforcementsFor,
  connectedOwned,
  findSet,
  tradeValue,
  RISK_FACTIONS,
  CARD_INFO,
} from '@/lib/risk/engine';
import { GIcon, BoardIcon } from '@/components/Icon';

const CENTER = [MAP_W / 2, MAP_H / 2];

function seaRoutePath(a, b) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = mx - CENTER[0];
  const dy = my - CENTER[1];
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (dx / len) * 70;
  const cy = my + (dy / len) * 70;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

function Die({ v, dark }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        borderRadius: 5,
        margin: '0 2px',
        fontWeight: 'bold',
        fontSize: 15,
        background: dark ? '#3c2d1c' : '#f2e7c8',
        color: dark ? '#f2e7c8' : '#3c2d1c',
        border: '1px solid #6b5230',
      }}
    >
      {v}
    </span>
  );
}

function MapBoard({ state, map, onTerritory, highlights, sel }) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
      <defs>
        <radialGradient id="rg-parch" cx="50%" cy="42%" r="80%">
          <stop offset="0%" stopColor="#eee0ba" />
          <stop offset="100%" stopColor="#d9c48f" />
        </radialGradient>
        <radialGradient id="rg-vignette" cx="50%" cy="50%" r="72%">
          <stop offset="0%" stopColor="rgba(88,58,20,0)" />
          <stop offset="78%" stopColor="rgba(88,58,20,0.05)" />
          <stop offset="100%" stopColor="rgba(74,46,14,0.4)" />
        </radialGradient>
        <filter id="rf-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" />
        </filter>
        <filter id="rf-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.34 0 0 0 0 0.24 0 0 0 0 0.10 0 0 0 0.07 0" />
        </filter>
        <filter id="rf-blotch">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0 0.10 0 0 0 0.11 0" />
        </filter>
        <filter id="rf-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#3a2510" floodOpacity="0.45" />
        </filter>
        <clipPath id="rf-coast">
          <polygon points={COAST.map((p) => p.join(',')).join(' ')} />
        </clipPath>
      </defs>

      <rect x="0" y="0" width={MAP_W} height={MAP_H} rx="14" fill="url(#rg-parch)" />

      {/* sea flourishes (south-western ocean) */}
      <g opacity="0.5">
        <BoardIcon name="compass" x={92} y={595} s={56} color="#5e4426" />
        <BoardIcon name="wavecrest" x={48} y={470} s={18} color="#6b5436" />
        <BoardIcon name="wavecrest" x={150} y={640} s={14} color="#6b5436" />
        <BoardIcon name="sailboat" x={55} y={360} s={26} color="#5e4426" />
      </g>

      {/* sea routes */}
      {map.extraLinks.map(([i, j], k) => (
        <path
          key={k}
          d={seaRoutePath(map.territories[i], map.territories[j])}
          fill="none"
          stroke="#5e4426"
          strokeWidth="2"
          strokeDasharray="7 6"
          opacity="0.6"
        />
      ))}

      {/* provinces, clipped to the coastline */}
      <g clipPath="url(#rf-coast)">
        {map.territories.map((t) => {
          const pts = t.cell.map((p) => p.join(',')).join(' ');
          const hl = highlights[t.id];
          return (
            <g key={t.id} filter="url(#rf-ink)">
              <polygon
                points={pts}
                fill={REALMS[t.realm].wash}
                fillOpacity={hl === 'dim' ? 0.45 : 0.85}
                stroke="#5a4326"
                strokeWidth="1.6"
                strokeOpacity="0.85"
                style={{ cursor: hl && hl !== 'dim' ? 'pointer' : 'default' }}
                onClick={() => onTerritory(t.id)}
              />
            </g>
          );
        })}
        {/* grain over the washes */}
        <rect x="0" y="0" width={MAP_W} height={MAP_H} filter="url(#rf-grain)" pointerEvents="none" />
        <rect x="0" y="0" width={MAP_W} height={MAP_H} filter="url(#rf-blotch)" pointerEvents="none" />
      </g>

      {/* coastline */}
      <polygon
        points={COAST.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke="#4a3722"
        strokeWidth="2.6"
        filter="url(#rf-ink)"
        pointerEvents="none"
      />

      {/* highlight rings and badges */}
      {map.territories.map((t) => {
        const hl = highlights[t.id];
        const owner = state.players[state.owner[t.id]];
        const ringColor =
          t.id === sel
            ? '#8a5a16'
            : hl === 'attack'
              ? '#9c2a18'
              : hl === 'move'
                ? '#3e7d44'
                : hl === 'own'
                  ? '#8a5a16'
                  : null;
        return (
          <g key={t.id} style={{ cursor: hl && hl !== 'dim' ? 'pointer' : 'default' }} onClick={() => onTerritory(t.id)}>
            {ringColor && (
              <circle
                cx={t.x}
                cy={t.y}
                r="17"
                fill="none"
                stroke={ringColor}
                strokeWidth={t.id === sel ? 3 : 2}
                strokeDasharray={hl === 'attack' || hl === 'move' ? '5 4' : 'none'}
              />
            )}
            <g filter="url(#rf-shadow)">
              <circle cx={t.x} cy={t.y} r="12" fill={owner.color} stroke="#2c2014" strokeWidth="1.6" />
              <text
                x={t.x}
                y={t.y + 4.5}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#f4e7c4"
              >
                {state.armies[t.id]}
              </text>
            </g>
            <text
              x={t.x}
              y={t.y + 24}
              textAnchor="middle"
              fontSize="8"
              fill="#4f3b22"
              style={{ fontStyle: 'italic', letterSpacing: 0.3, paintOrder: 'stroke' }}
              stroke="rgba(238,224,186,0.7)"
              strokeWidth="2.5"
            >
              {t.name}
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
        fill="url(#rg-vignette)"
        pointerEvents="none"
      />
    </svg>
  );
}

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">THE WAR OF THE RING</h1>
      <p className="subtitle">One realm to rule them all</p>
      <div className="ring">
        <GIcon
          name="flag"
          size={84}
          color="#e8c34a"
          style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }}
        />
      </div>
      <p>
        Middle-earth lies divided into 36 territories across 7 realms. Muster armies, hold whole
        realms for greater levies, trade banner cards for reinforcements, and hurl your hosts
        across the borders. Beware the fences of Mordor — its gates are few. The last banner
        flying rules all of Middle-earth.
      </p>
      <div className="lobby-buttons">
        {[2, 3, 4].map((n) => (
          <button key={n} onClick={() => onStart(n)}>
            {n} Banners
          </button>
        ))}
      </div>
      <p className="lobby-note">
        Hot-seat play: pass the device between players. Banners in order:{' '}
        {RISK_FACTIONS.map((f) => f.name).join(', ')}.
      </p>
    </div>
  );
}

export default function RiskGame() {
  const map = useMemo(() => buildRiskMap(), []);
  const [state, setState] = useState(null);
  const [sel, setSel] = useState(null);
  const [fortTo, setFortTo] = useState(null);
  const [moveN, setMoveN] = useState(1);
  const [placeAmt, setPlaceAmt] = useState(1);

  if (!state) {
    return (
      <div className="app">
        <a className="back-link" href="/">
          ⟵ The Hall of Games
        </a>
        <Lobby
          onStart={(n) => {
            setState(newRiskGame(map, n));
            setSel(null);
            setFortTo(null);
          }}
        />
        <Footer />
      </div>
    );
  }

  const dispatch = (action) => {
    const next = reduceRisk(state, map, action);
    if (next !== state) {
      setState(next);
      if (next.phase !== state.phase || next.current !== state.current) {
        setSel(null);
        setFortTo(null);
        if (next.pendingOccupy) {
          setMoveN(next.armies[next.pendingOccupy.from] - 1);
        }
      }
    }
  };

  const me = state.players[state.current];
  const phase = state.phase;
  const myCards = me.cards;
  const set = findSet(myCards);

  // Per-territory highlight: 'own' (clickable), 'attack', 'move', 'dim', or null.
  const highlights = {};
  if (phase === 'muster' && state.toPlace > 0) {
    for (const t of territoriesOf(state, state.current)) highlights[t] = 'own';
  } else if (phase === 'attack' && !state.battle) {
    for (const t of territoriesOf(state, state.current)) {
      if (state.armies[t] >= 2 && map.neighbors[t].some((n) => state.owner[n] !== state.current))
        highlights[t] = 'own';
    }
    if (sel !== null) {
      for (const n of map.neighbors[sel]) {
        if (state.owner[n] !== state.current) highlights[n] = 'attack';
      }
    }
  } else if (phase === 'fortify' && fortTo === null) {
    for (const t of territoriesOf(state, state.current)) {
      if (state.armies[t] >= 2) highlights[t] = 'own';
    }
    if (sel !== null) {
      for (const n of connectedOwned(state, map, sel)) highlights[n] = 'move';
    }
  }

  const onTerritory = (tid) => {
    if (phase === 'muster') {
      if (state.owner[tid] === state.current && state.toPlace > 0) {
        const n = placeAmt === 'all' ? state.toPlace : placeAmt;
        dispatch({ type: 'PLACE', tid, n });
      }
    } else if (phase === 'attack' && !state.battle) {
      if (state.owner[tid] === state.current) {
        setSel(state.armies[tid] >= 2 ? tid : null);
      } else if (sel !== null && map.neighbors[sel].includes(tid)) {
        dispatch({ type: 'BATTLE', from: sel, to: tid });
      }
    } else if (phase === 'fortify') {
      if (state.owner[tid] !== state.current) return;
      if (sel === null || state.armies[tid] >= 2) {
        if (sel !== null && sel !== tid && connectedOwned(state, map, sel).includes(tid)) {
          setFortTo(tid);
          setMoveN(state.armies[sel] - 1);
        } else {
          setSel(state.armies[tid] >= 2 ? tid : sel);
          setFortTo(null);
        }
      } else if (sel !== null && connectedOwned(state, map, sel).includes(tid)) {
        setFortTo(tid);
        setMoveN(state.armies[sel] - 1);
      }
    }
  };

  const prompt =
    phase === 'muster'
      ? state.toPlace > 0
        ? `${me.name}: place ${state.toPlace} armies on your territories.`
        : `${me.name}: the muster is complete.`
      : phase === 'attack'
        ? state.battle
          ? `Battle for ${map.territories[state.battle.to].name}!`
          : `${me.name}: choose an army, then an enemy border to assault.`
        : phase === 'occupy'
          ? `${me.name}: march armies into ${map.territories[state.pendingOccupy.to].name}.`
          : phase === 'fortify'
            ? fortTo !== null
              ? `${me.name}: how many armies march?`
              : `${me.name}: one free march between your lands, or end your turn.`
            : '';

  const occ = state.pendingOccupy;
  const battle = state.battle;

  return (
    <div className="app">
      <a className="back-link" href="/">
        ⟵ The Hall of Games
      </a>
      <h1 className="title" style={{ fontSize: 22 }}>
        THE WAR OF THE RING
      </h1>
      <div className="layout">
        <div className="board-wrap" style={{ maxWidth: 860, flexBasis: 640 }}>
          <MapBoard state={state} map={map} onTerritory={onTerritory} highlights={highlights} sel={sel} />
        </div>

        <div className="side">
          <div className="panel">
            <div className="prompt">{prompt}</div>

            {phase === 'muster' && (
              <>
                <div className="row">
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>Place per click:</span>
                  {[1, 5, 'all'].map((a) => (
                    <button
                      key={a}
                      className={placeAmt === a ? 'active' : ''}
                      onClick={() => setPlaceAmt(a)}
                    >
                      {a === 'all' ? 'All' : a}
                    </button>
                  ))}
                </div>
                <div className="row">
                  <button disabled={!set} onClick={() => dispatch({ type: 'TRADE' })}>
                    <GIcon name="scroll" /> Trade banners (+{tradeValue(state.setsTraded)})
                  </button>
                  <button disabled={state.toPlace > 0} onClick={() => dispatch({ type: 'BEGIN_ATTACK' })}>
                    <GIcon name="sword" /> March to War
                  </button>
                </div>
              </>
            )}

            {phase === 'attack' && battle && (
              <div className="picker">
                <div style={{ fontSize: 14 }}>
                  <b>{map.territories[battle.from].name}</b> ({state.armies[battle.from]}) assaults{' '}
                  <b>{map.territories[battle.to].name}</b> ({state.armies[battle.to]})
                </div>
                {battle.roll && (
                  <div className="row" style={{ alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Attack:</span>
                    {battle.roll.a.map((v, i) => (
                      <Die key={i} v={v} />
                    ))}
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Defense:</span>
                    {battle.roll.d.map((v, i) => (
                      <Die key={i} v={v} dark />
                    ))}
                    <span style={{ fontSize: 12 }}>
                      ⚔ −{battle.roll.lossA} / 🛡 −{battle.roll.lossD}
                    </span>
                  </div>
                )}
                <div className="row">
                  <button
                    disabled={state.armies[battle.from] < 2}
                    onClick={() => dispatch({ type: 'BATTLE', from: battle.from, to: battle.to })}
                  >
                    Roll
                  </button>
                  <button
                    disabled={state.armies[battle.from] < 2}
                    onClick={() =>
                      dispatch({ type: 'BATTLE', from: battle.from, to: battle.to, blitz: true })
                    }
                  >
                    Blitz
                  </button>
                  <button onClick={() => dispatch({ type: 'RETREAT' })}>Retreat</button>
                </div>
              </div>
            )}

            {phase === 'attack' && !battle && (
              <div className="row">
                <button onClick={() => dispatch({ type: 'END_ATTACK' })}>
                  <GIcon name="flag" /> End attacks
                </button>
              </div>
            )}

            {phase === 'occupy' && occ && (
              <div className="picker">
                <div className="row" style={{ marginTop: 0 }}>
                  <button onClick={() => setMoveN(Math.max(occ.min, moveN - 1))}>−</button>
                  <span style={{ fontSize: 16, minWidth: 30, textAlign: 'center' }}>{moveN}</span>
                  <button onClick={() => setMoveN(Math.min(state.armies[occ.from] - 1, moveN + 1))}>
                    +
                  </button>
                  <button onClick={() => setMoveN(state.armies[occ.from] - 1)}>Max</button>
                  <button onClick={() => dispatch({ type: 'OCCUPY', n: moveN })}>
                    <GIcon name="flag" /> Occupy
                  </button>
                </div>
              </div>
            )}

            {phase === 'fortify' && (
              <>
                {fortTo !== null && sel !== null && (
                  <div className="picker">
                    <div style={{ fontSize: 14 }}>
                      {map.territories[sel].name} → {map.territories[fortTo].name}
                    </div>
                    <div className="row">
                      <button onClick={() => setMoveN(Math.max(1, moveN - 1))}>−</button>
                      <span style={{ fontSize: 16, minWidth: 30, textAlign: 'center' }}>{moveN}</span>
                      <button onClick={() => setMoveN(Math.min(state.armies[sel] - 1, moveN + 1))}>
                        +
                      </button>
                      <button onClick={() => setMoveN(state.armies[sel] - 1)}>Max</button>
                      <button
                        onClick={() => dispatch({ type: 'FORTIFY', from: sel, to: fortTo, n: moveN })}
                      >
                        March
                      </button>
                      <button onClick={() => setFortTo(null)}>Cancel</button>
                    </div>
                  </div>
                )}
                <div className="row">
                  <button onClick={() => dispatch({ type: 'END_TURN' })}>End Turn</button>
                </div>
              </>
            )}

            {myCards.length > 0 && (
              <div className="row" style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>Banners:</span>
                {myCards.map((c, i) => (
                  <span key={i} title={CARD_INFO[c.kind].name}>
                    <GIcon name={CARD_INFO[c.kind].icon} color="var(--gold)" />
                    {c.tid !== null && state.owner[c.tid] === state.current ? '•' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="panel players">
            <div className="section-title">Banners of the War</div>
            {state.players.map((p) => {
              const terr = territoriesOf(state, p.id);
              const total = terr.reduce((s, t) => s + state.armies[t], 0);
              return (
                <div key={p.id} className={`player ${p.id === state.current ? 'current' : ''}`}>
                  <div className="player-head">
                    <span className="player-name" style={{ color: p.color }}>
                      {p.id === state.current ? '▶ ' : ''}
                      {p.name}
                      {p.eliminated ? ' ☠' : ''}
                    </span>
                    <span className="player-meta">
                      🏳 {terr.length} lands · ⚔ {total} armies · 🃏 {p.cards.length}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="costs">
              {Object.entries(REALMS).map(([k, r]) => (
                <span key={k} style={{ whiteSpace: 'nowrap', marginRight: 10 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: r.wash,
                      border: '1px solid #8a6f44',
                      marginRight: 3,
                    }}
                  />
                  {r.name} +{r.bonus}
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
                if (state.winner !== null || window.confirm('Abandon this war and start anew?')) {
                  setState(null);
                  setSel(null);
                  setFortTo(null);
                }
              }}
            >
              ↺ New War
            </button>
          </div>
        </div>
      </div>

      {state.winner !== null && (
        <div className="winner-overlay">
          <div className="winner-box">
            <GIcon
              name="crown"
              size={64}
              color="#a8821e"
              style={{ filter: 'drop-shadow(0 0 14px rgba(168,130,30,0.7))' }}
            />
            <h2>{state.players[state.winner].name} rules all of Middle-earth!</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
              Victory on turn {state.turn}
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
      A fan-made hot-seat strategy game inspired by classic world-conquest board games and the
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
