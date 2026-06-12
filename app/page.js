export const metadata = {
  title: 'Games of Middle-earth',
  description:
    'Fan-made Lord of the Rings themed strategy board games, playable in the browser: settlement building, world conquest, tile laying, deck building and more.',
};

const GAMES = [
  {
    href: '/settlers',
    title: 'Settlers of Middle-earth',
    blurb:
      'Gather Timber, Clay, Fleece, Grain and Mithril. Build roads, villages and strongholds, trade at the harbors, and beware the Nazgûl.',
    note: '2–4 players · settlement building',
  },
  {
    href: '/war',
    title: 'The War of the Ring',
    blurb:
      'Thirty-six territories, seven realms, one master. Muster your hosts, storm the gates of Mordor, and drive every rival banner from the map.',
    note: '2–4 players · world conquest',
  },
  {
    href: '/shadow',
    title: 'The Shadow Spreads',
    blurb:
      'Corruption seeps from Mordor, Isengard, Dol Guldur and Angmar. Stand together, cleanse the lands, and banish all four Shadows before Middle-earth falls.',
    note: '1–4 players · cooperative',
  },
  {
    href: '/hunt',
    title: 'The Hunt for the Ring',
    blurb:
      'Forty hidden pieces face forty more. March blind into battle, unmask the enemy ranks, and find the Ring-bearer before yours is found.',
    note: '2 players · hidden ranks',
  },
  {
    href: '/shire',
    title: 'The Founding of the Shire',
    blurb:
      'Lay the lanes, hedgerows and homesteads of the young Shire, tile by tile, and send your hobbits to claim the finest farms and inns.',
    note: '2–4 players · tile laying',
  },
  {
    href: '/journeys',
    title: 'There and Back Again',
    blurb:
      'Claim the roads between Hobbiton, Rivendell, Erebor and Mount Doom. Complete your secret journeys before your ponies run out.',
    note: '2–4 players · route building',
  },
  {
    href: '/pelennor',
    title: 'The Battle of the Pelennor',
    blurb:
      'The oldest war game of all, fought between the Free Peoples and the hosts of Mordor on the fields before Minas Tirith.',
    note: '2 players · chess',
  },
  {
    href: '/council',
    title: 'The Council of the Free Peoples',
    blurb:
      'Write your marching orders in secret, then watch every army move at once. Alliances are spoken; betrayals are written.',
    note: '2–4 players · simultaneous orders',
  },
  {
    href: '/beacons',
    title: 'The Beacon Hills',
    blurb:
      'Hidden encampments wait in the mountains. Scry the palantír, call down fire upon the grid, and burn the enemy camps before yours are found.',
    note: '2 players · hidden grids',
  },
  {
    href: '/leaves',
    title: 'The Leaves of Lórien',
    blurb:
      'Begin with humble lembas and a dream. Draft allies, artifacts and deeds into your deck and grow your realm card by card.',
    note: '1–4 players · deck building',
  },
];

export default function Home() {
  return (
    <div className="app">
      <div className="lobby" style={{ maxWidth: 1100 }}>
        <h1 className="title">GAMES OF MIDDLE-EARTH</h1>
        <p className="subtitle">Ten boards to rule them all</p>
        <div className="games-grid">
          {GAMES.map((g) => (
            <a key={g.href} href={g.href} className="game-card">
              <h2>{g.title}</h2>
              <p>{g.blurb}</p>
              <span className="game-note">{g.note}</span>
            </a>
          ))}
        </div>
        <p className="lobby-note">
          Fan-made hot-seat games inspired by classic strategy board games and the world of
          J.R.R. Tolkien. Not affiliated with Catan GmbH, Hasbro, or Middle-earth Enterprises.
        </p>
      </div>
    </div>
  );
}
