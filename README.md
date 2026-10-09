# A2Z Riders Hub — Motorcycle Gear Catalogue

Premium motorcycle equipment catalogue for **A2Z Riders Hub**, Biratnagar, Nepal.

Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework.
Open `index.html` in a browser or upload the folder to any static host.

**Everything is static HTML.** Product cards, the shared product detail page,
category tiles, filter chips, navigation and the search overlay index are all markup
in the `.html` files — no render scripts, no data files. The little JavaScript that
remains only filters, sorts and paginates the markup that is already on the page.

---

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage: hero, statement, categories, featured products, performance, why-us, catalogue CTA |
| `catalogue.html` | Full catalogue: search, sort and a collapsible filter panel (brand, price, availability, type) with active-filter tokens and a mobile bottom sheet, pagination (10 per page). `?cat=helmets`, `?brand=AGV`, `?price=5000-15000`, `?q=…`, `?page=2` are all shareable |
| `category.html` | Archive: every department tile plus **all products in one filterable list** (department chips, search, sort, 12 per page). `?cat=helmets` preselects a department, `?q=…` searches |
| `page-product.html` | **One product detail page for the whole site** — breadcrumbs, gallery, specs, features, availability, related products, Product JSON-LD, canonical URL. Every `View product` link points here; swap the copy when the template goes dynamic |
| `about.html` | Brand story, selection principles, range, visit |
| `contact.html` | Contact details, enquiry form, map |
| `terms.html` | Terms & conditions with a sticky table of contents |
| `privacy.html` | Privacy policy with a sticky table of contents |
| `404.html` | Not-found page: search, popular destinations, `noindex` |

Shared header, drawer, search overlay and footer are identical markup on every page.

---

## Editing the site

### 1. Contact details — `assets/js/config.js`

One `CONTACT` object near the top of the file. Set your real values and the header,
footer, drawer, contact page, and **every WhatsApp button** on the site update
automatically:

```js
phoneDisplay: "+977 981-0000000",   // shown to visitors
phoneDial:    "+9779810000000",     // tel: links (digits only)
whatsapp:     "9779810000000",      // wa.me links (country code + number, no + or spaces)
email:        "info@…",
street / city / region / hours
```

Social links live in `SOCIAL` just below it. This file holds nothing else.

### 2. Products — edit `page-product.html` + card data

Product detail is a single shared template — `page-product.html` (currently
holds AGV K3 SV demo copy; wire it to your backend/JSON later). Product
**cards** on the homepage, catalogue and category page are `<article class="card">`
blocks whose `data-*` attributes drive filters, sort and search.

A catalogue card looks like this — copy it to add a product:

```html
<article class="card reveal reveal--delay-0"
  data-id="agv-k3-sv" data-cat="helmets" data-brand="AGV" data-type="Full-Face Helmet"
  data-price="24900" data-avail="in-stock" data-featured="1" data-order="1"
  data-name="AGV K3 SV"
  data-find="AGV K3 SV Full-Face Helmet AGV-HL-01 Premium Helmets ECE 22.06">
  <div class="card__media">
    <img src="https://…/photo.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900&h=675"
         srcset="… 450w, … 675w, … 900w"
         sizes="(max-width: 759px) 92vw, (max-width: 1099px) 46vw, 31vw"
         alt="AGV K3 SV helmet" loading="lazy" decoding="async" width="900" height="675">
    <span class="card__badge">Best Seller</span>
    <span class="card__cat">Premium Helmets / Full-Face Helmet</span>
  </div>
  <div class="card__body">
    <h3 class="card__name">AGV K3 SV</h3>
    <p class="card__short">ECE 22.06 / Integrated sun visor</p>
    <div class="card__foot">
      <span class="card__price">NPR 24,900</span>
      <span class="card__avail is-available">Available</span>
    </div>
    <span class="card__cta">View Product<span class="card__cta-arrow" aria-hidden="true">→</span></span>
  </div>
  <a class="card__link" href="page-product.html">
    <span>View product: AGV K3 SV, NPR 24,900</span>
  </a>
</article>
```

Attribute rules:

- `data-cat` — one of the quick-category values: `helmets`, `jackets`,
  `gloves`, `parts`, `gears`, `accessories`.
- `data-avail` — `in-stock`, `limited`, `on-order` or `pre-order`; pair with the
  matching `card__avail` class (`is-available`, `is-limited`, `is-order`).
- `data-find` — lowercase search haystack (name, brand, type, SKU, category).
- Every card's visible link goes to `page-product.html`.

**To change a price:** edit the visible `card__price` text **and** the
`data-price` attribute on every card for that product (catalogue, category,
homepage) — the filters read the attribute.

**To change a product's detail content:** edit `page-product.html` — copy,
specs table, feature list, gallery images, related cards, and the Product
JSON-LD block at the bottom (price, SKU, availability).

**To remove a product:** delete its cards from every grid, its `.search__item`
entry, and (when you add products) its sitemap entry.

### 3. Categories / navigation

Department tiles, filter chips, the header "Categories" dropdown and the drawer's
sub-links are static markup. They live in:

- header dropdown → `.nav__dropdown` inside every page's `<nav class="nav">`
- drawer sub-links → `.drawer__sub` inside every page's `<nav class="drawer__nav">`
- department tiles → `#cats-index` (`category.html`), `#cats` (`index.html`, `about.html`)
- filter chips → `#filter-groups` and `#quick-cats` (`catalogue.html`),
  `#quick-cats` (`category.html`)

Counts shown on chips are static text — update them by hand when stock changes.

### 4. Colours, type and spacing — `assets/css/style.css`

Palette and type sit in `:root` at the top of the file:

```css
--carbon: #0b0b0b;  --graphite: #1c1c1c;  --gunmetal: #4a4945;
--red: #b51f1f;      --red-bright: #e21b1b;
--silver: #b8b6af;   --warm: #817a6c;      --off: #f1f0ec;
```

Spacing is tokenised next to them: `--section-y` (section bands), `--gap-block`,
`--gap-block-lg`, `--gap-2col`, `--gap-stack`, `--gap-row`, `--pad-cell`,
`--pad-panel`, `--pad-chip`, `--pad-tag`, `--pad-control`, `--control-h`,
`--sticky-offset`. Use the tokens instead of new magic numbers so the rhythm stays
consistent across pages.

Type families: `Barlow Condensed` for display headlines, `Inter` for body copy,
`Space Grotesk` for technical labels and metadata.

---

## JavaScript (what is left and why)

| File | Role |
| --- | --- |
| `assets/js/config.js` | Contact / social config — the only editable data |
| `assets/js/site.js` | Header compaction, drawer, Categories dropdown, static search-overlay filtering, reveals, parallax, `data-contact` / `data-wa` binding |
| `assets/js/grid.js` | Filtering, search, sorting and URL sync for `catalogue.html` + `category.html`. Reads `data-*` off the static cards; never builds markup. Also owns the filter-panel chrome: collapsible groups, active-filter tokens, badge count and the mobile bottom sheet |
| `assets/js/pagination.js` | Pagination math (`window.PAGER.pageCount/clamp/slice`). The pager markup itself is static — `#pager` in `catalogue.html` and `category.html`; update those blocks by hand when totals change |
| `assets/js/gallery.js` | Product page image swap + click-to-zoom (thumbnails carry `data-full` / `data-alt`) |
| `assets/js/contact.js` | Enquiry form → WhatsApp hand-off. Category `<option>`s are static HTML |
| `assets/js/legal.js` | Scrollspy for the legal pages' table of contents |

---

## Photography

Product and lifestyle photography is loaded from the Pexels CDN (free licence, no
attribution required). URLs are written directly into the HTML as `src` / `srcset`
crops, and every image carries an `alt` that describes what is actually in the frame.

To swap in your own shots: replace the `src`/`srcset` URLs with `assets/images/…`
paths (drop your files into `assets/images/`) and keep the `alt` accurate. If a photo
fails to load, the `.media` wrappers fall back to a dark carbon weave with a soft
vignette, so the layout still reads as intentional rather than broken.

---

## Notes

- **Catalogue, not checkout.** There is no cart by design. The primary actions are
  `VIEW PRODUCT`, `WHATSAPP ENQUIRY`, `REQUEST DETAILS` and `CONTACT US`.
- **The contact form has no backend.** It composes the message and hands off to WhatsApp.
  Nothing is stored. If you want server-side submissions, point the form at your own
  endpoint in `assets/js/contact.js`.
- **Filtering is shareable.** Every filter combination is written to the URL, so
  `catalogue.html?cat=helmets&price=15000-30000` or `category.html?cat=helmets&q=gloves`
  can be bookmarked or shared, and the back/forward buttons work.
- **Search overlay is static.** Its results are a plain link list baked into every
  page; typing only shows/hides items by their `data-find` terms. Enter opens
  `category.html?q=…`.
- **Legal pages are plain HTML.** `terms.html` and `privacy.html` hold real copy with a
  `#section` anchor per heading; `assets/js/legal.js` only highlights the current
  contents entry. Update the two "last updated" dates when you edit them.
- **The 404 page needs one line of server config.** On Apache add
  `ErrorDocument 404 /404.html`; on Netlify/Vercel/Cloudflare Pages a root `404.html`
  is picked up automatically.
- **Reduced motion** is respected. All animation is disabled when the OS setting is on.

---

## Before going live

- [ ] Replace the placeholder phone, WhatsApp and email in `assets/js/config.js`
- [ ] Set your real street address in `CONTACT.street`
- [ ] Point social links at your real profiles
- [ ] Update the `https://www.a2zridershub.com` URLs in `sitemap.xml`, `robots.txt` and
      the `<link rel="canonical">` tags if your domain differs
- [ ] Review the demo prices, stock copy and product detail content in
  `catalogue.html` cards and `page-product.html` against live
      stock (remember the `data-price` / `data-avail` attributes on the cards)
- [ ] Read `terms.html` and `privacy.html` and align them with how you actually trade
      (payment methods, warranty periods, retention times)
- [ ] Point `ErrorDocument 404 /404.html` (or the platform equivalent) at `404.html`
- [ ] Swap the placeholder photography for your own product shots
- [ ] Confirm opening hours against public holidays
