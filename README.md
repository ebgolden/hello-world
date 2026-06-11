# E.K. Wise — Author Site Redesign

A redesign of [ekwise.com](https://ekwise.com), the official author site for
**E.K. Wise** and her debut YA fantasy novel, *Keepers of the Rock: The Debilis
Rising*.

## Design

The theme is drawn straight from the book cover: **crimson darkness, gold
lettering, and crystal-blue light**, with faceted crystal motifs and angled
"strata" section dividers. Typography uses the brand's own fonts, self-hosted
from the original site: **Sveva** (display), **Libre Caslon Text** (serif),
and **Urbanist** (body).

All artwork is the real thing, pulled from ekwise.com: the book cover, the
nine Keeper dossier portraits by Brett Casaños, the E.K. Wise coin logo,
award seals, the Amazon badge, and the author photo.

## Structure

Plain static site — no build step required:

- `index.html` — single-page layout: hero, the novel, meet the Keepers,
  about the author, newsletter, contact/footer
- `styles.css` — all theming (palette defined as CSS variables in `:root`)
- `script.js` — mobile nav + scroll-reveal animations
- `images/` — cover, Keeper portraits, logo, seals, author photo
- `fonts/` — Sveva, Libre Caslon Text, Urbanist
- `favicon.svg`

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Remaining placeholder

- **Newsletter form** — point the form `action` at your email provider
  (Mailchimp, MailerLite, etc.)
