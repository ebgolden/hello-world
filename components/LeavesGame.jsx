'use client';

import { useState } from 'react';
import { newGame, reduce } from '@/lib/leaves/engine';
import { CARDS, SUPPLY_ORDER } from '@/lib/leaves/cards';
import { GIcon } from '@/components/Icon';
import Handoff from '@/components/Handoff';

const TYPE_COLOR = {
  treasure: '#a8821e',
  victory: '#3e7d44',
  curse: '#7a5f9c',
  action: '#5a6b80',
};

function MiniCard({ k, count, onClick, highlight, dim, selected, wide }) {
  const c = CARDS[k];
  return (
    <div
      onClick={onClick}
      style={{
        width: wide ? 118 : 'auto',
        minWidth: 96,
        background:
          'linear-gradient(160deg, #eee0ba 0%, #e9dab4 50%, #dcc795 100%)',
        color: '#3a2a18',
        border: `2px solid ${selected ? '#9c2a18' : highlight ? '#a8821e' : '#a8895a'}`,
        borderRadius: 8,
        padding: '6px 7px',
        fontSize: 11.5,
        lineHeight: 1.3,
        opacity: dim ? 0.45 : 1,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: highlight
          ? '0 0 8px rgba(232,195,74,0.6)'
          : selected
            ? '0 0 8px rgba(156,42,24,0.6)'
            : '0 1px 3px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
        <GIcon name={c.icon} size={18} color={TYPE_COLOR[c.type]} />
        <span
          style={{
            fontWeight: 'bold',
            fontSize: 12,
            background: '#3a2a18',
            color: '#ecc977',
            borderRadius: '50%',
            width: 18,
            height: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {c.cost}
        </span>
      </div>
      <div style={{ fontWeight: 'bold', fontSize: 11.5 }}>{c.name}</div>
      <div style={{ color: '#75603f', fontSize: 10.5 }}>{c.text}</div>
      {count !== undefined && (
        <div style={{ fontSize: 10.5, color: count === 0 ? '#9c2a18' : '#75603f' }}>
          {count === 0 ? 'empty' : `${count} left`}
        </div>
      )}
    </div>
  );
}

function Lobby({ onStart }) {
  return (
    <div className="lobby">
      <h1 className="title">THE LEAVES OF LÓRIEN</h1>
      <p className="subtitle">Build your hoard, leaf by golden leaf</p>
      <div className="ring">
        <GIcon
          name="beech"
          size={84}
          color="#e8c34a"
          style={{ filter: 'drop-shadow(0 0 18px rgba(232,195,74,0.55))' }}
        />
      </div>
      <p>
        Begin with a humble satchel of Lembas and quiet Glades, and turn it into a hoard worthy of
        a steward of the Golden Wood. Buy treasures and craft-cards from the supply, send Orc
        Raids and Nazgûl against your rivals, and claim Havens and Realms before the stores run
        dry. Whoever holds the most leaves when the gathering ends rules the glade.
      </p>
      <div className="lobby-buttons">
        {[1, 2, 3, 4].map((n) => (
          <button key={n} onClick={() => onStart(n)}>
            {n} {n === 1 ? 'Steward' : 'Stewards'}
          </button>
        ))}
      </div>
      <p className="lobby-note">
        Hot-seat play: hands are hidden, so pass the device when prompted. Stewards in order:
        Gondor, Mordor, Rohan, Isengard.
      </p>
    </div>
  );
}

export default function LeavesGame() {
  const [state, setState] = useState(null);
  const [picked, setPicked] = useState([]); // Grey Havens multi-select

  if (!state) {
    return (
      <div className="app">
        <a className="back-link" href="/">
          ⟵ The Hall of Games
        </a>
        <Lobby
          onStart={(n) => {
            setState(newGame(n));
            setPicked([]);
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
      setPicked([]);
    }
  };

  const me = state.players[state.current];
  const pc = state.pendingChoice;

  const onHandCard = (i) => {
    if (state.over) return;
    if (pc) {
      if (pc.type === 'reforge-trash') dispatch({ type: 'CHOOSE', index: i });
      else if (pc.type === 'havens-trash') {
        setPicked((prev) =>
          prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < 4 ? [...prev, i] : prev
        );
      }
      return;
    }
    if (state.phase === 'action' && CARDS[me.hand[i]].type === 'action' && state.actions > 0) {
      dispatch({ type: 'PLAY_ACTION', index: i });
    }
  };

  const onPile = (k) => {
    if (state.over) return;
    if (pc) {
      if (pc.type === 'reforge-gain' && state.piles[k] > 0 && CARDS[k].cost <= pc.maxCost) {
        dispatch({ type: 'CHOOSE', cardKey: k });
      }
      return;
    }
    if (state.phase === 'buy') dispatch({ type: 'BUY', cardKey: k });
  };

  const pileHighlight = (k) => {
    if (state.over) return false;
    if (pc) return pc.type === 'reforge-gain' && state.piles[k] > 0 && CARDS[k].cost <= pc.maxCost;
    return (
      state.phase === 'buy' && state.buys > 0 && state.piles[k] > 0 && state.gold >= CARDS[k].cost
    );
  };

  const prompt = state.over
    ? 'The gathering has ended.'
    : pc
      ? pc.type === 'reforge-trash'
        ? `${me.name}: choose a card from your hand to cast into the forge.`
        : pc.type === 'reforge-gain'
          ? `${me.name}: claim a card from the supply costing up to ${pc.maxCost}.`
          : `${me.name}: choose up to 4 cards to release at the Havens.`
      : state.phase === 'action'
        ? `${me.name}: play action cards, or go to market.`
        : `${me.name}: lay out treasures and buy from the supply.`;

  const inner = (
    <>
      <div className="layout">
        <div className="board-wrap" style={{ maxWidth: 760, flexBasis: 560 }}>
          <div className="section-title" style={{ color: '#cdb47e' }}>
            The Supply
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))',
              gap: 7,
            }}
          >
            {SUPPLY_ORDER.map((k) => (
              <MiniCard
                key={k}
                k={k}
                count={state.piles[k]}
                highlight={pileHighlight(k)}
                dim={state.piles[k] === 0 || (pc && pc.type === 'reforge-gain' && !pileHighlight(k))}
                onClick={() => onPile(k)}
              />
            ))}
          </div>

          <div className="section-title" style={{ color: '#cdb47e', marginTop: 14 }}>
            {me.name}&apos;s Hand
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {me.hand.length === 0 && (
              <span style={{ color: '#9a8c70', fontSize: 13, fontStyle: 'italic' }}>
                An empty hand.
              </span>
            )}
            {me.hand.map((k, i) => (
              <MiniCard
                key={i}
                k={k}
                wide
                selected={picked.includes(i)}
                highlight={
                  !state.over &&
                  !pc &&
                  state.phase === 'action' &&
                  state.actions > 0 &&
                  CARDS[k].type === 'action'
                }
                onClick={() => onHandCard(i)}
              />
            ))}
          </div>

          {me.inPlay.length > 0 && (
            <>
              <div className="section-title" style={{ color: '#cdb47e', marginTop: 14 }}>
                In Play
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {me.inPlay.map((k, i) => (
                  <span key={i} style={{ color: '#cdb47e', fontSize: 12, whiteSpace: 'nowrap' }}>
                    <GIcon name={CARDS[k].icon} color="#cdb47e" /> {CARDS[k].name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="side">
          <div className="panel">
            <div className="prompt">{prompt}</div>
            <div className="row" style={{ fontSize: 13.5 }}>
              <span>
                <GIcon name="boot" color="var(--gold)" /> Actions: <b>{state.actions}</b>
              </span>
              <span>
                <GIcon name="wagon" color="var(--gold)" /> Buys: <b>{state.buys}</b>
              </span>
              <span>
                <GIcon name="twocoins" color="var(--gold)" /> Gold: <b>{state.gold}</b>
              </span>
              <span style={{ color: 'var(--muted)' }}>Round {state.turn}</span>
            </div>

            {pc && pc.type === 'havens-trash' && (
              <div className="picker">
                <div style={{ fontSize: 13 }}>
                  Chosen: {picked.length === 0 ? 'none' : picked.map((i) => CARDS[me.hand[i]].name).join(', ')}
                </div>
                <div className="row">
                  <button onClick={() => dispatch({ type: 'CHOOSE', indices: picked })}>
                    Trash chosen ({picked.length})
                  </button>
                  <button onClick={() => dispatch({ type: 'CHOOSE', indices: [] })}>
                    Keep everything
                  </button>
                </div>
              </div>
            )}
            {pc && pc.type === 'reforge-gain' && (
              <div className="row">
                <button onClick={() => dispatch({ type: 'CHOOSE', skip: true })}>
                  Take nothing
                </button>
              </div>
            )}

            {!pc && !state.over && (
              <div className="row">
                {state.phase === 'action' && (
                  <button onClick={() => dispatch({ type: 'END_PHASE' })}>
                    <GIcon name="coins" /> To Market
                  </button>
                )}
                <button onClick={() => dispatch({ type: 'PLAY_TREASURES' })}>
                  <GIcon name="twocoins" /> Play all treasures
                </button>
                <button onClick={() => dispatch({ type: 'END_TURN' })}>
                  <GIcon name="flag" /> End Turn
                </button>
              </div>
            )}
          </div>

          <div className="panel players">
            <div className="section-title">The Stewards</div>
            {state.players.map((p, i) => (
              <div key={i} className={`player ${i === state.current && !state.over ? 'current' : ''}`}>
                <div className="player-head">
                  <span className="player-name" style={{ color: p.color }}>
                    {i === state.current && !state.over ? '▶ ' : ''}
                    {p.name}
                  </span>
                  <span className="player-meta">
                    🂠 {p.deck.length} deck · ✋ {p.hand.length} hand · ⤵ {p.discard.length} discard
                  </span>
                </div>
              </div>
            ))}
            <div className="costs">
              Leaves stay hidden until the gathering ends. It ends when the Realms run out, or any
              three supply stores stand empty.
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
                if (state.over || window.confirm('Scatter the leaves and begin anew?')) {
                  setState(null);
                  setPicked([]);
                }
              }}
            >
              ↺ New Gathering
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
      <h1 className="title" style={{ fontSize: 22 }}>
        THE LEAVES OF LÓRIEN
      </h1>

      {state.players.length > 1 && !state.over ? (
        <Handoff player={me.name} color={me.color}>
          {inner}
        </Handoff>
      ) : (
        inner
      )}

      {state.over && (
        <div className="winner-overlay">
          <div className="winner-box">
            <GIcon
              name="beech"
              size={64}
              color="#a8821e"
              style={{ filter: 'drop-shadow(0 0 14px rgba(168,130,30,0.7))' }}
            />
            <h2>
              {state.over.winners.length === 1
                ? `${state.players[state.over.winners[0]].name} rules the Golden Wood!`
                : `${state.over.winners.map((i) => state.players[i].name).join(' and ')} share the rule of the Golden Wood!`}
            </h2>
            <div style={{ margin: '6px 0 14px' }}>
              {state.over.scores.map((s, i) => (
                <div key={i} style={{ fontSize: 15 }}>
                  {s.name}: <b>{s.score}</b> {Math.abs(s.score) === 1 ? 'leaf' : 'leaves'}
                  {state.over.winners.includes(i) ? ' ✦' : ''}
                </div>
              ))}
            </div>
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
      A fan-made hot-seat game inspired by classic deck-building card games and the world of
      J.R.R. Tolkien. Not affiliated with Hasbro or Middle-earth Enterprises.
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
