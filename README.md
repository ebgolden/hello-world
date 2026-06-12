# Settlers of Middle-earth 💍

A Lord of the Rings–themed, Catan-style settlement-building strategy game, playable in the
browser as a hot-seat game for 2–4 players. Built with Next.js and deployed on Vercel.

## How to play

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
- **Trade** with the bank at 4:1.
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
