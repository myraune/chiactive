# ChiActive: Collection 01

ChiActive's own jacket collection: six AI-designed jackets with the real ChiActive patch printed on, in one ultra-minimal store.

**Live site:** https://myraune.github.io/chiactive/ (code: https://github.com/myraune/chiactive)

## Preview It

Double-click `../start-server-mac.command` (Mac) or `../start-server-windows.bat` (Windows), then open http://localhost:8000.

## The Collection

| Jacket | Type | Price |
|---|---|---|
| Lakeshore Shell | 3-layer hardshell, sky blue / navy | $289 |
| 312 Down Parka | Long down parka, navy | $349 |
| Loop Puffer | Cropped down puffer, star red | $229 |
| Wacker Anorak | Windproof anorak, cream / navy | $149 |
| North Branch Fleece | High-pile fleece, navy / sky | $139 |
| Night Line Shell | Rain shell with reflective piping, graphite | $199 |

**How the images were made:**
- The product and campaign photos were generated with Canva's AI image generator, with a minimal Scandinavian look inspired by Norrøna and a clean chest on every jacket.
- The **real** ChiActive patch was then printed onto each jacket with a script, so the logo is always correct and follows the fabric's shading.
- The files are in `images/ai/`. Cutouts with transparent backgrounds are in `images/ai/cutouts/`. The shop uses the versions on pure white in `images/ai/white/`.

## The Homepage: Unzip to Enter

- **Loading screen:** only the logo, with a thin beam of light sweeping across it. It shows once per browser session.
- **Unzip intro** (`js/zip.js`): the Lakeshore Shell stands in front of the giant CHIACTIVE wordmark. Scrolling, or dragging the zip pull (which carries the Chicago star), unzips the jacket in three acts:
  1. **Unzip:** the pull slides down the zip and the upper halves open into a V. Through the gap you see the quilted lining and the woven neck label, "ChiActive · Collection 01 · Chicago".
  2. **Doors:** both halves swing out like doors while the lining grows to fill the screen, so you are now inside the jacket.
  3. **Inside:** Collection 01 ("Six jackets. One city.") rises out of the lining, one jacket at a time, as the entrance to the rest of the site.
- **How it works:** the section is a tall scroll track with a pinned stage. The scroll position is the only source of truth, so dragging the pull just scrolls the page, and letting go near the bottom finishes the entrance by itself. The jacket is four copies of one cut-out, clipped along the zip line, and the upper two rotate around the pull like a hinge. Every frame only changes transforms, clip-paths and opacity.
- **Reduce motion:** with this setting on, the page skips the animation and shows the collection directly. Add `?motion=1` to the address to force the animation on.

## Design

- **Minimal:** everything is white, with small type and the jackets on pure white. Inspired by Norrøna, Arc'teryx and COS.
- **Header:** the ChiActive patch centered on white, like Canada Goose's badge. It's the same on every page.
- **Shop:** one slim sticky bar with the filters, then only photo, name and price.
- **Product card hover:** the jacket slowly fades into a close-up of the chest patch, and a quiet row of sizes rises from the bottom. Click a size to add the jacket straight to the cart (quick add). On touch screens the cards show only the photo.
- **About and Journal:** the same slim sticky bar as the shop, then straight to the content. About pairs one photo with a quiet text column and links to all six jackets. The Journal shows one line per story: date, title and author.
- **Product pages:** everything you need is above the fold: a gallery (thumbnails, arrows, swipe) on the left and the buy panel on the right (type, name, price, color, size with a size guide, Add to cart, free-shipping note and three key specs). Below:
  - **Anatomy:** numbered markers on the jacket, and hovering a marker or a feature in the list highlights both.
  - The campaign photo and related jackets.
  - A slim buy bar slides up at the bottom once you scroll past Add to cart.
- **Checkout:** the same slim bar, numbered steps, fields with only a line under them, and an order summary with a free-shipping nudge.
- **Earlier explorations:** three alternative homepage concepts (Editorial, Monochrome, Neon) are kept in `_archive/concepts/` for reference.

## Page Map

| File | What it is |
|---|---|
| `shop.html` | All six jackets, filterable: `#shells`, `#insulated`, `#layers` |
| `jackets/*.html` | Product pages: gallery and buy panel, Anatomy hotspots, campaign photo, related jackets, buy bar |
| `blog/` | Journal: the student posts and the backpack article |
| `about.html` | Brand story and how the collection was made |
| `checkout.html` | Demo checkout. Nothing is sent and no payment is taken. |
| `js/products.js` | Product catalog used by the cart, search and checkout |
| `js/main.js` | Cart drawer, menu, search, product page, filters, checkout |
| `_archive/` | Earlier versions and explorations: `concepts/`, `light-v1/`, `lake-effect-v2/`, `north-form/`, and `xray-reveal/` (the dropped X-ray hover effect) |

## Honest Notes

- Collection 01 is a design concept for a class project. The product details describe the designs, not tested garments.
- The size guide uses typical measurements.

## Publishing to GitHub Pages

Run `python3 publish.py` from this folder (needs git and the GitHub CLI, signed in as myraune). It builds a clean copy that holds only the files the site uses, then pushes it to github.com/myraune/chiactive. The site updates in about a minute.
- The public site shows "ChiActive Journal" instead of the student authors' names. This folder (the class ZIP) keeps the names.
- `python3 publish.py --dry-run` shows what would be published without pushing.
- `404.html` is GitHub Pages' "page not found" page, and `.nojekyll` makes GitHub serve the files as they are.

