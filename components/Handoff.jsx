'use client';

import { useEffect, useState } from 'react';

// Hot-seat privacy screen: covers the table until the named player reveals it.
// Re-covers automatically whenever `player` changes.
export default function Handoff({ player, color, children }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    setHidden(true);
  }, [player]);
  if (!hidden) return children;
  return (
    <div className="handoff">
      <div className="winner-box">
        <h2>
          Pass the device to <span style={{ color: color || '#6b3d10' }}>{player}</span>
        </h2>
        <p style={{ color: 'var(--ink-muted)', margin: '8px 0 18px' }}>
          No peeking — their secrets are their own.
        </p>
        <button onClick={() => setHidden(false)}>I am {player} — reveal</button>
      </div>
    </div>
  );
}
