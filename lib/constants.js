export const RESOURCES = ['wood', 'clay', 'wool', 'grain', 'ore'];

export const RESOURCE_INFO = {
  wood: { name: 'Timber', icon: '🌲' },
  clay: { name: 'Clay', icon: '🧱' },
  wool: { name: 'Fleece', icon: '🐑' },
  grain: { name: 'Grain', icon: '🌾' },
  ore: { name: 'Mithril', icon: '💎' },
};

export const TERRAIN_INFO = {
  forest: { name: 'Fangorn Forest', resource: 'wood', fill: '#2d5a35' },
  hills: { name: 'Bree-land Hills', resource: 'clay', fill: '#9c5535' },
  pasture: { name: 'Shire Pastures', resource: 'wool', fill: '#86a83f' },
  fields: { name: 'Fields of the Pelennor', resource: 'grain', fill: '#d2a73e' },
  mountains: { name: 'Mines of Moria', resource: 'ore', fill: '#71717f' },
  desert: { name: 'The Dead Marshes', resource: null, fill: '#4a4440' },
};

export const FACTIONS = [
  { name: 'Gondor', color: '#d8dbe6' },
  { name: 'Rohan', color: '#5dba6c' },
  { name: 'Lothlórien', color: '#e8c34a' },
  { name: 'Erebor', color: '#e06a4a' },
];

export const COSTS = {
  road: { wood: 1, clay: 1 },
  settlement: { wood: 1, clay: 1, wool: 1, grain: 1 },
  city: { ore: 3, grain: 2 },
  dev: { wool: 1, grain: 1, ore: 1 },
};

export const PIECE_NAMES = {
  road: 'Road',
  settlement: 'Village',
  city: 'Stronghold',
  dev: 'Tale of Old',
};

export const DEV_INFO = {
  knight: {
    name: 'Rider of Rohan',
    desc: 'Drive off the Nazgûl: move it and steal a card. Counts toward the Mightiest Host.',
  },
  vp: {
    name: 'Palantír',
    desc: 'Worth 1 victory point.',
  },
  roads: {
    name: 'The Great East Road',
    desc: 'Build two roads for free.',
  },
  plenty: {
    name: "Galadriel's Gift",
    desc: 'Take any two resources from the bank.',
  },
  monopoly: {
    name: 'The One Ring',
    desc: 'Name a resource; all other players must surrender every card of it.',
  },
};

export const VP_TO_WIN = 10;
export const LONGEST_ROAD_NAME = 'Longest Road';
export const LARGEST_ARMY_NAME = 'Mightiest Host';
