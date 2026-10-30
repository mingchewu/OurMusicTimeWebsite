# Our Music Time

Single-page, bilingual (English / 繁體中文) site. Plain HTML, CSS and JavaScript — no build step.

```
index.html          the whole site (both languages)
css/style.css       all styles
js/main.js          language switch, nav, reveal, parallax, lightbox, videos
js/faq.js           FAQ content (both languages)
js/piano.js         3D grand piano (Three.js from jsDelivr, started by a small
                    inline module at the end of index.html)
media/              original photos (untouched)
media/web/          web-sized copies used by the site (generated)
tools/optimize-images.sh
```

## Editing text

Every piece of text exists twice, side by side, marked with `lang`:

```html
<p lang="en">Hello</p>
<p lang="zh-Hant">你好</p>
```

The switch in the top bar shows one language and hides the other — no
second page. The choice is remembered; `?lang=zh` or `?lang=en` in a link
forces a language. Old links (`index_cn.html`, `about.html`, `about_cn.html`)
redirect to the right place.

## Publishing changes

The live host tells browsers to keep CSS and JS for a few hours. After editing
`css/style.css` or anything in `js/`, bump the `?v=` number on its `<link>` /
`<script>` tag in `index.html` (e.g. `?v=20261029` → `?v=20261105`) so visitors
get the new file straight away instead of a stale copy.

## Adding photos

1. Put originals in `media/…` (e.g. `media/events/2027/`).
2. Run `zsh tools/optimize-images.sh` (macOS) to create `media/web/` copies.
3. Reference `media/web/…` (full size) or `media/web/sm/…` (thumbnail).
   For an event year, add its file list to `EVENTS` in `js/main.js`.

## The piano

Each `<section data-piano='{…}'>` is a pose the piano moves to as that section
scrolls into the middle of the screen (`x`, `y`, `ry`, `rx`, `s`, `lid`, `o`;
`data-piano-m` is the phone version). Sections with the `surface` class are
solid and cover it. Before one covers the piano it comes apart, top down,
and rebuilds bottom up afterwards. When someone flicks through the page fast
(`html.is-fast`, set in `js/main.js`), the piano steps aside and is rebuilt
where they land.

## Sound

Off by default (the Sound button). When on, scrolling plays an original theme
(`THEME` in `js/sound.js`: 16 bars, melody + bass + chord per bar) that grows
fuller further down the page and resolves at the bottom. All synthesised.

## Running locally

Double-clicking `index.html` works, piano included (it needs an internet
connection for Three.js). The one difference: YouTube won't embed videos on a
page opened from disk, so there the recordings open on YouTube instead of
playing inline. To see the site exactly as it will be hosted, serve it:

```bash
python3 -m http.server 4173
```

If WebGL or the CDN is unavailable, the page switches to a layout without the
piano (`html.no-piano`) so no section is left empty.
