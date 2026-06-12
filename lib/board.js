// Board generation and hex/vertex/edge geometry for the radius-2 hex map.

export const HEX_SIZE = 52;
const SQRT3 = Math.sqrt(3);

const TERRAIN_POOL = [
  'forest', 'forest', 'forest', 'forest',
  'hills', 'hills', 'hills',
  'pasture', 'pasture', 'pasture', 'pasture',
  'fields', 'fields', 'fields', 'fields',
  'mountains', 'mountains', 'mountains',
  'desert',
];

const TOKEN_POOL = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

// Four generic 3:1 harbors and one 2:1 harbor per resource.
const PORT_KINDS = ['any', 'any', 'any', 'any', 'wood', 'clay', 'wool', 'grain', 'ore'];

// Coastal edge offsets for the 9 harbors around the 30-edge perimeter
// (gaps of 3-3-4 keep harbor vertices from overlapping).
const PORT_OFFSETS = [0, 3, 6, 10, 13, 16, 20, 23, 26];

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function hexCenter(q, r) {
  return {
    x: HEX_SIZE * SQRT3 * (q + r / 2),
    y: HEX_SIZE * 1.5 * r,
  };
}

export function hexCorners(q, r) {
  const c = hexCenter(q, r);
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 180) * (60 * i + 30);
    pts.push({ x: c.x + HEX_SIZE * Math.cos(ang), y: c.y + HEX_SIZE * Math.sin(ang) });
  }
  return pts;
}

function vid(p) {
  return `${Math.round(p.x * 10)}_${Math.round(p.y * 10)}`;
}

export function generateBoard(rand = Math.random) {
  const hexes = [];
  const terrains = shuffle(TERRAIN_POOL, rand);
  const tokens = shuffle(TOKEN_POOL, rand);
  let i = 0;
  let t = 0;
  for (let q = -2; q <= 2; q++) {
    for (let r = -2; r <= 2; r++) {
      if (Math.abs(q + r) > 2) continue;
      const terrain = terrains[i];
      hexes.push({
        id: `h${i}`,
        q,
        r,
        terrain,
        token: terrain === 'desert' ? null : tokens[t++],
      });
      i++;
    }
  }
  const desert = hexes.find((h) => h.terrain === 'desert');
  return { hexes, robberHex: desert.id, ports: generatePorts(hexes, rand) };
}

// Walk the coastal edge cycle and drop harbors at fixed offsets.
function generatePorts(hexes, rand) {
  const geom = buildGeometry(hexes);
  const boundary = Object.values(geom.edges).filter((e) => e.hexCount === 1);
  const byVert = {};
  for (const e of boundary) {
    (byVert[e.a] = byVert[e.a] || []).push(e);
    (byVert[e.b] = byVert[e.b] || []).push(e);
  }
  const ordered = [];
  let cur = boundary[0];
  let v = cur.a;
  for (let i = 0; i < boundary.length; i++) {
    ordered.push(cur);
    v = cur.a === v ? cur.b : cur.a;
    cur = byVert[v].find((e) => e !== cur);
  }
  const kinds = shuffle(PORT_KINDS, rand);
  return PORT_OFFSETS.map((o, i) => ({
    verts: [ordered[o].a, ordered[o].b],
    kind: kinds[i],
  }));
}

// Derived geometry: vertices (settlement spots) and edges (road spots).
export function buildGeometry(hexes) {
  const vertices = {}; // vid -> { id, x, y, hexes: [hexId] }
  const edges = {}; // eid -> { id, a, b }
  const vertexEdges = {}; // vid -> [eid]

  for (const hex of hexes) {
    const corners = hexCorners(hex.q, hex.r);
    const ids = corners.map((p) => {
      const id = vid(p);
      if (!vertices[id]) vertices[id] = { id, x: p.x, y: p.y, hexes: [] };
      vertices[id].hexes.push(hex.id);
      return id;
    });
    for (let k = 0; k < 6; k++) {
      const a = ids[k];
      const b = ids[(k + 1) % 6];
      const eid = [a, b].sort().join('|');
      if (!edges[eid]) {
        edges[eid] = { id: eid, a, b, hexCount: 1 };
        (vertexEdges[a] = vertexEdges[a] || []).push(eid);
        (vertexEdges[b] = vertexEdges[b] || []).push(eid);
      } else {
        edges[eid].hexCount++;
      }
    }
  }

  const vertexNeighbors = {};
  for (const e of Object.values(edges)) {
    (vertexNeighbors[e.a] = vertexNeighbors[e.a] || []).push(e.b);
    (vertexNeighbors[e.b] = vertexNeighbors[e.b] || []).push(e.a);
  }

  return { vertices, edges, vertexEdges, vertexNeighbors };
}

export function edgeEndpoints(geom, eid) {
  const e = geom.edges[eid];
  return [geom.vertices[e.a], geom.vertices[e.b]];
}
