# E.K. Wise — Author Site Redesign

A redesign of [ekwise.com](https://ekwise.com), the official author site for
**E.K. Wise** and her debut YA fantasy novel, *Keepers of the Rock: The Debilis
Rising*.

## Design

A modern **"crystal cavern"** theme: deep slate dark mode lit by teal,
amethyst, and gold mineral light, with rounded glass surfaces, pill buttons,
and micro-interactions throughout. Typography uses the brand's own fonts,
self-hosted from the original site: **Sveva** (display), **Libre Caslon
Text** (serif), and **Urbanist** (body).

Interactive touches:

- **Book cover** — 3D cursor-tracking tilt with a moving glare highlight
- **Keeper cards** — portraits cropped from the original dossier artwork
  (Brett Casaños); clicking opens a dossier modal with the character's
  name, role, origin, ability chip, and full bio rendered as real text
  (transcribed from the artwork), with prev/next + keyboard navigation
- Floating hero crystals, scroll-reveal animations, hover states everywhere;
  all motion respects `prefers-reduced-motion`

## Structure

Plain static site — no build step required:

- `index.html` — single-page layout: hero, the novel, meet the Keepers,
  about the author, newsletter, contact/footer
- `styles.css` — all theming (palette defined as CSS variables in `:root`)
- `script.js` — Keeper data + dossier modal, book tilt, nav, scroll-reveal
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
