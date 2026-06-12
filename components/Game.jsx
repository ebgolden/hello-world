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
  tradeRates,
  computeVP,
  canAfford,
  totalCards,
} from '@/lib/engine';
import { GIcon, BoardIcon } from '@/components/Icon';

function costText(cost) {
  return Object.entries(cost).map(([r, n]) => (
    <span key={r} style={{ whiteSpace: 'nowrap', marginRight: 6 }}>
      {n}
      <GIcon name={RESOURCE_INFO[r].icon} size={13} color={RESOURCE_INFO[r].color} style={{ marginLeft: 2 }} />
    </span>
  ));
}

// Decorative ink-symbol arrangements per terrain, in hex-local coordinates,
// drawn like the hand-inked symbols of an old fantasy map.
// [icon, dx, dy, size, color, opacity]
const MOTIFS = {
  forest: [
    ['pine', -26, -10, 20, '#2f4527', 0.85],
    ['pine', -4, -24, 24, '#35502c', 0.8],
    ['pine', 18, -10, 21, '#2f4527', 0.85],
    ['pine', -19, 16, 25, '#35502c', 0.9],
    ['pine', 9, 19, 27, '#2a3d22', 0.9],
  ],
  hills: [
    ['hills', -13, -16, 32, '#6b3a1a', 0.7],
    ['hills', 15, -12, 26, '#5e3115', 0.65],
    ['brickwall', -16, 18, 20, '#5e3115', 0.8],
    ['claybrick', 14, 18, 18, '#5e3115', 0.8],
  ],
  pasture: [
    ['grass', -24, -12, 16, '#46571f', 0.85],
    ['grass', 0, -22, 15, '#46571f', 0.8],
    ['grass', -26, 14, 15, '#3e4d1b', 0.85],
    ['grass', 22, -14, 14, '#3e4d1b', 0.8],
    ['sheep', 9, 14, 26, '#4a3a22', 0.85],
  ],
  fields: [
    ['wheat', -22, -12, 20, '#7c5c14', 0.8],
    ['wheat', -1, -22, 19, '#86640f', 0.75],
    ['wheat', 19, -10, 20, '#7c5c14', 0.8],
    ['wheat', -13, 16, 22, '#6f5210', 0.85],
    ['wheat', 12, 18, 21, '#6f5210', 0.85],
    ['windmill', 27, 10, 18, '#5d450e', 0.6],
  ],
  mountains: [
    ['peaks', -11, -8, 38, '#45403a', 0.85],
    ['mountaintop', 15, 12, 30, '#3c3833', 0.85],
    ['crystal', 21, -15, 15, '#4f7390', 0.85],
    ['crystal', -24, 15, 12, '#5a7a96', 0.75],
  ],
  desert: [
    ['swamp', -15, -10, 26, '#4a4031', 0.8],
    ['swamp', 14, -14, 21, '#4a4031', 0.7],
    ['deadwood', 4, 16, 26, '#3f362a', 0.85],
    ['swamp', -22, 16, 18, '#524836', 0.75],
  ],
};

function Token({ x, y, n }) {
  const hot = n === 6 || n === 8;
  const ink = hot ? '#9c2a18' : '#3c2d1c';
  const pips = 6 - Math.abs(7 - n);
  return (
    <g filter="url(#f-shadow)">
      <circle cx={x} cy={y} r="16" fill="url(#g-token)" stroke="#6b5230" strokeWidth="1.5" />
      <circle cx={x} cy={y} r="13.5" fill="none" stroke="rgba(107,82,48,0.4)" strokeWidth="0.8" />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize={hot ? 15 : 13} fontWeight="bold" fill={ink}>
        {n}
      </text>
      {Array.from({ length: pips }, (_, i) => (
        <circle key={i} cx={x + (i - (pips - 1) / 2) * 4} cy={y + 9.5} r="1.3" fill={ink} />
      ))}
    </g>
  );
}

function Nazgul({ x, y }) {
  return (
    <g filter="url(#f-shadow)">
      <circle cx={x} cy={y} r="14" fill="#171020" stroke="#7a1f12" strokeWidth="1.5" />
      <g filter="url(#f-glow)">
        <BoardIcon name="eye" x={x} y={y} s={21} color="#ff8c2e" />
      </g>
    </g>
  );
}

function Port({ geom, port }) {
  const a = geom.vertices[port.verts[0]];
  const b = geom.vertices[port.verts[1]];
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // The board is centered on the origin, so outward = away from (0,0).
  const len = Math.hypot(mx, my) || 1;
  const px = mx + (mx / len) * 23;
  const py = my + (my / len) * 23;
  return (
    <g>
      <g filter="url(#f-ink)">
        <line x1={a.x} y1={a.y} x2={px} y2={py} stroke="#5e4426" strokeWidth="3" />
        <line x1={b.x} y1={b.y} x2={px} y2={py} stroke="#5e4426" strokeWidth="3" />
      </g>
      <circle cx={px} cy={py} r="12" fill="url(#g-token)" stroke="#6b5230" strokeWidth="1.4" />
      {port.kind === 'any' ? (
        <text x={px} y={py + 3.5} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3c2d1c">
          3:1
        </text>
      ) : (
        <g>
          <BoardIcon name={RESOURCE_INFO[port.kind].icon} x={px} y={py - 2.5} s={13} color="#3c2d1c" />
          <text x={px} y={py + 9.5} textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#3c2d1c">
            2:1
          </text>
        </g>
      )}
    </g>
  );
}

function Board({ state, geom, dispatch, clickableVerts, clickableEdges, robberMode }) {
  const verts = Object.values(geom.vertices);
  const pad = 44;
  const minX = Math.min(...verts.map((v) => v.x)) - pad;
  const maxX = Math.max(...verts.map((v) => v.x)) + pad;
  const minY = Math.min(...verts.map((v) => v.y)) - pad;
  const maxY = Math.max(...verts.map((v) => v.y)) + pad;

  return (
    <svg viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}>
      <defs>
        {Object.entries(TERRAIN_INFO).map(([t, info]) => (
          <radialGradient key={t} id={`g-${t}`} cx="50%" cy="40%" r="80%">
            <stop offset="0%" stopColor={info.grad[0]} />
            <stop offset="100%" stopColor={info.grad[1]} />
          </radialGradient>
        ))}
        <radialGradient id="g-token" cx="50%" cy="36%" r="75%">
          <stop offset="0%" stopColor="#f4e7c4" />
          <stop offset="100%" stopColor="#dcc89c" />
        </radialGradient>
        <radialGradient id="g-parch" cx="50%" cy="42%" r="80%">
          <stop offset="0%" stopColor="#eee0ba" />
          <stop offset="100%" stopColor="#d9c48f" />
        </radialGradient>
        <radialGradient id="g-vignette" cx="50%" cy="50%" r="72%">
          <stop offset="0%" stopColor="rgba(88,58,20,0)" />
          <stop offset="78%" stopColor="rgba(88,58,20,0.05)" />
          <stop offset="100%" stopColor="rgba(74,46,14,0.4)" />
        </radialGradient>
        <filter id="f-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#3a2510" floodOpacity="0.45" />
        </filter>
        <filter id="f-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* hand-drawn wobble for hex washes, outlines and piers */}
        <filter id="f-ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" />
        </filter>
        {/* parchment grain and age blotches */}
        <filter id="f-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.34 0 0 0 0 0.24 0 0 0 0 0.10 0 0 0 0.07 0" />
        </filter>
        <filter id="f-blotch">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" />
          <feColorMatrix values="0 0 0 0 0.38 0 0 0 0 0.26 0 0 0 0 0.10 0 0 0 0.11 0" />
        </filter>
      </defs>

      <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} rx="14" fill="url(#g-parch)" />

      {/* sea flourishes */}
      <g opacity="0.5">
        <BoardIcon name="wavecrest" x={minX + 38} y={minY + 38} s={20} color="#6b5436" />
        <BoardIcon name="wavecrest" x={minX + 66} y={minY + 52} s={14} color="#6b5436" />
        <BoardIcon name="compass" x={maxX - 50} y={minY + 50} s={52} color="#5e4426" />
        <BoardIcon name="sailboat" x={minX + 46} y={maxY - 44} s={30} color="#5e4426" />
        <BoardIcon name="wavecrest" x={maxX - 42} y={maxY - 38} s={20} color="#6b5436" />
        <BoardIcon name="wavecrest" x={maxX - 68} y={maxY - 26} s={13} color="#6b5436" />
      </g>

      {/* harbors */}
      {state.board.ports.map((p, i) => (
        <Port key={i} geom={geom} port={p} />
      ))}

      {/* terrain washes with hand-drawn edges */}
      {state.board.hexes.map((h) => {
        const poly = hexCorners(h.q, h.r)
          .map((p) => `${p.x},${p.y}`)
          .join(' ');
        return (
          <g key={h.id} filter="url(#f-ink)">
            <polygon points={poly} fill={`url(#g-${h.terrain})`} fillOpacity="0.88" />
            <polygon points={poly} fill="none" stroke="#5a4326" strokeWidth="1.7" strokeOpacity="0.85" />
          </g>
        );
      })}

      {/* parchment grain over the washes */}
      <rect
        x={minX}
        y={minY}
        width={maxX - minX}
        height={maxY - minY}
        rx="14"
        filter="url(#f-grain)"
        pointerEvents="none"
      />
      <rect
        x={minX}
        y={minY}
        width={maxX - minX}
        height={maxY - minY}
        rx="14"
        filter="url(#f-blotch)"
        pointerEvents="none"
      />

      {/* ink symbols, names and tokens */}
      {state.board.hexes.map((h) => {
        const c = hexCenter(h.q, h.r);
        const info = TERRAIN_INFO[h.terrain];
        return (
          <g key={`s${h.id}`}>
            {(MOTIFS[h.terrain] || []).map(([icon, dx, dy, s, color, op], i) => (
              <BoardIcon key={i} name={icon} x={c.x + dx} y={c.y + dy} s={s} color={color} opacity={op} />
            ))}
            <text
              x={c.x}
              y={c.y - 24}
              textAnchor="middle"
              fontSize="8.5"
              fill="#4f3b22"
              style={{ fontStyle: 'italic', letterSpacing: 0.4 }}
            >
              {info.name}
            </text>
            {h.token !== null && <Token x={c.x} y={c.y} n={h.token} />}
            {state.board.robberHex === h.id && <Nazgul x={c.x} y={c.y + (h.token !== null ? 27 : 0)} />}
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
        // No filter here: vertical edges have a zero-width bounding box, which
        // collapses percentage-based filter regions and hides the road entirely.
        return (
          <g key={eid}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2c2014" strokeWidth="8.5" strokeLinecap="round" />
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={state.players[pid].color}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* buildings */}
      {Object.entries(state.buildings).map(([vid, b]) => {
        const v = geom.vertices[vid];
        const color = state.players[b.player].color;
        const city = b.type === 'city';
        return (
          <g key={vid} filter="url(#f-shadow)">
            <BoardIcon
              name={city ? 'castle' : 'village'}
              x={v.x}
              y={v.y - 2}
              s={city ? 34 : 26}
              color={color}
              stroke="#2c2014"
              strokeWidth={city ? 22 : 26}
            />
          </g>
        );
      })}

      {/* aged edges */}
      <rect
        x={minX}
        y={minY}
        width={maxX - minX}
        height={maxY - minY}
        rx="14"
        fill="url(#g-vignette)"
        pointerEvents="none"
      />

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
              fill="rgba(156,42,24,0.16)"
              stroke="rgba(122,74,14,0.6)"
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
            stroke="rgba(122,74,14,0.4)"
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
            fill="rgba(122,74,14,0.5)"
            stroke="#2c2014"
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
      <div className="ring">
        <GIcon name="ring" size={84} color="#e8c34a" style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }} />
      </div>
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
  const rates = tradeRates(state, state.current);

  const roadSpots = phase === 'main' ? legalRoads(state, geom, state.current) : [];
  const villageSpots = phase === 'main' ? legalSettlements(state, geom, state.current) : [];
  const citySpots = phase === 'main' ? legalCities(state, state.current) : [];
  const placingFreeRoads = phase === 'main' && state.freeRoads > 0 && roadSpots.length > 0;

  let clickableVerts = [];
  let clickableEdges = [];
  if (phase === 'setup-settlement') clickableVerts = legalSetupSettlements(state, geom);
  else if (phase === 'setup-road') clickableEdges = legalSetupRoads(state, geom);
  else if (phase === 'main') {
    if (placingFreeRoads || (mode === 'road' && canAfford(me, COSTS.road))) clickableEdges = roadSpots;
    else if (mode === 'settlement' && canAfford(me, COSTS.settlement)) clickableVerts = villageSpots;
    else if (mode === 'city' && canAfford(me, COSTS.city)) clickableVerts = citySpots;
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
                <GIcon name="dice" /> Roll Dice
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
                disabled={
                  phase !== 'main' ||
                  roadSpots.length === 0 ||
                  (!placingFreeRoads && !canAfford(me, COSTS.road))
                }
                onClick={() => setMode(mode === 'road' ? null : 'road')}
              >
                <GIcon name="road" /> Road
              </button>
              <button
                className={mode === 'settlement' ? 'active' : ''}
                disabled={
                  phase !== 'main' ||
                  placingFreeRoads ||
                  villageSpots.length === 0 ||
                  !canAfford(me, COSTS.settlement)
                }
                onClick={() => setMode(mode === 'settlement' ? null : 'settlement')}
              >
                <GIcon name="village" /> Village
              </button>
              <button
                className={mode === 'city' ? 'active' : ''}
                disabled={
                  phase !== 'main' ||
                  placingFreeRoads ||
                  citySpots.length === 0 ||
                  !canAfford(me, COSTS.city)
                }
                onClick={() => setMode(mode === 'city' ? null : 'city')}
              >
                <GIcon name="castle" /> Stronghold
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
                <GIcon name="scroll" /> Tale of Old ({state.devDeck.length})
              </button>
            </div>
            <div className="row">
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Bank &amp; harbors</span>
              <select value={pick.give} onChange={(e) => setPick({ ...pick, give: e.target.value })}>
                {RESOURCES.map((r) => (
                  <option key={r} value={r}>
                    give {rates[r]} {RESOURCE_INFO[r].name}
                  </option>
                ))}
              </select>
              <select value={pick.get} onChange={(e) => setPick({ ...pick, get: e.target.value })}>
                {RESOURCES.map((r) => (
                  <option key={r} value={r}>
                    get 1 {RESOURCE_INFO[r].name}
                  </option>
                ))}
              </select>
              <button
                disabled={
                  phase !== 'main' ||
                  pick.give === pick.get ||
                  me.resources[pick.give] < rates[pick.give]
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
                        <div>
                          <GIcon
                            name={
                              c.type === 'knight'
                                ? 'horse'
                                : c.type === 'vp'
                                  ? 'crown'
                                  : c.type === 'roads'
                                    ? 'road'
                                    : c.type === 'monopoly'
                                      ? 'ring'
                                      : 'scroll'
                            }
                            color="var(--gold)"
                          />{' '}
                          {info.name}
                        </div>
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
                    {state.longestRoadHolder === p.id && (
                      <>
                        {' · '}
                        <GIcon name="road" size={12} /> Longest Road
                      </>
                    )}
                    {state.largestArmyHolder === p.id && (
                      <>
                        {' · '}
                        <GIcon name="horse" size={12} /> Mightiest Host
                      </>
                    )}
                  </span>
                </div>
                <div className="res-row">
                  {RESOURCES.map((r) => (
                    <span key={r} title={RESOURCE_INFO[r].name}>
                      <GIcon name={RESOURCE_INFO[r].icon} color={RESOURCE_INFO[r].color} /> {p.resources[r]}
                    </span>
                  ))}
                  <span title="Riders of Rohan played">
                    <GIcon name="horse" color="var(--muted)" /> {p.knightsPlayed}
                  </span>
                  <span title="Tales of Old in hand">
                    <GIcon name="scroll" color="var(--muted)" /> {p.devCards.length}
                  </span>
                </div>
              </div>
            ))}
            <div className="costs">
              <GIcon name="road" size={12} /> Road: {costText(COSTS.road)} · <GIcon name="village" size={12} />{' '}
              Village: {costText(COSTS.settlement)}
              <br />
              <GIcon name="castle" size={12} /> Stronghold: {costText(COSTS.city)} ·{' '}
              <GIcon name="scroll" size={12} /> Tale: {costText(COSTS.dev)}
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
            <GIcon
              name="crown"
              size={64}
              color="#a8821e"
              style={{ filter: 'drop-shadow(0 0 14px rgba(168,130,30,0.7))' }}
            />
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
