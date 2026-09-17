# Okechukwu Fidelis Amadi — Portfolio

Single-page portfolio site. Plain HTML/CSS/JS — no framework, no build step.

## Project Structure

```
index.html            Slim page shell (~60 lines). Contains <head>, the
                      background orbs, and one empty slot per section.
css/styles.css        Site styles: body colors, ::selection, kinetic-glass /
                      kinetic-card / kinetic-btn effects, partial-slot fade-in,
                      honeypot hiding.
js/tailwind-config.js Tailwind theme (colors, fonts, shadows). MUST load after
                      the Tailwind CDN <script> in index.html.
js/main.js            Contact form logic: validation, spam traps, Formspree
                      delivery with mailto fallback.
js/includes.js        Loads each partial into its [data-include] slot, fades
                      sections in, then dispatches a 'partials:loaded' event.
partials/             One HTML file per page section:
  header.html           Sticky navigation
  hero.html             Headline, availability badge, contact buttons
  work.html             4 project cards
  skills.html           4 skill columns
  experience.html       Work history
  about.html            Photo, bio, education
  contact.html          Contact info + inquiry form
  footer.html           Footer
```

### How the partials work

Each section in `index.html` is an empty slot:

```html
<div class="section-slot" data-include="partials/hero.html"></div>
```

On page load, `js/includes.js` fetches each partial and injects it into its
slot, then fades it in (`.section-slot.is-loaded`). When all slots are filled,
it dispatches `partials:loaded`, which `js/main.js` listens for before binding
the contact form. The result is one normal page — behavior is identical to a
single-file layout; only code organization changed.

**Editing a section:** open the matching file in `partials/`. No build, no
recompile — save and refresh.

## Running the Site

The partial fetches require HTTP — opening `index.html` via `file://` will
block them and the sections won't appear.

Any static server works:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Or use the VS Code "Live Server" extension. Deployment targets with HTTP
(GitHub Pages, Netlify, Vercel) work as-is — just upload everything.

## File-by-file Notes

- `index.html` — the Tailwind CDN script must stay **before**
  `js/tailwind-config.js` (marked with a comment). `main.js` and
  `includes.js` load with `defer`.
- `js/main.js` — `CONTACT_EMAIL` is the fallback recipient and the address
  shown in the success panel. Update it if your email changes.
- `css/styles.css` — the `.js-enabled .section-slot` rules only hide slots
  when JavaScript is available, so no-JS visitors still see all content.
