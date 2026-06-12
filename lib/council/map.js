// Static map for The Council of the Free Peoples (a Diplomacy-style game of
// simultaneous secret orders). 16 provinces, 12 of them strongholds (supply
// centers); each power begins on its two home strongholds. Pure static data.

export const MAP_W = 760;
export const MAP_H = 620;

export const POWERS = [
  { name: 'Gondor', color: '#5a6b80', home: ['Minas Tirith', 'Osgiliath'] },
  { name: 'Mordor', color: '#9c2a18', home: ['Barad-dûr', 'Minas Morgul'] },
  { name: 'Rohan', color: '#3e7d44', home: ['Edoras', "Helm's Deep"] },
  { name: 'Isengard', color: '#7a5f9c', home: ['Isengard', 'Dunland'] },
];

// [name, isCenter, x, y]
const PROVS = [
  ['Eriador', false, 143, 161],
  ['Rivendell', true, 301, 98],
  ['Moria', true, 372, 193],
  ['Lórien', true, 463, 243],
  ['Rhûn', true, 649, 177],
  ['Dunland', true, 219, 283],
  ['Isengard', true, 311, 321],
  ['Fangorn', false, 423, 327],
  ['Gap of Rohan', false, 329, 413],
  ["Helm's Deep", true, 257, 451],
  ['Edoras', true, 433, 437],
  ['Minas Tirith', true, 471, 527],
  ['Osgiliath', true, 557, 503],
  ['Ithilien', false, 621, 561],
  ['Minas Morgul', true, 647, 469],
  ['Barad-dûr', true, 683, 377],
];

const EDGE_NAMES = [
  ['Eriador', 'Rivendell'],
  ['Eriador', 'Dunland'],
  ['Rivendell', 'Moria'],
  ['Moria', 'Lórien'],
  ['Moria', 'Dunland'],
  ['Lórien', 'Fangorn'],
  ['Lórien', 'Rhûn'],
  ['Rhûn', 'Barad-dûr'],
  ['Dunland', 'Isengard'],
  ['Dunland', 'Gap of Rohan'],
  ['Isengard', 'Fangorn'],
  ['Isengard', 'Gap of Rohan'],
  ['Fangorn', 'Edoras'],
  ['Gap of Rohan', "Helm's Deep"],
  ['Gap of Rohan', 'Edoras'],
  ["Helm's Deep", 'Edoras'],
  ['Edoras', 'Minas Tirith'],
  ['Minas Tirith', 'Osgiliath'],
  ['Minas Tirith', 'Ithilien'],
  ['Osgiliath', 'Ithilien'],
  ['Osgiliath', 'Minas Morgul'],
  ['Ithilien', 'Minas Morgul'],
  ['Minas Morgul', 'Barad-dûr'],
];

export const PROVINCES = PROVS.map(([name, center, x, y], id) => ({ id, name, center, x, y }));

const nameToId = new Map(PROVINCES.map((p) => [p.name, p.id]));

export const EDGES = EDGE_NAMES.map(([a, b]) => [nameToId.get(a), nameToId.get(b)]);

export const NEIGHBORS = PROVINCES.map(() => []);
for (const [a, b] of EDGES) {
  NEIGHBORS[a].push(b);
  NEIGHBORS[b].push(a);
}

export const CENTER_IDS = PROVINCES.filter((p) => p.center).map((p) => p.id);

// HOME_CENTERS[powerIdx] = [provId, provId]
export const HOME_CENTERS = POWERS.map((p) => p.home.map((n) => nameToId.get(n)));

// Convenience shape passed to engine helpers (validOrders).
export const COUNCIL_MAP = {
  provinces: PROVINCES,
  neighbors: NEIGHBORS,
  edges: EDGES,
  centerIds: CENTER_IDS,
  homeCenters: HOME_CENTERS,
};
