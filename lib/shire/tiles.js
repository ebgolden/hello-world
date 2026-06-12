// Tile definitions for The Founding of the Shire (Carcassonne-like).
//
// Edges are listed [N, E, S, W]; each edge is 'road' | 'town' | 'grass'.
// `features` groups edge indices into the connected road/town segments
// drawn on that tile (two separate caps on one tile are two features;
// a "bridge" town joins opposite edges into one feature). `inn: true`
// marks a tile bearing an inn at its centre (a per-tile feature).

const G = 'grass';
const R = 'road';
const T = 'town';

export const TILE_TYPES = {
  'road-straight': {
    count: 8,
    label: 'a straight lane',
    edges: [G, R, G, R],
    features: [{ type: 'road', edges: [1, 3] }],
  },
  'road-curve': {
    count: 9,
    label: 'a bending lane',
    edges: [G, G, R, R],
    features: [{ type: 'road', edges: [2, 3] }],
  },
  'road-t': {
    count: 4,
    label: 'a three-way meeting of lanes',
    edges: [G, R, R, R],
    features: [
      { type: 'road', edges: [1] },
      { type: 'road', edges: [2] },
      { type: 'road', edges: [3] },
    ],
  },
  'road-cross': {
    count: 1,
    label: 'a great crossroads',
    edges: [R, R, R, R],
    features: [
      { type: 'road', edges: [0] },
      { type: 'road', edges: [1] },
      { type: 'road', edges: [2] },
      { type: 'road', edges: [3] },
    ],
  },
  inn: {
    count: 4,
    label: 'an inn among the meadows',
    edges: [G, G, G, G],
    features: [],
    inn: true,
  },
  'inn-road': {
    count: 2,
    label: 'an inn at a lane’s end',
    edges: [G, G, R, G],
    features: [{ type: 'road', edges: [2] }],
    inn: true,
  },
  'town-cap': {
    count: 5,
    label: 'a small homestead',
    edges: [T, G, G, G],
    features: [{ type: 'town', edges: [0] }],
  },
  'town-cap-straight': {
    count: 3,
    label: 'a homestead beside a straight lane',
    edges: [T, R, G, R],
    features: [
      { type: 'town', edges: [0] },
      { type: 'road', edges: [1, 3] },
    ],
  },
  'town-cap-curve': {
    count: 4,
    label: 'a homestead beside a bending lane',
    edges: [T, G, R, R],
    features: [
      { type: 'town', edges: [0] },
      { type: 'road', edges: [2, 3] },
    ],
  },
  'town-corner': {
    count: 4,
    label: 'a homestead on the corner',
    edges: [T, T, G, G],
    features: [{ type: 'town', edges: [0, 1] }],
  },
  'town-corner-road': {
    count: 3,
    label: 'a corner homestead with a lane',
    edges: [T, T, R, R],
    features: [
      { type: 'town', edges: [0, 1] },
      { type: 'road', edges: [2, 3] },
    ],
  },
  'town-bridge': {
    count: 4,
    label: 'a long row of smials',
    edges: [T, G, T, G],
    features: [{ type: 'town', edges: [0, 2] }],
  },
  'town-two-caps': {
    count: 3,
    label: 'two facing homesteads',
    edges: [T, G, T, G],
    features: [
      { type: 'town', edges: [0] },
      { type: 'town', edges: [2] },
    ],
  },
  'town-three': {
    count: 3,
    label: 'a sprawling homestead',
    edges: [T, T, G, T],
    features: [{ type: 'town', edges: [0, 1, 3] }],
  },
  'town-three-road': {
    count: 2,
    label: 'a sprawling homestead with a lane',
    edges: [T, T, R, T],
    features: [
      { type: 'town', edges: [0, 1, 3] },
      { type: 'road', edges: [2] },
    ],
  },
  'town-full': {
    count: 1,
    label: 'a whole hill of smials',
    edges: [T, T, T, T],
    features: [{ type: 'town', edges: [0, 1, 2, 3] }],
  },
};

// The pre-placed start tile: a homestead to the north, a lane running
// east to west. One copy of this type comes out of the deck.
export const START_TILE = 'town-cap-straight';

export function buildDeck() {
  const deck = [];
  for (const [id, t] of Object.entries(TILE_TYPES)) {
    const n = id === START_TILE ? t.count - 1 : t.count;
    for (let i = 0; i < n; i++) deck.push(id);
  }
  return deck;
}
