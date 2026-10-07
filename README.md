# ChiActive: Collection 01

ChiActive's own jacket collection: six AI-designed jackets with the real ChiActive patch printed on. This folder holds two complete versions of the store.

| Version | Where | Local address | Start it |
|---|---|---|---|
| **Scroll film** (the main site) | this folder | http://localhost:8000 | double-click `../start-server-mac.command` (Mac) or `../start-server-windows.bat` (Windows) |
| **Ultra-minimal** | `minimal/` | http://localhost:8001 | double-click `minimal/start-minimal-mac.command`, or run `python3 -m http.server 8001` inside `minimal/` |

The two never share files: `minimal/` has its own pages, styles, scripts, fonts and images, so changing one never breaks the other. See `minimal/README.md` for that version.

**Live site:** https://myraune.github.io/chiactive/ (the scroll-film version).

## The Scroll Film (main site)

The homepage is told in scenes that play as you scroll. All the animation code is our own, with no libraries:
- `js/motion.js` is the engine: smooth scroll, scenes, text reveals and the hiding header.
- `js/rack.js` runs the opening scene (the rail).
- `js/home.js` runs the other scenes.

1. **The rail:** six jackets hang from a metal rail in front of the giant CHIACTIVE. After the loading screen they drop onto the rail one by one and swing to a stop. Scrolling pulls the rail sideways, and each jacket is a real pendulum: a damped spring that leans away from the direction of travel, kicked harder the faster you scroll, plus a tiny breeze. The jacket in the middle is in focus with its name and price, and a click opens its page. Everything is plain CSS transforms (no WebGL), driven by the scroll position.
2. **Manifesto and marquee:** a sentence whose words light up as you scroll, and an outlined "Four kinds of cold" marquee that follows your scroll speed.
3. **Four kinds of cold:** a sideways journey through January, February, April and an October night with rain, with each photo shown framed over a blurred copy of itself.
4. **The star:** a zoom from the jacket into the patch and into the Chicago star, until it fills the screen.
5. **Shot in Chicago:** three photo columns drifting at different speeds, then the footer reveals itself like a curtain.

Motion is always on: the site plays the same for every visitor, whatever their system's "Reduce motion" setting says, and there is no switch.

## Files

| File | What it is |
|---|---|
| `index.html`, `shop.html`, `about.html`, `checkout.html`, `404.html` | Home, shop, about, demo checkout (nothing is sent, no payment), page not found |
| `jackets/*.html` | Product pages: gallery, buy panel, "Anatomy" hotspots, buy bar |
| `blog/` | Journal: the student posts and the backpack article |
| `styles.css` | All styles for the main site |
| `js/main.js`, `js/products.js` | Cart, search, menu, product page, filters, checkout; product catalog |
| `publish.py` | Publishes the main site to GitHub Pages |
| `minimal/` | The ultra-minimal version (separate site) |
| `_archive/` | Earlier versions and explorations |

## Publishing

Run `python3 publish.py` from this folder. It publishes only the files the main site uses (not `minimal/`, `tools/` or `_archive/`). On the public copy the student authors' names are replaced with "ChiActive Journal"; this folder keeps the names.

## Honest Notes

- Collection 01 is a design concept for a class project. The product details describe the designs, not tested garments.
- The product and campaign photos were generated with AI (Canva). The real ChiActive patch was printed on afterwards with a script.
