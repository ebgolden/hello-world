# Games of Middle-earth 💍

Fan-made Lord of the Rings–themed strategy board games, playable in the browser as hot-seat
games for 2–4 players. Built with Next.js and deployed on Vercel.

- **`/settlers` — Settlers of Middle-earth**: a Catan-style settlement-building game.
- **`/war` — The War of the Ring**: a Risk-style world-conquest game across 36 territories
  of Middle-earth in 7 realms. Muster armies (more for whole realms), trade banner cards for
  escalating reinforcements, fight 3v2 dice battles (with blitz), make one fortifying march
  per turn, and eliminate every rival. Mordor can only be entered by the Black Gate, the pass
  of Minas Morgul, or out of the east — and the Corsair sea-routes link Umbar and Lindon to
  Dol Amroth.

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
