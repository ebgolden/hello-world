export const RESOURCES = ['wood', 'clay', 'wool', 'grain', 'ore'];

export const RESOURCE_INFO = {
  wood: { name: 'Timber', icon: 'woodpile', color: '#41682f' },
  clay: { name: 'Clay', icon: 'claybrick', color: '#9c4b24' },
  wool: { name: 'Fleece', icon: 'sheep', color: '#7b6b4a' },
  grain: { name: 'Grain', icon: 'wheat', color: '#9a7414' },
  ore: { name: 'Mithril', icon: 'gems', color: '#41617e' },
};

export const TERRAIN_INFO = {
  forest: {
    name: 'Fangorn Forest',
    resource: 'wood',
    fill: '#8fae74',
    grad: ['#94b378', '#6f9156'],
    ink: '#2f4527',
  },
  hills: {
    name: 'Bree-land Hills',
    resource: 'clay',
    fill: '#c79468',
    grad: ['#cd9c70', '#a97546'],
    ink: '#5e3115',
  },
  pasture: {
    name: 'Shire Pastures',
    resource: 'wool',
    fill: '#b5c882',
    grad: ['#bccd8b', '#97ac64'],
    ink: '#46571f',
  },
  fields: {
    name: 'Fields of the Pelennor',
    resource: 'grain',
    fill: '#e0cb84',
    grad: ['#e4d08c', '#c6ac5e'],
    ink: '#7c5c14',
  },
  mountains: {
    name: 'Mines of Moria',
    resource: 'ore',
    fill: '#b3ada1',
    grad: ['#bab4a8', '#968f82'],
    ink: '#45403a',
  },
  desert: {
    name: 'The Dead Marshes',
    resource: null,
    fill: '#b9ab86',
    grad: ['#b4a67f', '#94865f'],
    ink: '#4a4031',
  },
};

export const FACTIONS = [
  { name: 'Gondor', color: '#5a6b80' },
  { name: 'Rohan', color: '#3e7d44' },
  { name: 'Lothlórien', color: '#a8821e' },
  { name: 'Erebor', color: '#a03d24' },
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
