# Games of Middle-earth 💍

Fan-made Lord of the Rings–themed strategy board games, playable in the browser as hot-seat
games. Built with Next.js and deployed on Vercel.

- **`/settlers` — Settlers of Middle-earth**: a Catan-style settlement-building game.
- **`/war` — The War of the Ring**: a Risk-style world-conquest game across 36 territories
  of Middle-earth in 7 realms. Muster armies (more for whole realms), trade banner cards for
  escalating reinforcements, fight 3v2 dice battles (with blitz), make one fortifying march
  per turn, and eliminate every rival. Mordor can only be entered by the Black Gate, the pass
  of Minas Morgul, or out of the east — and the Corsair sea-routes link Umbar and Lindon to
  Dol Amroth.
- **`/shadow` — The Shadow Spreads**: a Pandemic-style cooperative game; cleanse the
  corruption flowing from Mordor, Isengard, Dol Guldur and Angmar and banish all four Shadows.
- **`/hunt` — The Hunt for the Ring**: a Stratego-style hidden-rank battle; find the enemy
  Ring-bearer before yours is found.
- **`/shire` — The Founding of the Shire**: a Carcassonne-style tile-layer; build lanes,
  homesteads and inns and claim them with your hobbits.
- **`/journeys` — There and Back Again**: a Ticket to Ride-style route builder across
  Middle-earth; complete your secret journeys before the ponies run out.
- **`/pelennor` — The Battle of the Pelennor**: chess between the Free Peoples and Mordor.
- **`/council` — The Council of the Free Peoples**: a Diplomacy-style game of simultaneous
  secret orders, supports, and betrayal.
- **`/beacons` — The Beacon Hills**: a Battleship-style palantír duel over hidden mountain
  encampments.
- **`/leaves` — The Leaves of Lórien**: a Dominion-style deck-builder of allies, artifacts
  and deeds.

## Settlers of Middle-earth — how to play

- **Resources:** Timber 🌲 (Fangorn Forest), Clay 🧱 (Bree-land Hills), Fleece 🐑 (Shire
  Pastures), Grain 🌾 (Fields of the Pelennor), Mithril 💎 (Mines of Moria).
- **Setup:** each realm places two villages and two roads (snake order). Your second village
  grants its adjacent resources.
- **On your turn:** roll the dice — every hex with that number pays its adjacent villages
  (1 card) and strongholds (2 cards). A roll of **7** summons the **Nazgûl** 👁: every realm
  holding more than 7 cards loses half, and you move the Nazgûl to block a hex and steal a card.
- **Build:** roads (1🌲 1🧱), villages (1🌲 1🧱 1🐑 1🌾), strongholds (3💎 2🌾), and
  Tales of Old (1🐑 1🌾 1💎) — development cards including Riders of Rohan, the Palantír,
  the Great East Road, Galadriel's Gift, and the One Ring.
- **Trade** with the bank at 4:1 — or better through the 9 coastal **harbors**: a village on a
  3:1 harbor trades any resource at 3:1, and each resource has one 2:1 harbor.
- **Bonuses:** Longest Road (5+ road chain, 2⭐) and the Mightiest Host (3+ Riders, 2⭐).
- **Win:** first realm to **10 victory points** unites Middle-earth.

## Development

```bash
npm install
npm run dev
```

## Deployment

The app is a standard Next.js project and deploys to Vercel with zero configuration.

---

*A fan project. Not affiliated with or endorsed by Catan GmbH or Middle-earth Enterprises.*
