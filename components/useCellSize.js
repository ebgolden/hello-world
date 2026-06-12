'use client';

import { useEffect, useState } from 'react';

// Largest grid cell size (capped at `max`) such that `cols` columns plus
// `reserve` px of surrounding chrome fit the viewport width.
export default function useCellSize(max, cols, reserve = 80) {
  const [size, setSize] = useState(max);
  useEffect(() => {
    const update = () =>
      setSize(Math.max(22, Math.min(max, Math.floor((window.innerWidth - reserve) / cols))));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [max, cols, reserve]);
  return size;
}
