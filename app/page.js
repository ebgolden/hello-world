export const metadata = {
  title: 'Games of Middle-earth',
  description:
    'Fan-made Lord of the Rings themed strategy board games, playable in the browser: Settlers of Middle-earth and The War of the Ring.',
};

const GAMES = [
  {
    href: '/settlers',
    title: 'Settlers of Middle-earth',
    blurb:
      'Gather Timber, Clay, Fleece, Grain and Mithril. Build roads, villages and strongholds, trade at the harbors, and beware the Nazgûl. First realm to 10 victory points unites Middle-earth.',
    note: '2–4 players · hot-seat · settlement building',
  },
  {
    href: '/war',
    title: 'The War of the Ring',
    blurb:
      'Thirty-six territories, seven realms, one master. Muster your hosts, trade banner cards, storm the gates of Mordor, and drive every rival banner from the map.',
    note: '2–4 players · hot-seat · world conquest',
  },
];

export default function Home() {
  return (
    <div className="app">
      <div className="lobby" style={{ maxWidth: 900 }}>
        <h1 className="title">GAMES OF MIDDLE-EARTH</h1>
        <p className="subtitle">Two boards to rule them all</p>
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
