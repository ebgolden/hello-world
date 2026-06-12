// Middle-earth campaign map for the War of the Ring (Risk-style) game.
// Territories are Voronoi provinces around hand-placed seed points; adjacency
// comes from the Delaunay triangulation, minus mountain walls and plus sea routes.

import { Delaunay } from 'd3-delaunay';

export const MAP_W = 960;
export const MAP_H = 680;

export const REALMS = {
  eriador: { name: 'Eriador', bonus: 4, wash: '#b7c98a', ink: '#4d5e26' },
  wilderland: { name: 'Wilderland', bonus: 4, wash: '#93b07a', ink: '#33492a' },
  vales: { name: 'Vales of Anduin', bonus: 4, wash: '#c2b694', ink: '#5c5232' },
  rohan: { name: 'Rohan', bonus: 3, wash: '#ddc983', ink: '#7c5c14' },
  gondor: { name: 'Gondor', bonus: 4, wash: '#aebccb', ink: '#3e4f60' },
  mordor: { name: 'Mordor', bonus: 4, wash: '#bd9078', ink: '#6e3520' },
  harad: { name: 'Rhûn & Harad', bonus: 3, wash: '#cba96e', ink: '#7a5a1c' },
};

// [name, realm, x, y]
const TERRITORIES = [
  ['Lindon', 'eriador', 75, 195],
  ['The Shire', 'eriador', 185, 215],
  ['Bree-land', 'eriador', 270, 185],
  ['North Downs', 'eriador', 255, 105],
  ['The Trollshaws', 'eriador', 360, 150],
  ['Eregion', 'eriador', 330, 265],
  ['The Carrock', 'wilderland', 475, 150],
  ['Mirkwood North', 'wilderland', 565, 120],
  ['Mirkwood South', 'wilderland', 575, 240],
  ['Esgaroth', 'wilderland', 655, 150],
  ['Erebor', 'wilderland', 655, 65],
  ['Iron Hills', 'wilderland', 790, 75],
  ['The High Pass', 'vales', 440, 215],
  ['Gladden Fields', 'vales', 495, 280],
  ['Moria', 'vales', 405, 310],
  ['Lothlórien', 'vales', 500, 345],
  ['Fangorn', 'vales', 455, 410],
  ['The Brown Lands', 'vales', 600, 330],
  ['Dunland', 'rohan', 310, 370],
  ['The Westfold', 'rohan', 385, 475],
  ['Edoras', 'rohan', 470, 480],
  ['The Eastfold', 'rohan', 555, 455],
  ['Dol Amroth', 'gondor', 340, 585],
  ['Lebennin', 'gondor', 450, 575],
  ['Anórien', 'gondor', 520, 510],
  ['Minas Tirith', 'gondor', 560, 550],
  ['Ithilien', 'gondor', 620, 585],
  ['Udûn', 'mordor', 675, 475],
  ['Minas Morgul', 'mordor', 680, 560],
  ['Gorgoroth', 'mordor', 745, 560],
  ['Barad-dûr', 'mordor', 765, 480],
  ['Nurn', 'mordor', 835, 600],
  ['Rhûn', 'harad', 810, 240],
  ['Khand', 'harad', 890, 490],
  ['Near Harad', 'harad', 740, 650],
  ['Umbar', 'harad', 575, 635],
];

// Impassable walls (mountain ranges and the fences of Mordor), by name.
const BARRIERS = [
  // The Misty Mountains: cross only at the High Pass or through Moria.
  ['The Trollshaws', 'The Carrock'],
  ['Eregion', 'Gladden Fields'],
  ['Eregion', 'The High Pass'],
  // The White Mountains divide Gondor from the plains except at the road.
  ['The Westfold', 'Dol Amroth'],
  ['The Westfold', 'Lebennin'],
  ['Edoras', 'Lebennin'],
  // Mordor's mountain fences: enter only by the Black Gate (Udûn),
  // the pass of Minas Morgul, or out of the east.
  ['Ithilien', 'Gorgoroth'],
  ['Rhûn', 'Barad-dûr'],
  ['The Brown Lands', 'Barad-dûr'],
  ['Minas Morgul', 'Lebennin'],
  // The Grey Mountains close the far north; Wilderland is reached
  // around or over the Misty Mountains, not across them.
  ['North Downs', 'Erebor'],
  ['North Downs', 'Mirkwood North'],
  ['North Downs', 'The Carrock'],
  // Coastal contacts that only meet out at sea become dashed sea routes.
  ['Lindon', 'Dunland'],
  ['Dunland', 'Dol Amroth'],
  ['Lindon', 'Dol Amroth'],
  ['Umbar', 'Dol Amroth'],
  ['Minas Tirith', 'Umbar'],
];

// Sea and long-road routes, drawn as dashed crossings.
const EXTRA_LINKS = [
  ['Umbar', 'Dol Amroth'], // the Corsair coast
  ['Lindon', 'Dol Amroth'], // the long sea-road from the Grey Havens
];

// The coastline of Middle-earth; provinces are clipped to this outline.
export const COAST = [
  [30, 40], [400, 22], [930, 25], [945, 300], [945, 650],
  [760, 665], [600, 668], [520, 648], [470, 620], [430, 645],
  [300, 650], [210, 600], [140, 500], [90, 400], [48, 300], [22, 180],
];

let cached = null;

export function buildRiskMap() {
  if (cached) return cached;
  const points = TERRITORIES.map(([, , x, y]) => [x, y]);
  const delaunay = Delaunay.from(points);
  const voronoi = delaunay.voronoi([0, 0, MAP_W, MAP_H]);

  const territories = TERRITORIES.map(([name, realm, x, y], i) => ({
    id: i,
    name,
    realm,
    x,
    y,
    cell: voronoi.cellPolygon(i),
  }));

  const nameToId = new Map(territories.map((t) => [t.name, t.id]));
  const blocked = new Set(
    BARRIERS.map(([a, b]) => [nameToId.get(a), nameToId.get(b)].sort((x, y) => x - y).join('-'))
  );

  const neighbors = territories.map(() => new Set());
  for (let i = 0; i < territories.length; i++) {
    for (const j of delaunay.neighbors(i)) {
      const key = [i, j].sort((x, y) => x - y).join('-');
      if (blocked.has(key)) continue;
      neighbors[i].add(j);
      neighbors[j].add(i);
    }
  }
  const extraLinks = [];
  for (const [a, b] of EXTRA_LINKS) {
    const i = nameToId.get(a);
    const j = nameToId.get(b);
    if (!neighbors[i].has(j)) extraLinks.push([i, j]);
    neighbors[i].add(j);
    neighbors[j].add(i);
  }

  const realmTerritories = {};
  for (const t of territories) (realmTerritories[t.realm] = realmTerritories[t.realm] || []).push(t.id);

  cached = {
    territories,
    neighbors: neighbors.map((s) => [...s]),
    extraLinks,
    realmTerritories,
  };
  return cached;
}
