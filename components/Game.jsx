'use client';

import { useMemo, useState } from 'react';
import {
  RESOURCES,
  RESOURCE_INFO,
  TERRAIN_INFO,
  COSTS,
  DEV_INFO,
  VP_TO_WIN,
} from '@/lib/constants';
import { buildGeometry, hexCorners, hexCenter } from '@/lib/board';
import {
  newGame,
  reduce,
  legalSetupSettlements,
  legalSetupRoads,
  legalRoads,
  legalSettlements,
  legalCities,
  computeVP,
  canAfford,
  totalCards,
} from '@/lib/engine';

function costText(cost) {
  return Object.entries(cost)
    .map(([r, n]) => `${n} ${RESOURCE_INFO[r].icon}`)
    .join(' + ');
}

function Settlement({ x, y, color }) {
  const pts = [
    [-7, 6], [-7, -2], [0, -9], [7, -2], [7, 6],
  ]
    .map(([dx, dy]) => `${x + dx},${y + dy}`)
    .join(' ');
  return <polygon points={pts} fill={color} stroke="#14100a" strokeWidth="2" />;
}

function City({ x, y, color }) {
  const pts = [
    [-10, 8], [-10, -3], [-4, -3], [-4, -11], [4, -11], [4, -3], [10, -3], [10, 8],
  ]
    .map(([dx, dy]) => `${x + dx},${y + dy}`)
    .join(' ');
  return <polygon points={pts} fill={color} stroke="#14100a" strokeWidth="2" />;
}

function Board({ state, geom, dispatch, clickableVerts, clickableEdges, robberMode }) {
  const verts = Object.values(geom.vertices);
  const pad = 26;
  const minX = Math.min(...verts.map((v) => v.x)) - pad;
  const maxX = Math.max(...verts.map((v) => v.x)) + pad;
  const minY = Math.min(...verts.map((v) => v.y)) - pad;
  const maxY = Math.max(...verts.map((v) => v.y)) + pad;

  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}>
      {/* terrain */}
      {state.board.hexes.map((h) => {
        const corners = hexCorners(h.q, h.r);
        const c = hexCenter(h.q, h.r);
        const info = TERRAIN_INFO[h.terrain];
        const hot = h.token === 6 || h.token === 8;
        return (
          <g key={h.id}>
            <polygon
              points={corners.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={info.fill}
              stroke="#1a140d"
              strokeWidth="3"
            />
            <text
              x={c.x}
              y={c.y - 22}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(20,14,8,0.75)"
              style={{ fontStyle: 'italic' }}
            >
              {info.name}
            </text>
            {h.token !== null && (
              <g>
                <circle cx={c.x} cy={c.y} r="15" fill="#e8dcc0" stroke="#5a4a2e" strokeWidth="1.5" />
                <text
                  x={c.x}
                  y={c.y + 5}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="bold"
                  fill={hot ? '#a32a1d' : '#3a2f1e'}
                >
                  {h.token}
                </text>
              </g>
            )}
            {state.board.robberHex === h.id && (
              <g>
                <circle cx={c.x} cy={c.y + 25} r="12" fill="#100c14" stroke="#a32a1d" strokeWidth="1.5" />
                <text x={c.x} y={c.y + 30} textAnchor="middle" fontSize="13">
                  👁
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* roads */}
      {Object.entries(state.roads).map(([eid, pid]) => {
        const e = geom.edges[eid];
        const a = geom.vertices[e.a];
        const b = geom.vertices[e.b];
        const shrink = 0.16;
        const x1 = a.x + (b.x - a.x) * shrink;
        const y1 = a.y + (b.y - a.y) * shrink;
        const x2 = b.x + (a.x - b.x) * shrink;
        const y2 = b.y + (a.y - b.y) * shrink;
        return (
          <g key={eid}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#14100a" strokeWidth="9" strokeLinecap="round" />
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={state.players[pid].color}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* buildings */}
      {Object.entries(state.buildings).map(([vid, b]) => {
        const v = geom.vertices[vid];
        const color = state.players[b.player].color;
        return b.type === 'city' ? (
          <City key={vid} x={v.x} y={v.y} color={color} />
        ) : (
          <Settlement key={vid} x={v.x} y={v.y} color={color} />
        );
      })}

      {/* robber targets */}
      {robberMode &&
        state.board.hexes
          .filter((h) => h.id !== state.board.robberHex)
          .map((h) => (
            <polygon
              key={`t${h.id}`}
              className="hex-target"
              points={hexCorners(h.q, h.r)
                .map((p) => `${p.x},${p.y}`)
                .join(' ')}
              fill="rgba(163,42,29,0.12)"
              stroke="rgba(240,207,126,0.5)"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              onClick={() => dispatch({ type: 'MOVE_ROBBER', hexId: h.id })}
            />
          ))}

      {/* edge targets */}
      {clickableEdges.map((eid) => {
        const e = geom.edges[eid];
        const a = geom.vertices[e.a];
        const b = geom.vertices[e.b];
        return (
          <line
            key={`e${eid}`}
            className="edge-spot"
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            strokeWidth="13"
            strokeLinecap="round"
            stroke="rgba(240,207,126,0.28)"
            pointerEvents="all"
            onClick={() =>
              dispatch({
                type: state.phase === 'setup-road' ? 'PLACE_SETUP_ROAD' : 'BUILD_ROAD',
                eid,
              })
            }
          />
        );
      })}

      {/* vertex targets */}
      {clickableVerts.map((vid) => {
        const v = geom.vertices[vid];
        return (
          <circle
            key={`v${vid}`}
            className="vertex-spot"
            cx={v.x}
            cy={v.y}
            r="9"
            fill="rgba(240,207,126,0.45)"
            stroke="#14100a"
            strokeWidth="1"
            onClick={() => {
              const type =
                state.phase === 'setup-settlement'
                  ? 'PLACE_SETUP_SETTLEMENT'
                  : state.buildings[vid]
                    ? 'BUILD_CITY'
                    : 'BUILD_SETTLEMENT';
              dispatch({ type, vid });
            }}
          />
        );
      })}
    </svg>
  );
}

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">SETTLERS OF MIDDLE-EARTH</h1>
      <p className="subtitle">One board to rule them all</p>
      <div className="ring">💍</div>
      <p>
        Gather Timber from Fangorn, Clay from Bree, Fleece from the Shire, Grain from the
        Pelennor and Mithril from Moria. Build roads, villages and strongholds — but beware
        the Nazgûl. The first realm to {VP_TO_WIN} victory points unites Middle-earth.
      </p>
      <div className="lobby-buttons">
        {[2, 3, 4].map((n) => (
          <button key={n} onClick={() => onStart(n)}>
            {n} Realms
          </button>
        ))}
      </div>
      <p className="lobby-note">
        Hot-seat play: pass the device between players. Realms in order: Gondor, Rohan,
        Lothlórien, Erebor.
      </p>
    </div>
  );
}

export default function Game() {
  const [state, setState] = useState(null);
  const [mode, setMode] = useState(null); // 'road' | 'settlement' | 'city' | null
  const [picker, setPicker] = useState(null); // { index, type: 'plenty' | 'monopoly' }
  const [pick, setPick] = useState({ a: 'wood', b: 'wood', res: 'wood', give: 'wood', get: 'clay' });

  const geom = useMemo(
    () => (state ? buildGeometry(state.board.hexes) : null),
    [state ? state.board.hexes : null]
  );

  if (!state) {
    return (
      <div className="app">
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
    const next = reduce(state, geom, action);
    if (next !== state) {
      setState(next);
      if (action.type === 'BUILD_SETTLEMENT' || action.type === 'BUILD_CITY') setMode(null);
      if (action.type === 'END_TURN' || action.type === 'ROLL') setMode(null);
    }
  };

  const me = state.players[state.current];
  const phase = state.phase;
  const placingFreeRoads = phase === 'main' && state.freeRoads > 0;

  let clickableVerts = [];
  let clickableEdges = [];
  if (phase === 'setup-settlement') clickableVerts = legalSetupSettlements(state, geom);
  else if (phase === 'setup-road') clickableEdges = legalSetupRoads(state, geom);
  else if (phase === 'main') {
    if (placingFreeRoads || (mode === 'road' && canAfford(me, COSTS.road)))
      clickableEdges = legalRoads(state, geom, state.current);
    else if (mode === 'settlement' && canAfford(me, COSTS.settlement))
      clickableVerts = legalSettlements(state, geom, state.current);
    else if (mode === 'city' && canAfford(me, COSTS.city)) clickableVerts = legalCities(state, state.current);
  }

  const prompt =
    phase === 'setup-settlement'
      ? `${me.name}: place a village (round ${state.setupIndex < state.players.length ? 1 : 2}).`
      : phase === 'setup-road'
        ? `${me.name}: place a road beside your new village.`
        : phase === 'roll'
          ? `${me.name}: roll the dice.`
          : phase === 'move-robber'
            ? `${me.name}: click a land to send the Nazgûl there.`
            : phase === 'main'
              ? placingFreeRoads
                ? `${me.name}: place ${state.freeRoads} free road${state.freeRoads > 1 ? 's' : ''}.`
                : `${me.name}: build, trade, play a card, or end your turn.`
              : '';

  const playDev = (index, type) => {
    if (type === 'plenty' || type === 'monopoly') {
      setPicker({ index, type });
    } else {
      dispatch({ type: 'PLAY_DEV', index });
    }
  };

  return (
    <div className="app">
      <h1 className="title" style={{ fontSize: 22 }}>
        SETTLERS OF MIDDLE-EARTH
      </h1>
      <div className="layout">
        <div className="board-wrap">
          <Board
            state={state}
            geom={geom}
            dispatch={dispatch}
            clickableVerts={clickableVerts}
            clickableEdges={clickableEdges}
            robberMode={phase === 'move-robber'}
          />
        </div>

        <div className="side">
          <div className="panel">
            <div className="prompt">{prompt}</div>
            <div className="row">
              <button disabled={phase !== 'roll'} onClick={() => dispatch({ type: 'ROLL' })}>
                🎲 Roll Dice
              </button>
              {state.dice && (
                <span className="dice">
                  {state.dice[0]} + {state.dice[1]} = {state.dice[0] + state.dice[1]}
                </span>
              )}
              <button
                disabled={phase !== 'main' || placingFreeRoads}
                onClick={() => dispatch({ type: 'END_TURN' })}
              >
                End Turn
              </button>
            </div>
            <div className="row">
              <button
                className={mode === 'road' || placingFreeRoads ? 'active' : ''}
                disabled={phase !== 'main' || (!placingFreeRoads && !canAfford(me, COSTS.road))}
                onClick={() => setMode(mode === 'road' ? null : 'road')}
              >
                🛤 Road
              </button>
              <button
                className={mode === 'settlement' ? 'active' : ''}
                disabled={phase !== 'main' || placingFreeRoads || !canAfford(me, COSTS.settlement)}
                onClick={() => setMode(mode === 'settlement' ? null : 'settlement')}
              >
                🏠 Village
              </button>
              <button
                className={mode === 'city' ? 'active' : ''}
                disabled={phase !== 'main' || placingFreeRoads || !canAfford(me, COSTS.city)}
                onClick={() => setMode(mode === 'city' ? null : 'city')}
              >
                🏰 Stronghold
              </button>
              <button
                disabled={
                  phase !== 'main' ||
                  placingFreeRoads ||
                  state.devDeck.length === 0 ||
                  !canAfford(me, COSTS.dev)
                }
                onClick={() => dispatch({ type: 'BUY_DEV' })}
              >
                📜 Tale of Old ({state.devDeck.length})
              </button>
            </div>
            <div className="row">
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Bank 4:1</span>
              <select value={pick.give} onChange={(e) => setPick({ ...pick, give: e.target.value })}>
                {RESOURCES.map((r) => (
                  <option key={r} value={r}>
                    give {RESOURCE_INFO[r].name}
                  </option>
                ))}
              </select>
              <select value={pick.get} onChange={(e) => setPick({ ...pick, get: e.target.value })}>
                {RESOURCES.map((r) => (
                  <option key={r} value={r}>
                    get {RESOURCE_INFO[r].name}
                  </option>
                ))}
              </select>
              <button
                disabled={
                  phase !== 'main' || pick.give === pick.get || me.resources[pick.give] < 4
                }
                onClick={() => dispatch({ type: 'TRADE_BANK', give: pick.give, get: pick.get })}
              >
                Trade
              </button>
            </div>

            {me.devCards.length > 0 && phase !== 'setup-settlement' && phase !== 'setup-road' && (
              <div className="dev-cards">
                <div className="section-title">Tales of Old ({me.name})</div>
                {me.devCards.map((c, i) => {
                  const info = DEV_INFO[c.type];
                  const playable =
                    phase === 'main' &&
                    !state.devPlayedThisTurn &&
                    c.type !== 'vp' &&
                    c.boughtOnTurn !== state.turn;
                  return (
                    <div className="dev-card" key={i}>
                      <div>
                        <div>{info.name}</div>
                        <div className="desc">{info.desc}</div>
                      </div>
                      {c.type !== 'vp' && (
                        <button disabled={!playable} onClick={() => playDev(i, c.type)}>
                          Play
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {picker && (
              <div className="picker">
                {picker.type === 'plenty' ? (
                  <div className="row" style={{ marginTop: 0 }}>
                    <span>Galadriel grants:</span>
                    <select value={pick.a} onChange={(e) => setPick({ ...pick, a: e.target.value })}>
                      {RESOURCES.map((r) => (
                        <option key={r} value={r}>
                          {RESOURCE_INFO[r].name}
                        </option>
                      ))}
                    </select>
                    <select value={pick.b} onChange={(e) => setPick({ ...pick, b: e.target.value })}>
                      {RESOURCES.map((r) => (
                        <option key={r} value={r}>
                          {RESOURCE_INFO[r].name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        dispatch({ type: 'PLAY_DEV', index: picker.index, a: pick.a, b: pick.b });
                        setPicker(null);
                      }}
                    >
                      Take
                    </button>
                  </div>
                ) : (
                  <div className="row" style={{ marginTop: 0 }}>
                    <span>The Ring demands:</span>
                    <select value={pick.res} onChange={(e) => setPick({ ...pick, res: e.target.value })}>
                      {RESOURCES.map((r) => (
                        <option key={r} value={r}>
                          {RESOURCE_INFO[r].name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        dispatch({ type: 'PLAY_DEV', index: picker.index, res: pick.res });
                        setPicker(null);
                      }}
                    >
                      Seize
                    </button>
                  </div>
                )}
                <div className="row">
                  <button onClick={() => setPicker(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div className="panel players">
            <div className="section-title">Realms — first to {VP_TO_WIN} ⭐ wins</div>
            {state.players.map((p) => (
              <div key={p.id} className={`player ${p.id === state.current ? 'current' : ''}`}>
                <div className="player-head">
                  <span className="player-name" style={{ color: p.color }}>
                    {p.id === state.current ? '▶ ' : ''}
                    {p.name}
                  </span>
                  <span className="player-meta">
                    ⭐ {computeVP(state, p.id)}
                    {state.longestRoadHolder === p.id ? ' · 🛤 Longest Road' : ''}
                    {state.largestArmyHolder === p.id ? ' · 🐎 Mightiest Host' : ''}
                    {' · 🃏 '}
                    {totalCards(p)}
                  </span>
                </div>
                <div className="res-row">
                  {RESOURCES.map((r) => (
                    <span key={r} title={RESOURCE_INFO[r].name}>
                      {RESOURCE_INFO[r].icon} {p.resources[r]}
                    </span>
                  ))}
                  <span title="Riders of Rohan played">🐎 {p.knightsPlayed}</span>
                  <span title="Tales of Old in hand">📜 {p.devCards.length}</span>
                </div>
              </div>
            ))}
            <div className="costs">
              🛤 Road: {costText(COSTS.road)} &nbsp;·&nbsp; 🏠 Village: {costText(COSTS.settlement)}
              <br />
              🏰 Stronghold: {costText(COSTS.city)} &nbsp;·&nbsp; 📜 Tale: {costText(COSTS.dev)}
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
                if (state.winner !== null || window.confirm('Abandon this campaign and start anew?')) {
                  setState(null);
                  setMode(null);
                  setPicker(null);
                }
              }}
            >
              ↺ New Campaign
            </button>
          </div>
        </div>
      </div>

      {state.winner !== null && (
        <div className="winner-overlay">
          <div className="winner-box">
            <div style={{ fontSize: 48 }}>👑</div>
            <h2>{state.players[state.winner].name} unites Middle-earth!</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
              {computeVP(state, state.winner)} victory points
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
      A fan-made hot-seat strategy game inspired by classic settlement-building board games and
      the world of J.R.R. Tolkien. Not affiliated with or endorsed by Catan GmbH or Middle-earth
      Enterprises.
    </div>
  );
}
