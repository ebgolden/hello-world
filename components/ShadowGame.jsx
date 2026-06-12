'use client';

import { useState } from 'react';
import { LOCATIONS, NEIGHBORS, LINKS, FRONTS, HAVENS, MAP_W, MAP_H } from '@/lib/shadow/map';
import {
  newGame,
  reduce,
  RATES,
  HAND_LIMIT,
  MAX_OUTBREAKS,
  ROLES,
  banishCost,
} from '@/lib/shadow/engine';
import { GIcon, BoardIcon } from '@/components/Icon';

function roleInfo(key) {
  return ROLES.find((r) => r.key === key);
}

function CardChip({ card, onClick, title }) {
  const f = FRONTS[LOCATIONS[card].front];
  const inner = (
    <>
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: 2,
          background: f.color,
          marginRight: 5,
          border: '1px solid rgba(44,32,20,0.5)',
        }}
      />
      {LOCATIONS[card].name}
    </>
  );
  if (onClick) {
    return (
      <button onClick={onClick} title={title} style={{ padding: '3px 8px', fontSize: 11.5 }}>
        {inner}
      </button>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${f.color}`,
        borderRadius: 5,
        padding: '1px 6px',
        fontSize: 11.5,
        background: 'rgba(255,246,220,0.55)',
        whiteSpace: 'nowrap',
      }}
    >
      {inner}
    </span>
  );
}

function MapBoard({ state, onLoc, highlights }) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
      <defs>
        <radialGradient id="sg-parch" cx="50%" cy="42%" r="80%">
          <stop offset="0%" stopColor="#eee0ba" />
          <stop offset="100%" stopColor="#d9c48f" />
        </radialGradient>
        <radialGradient id="sg-vignette" cx="50%" cy="50%" r="72%">
          <stop offset="0%" stopColor="rgba(88,58,20,0)" />
          <stop offset="78%" stopColor="rgba(88,58,20,0.05)" />
          <stop offset="100%" stopColor="rgba(74,46,14,0.4)" />
        </radialGradient>
        <filter id="sf-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" />
        </filter>
        <filter id="sf-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.34 0 0 0 0 0.24 0 0 0 0 0.10 0 0 0 0.07 0" />
        </filter>
        <filter id="sf-blotch">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0 0.10 0 0 0 0.11 0" />
        </filter>
        <filter id="sf-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#3a2510" floodOpacity="0.45" />
        </filter>
      </defs>

      <rect x="0" y="0" width={MAP_W} height={MAP_H} rx="14" fill="url(#sg-parch)" />

      {/* margin flourishes */}
      <g opacity="0.45">
        <BoardIcon name="compass" x={78} y={560} s={54} color="#5e4426" />
        <BoardIcon name="eye" x={712} y={48} s={30} color="#6e3520" />
        <BoardIcon name="mountaintop" x={120} y={420} s={26} color="#6b5436" />
        <BoardIcon name="pine" x={170} y={600} s={24} color="#6b5436" />
      </g>

      {/* roads (the whole group gets the ink wobble, never a single flat line) */}
      <g filter="url(#sf-ink)">
        {LINKS.map(([a, b], k) => (
          <line
            key={k}
            x1={LOCATIONS[a].x}
            y1={LOCATIONS[a].y}
            x2={LOCATIONS[b].x}
            y2={LOCATIONS[b].y}
            stroke="#5e4426"
            strokeWidth="2.2"
            opacity="0.65"
          />
        ))}
      </g>

      {/* grain + blotch overlays */}
      <rect x="0" y="0" width={MAP_W} height={MAP_H} filter="url(#sf-grain)" pointerEvents="none" />
      <rect x="0" y="0" width={MAP_W} height={MAP_H} filter="url(#sf-blotch)" pointerEvents="none" />

      {LOCATIONS.map((l) => {
        const hl = highlights[l.id];
        const isHaven = HAVENS.includes(l.id);
        const cubeFronts = [0, 1, 2, 3].filter((f) => state.cubes[l.id][f] > 0);
        const heroesHere = state.heroes.filter((h) => h.loc === l.id);
        return (
          <g
            key={l.id}
            style={{ cursor: hl ? 'pointer' : 'default' }}
            onClick={() => onLoc(l.id)}
          >
            <circle cx={l.x} cy={l.y} r="22" fill="transparent" />
            {hl && (
              <circle
                cx={l.x}
                cy={l.y}
                r="19"
                fill="none"
                stroke={hl === 'fly' ? '#8a5a16' : '#3e7d44'}
                strokeWidth="2.4"
                strokeDasharray="5 4"
              />
            )}
            {isHaven && (
              <circle cx={l.x} cy={l.y} r="16.5" fill="none" stroke="#a8821e" strokeWidth="2.2" />
            )}
            <g filter="url(#sf-shadow)">
              <circle
                cx={l.x}
                cy={l.y}
                r="12"
                fill={FRONTS[l.front].color}
                fillOpacity={state.banished[l.front] ? 0.55 : 0.95}
                stroke="#2c2014"
                strokeWidth="1.6"
              />
              {isHaven && <BoardIcon name="castle" x={l.x} y={l.y} s={14} color="#f4e7c4" />}
            </g>
            {/* hero pawns */}
            {heroesHere.map((h, i) => (
              <BoardIcon
                key={h.id}
                name="meeple"
                x={l.x + (i - (heroesHere.length - 1) / 2) * 15}
                y={l.y - 21}
                s={19}
                color={h.color}
                stroke="#1d1410"
                strokeWidth={26}
              />
            ))}
            <text
              x={l.x}
              y={l.y + 24}
              textAnchor="middle"
              fontSize="9"
              fill="#4f3b22"
              style={{ fontStyle: 'italic', letterSpacing: 0.3, paintOrder: 'stroke' }}
              stroke="rgba(238,224,186,0.75)"
              strokeWidth="2.5"
            >
              {l.name}
            </text>
            {/* corruption cubes, one row per front */}
            {cubeFronts.map((f, row) => {
              const n = state.cubes[l.id][f];
              return (
                <g key={f}>
                  {Array.from({ length: n }, (_, i) => (
                    <rect
                      key={i}
                      x={l.x + (i - (n - 1) / 2) * 9 - 3.5}
                      y={l.y + 28 + row * 9}
                      width="7"
                      height="7"
                      rx="1.2"
                      fill={FRONTS[f].color}
                      stroke="#2c2014"
                      strokeWidth="0.9"
                    />
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}

      <rect
        x="0"
        y="0"
        width={MAP_W}
        height={MAP_H}
        rx="14"
        fill="url(#sg-vignette)"
        pointerEvents="none"
      />
    </svg>
  );
}

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">THE SHADOW SPREADS</h1>
      <p className="subtitle">Four shadows, one fading light</p>
      <div className="ring">
        <GIcon
          name="eye"
          size={84}
          color="#e8c34a"
          style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }}
        />
      </div>
      <p>
        Four Shadow fronts — Mordor, Isengard, Dol Guldur and Angmar — seep corruption across 24
        lands of Middle-earth. Stand together: ride the roads, call the Eagles, cleanse the
        taint, and gather scrolls of lore to banish each Shadow at its Haven before an eighth
        outbreak, an empty reserve, or the last scroll spells defeat. All hands win or fall as
        one.
      </p>
      <div className="lobby-buttons">
        {[1, 2, 3, 4].map((n) => (
          <button key={n} onClick={() => onStart(n)}>
            {n} {n === 1 ? 'Hero' : 'Heroes'}
          </button>
        ))}
      </div>
      <p className="lobby-note">
        Fully cooperative — one device, open hands, shared counsel. Each hero is dealt a secret
        gift: Ranger, Healer, Grey Pilgrim or Lorekeeper.
      </p>
    </div>
  );
}

export default function ShadowGame() {
  const [state, setState] = useState(null);
  const [mode, setMode] = useState(null); // null | 'ride' | 'eagles' | 'counsel'

  if (!state) {
    return (
      <div className="app">
        <a className="back-link" href="/">
          ⟵ The Hall of Games
        </a>
        <Lobby
          onStart={(n) => {
            setState(newGame(n));
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
      if (next.current !== state.current || next.phase !== state.phase) setMode(null);
    }
  };

  const hero = state.heroes[state.current];
  const role = roleInfo(hero.role);
  const phase = state.phase;

  const highlights = {};
  if (phase === 'actions') {
    if (mode === 'eagles') {
      for (const l of LOCATIONS) if (l.id !== hero.loc) highlights[l.id] = 'fly';
    } else {
      for (const nb of NEIGHBORS[hero.loc]) highlights[nb] = 'move';
    }
  }

  const onLoc = (id) => {
    if (phase !== 'actions') return;
    if (mode === 'eagles') {
      const card = hero.hand.findIndex((c) => c === hero.loc);
      if (card >= 0 && id !== hero.loc) dispatch({ type: 'EAGLES', card, to: id });
      setMode(null);
    } else if (NEIGHBORS[hero.loc].includes(id)) {
      dispatch({ type: 'MOVE', to: id });
    }
  };

  const here = LOCATIONS[hero.loc];
  const companions = state.heroes.filter((h) => h.id !== hero.id && h.loc === hero.loc);
  const canCounsel =
    companions.length > 0 &&
    (hero.role === 'lorekeeper' ||
      hero.hand.includes(hero.loc) ||
      companions.some((c) => c.hand.includes(hero.loc)));
  const hasEagleCard = hero.hand.includes(hero.loc);
  const ridable = hero.hand.map((c, i) => [c, i]).filter(([c]) => c !== hero.loc);

  const prompt =
    phase === 'discard'
      ? `${state.heroes[state.discardHero].name} carries too much: set scrolls down to ${HAND_LIMIT}.`
      : phase === 'actions'
        ? `${hero.name} at ${here.name} — ${state.actionsLeft} action${state.actionsLeft === 1 ? '' : 's'} left.`
        : 'The tale is told.';

  return (
    <div className="app">
      <a className="back-link" href="/">
        ⟵ The Hall of Games
      </a>
      <h1 className="title" style={{ fontSize: 22 }}>
        THE SHADOW SPREADS
      </h1>
      <div className="layout">
        <div className="board-wrap" style={{ maxWidth: 860, flexBasis: 640 }}>
          <MapBoard state={state} onLoc={onLoc} highlights={highlights} />
        </div>

        <div className="side">
          <div className="panel">
            <div className="prompt">{prompt}</div>

            {phase === 'actions' && (
              <>
                <div className="row" style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                  Walk: click a road-linked location.{' '}
                  {role && (
                    <span>
                      <GIcon name={role.icon} color="var(--gold)" /> {role.desc}
                    </span>
                  )}
                </div>
                <div className="row">
                  <button
                    className={mode === 'ride' ? 'active' : ''}
                    disabled={ridable.length === 0}
                    onClick={() => setMode(mode === 'ride' ? null : 'ride')}
                  >
                    <GIcon name="horse" /> Ride
                  </button>
                  <button
                    className={mode === 'eagles' ? 'active' : ''}
                    disabled={!hasEagleCard}
                    onClick={() => setMode(mode === 'eagles' ? null : 'eagles')}
                  >
                    <GIcon name="eagle" /> Eagles
                  </button>
                  <button
                    className={mode === 'counsel' ? 'active' : ''}
                    disabled={!canCounsel}
                    onClick={() => setMode(mode === 'counsel' ? null : 'counsel')}
                  >
                    <GIcon name="scroll" /> Counsel
                  </button>
                  <button onClick={() => dispatch({ type: 'PASS' })}>
                    <GIcon name="campfire" /> Rest
                  </button>
                </div>

                <div className="row">
                  {[0, 1, 2, 3]
                    .filter((f) => state.cubes[hero.loc][f] > 0)
                    .map((f) => (
                      <button key={f} onClick={() => dispatch({ type: 'CLEANSE', front: f })}>
                        <GIcon name="crystal" color={FRONTS[f].color} /> Cleanse {FRONTS[f].name} (
                        {state.banished[f] || hero.role === 'healer'
                          ? 'all'
                          : state.cubes[hero.loc][f]}
                        )
                      </button>
                    ))}
                  {[0, 1, 2, 3]
                    .filter((f) => HAVENS[f] === hero.loc && !state.banished[f])
                    .map((f) => {
                      const have = hero.hand.filter((c) => LOCATIONS[c].front === f).length;
                      const cost = banishCost(hero.role);
                      return (
                        <button
                          key={f}
                          disabled={have < cost}
                          onClick={() => dispatch({ type: 'BANISH', front: f })}
                        >
                          <GIcon name="magicgate" color={FRONTS[f].color} /> Banish {FRONTS[f].name}{' '}
                          ({have}/{cost})
                        </button>
                      );
                    })}
                </div>

                {mode === 'ride' && (
                  <div className="picker">
                    <div style={{ fontSize: 13, marginBottom: 6 }}>
                      Discard a scroll to ride to that land:
                    </div>
                    <div className="row" style={{ marginTop: 0 }}>
                      {ridable.map(([c, i]) => (
                        <CardChip key={i} card={c} onClick={() => dispatch({ type: 'RIDE', card: i })} />
                      ))}
                      <button onClick={() => setMode(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {mode === 'eagles' && (
                  <div className="picker">
                    <div style={{ fontSize: 13 }}>
                      The Eagles answer the {here.name} scroll — click any location to fly there.
                    </div>
                    <div className="row">
                      <button onClick={() => setMode(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {mode === 'counsel' && (
                  <div className="picker">
                    <div style={{ fontSize: 13, marginBottom: 6 }}>
                      Trade counsel with a companion standing here
                      {hero.role === 'lorekeeper' ? ' (any scroll)' : ` (the ${here.name} scroll)`}:
                    </div>
                    {companions.map((o) => (
                      <div key={o.id} className="row" style={{ marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: o.color, fontWeight: 'bold' }}>
                          {o.name}:
                        </span>
                        {hero.hand
                          .map((c, i) => [c, i])
                          .filter(([c]) => hero.role === 'lorekeeper' || c === hero.loc)
                          .map(([c, i]) => (
                            <CardChip
                              key={`g${i}`}
                              card={c}
                              title="Give this scroll"
                              onClick={() =>
                                dispatch({ type: 'COUNSEL', dir: 'give', other: o.id, card: i })
                              }
                            />
                          ))}
                        {o.hand
                          .map((c, i) => [c, i])
                          .filter(([c]) => hero.role === 'lorekeeper' || c === hero.loc)
                          .map(([c, i]) => (
                            <span key={`t${i}`} style={{ fontSize: 11 }}>
                              take{' '}
                              <CardChip
                                card={c}
                                title="Take this scroll"
                                onClick={() =>
                                  dispatch({ type: 'COUNSEL', dir: 'take', other: o.id, card: i })
                                }
                              />
                            </span>
                          ))}
                      </div>
                    ))}
                    <div className="row">
                      <button onClick={() => setMode(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {phase === 'discard' && (
              <div className="picker">
                <div className="row" style={{ marginTop: 0 }}>
                  {state.heroes[state.discardHero].hand.map((c, i) => (
                    <CardChip key={i} card={c} onClick={() => dispatch({ type: 'DISCARD', card: i })} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="panel players">
            <div className="section-title">The Fellowship</div>
            {state.heroes.map((h) => {
              const r = roleInfo(h.role);
              return (
                <div
                  key={h.id}
                  className={`player ${h.id === state.current && phase !== 'game-over' ? 'current' : ''}`}
                >
                  <div className="player-head">
                    <span className="player-name" style={{ color: h.color }}>
                      {h.id === state.current ? '▶ ' : ''}
                      <GIcon name={r.icon} color={h.color} /> {h.name}
                    </span>
                    <span className="player-meta">at {LOCATIONS[h.loc].name}</span>
                  </div>
                  <div className="row" style={{ marginTop: 5 }}>
                    {h.hand.length === 0 ? (
                      <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>no scrolls</span>
                    ) : (
                      h.hand.map((c, i) => <CardChip key={i} card={c} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="panel">
            <div className="section-title">The Darkening of Middle-earth</div>
            <div className="row" style={{ marginTop: 2, fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Outbreaks:</span>
              {Array.from({ length: MAX_OUTBREAKS }, (_, i) => (
                <GIcon
                  key={i}
                  name="skullbones"
                  color={i < state.outbreaks ? '#9c2a18' : 'rgba(58,42,24,0.25)'}
                />
              ))}
            </div>
            <div className="row" style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Corruption rate:</span>
              {RATES.map((r, i) => (
                <span
                  key={i}
                  style={{
                    fontWeight: i === state.rateIdx ? 'bold' : 'normal',
                    color: i === state.rateIdx ? '#6b3d10' : 'var(--muted)',
                    textDecoration: i === state.rateIdx ? 'underline' : 'none',
                  }}
                >
                  {r}
                </span>
              ))}
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                · hero deck {state.heroDeck.length}
              </span>
            </div>
            <div className="costs">
              {FRONTS.map((f, i) => (
                <span key={f.key} style={{ whiteSpace: 'nowrap', marginRight: 10 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: f.color,
                      border: '1px solid #8a6f44',
                      marginRight: 3,
                    }}
                  />
                  {f.name}{' '}
                  {state.banished[i] ? (
                    <b style={{ color: '#6b3d10' }}>
                      <GIcon name="magicgate" color="#a8821e" /> banished
                    </b>
                  ) : (
                    <>reserve {state.reserves[i]} · haven {f.haven}</>
                  )}
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
                if (state.phase === 'game-over' || window.confirm('Abandon this quest and begin anew?')) {
                  setState(null);
                  setMode(null);
                }
              }}
            >
              ↺ New Quest
            </button>
          </div>
        </div>
      </div>

      {phase === 'game-over' && state.winner === 'win' && (
        <div className="winner-overlay">
          <div className="winner-box">
            <GIcon
              name="ring"
              size={64}
              color="#a8821e"
              style={{ filter: 'drop-shadow(0 0 14px rgba(168,130,30,0.7))' }}
            />
            <h2>The four Shadows are banished!</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
              Light returns to Middle-earth. The Fellowship prevails on turn {state.turn}.
            </p>
            <button onClick={() => setState(null)}>Play Again</button>
          </div>
        </div>
      )}
      {phase === 'game-over' && state.winner === 'lose' && (
        <div className="winner-overlay">
          <div className="winner-box">
            <GIcon
              name="eye"
              size={64}
              color="#9c2a18"
              style={{ filter: 'drop-shadow(0 0 14px rgba(156,42,24,0.7))' }}
            />
            <h2>Darkness covers Middle-earth</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
              {state.loseReason === 'outbreaks'
                ? 'An eighth shadow-tide broke the last defenses.'
                : state.loseReason === 'reserve'
                  ? 'One Shadow grew beyond all counting and overran the land.'
                  : 'The well of counsel ran dry, and no more aid would come.'}{' '}
              The quest ends on turn {state.turn}.
            </p>
            <button onClick={() => setState(null)}>Try Again</button>
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
      A fan-made hot-seat strategy game inspired by classic cooperative outbreak-containment board
      games and the world of J.R.R. Tolkien. Not affiliated with Hasbro or Middle-earth
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
