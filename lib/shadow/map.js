// Static map for The Shadow Spreads (a Pandemic-style co-op set in
// Middle-earth). 24 locations across four Shadow fronts, hand-placed on a
// parchment chart. Pure static data so plain node tests need no packages.

export const MAP_W = 760;
export const MAP_H = 640;

// Front order is fixed: 0 Mordor (red), 1 Isengard (grey), 2 Dol Guldur
// (green), 3 Angmar (blue). Each front has one Haven where it is banished.
export const FRONTS = [
  { key: 'mordor', name: 'Mordor', color: '#9c2a18', haven: 'Minas Tirith' },
  { key: 'isengard', name: 'Isengard', color: '#7a7d85', haven: "Helm's Deep" },
  { key: 'dolguldur', name: 'Dol Guldur', color: '#4d6b3a', haven: 'Lórien' },
  { key: 'angmar', name: 'Angmar', color: '#4a6e8e', haven: 'Rivendell' },
];

// [name, front, x, y]
const LOCS = [
  // Angmar's front: the north.
  ['Grey Havens', 3, 62, 152],
  ['Hobbiton', 3, 176, 172],
  ['Bree', 3, 281, 149],
  ['Fornost', 3, 257, 71],
  ['Carn Dûm', 3, 383, 41],
  ['Rivendell', 3, 409, 153],
  // Dol Guldur's front: the wilds east of the mountains.
  ['Carrock', 2, 489, 119],
  ['Erebor', 2, 601, 57],
  ['Esgaroth', 2, 673, 123],
  ['Mirkwood', 2, 577, 191],
  ['Dol Guldur', 2, 561, 277],
  ['Lórien', 2, 479, 323],
  // Isengard's front: the west and the gap of the mountains.
  ['Tharbad', 1, 263, 261],
  ['Moria', 1, 399, 247],
  ['Dunland', 1, 291, 351],
  ['Isengard', 1, 347, 417],
  ["Helm's Deep", 1, 331, 503],
  ['Edoras', 1, 446, 489],
  // Mordor's front: the south and east.
  ['Rhûn', 0, 689, 267],
  ['Barad-dûr', 0, 701, 453],
  ['Minas Morgul', 0, 653, 537],
  ['Osgiliath', 0, 576, 547],
  ['Minas Tirith', 0, 521, 567],
  ['Pelargir', 0, 457, 613],
];

const LINK_NAMES = [
  ['Grey Havens', 'Hobbiton'],
  ['Hobbiton', 'Bree'],
  ['Hobbiton', 'Tharbad'],
  ['Bree', 'Fornost'],
  ['Bree', 'Rivendell'],
  ['Bree', 'Tharbad'],
  ['Fornost', 'Carn Dûm'],
  ['Carn Dûm', 'Rivendell'],
  ['Rivendell', 'Carrock'],
  ['Rivendell', 'Moria'],
  ['Carrock', 'Erebor'],
  ['Carrock', 'Mirkwood'],
  ['Erebor', 'Esgaroth'],
  ['Esgaroth', 'Mirkwood'],
  ['Esgaroth', 'Rhûn'],
  ['Mirkwood', 'Dol Guldur'],
  ['Dol Guldur', 'Lórien'],
  ['Lórien', 'Moria'],
  ['Lórien', 'Edoras'],
  ['Tharbad', 'Dunland'],
  ['Dunland', 'Moria'],
  ['Dunland', 'Isengard'],
  ['Isengard', "Helm's Deep"],
  ['Isengard', 'Edoras'],
  ["Helm's Deep", 'Edoras'],
  ['Edoras', 'Minas Tirith'],
  ['Minas Tirith', 'Osgiliath'],
  ['Minas Tirith', 'Pelargir'],
  ['Pelargir', 'Osgiliath'],
  ['Osgiliath', 'Minas Morgul'],
  ['Minas Morgul', 'Barad-dûr'],
  ['Barad-dûr', 'Rhûn'],
];

export const LOCATIONS = LOCS.map(([name, front, x, y], id) => ({ id, name, front, x, y }));

const nameToId = new Map(LOCATIONS.map((l) => [l.name, l.id]));

// Index pairs, for drawing the ink roads.
export const LINKS = LINK_NAMES.map(([a, b]) => [nameToId.get(a), nameToId.get(b)]);

export const NEIGHBORS = LOCATIONS.map(() => []);
for (const [a, b] of LINKS) {
  NEIGHBORS[a].push(b);
  NEIGHBORS[b].push(a);
}

// HAVENS[front] = location id of that front's Haven.
export const HAVENS = FRONTS.map((f) => nameToId.get(f.haven));

export const START_LOCATION = nameToId.get('Rivendell');
