# E.K. Wise — Author Site Redesign

A redesign of [ekwise.com](https://ekwise.com), the official author site for
**E.K. Wise** and her debut YA fantasy novel, *Keepers of the Rock: The Debilis
Rising*.

## Design

The theme is drawn from the book itself: geology, crystals, and an ancient
order protecting a dying Earth. The look is a dark **"geode" aesthetic** —
deep earthen darkness lit by glowing gemstone accents (amethyst, pyrite gold,
jade), with faceted crystal motifs, sedimentary "strata" dividers, and
classical serif display type (Cinzel / Cormorant Garamond).

Each of the nine Keepers gets a gemstone color of their own in the character
grid.

## Structure

Plain static site — no build step required:

- `index.html` — single-page layout: hero, the novel, meet the Keepers,
  about the author, newsletter, contact/footer
- `styles.css` — all theming (gem colors defined as CSS variables in `:root`)
- `script.js` — mobile nav + scroll-reveal animations
- `favicon.svg`

## Preview locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Filling in real assets

Placeholders to replace (marked with HTML comments in `index.html`):

- **Book cover** — swap the stylized CSS cover in `.book-display` for the real
  cover image
- **Keeper portraits** — replace each `.keeper-gem` crystal emblem with the
  Brett Casaños character portraits
- **Author photo** — replace `.author-photo-placeholder`
- **Newsletter form** — point the form `action` at your email provider
  (Mailchimp, MailerLite, etc.)
