'use client';

import { useState } from 'react';
import { PLACES, MAP_W, MAP_H, ROUTE_COLORS } from '@/lib/journeys/map';
import { newGame, reduce, paymentOptions, POINTS, FACTIONS, CARD_COLORS } from '@/lib/journeys/engine';
import { GIcon, BoardIcon } from '@/components/Icon';
import Handoff from '@/components/Handoff';

const CARD_BG = {
  red: ROUTE_COLORS.red,
  green: ROUTE_COLORS.green,
  blue: ROUTE_COLORS.blue,
  gold: ROUTE_COLORS.gold,
  eagle: '#54452e',
};

const COLOR_LABEL = { red: 'red', green: 'green', blue: 'blue', gold: 'gold' };

function handSize(hand) {
  return hand.red + hand.green + hand.blue + hand.gold + hand.eagle;
}

function RouteShape({ route, state, onRoute, selected, clickable }) {
  const a = PLACES[route.a];
  const b = PLACES[route.b];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  const ux = dx / d;
  const uy = dy / d;
  const pad = 18;
  const slot = (d - pad * 2) / route.len;
  const w = Math.max(10, Math.min(slot - 5, 30));
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const owner = route.owner !== null ? state.players[route.owner] : null;
  const fill = owner ? owner.color : ROUTE_COLORS[route.color];
  const rects = [];
  for (let i = 0; i < route.len; i++) {
    const cx = a.x + ux * (pad + slot * (i + 0.5));
    const cy = a.y + uy * (pad + slot * (i + 0.5));
    rects.push(
      <rect
        key={i}
        x={cx - w / 2}
        y={cy - 4.5}
        width={w}
        height={9}
        rx={3}
        transform={`rotate(${angle} ${cx} ${cy})`}
        fill={fill}
        fillOpacity={owner ? 0.95 : 0.8}
        stroke={selected ? '#8a5a16' : '#3a2a18'}
        strokeWidth={selected ? 2.6 : 1.2}
        strokeOpacity={0.9}
      />
    );
  }
  return (
    <g
      style={{ cursor: clickable ? 'pointer' : 'default' }}
      onClick={clickable ? () => onRoute(route.id) : undefined}
    >
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(0,0,0,0)" strokeWidth={16} />
      <g filter="url(#jy-ink)">{rects}</g>
    </g>
  );
}

function MapBoard({ state, onRoute, selRoute, claimAllowed }) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
      <defs>
        <radialGradient id="jy-parch" cx="50%" cy="42%" r="80%">
          <stop offset="0%" stopColor="#eee0ba" />
          <stop offset="100%" stopColor="#d9c48f" />
        </radialGradient>
        <radialGradient id="jy-vignette" cx="50%" cy="50%" r="72%">
          <stop offset="0%" stopColor="rgba(88,58,20,0)" />
          <stop offset="78%" stopColor="rgba(88,58,20,0.05)" />
          <stop offset="100%" stopColor="rgba(74,46,14,0.4)" />
        </radialGradient>
        <filter id="jy-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" />
        </filter>
        <filter id="jy-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.34 0 0 0 0 0.24 0 0 0 0 0.10 0 0 0 0.07 0" />
        </filter>
        <filter id="jy-blotch">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0 0.10 0 0 0 0.11 0" />
        </filter>
      </defs>

      <rect x="0" y="0" width={MAP_W} height={MAP_H} rx="14" fill="url(#jy-parch)" />

      {/* margin flourishes */}
      <g opacity="0.45" pointerEvents="none">
        <BoardIcon name="compass" x={70} y={555} s={60} color="#5e4426" />
        <BoardIcon name="sailboat" x={50} y={235} s={26} color="#5e4426" />
        <BoardIcon name="wavecrest" x={95} y={330} s={18} color="#6b5436" />
        <BoardIcon name="wavecrest" x={45} y={430} s={15} color="#6b5436" />
        <BoardIcon name="mountaintop" x={520} y={185} s={30} color="#6b5436" />
        <BoardIcon name="mountaintop" x={880} y={300} s={26} color="#6b5436" />
        <BoardIcon name="eye" x={905} y={420} s={26} color="#7a3a22" />
        <BoardIcon name="pine" x={745} y={195} s={24} color="#5e6b3a" />
        <BoardIcon name="pine" x={310} y={555} s={20} color="#5e6b3a" />
      </g>

      {/* roads */}
      {state.routes.map((r) => (
        <RouteShape
          key={r.id}
          route={r}
          state={state}
          onRoute={onRoute}
          selected={selRoute === r.id}
          clickable={claimAllowed && r.owner === null}
        />
      ))}

      <rect x="0" y="0" width={MAP_W} height={MAP_H} filter="url(#jy-grain)" pointerEvents="none" />
      <rect x="0" y="0" width={MAP_W} height={MAP_H} filter="url(#jy-blotch)" pointerEvents="none" />

      {/* places */}
      {PLACES.map((p) => (
        <g key={p.id} pointerEvents="none">
          <circle
            cx={p.x}
            cy={p.y}
            r={6}
            fill="#efe3c0"
            stroke="#4a3722"
            strokeWidth={2.2}
            filter="url(#jy-ink)"
          />
          <text
            x={p.x}
            y={p.y - 11}
            textAnchor="middle"
            fontSize="10.5"
            fill="#4f3b22"
            style={{ fontStyle: 'italic', letterSpacing: 0.3, paintOrder: 'stroke' }}
            stroke="rgba(238,224,186,0.75)"
            strokeWidth="3"
          >
            {p.name}
          </text>
        </g>
      ))}

      <rect
        x="0"
        y="0"
        width={MAP_W}
        height={MAP_H}
        rx="14"
        fill="url(#jy-vignette)"
        pointerEvents="none"
      />
    </svg>
  );
}

function MiniCard({ card, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={card === 'eagle' ? 'Great Eagle (wild)' : `${COLOR_LABEL[card]} pony`}
      style={{
        width: 44,
        height: 60,
        borderRadius: 8,
        background: `linear-gradient(165deg, ${CARD_BG[card]}, ${CARD_BG[card]}cc)`,
        border: '2px solid #3a2a18',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <GIcon name={card === 'eagle' ? 'eagle' : 'horse'} size={26} color="#f2e7c8" />
    </button>
  );
}

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">THERE AND BACK AGAIN</h1>
      <p className="subtitle">A pony-post across Middle-earth</p>
      <div className="ring">
        <GIcon
          name="boot"
          size={84}
          color="#e8c34a"
          style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }}
        />
      </div>
      <p>
        Twenty waystations dot the map from the Grey Havens to the gates of Mordor. Gather pony
        cards at the market, spend matched colours (Great Eagles stand for any) to claim the roads
        between places, and quietly complete the secret journeys sworn at your table. When any
        company's stable runs nearly empty, the last leg begins — longest unbroken trail earns the
        teller's bonus.
      </p>
      <div className="lobby-buttons">
        {[2, 3, 4].map((n) => (
          <button key={n} onClick={() => onStart(n)}>
            {n} Companies
          </button>
        ))}
      </div>
      <p className="lobby-note">
        Hot-seat play: pass the device between players — hands and journeys stay secret. Companies
        in order: {FACTIONS.map((f) => f.name).join(', ')}.
      </p>
    </div>
  );
}

export default function JourneysGame() {
  const [state, setState] = useState(null);
  const [selRoute, setSelRoute] = useState(null);
  const [tickSel, setTickSel] = useState([]);

  if (!state) {
    return (
      <div className="app">
        <a className="back-link" href="/">
          ⟵ The Hall of Games
        </a>
        <Lobby
          onStart={(n) => {
            setState(newGame(n));
            setSelRoute(null);
            setTickSel([]);
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
      setSelRoute(null);
      setTickSel([]);
    }
  };

  const me = state.players[state.current];
  const over = state.phase === 'game-over';
  const busy = state.phase !== 'turn' || state.pendingTickets !== null;
  const claimAllowed = !busy && state.drawsLeft === 2;
  const deckCount = state.deck.length + state.discard.length;
  const route = selRoute !== null ? state.routes.find((r) => r.id === selRoute) : null;
  const routeOpts = route ? paymentOptions(me.hand, route) : [];

  const prompt = over
    ? 'The journeys are done.'
    : state.phase === 'pick-tickets'
      ? `${me.name}: choose your starting journeys (keep at least one).`
      : state.pendingTickets
        ? `${me.name}: keep at least one of the new journeys.`
        : state.drawsLeft === 1
          ? `${me.name}: draw one more card (no face-up Eagle now).`
          : `${me.name}: take two cards, claim a road, or seek new journeys.`;

  const toggleTick = (i) =>
    setTickSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  const content = (
    <div className="layout">
      <div className="board-wrap" style={{ maxWidth: 860, flexBasis: 640 }}>
        <MapBoard
          state={state}
          onRoute={(id) => setSelRoute(id === selRoute ? null : id)}
          selRoute={selRoute}
          claimAllowed={claimAllowed && !over}
        />
      </div>

      <div className="side">
        <div className="panel">
          <div className="prompt">{prompt}</div>
          {state.finalTurnsLeft !== null && !over && (
            <div style={{ fontSize: 13, color: 'var(--gold)', marginTop: 4 }}>
              Last leg! {state.finalTurnsLeft} final turn{state.finalTurnsLeft === 1 ? '' : 's'}{' '}
              remain.
            </div>
          )}

          {state.pendingTickets ? (
            <div className="picker">
              <div style={{ fontSize: 14, fontWeight: 'bold' }}>Journeys offered:</div>
              {state.pendingTickets.map((t, i) => (
                <div className="row" key={i}>
                  <button
                    className={tickSel.includes(i) ? 'active' : ''}
                    onClick={() => toggleTick(i)}
                    style={{ width: '100%', textAlign: 'left' }}
                  >
                    {tickSel.includes(i) ? '✓ ' : '○ '}
                    {PLACES[t.from].name} → {PLACES[t.to].name} ({t.points} pts)
                  </button>
                </div>
              ))}
              <div className="row">
                <button
                  disabled={tickSel.length < 1}
                  onClick={() => dispatch({ type: 'KEEP_TICKETS', indices: tickSel })}
                >
                  <GIcon name="tiedscroll" /> Keep {tickSel.length || '…'}
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                Unkept journeys return to the bottom of the pile. Failed journeys cost their points
                at the end.
              </div>
            </div>
          ) : (
            <>
              <div className="row">
                {state.market.map((c, i) => (
                  <MiniCard
                    key={`${i}-${c}`}
                    card={c}
                    disabled={busy || over || (c === 'eagle' && state.drawsLeft !== 2)}
                    onClick={() => dispatch({ type: 'DRAW_MARKET', index: i })}
                  />
                ))}
                {state.market.length === 0 && (
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>The market is bare.</span>
                )}
              </div>
              <div className="row">
                <button
                  disabled={busy || over || deckCount === 0}
                  onClick={() => dispatch({ type: 'DRAW_BLIND' })}
                >
                  <GIcon name="twocoins" /> Draw blind ({state.deck.length}+{state.discard.length})
                </button>
                <button
                  disabled={!claimAllowed || over || state.ticketDeck.length === 0}
                  onClick={() => dispatch({ type: 'DRAW_TICKETS' })}
                >
                  <GIcon name="scroll" /> New journeys ({state.ticketDeck.length})
                </button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                A face-up Eagle may only be taken as your first card, and ends the turn. Click an
                unclaimed road on the map to ride it.
              </div>
            </>
          )}

          {route && !over && (
            <div className="picker">
              <div style={{ fontSize: 14 }}>
                <b>
                  {PLACES[route.a].name} → {PLACES[route.b].name}
                </b>{' '}
                · length {route.len} ·{' '}
                <span style={{ color: ROUTE_COLORS[route.color], fontWeight: 'bold' }}>
                  {route.color === 'grey' ? 'any colour' : route.color}
                </span>{' '}
                · +{POINTS[route.len]} pts
              </div>
              {me.ponies < route.len ? (
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                  Not enough ponies left in your stable.
                </div>
              ) : routeOpts.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
                  You cannot pay for this road yet.
                </div>
              ) : (
                <div className="row">
                  {routeOpts.map((o) => (
                    <button
                      key={`${o.color}-${o.eagles}`}
                      onClick={() =>
                        dispatch({ type: 'CLAIM', routeId: route.id, color: o.color })
                      }
                    >
                      {o.colorCount > 0 && (
                        <>
                          {o.colorCount}× <GIcon name="horse" color={CARD_BG[o.color]} />
                        </>
                      )}
                      {o.colorCount > 0 && o.eagles > 0 && ' + '}
                      {o.eagles > 0 && (
                        <>
                          {o.eagles}× <GIcon name="eagle" color={CARD_BG.eagle} />
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <div className="row">
                <button onClick={() => setSelRoute(null)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="row" style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--muted)' }}>My hand:</span>
            {CARD_COLORS.map((c) => (
              <span
                key={c}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: CARD_BG[c],
                  color: '#f2e7c8',
                }}
              >
                <GIcon name="horse" color="#f2e7c8" /> {me.hand[c]}
              </span>
            ))}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 6,
                background: CARD_BG.eagle,
                color: '#f2e7c8',
              }}
            >
              <GIcon name="eagle" color="#f2e7c8" /> {me.hand.eagle}
            </span>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="section-title">My Journeys</div>
            {me.tickets.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>No journeys sworn yet.</div>
            )}
            {me.tickets.map((t, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span>
                  {PLACES[t.from].name} → {PLACES[t.to].name}
                </span>
                <span
                  style={{
                    color: t.done ? '#3e7d44' : 'var(--muted)',
                    fontWeight: t.done ? 'bold' : 'normal',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.done ? '✓' : '…'} {t.points}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel players">
          <div className="section-title">The Companies</div>
          {state.players.map((p) => (
            <div key={p.id} className={`player ${p.id === state.current ? 'current' : ''}`}>
              <div className="player-head">
                <span className="player-name" style={{ color: p.color }}>
                  {p.id === state.current ? '▶ ' : ''}
                  {p.name}
                </span>
                <span className="player-meta">
                  <GIcon name="horse" /> {p.ponies} · ★ {p.score} pts · 🂠 {handSize(p.hand)} ·{' '}
                  <GIcon name="scroll" /> {p.tickets.length}
                </span>
              </div>
            </div>
          ))}
          <div className="costs">
            Road points: 1→1 · 2→2 · 3→4 · 4→7 · 5→10 · 6→15. Longest unbroken trail: +10.
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
              if (over || window.confirm('Abandon these journeys and start anew?')) {
                setState(null);
                setSelRoute(null);
                setTickSel([]);
              }
            }}
          >
            ↺ New Road
          </button>
        </div>
      </div>
    </div>
  );

  const tdR = { padding: '4px 10px', textAlign: 'right' };
  const winnerNames = over && state.winners
    ? state.winners.map((i) => state.players[i].name).join(' & ')
    : '';

  return (
    <div className="app">
      <a className="back-link" href="/">
        ⟵ The Hall of Games
      </a>
      <h1 className="title" style={{ fontSize: 22 }}>
        THERE AND BACK AGAIN
      </h1>
      {over ? content : (
        <Handoff player={me.name} color={me.color}>
          {content}
        </Handoff>
      )}

      {over && state.winners && state.results && (
        <div className="winner-overlay">
          <div className="winner-box" style={{ maxWidth: 600 }}>
            <GIcon
              name="crown"
              size={64}
              color="#a8821e"
              style={{ filter: 'drop-shadow(0 0 14px rgba(168,130,30,0.7))' }}
            />
            <h2>
              {winnerNames} {state.winners.length > 1 ? 'share the longest tale!' : 'tells the longest tale!'}
            </h2>
            <table style={{ margin: '14px auto 8px', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Company', 'Roads', 'Journeys', 'Longest', 'Total'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '4px 10px',
                        borderBottom: '1px solid #a8895a',
                        textAlign: h === 'Company' ? 'left' : 'right',
                        fontSize: 12,
                        letterSpacing: 1,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.players.map((p, i) => {
                  const r = state.results[i];
                  return (
                    <tr key={p.id}>
                      <td style={{ padding: '4px 10px', color: p.color, fontWeight: 'bold' }}>
                        {p.name}
                        {state.winners.includes(p.id) ? ' 👑' : ''}
                      </td>
                      <td style={tdR}>{r.routePts}</td>
                      <td style={tdR}>
                        +{r.ticketPlus} / −{r.ticketMinus}
                      </td>
                      <td style={tdR}>{r.bonus ? `+10 (${r.trail})` : '—'}</td>
                      <td style={{ ...tdR, fontWeight: 'bold' }}>{r.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
      A fan-made hot-seat strategy game inspired by classic railway route-building board games and
      the world of J.R.R. Tolkien. Not affiliated with Hasbro or Middle-earth Enterprises.
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
