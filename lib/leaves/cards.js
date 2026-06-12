// Card definitions for The Leaves of Lórien (deck-builder).
// Pure data; the engine and UI both read from here.

export const CARDS = {
  // Treasures
  lembas: {
    name: 'Lembas', type: 'treasure', cost: 0, gold: 1,
    icon: 'wheat', text: '+1 gold',
  },
  mithril: {
    name: 'Mithril Shard', type: 'treasure', cost: 3, gold: 2,
    icon: 'gems', text: '+2 gold',
  },
  arkenstone: {
    name: 'Arkenstone', type: 'treasure', cost: 6, gold: 3,
    icon: 'crystal', text: '+3 gold',
  },

  // Victory & curse
  glade: { name: 'Glade', type: 'victory', cost: 2, vp: 1, icon: 'grass', text: '1 leaf' },
  haven: { name: 'Haven', type: 'victory', cost: 5, vp: 3, icon: 'hearttower', text: '3 leaves' },
  realm: { name: 'Realm', type: 'victory', cost: 8, vp: 6, icon: 'castle', text: '6 leaves' },
  shadow: { name: 'Shadow', type: 'curse', cost: 0, vp: -1, icon: 'spectre', text: '−1 leaf' },

  // Kingdom actions
  village: {
    name: 'Hobbit Village', type: 'action', cost: 3, cards: 1, actions: 2,
    icon: 'village', text: '+1 card, +2 actions',
  },
  forge: {
    name: 'Forge of Erebor', type: 'action', cost: 4, cards: 3,
    icon: 'claybrick', text: '+3 cards',
  },
  market: {
    name: 'Market of Bree', type: 'action', cost: 5, cards: 1, actions: 1, buys: 1, gold: 1,
    icon: 'coins', text: '+1 card, +1 action, +1 buy, +1 gold',
  },
  feast: {
    name: 'Feast of Yule', type: 'action', cost: 5, actions: 2, buys: 1, gold: 2,
    icon: 'sheep', text: '+2 actions, +1 buy, +2 gold',
  },
  study: {
    name: 'Study of Elrond', type: 'action', cost: 5, cards: 2, actions: 1,
    icon: 'scroll', text: '+2 cards, +1 action',
  },
  woodmen: {
    name: 'Woodmen of Mirkwood', type: 'action', cost: 3, buys: 1, gold: 2,
    icon: 'pine', text: '+1 buy, +2 gold',
  },
  raid: {
    name: 'Orc Raid', type: 'action', cost: 4, gold: 2, attack: 'discard',
    icon: 'crossedswords', text: '+2 gold; foes discard down to 3',
  },
  nazgul: {
    name: 'Nazgûl', type: 'action', cost: 5, cards: 2, attack: 'shadow',
    icon: 'wolf', text: '+2 cards; foes gain a Shadow',
  },
  reforge: {
    name: 'Reforging', type: 'action', cost: 4, special: 'reforge',
    icon: 'sword', text: 'Trash a card; gain one costing up to 2 more',
  },
  havens: {
    name: 'Grey Havens', type: 'action', cost: 2, special: 'havens',
    icon: 'sailboat', text: 'Trash up to 4 cards from your hand',
  },
};

export const TREASURE_KEYS = ['lembas', 'mithril', 'arkenstone'];
export const VICTORY_KEYS = ['glade', 'haven', 'realm', 'shadow'];
export const KINGDOM_KEYS = [
  'havens', 'village', 'woodmen', 'forge', 'raid', 'reforge',
  'market', 'feast', 'study', 'nazgul',
];

// Display order for the supply.
export const SUPPLY_ORDER = [...TREASURE_KEYS, ...VICTORY_KEYS, ...KINGDOM_KEYS];
