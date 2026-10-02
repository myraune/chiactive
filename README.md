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

## The Homepage Hero

- **Loading screen:** only the logo, with a thin beam of light sweeping across it. It shows once per browser session.
- **Hero:** only the giant CHIACTIVE wordmark and a jacket on pure white, slowly crossfading to the next jacket every few seconds.
- **Parallax:** the jacket drifts and tilts slightly toward the mouse while the wordmark moves the other way, for depth. It floats gently over a soft shadow.
- **Light hover:** a soft studio light follows the mouse across the jacket. The light layer uses the jacket's own cut-out as a mask, so it only lands on the fabric, never on the white page.
- **Reduce motion:** with this setting on, the jacket stays still. Add `?motion=1` to the address to force mouse movement on.

## Design

- **Minimal:** everything is white, with small type and the jackets on pure white. Inspired by Norrøna, Arc'teryx and COS.
- **Header:** the ChiActive patch centered on white, like Canada Goose's badge. It's the same on every page.
- **Shop:** one slim sticky bar with the filters, then only photo, name and price.
- **Product card hover:** the jacket slowly fades into a close-up of the chest patch, and a quiet row of sizes rises from the bottom. Click a size to add the jacket straight to the cart (quick add). On touch screens the cards show only the photo.
- **Product pages:** photos stacked on the left; one quiet sticky panel on the right with size, add to cart, and Description / Details / Size guide.
- **Earlier explorations:** three alternative homepage concepts (Editorial, Monochrome, Neon) are kept in `_archive/concepts/` for reference.

## Page Map

| File | What it is |
|---|---|
| `shop.html` | All six jackets, filterable: `#shells`, `#insulated`, `#layers` |
| `jackets/*.html` | Minimal product pages: photos stacked on the left; name, price, size, add to cart and Description / Details / Size guide on the right |
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

