export const RESOURCES = ['wood', 'clay', 'wool', 'grain', 'ore'];

export const RESOURCE_INFO = {
  wood: { name: 'Timber', icon: 'woodpile', color: '#7cb86b' },
  clay: { name: 'Clay', icon: 'claybrick', color: '#cf7a4e' },
  wool: { name: 'Fleece', icon: 'sheep', color: '#e9e2cf' },
  grain: { name: 'Grain', icon: 'wheat', color: '#e5bd55' },
  ore: { name: 'Mithril', icon: 'gems', color: '#a8cbe8' },
};

export const TERRAIN_INFO = {
  forest: {
    name: 'Fangorn Forest',
    resource: 'wood',
    fill: '#2d5a35',
    grad: ['#3f7a4a', '#1f4128'],
  },
  hills: {
    name: 'Bree-land Hills',
    resource: 'clay',
    fill: '#9c5535',
    grad: ['#bb6e42', '#763d20'],
  },
  pasture: {
    name: 'Shire Pastures',
    resource: 'wool',
    fill: '#86a83f',
    grad: ['#9cbf55', '#647f31'],
  },
  fields: {
    name: 'Fields of the Pelennor',
    resource: 'grain',
    fill: '#d2a73e',
    grad: ['#e2bb52', '#a8842c'],
  },
  mountains: {
    name: 'Mines of Moria',
    resource: 'ore',
    fill: '#71717f',
    grad: ['#8a8a98', '#50505a'],
  },
  desert: {
    name: 'The Dead Marshes',
    resource: null,
    fill: '#4a4440',
    grad: ['#5d564e', '#332e29'],
  },
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
