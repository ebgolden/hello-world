// Map data for "There and Back Again" — a route-building journey across
// Middle-earth. Places, roads, and journey (ticket) cards. Pure data so the
// engine and the board component can both consume it.

export const MAP_W = 960;
export const MAP_H = 620;

export const PLACES = [
  { id: 0, name: 'Grey Havens', x: 60, y: 150 },
  { id: 1, name: 'Hobbiton', x: 175, y: 130 },
  { id: 2, name: 'Bree', x: 280, y: 145 },
  { id: 3, name: 'Rivendell', x: 430, y: 130 },
  { id: 4, name: 'Esgaroth', x: 700, y: 95 },
  { id: 5, name: 'Erebor', x: 790, y: 60 },
  { id: 6, name: 'Rhûn', x: 880, y: 180 },
  { id: 7, name: 'Tharbad', x: 260, y: 270 },
  { id: 8, name: 'Moria', x: 455, y: 235 },
  { id: 9, name: 'Lórien', x: 540, y: 280 },
  { id: 10, name: 'Dol Guldur', x: 640, y: 250 },
  { id: 11, name: 'Isengard', x: 390, y: 370 },
  { id: 12, name: "Helm's Deep", x: 390, y: 455 },
  { id: 13, name: 'Edoras', x: 470, y: 430 },
  { id: 14, name: 'Minas Tirith', x: 620, y: 460 },
  { id: 15, name: 'Osgiliath', x: 690, y: 445 },
  { id: 16, name: 'Barad-dûr', x: 830, y: 400 },
  { id: 17, name: 'Pelargir', x: 610, y: 545 },
  { id: 18, name: 'Dol Amroth', x: 415, y: 555 },
  { id: 19, name: 'Umbar', x: 520, y: 610 },
];

// Roads. color: red | green | blue | gold | grey ('any' — claim with one
// colour of your choice, plus Eagles).
export const ROUTES = [
  { id: 0, a: 0, b: 1, len: 2, color: 'grey' },
  { id: 1, a: 1, b: 2, len: 1, color: 'green' },
  { id: 2, a: 2, b: 3, len: 3, color: 'blue' },
  { id: 3, a: 2, b: 7, len: 2, color: 'gold' },
  { id: 4, a: 0, b: 7, len: 4, color: 'blue' },
  { id: 5, a: 3, b: 8, len: 2, color: 'red' },
  { id: 6, a: 8, b: 9, len: 1, color: 'grey' },
  { id: 7, a: 9, b: 10, len: 2, color: 'red' },
  { id: 8, a: 3, b: 4, len: 4, color: 'green' },
  { id: 9, a: 4, b: 5, len: 1, color: 'gold' },
  { id: 10, a: 5, b: 6, len: 3, color: 'red' },
  { id: 11, a: 4, b: 10, len: 3, color: 'grey' },
  { id: 12, a: 10, b: 6, len: 4, color: 'blue' },
  { id: 13, a: 7, b: 8, len: 3, color: 'green' },
  { id: 14, a: 7, b: 11, len: 3, color: 'red' },
  { id: 15, a: 11, b: 12, len: 1, color: 'grey' },
  { id: 16, a: 12, b: 13, len: 1, color: 'blue' },
  { id: 17, a: 11, b: 13, len: 2, color: 'gold' },
  { id: 18, a: 13, b: 9, len: 3, color: 'blue' },
  { id: 19, a: 13, b: 14, len: 3, color: 'green' },
  { id: 20, a: 14, b: 15, len: 1, color: 'red' },
  { id: 21, a: 15, b: 16, len: 4, color: 'red' },
  { id: 22, a: 10, b: 16, len: 6, color: 'grey' },
  { id: 23, a: 6, b: 16, len: 5, color: 'gold' },
  { id: 24, a: 14, b: 17, len: 2, color: 'gold' },
  { id: 25, a: 17, b: 15, len: 2, color: 'blue' },
  { id: 26, a: 17, b: 18, len: 2, color: 'green' },
  { id: 27, a: 18, b: 19, len: 3, color: 'blue' },
  { id: 28, a: 17, b: 19, len: 3, color: 'red' },
  { id: 29, a: 12, b: 18, len: 3, color: 'grey' },
  { id: 30, a: 8, b: 10, len: 3, color: 'gold' },
  { id: 31, a: 7, b: 12, len: 4, color: 'green' },
];

// Journey cards: complete a connected path of your own claimed roads between
// the two places to score the points (or lose them if you fail).
export const TICKETS = [
  { from: 1, to: 5, points: 16 }, // Hobbiton — Erebor: there and back again
  { from: 0, to: 3, points: 8 }, // Grey Havens — Rivendell
  { from: 2, to: 14, points: 13 }, // Bree — Minas Tirith
  { from: 1, to: 16, points: 20 }, // Hobbiton — Barad-dûr
  { from: 0, to: 14, points: 15 }, // Grey Havens — Minas Tirith
  { from: 3, to: 9, points: 6 }, // Rivendell — Lórien
  { from: 4, to: 10, points: 5 }, // Esgaroth — Dol Guldur
  { from: 11, to: 16, points: 12 }, // Isengard — Barad-dûr
  { from: 13, to: 5, points: 14 }, // Edoras — Erebor
  { from: 7, to: 17, points: 10 }, // Tharbad — Pelargir
  { from: 8, to: 14, points: 9 }, // Moria — Minas Tirith
  { from: 5, to: 19, points: 20 }, // Erebor — Umbar
  { from: 6, to: 12, points: 17 }, // Rhûn — Helm's Deep
  { from: 18, to: 15, points: 6 }, // Dol Amroth — Osgiliath
];

// Muted parchment-friendly tones for unclaimed roads and the pony cards.
export const ROUTE_COLORS = {
  red: '#a04434',
  green: '#5e7d44',
  blue: '#4f6b88',
  gold: '#b08c2e',
  grey: '#8a7a5e',
};
