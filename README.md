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
- `js/zip.js` runs the opening scene.
- `js/home.js` runs the other scenes.

1. **Unzip:** the camera pushes in from the Lakeshore Shell to its zip. The screen then becomes the jacket's fabric, drawn live in WebGL: ripstop, zip tape, metal teeth and the patch. Scrolling, or dragging the pull, unzips it to reveal Collection 01.
2. **Manifesto and marquee:** a sentence whose words light up as you scroll, and an outlined "Four kinds of cold" marquee that follows your scroll speed.
3. **Four kinds of cold:** a sideways journey through January, February, April and an October night with rain, with each photo shown framed over a blurred copy of itself.
4. **The star:** a zoom from the jacket into the patch and into the Chicago star, until it fills the screen.
5. **Shot in Chicago:** three photo columns drifting at different speeds, then the footer reveals itself like a curtain.

With "Reduce motion" turned on, the page shows everything without animation, and a small button lets the visitor turn motion on anyway.

## Files

| File | What it is |
|---|---|
| `index.html`, `shop.html`, `about.html`, `checkout.html`, `404.html` | Home, shop, about, demo checkout (nothing is sent, no payment), page not found |
| `jackets/*.html` | Product pages: gallery, buy panel, "Anatomy" hotspots, buy bar |
| `blog/` | Journal: the student posts and the backpack article |
| `styles.css` | All styles for the main site |
| `js/main.js`, `js/products.js` | Cart, search, menu, product page, filters, checkout; product catalog |
| `tools/video_to_frames.py` | Turns an AI unzip video into frames for the intro |
| `publish.py` | Publishes the main site to GitHub Pages |
| `minimal/` | The ultra-minimal version (separate site) |
| `_archive/` | Earlier versions and explorations |

## Publishing

Run `python3 publish.py` from this folder. It publishes only the files the main site uses (not `minimal/`, `tools/` or `_archive/`). On the public copy the student authors' names are replaced with "ChiActive Journal"; this folder keeps the names.

## Honest Notes

- Collection 01 is a design concept for a class project. The product details describe the designs, not tested garments.
- The product and campaign photos were generated with AI (Canva). The real ChiActive patch was printed on afterwards with a script.
