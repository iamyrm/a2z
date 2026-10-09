/* =============================================================
   A2Z RIDERS HUB — Grid filtering (catalogue + archive)
   -------------------------------------------------------------
   Both listing pages ship every product as a static <article>
   carrying data-* attributes. This script never builds markup:
   it shows, hides and reorders the cards that are already in
   the HTML, and mirrors the view into the URL.

   catalogue.html  -> search/sort toolbar + collapsible filter groups
                       (brand, price, availability, type), 10 per page
   category.html   -> department chips + search, 12 per page
   ============================================================= */

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);

  const FILE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const ARCHIVE = FILE !== "catalogue.html";
  const PER_PAGE = ARCHIVE ? 12 : 10;

  /* single-select filters resolve against data attributes */
  const PRICE_BANDS = {
    "0-5000": (n) => n < 5000,
    "5000-15000": (n) => n >= 5000 && n < 15000,
    "15000-30000": (n) => n >= 15000 && n < 30000,
    "30000+": (n) => n >= 30000,
  };
  const AVAILABILITY = {
    "in-stock": ["in-stock"],
    limited: ["limited"],
    order: ["on-order", "pre-order"],
  };

  /* multi-select groups (array state) */
  const MULTI = ["category", "brand", "type"];

  const state = {
    q: "",
    sort: "featured",
    category: [],
    brand: [],
    type: [],
    price: "",
    availability: "",
    page: 1,
  };

  /* indexed once from the static cards */
  let ITEMS = [];

  function indexCards() {
    ITEMS = Array.from(document.querySelectorAll("#grid .card")).map((el) => ({
      el: el,
      cat: el.dataset.cat,
      brand: el.dataset.brand,
      type: el.dataset.type,
      price: Number(el.dataset.price) || 0,
      avail: el.dataset.avail,
      featured: el.dataset.featured === "1",
      order: Number(el.dataset.order) || 0,
      name: el.dataset.name || "",
      find: (el.dataset.find || "").toLowerCase(),
    }));
  }

  /* ---------------------------------------------------------
     URL
     ------------------------------------------------------- */
  function readUrl() {
    const params = new URLSearchParams(location.search);

    state.q = params.get("q") || "";
    state.sort = params.get("sort") || "featured";

    state.category = params.get("cat")
      ? [params.get("cat")]
      : (params.get("category") || "").split(",").filter(Boolean);
    state.brand = (params.get("brand") || "").split(",").filter(Boolean);
    state.type = (params.get("type") || "").split(",").filter(Boolean);
    state.price = params.get("price") || "";
    state.availability = params.get("availability") || "";
    state.page = parseInt(params.get("page"), 10) || 1;

    /* department ids that no longer exist would filter everything out */
    const known = new Set(ITEMS.map((it) => it.cat));
    state.category = state.category.filter((id) => known.has(id));
  }

  function writeUrl(push) {
    const params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.category.length === 1) params.set("cat", state.category[0]);
    else if (state.category.length > 1)
      params.set("category", state.category.join(","));
    if (state.brand.length) params.set("brand", state.brand.join(","));
    if (state.type.length) params.set("type", state.type.join(","));
    if (state.price) params.set("price", state.price);
    if (state.availability) params.set("availability", state.availability);
    if (state.sort !== "featured") params.set("sort", state.sort);
    if (state.page > 1) params.set("page", state.page);

    const qs = params.toString();
    const url = qs ? FILE + "?" + qs : FILE;
    if (push) history.pushState(null, "", url);
    else history.replaceState(null, "", url);
  }

  /* ---------------------------------------------------------
     FILTER + SORT
     ------------------------------------------------------- */
  function matches(it) {
    if (state.category.length && state.category.indexOf(it.cat) === -1)
      return false;
    if (state.brand.length && state.brand.indexOf(it.brand) === -1) return false;
    if (state.type.length && state.type.indexOf(it.type) === -1) return false;
    if (state.price && !(PRICE_BANDS[state.price] || (() => true))(it.price))
      return false;
    if (
      state.availability &&
      (AVAILABILITY[state.availability] || []).indexOf(it.avail) === -1
    )
      return false;
    if (state.q && it.find.indexOf(state.q.trim().toLowerCase()) === -1)
      return false;
    return true;
  }

  function sorter() {
    switch (state.sort) {
      case "price-asc":
        return (a, b) => a.price - b.price;
      case "price-desc":
        return (a, b) => b.price - a.price;
      case "name-asc":
        return (a, b) => a.name.localeCompare(b.name);
      case "name-desc":
        return (a, b) => b.name.localeCompare(a.name);
      default:
        return (a, b) =>
          (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.order - b.order;
    }
  }

  function filtered() {
    return ITEMS.filter(matches).sort(sorter());
  }

  /* ---------------------------------------------------------
     FILTER CHROME — active tokens, badge, collapsible panel
     ------------------------------------------------------- */
  const LABELS = {};

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  /* every chip doubles as the label source for its token */
  function indexLabels() {
    document.querySelectorAll(".chip[data-group]").forEach((chip) => {
      const clone = chip.cloneNode(true);
      clone.querySelectorAll(".mono").forEach((n) => n.remove());
      LABELS[chip.dataset.group + "|" + chip.dataset.value] =
        clone.textContent.trim();
    });
    document.querySelectorAll("[data-quickcat]").forEach((chip) => {
      if (!chip.dataset.quickcat) return;
      LABELS["category|" + chip.dataset.quickcat] =
        chip.dataset.label || chip.textContent.trim();
    });
  }

  function activeFilters() {
    const out = [];
    state.category.forEach((v) => out.push({ group: "category", value: v }));
    ["brand", "type"].forEach((g) =>
      state[g].forEach((v) => out.push({ group: g, value: v })),
    );
    if (state.price) out.push({ group: "price", value: state.price });
    if (state.availability)
      out.push({ group: "availability", value: state.availability });
    return out;
  }

  function removeFilter(group, value) {
    if (group === "category") {
      state.category = state.category.filter((v) => v !== value);
    } else if (Array.isArray(state[group])) {
      state[group] = state[group].filter((v) => v !== value);
    } else {
      state[group] = "";
    }
    state.page = 1;
    writeUrl(false);
    renderAll();
  }

  function renderChrome(total) {
    const active = activeFilters();

    const tokens = $("#filter-tokens");
    if (tokens) {
      tokens.innerHTML = active
        .map((f) => {
          const label = LABELS[f.group + "|" + f.value] || f.value;
          return (
            '<button class="token" type="button" data-token-group="' +
            f.group +
            '" data-token-value="' +
            esc(f.value) +
            '" aria-label="Remove filter: ' +
            esc(label) +
            '"><span>' +
            esc(label) +
            '</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19"/></svg></button>'
          );
        })
        .join("");
    }

    const badge = $("#filters-badge");
    if (badge) {
      badge.hidden = active.length === 0;
      badge.textContent = String(active.length);
    }

    document.querySelectorAll("[data-group-count]").forEach((el) => {
      const n = active.filter((f) => f.group === el.dataset.groupCount).length;
      el.textContent = String(n);
      el.hidden = n === 0;
    });

    const word = total === 1 ? " product" : " products";
    const sheetCount = $("#sheet-count");
    if (sheetCount) sheetCount.textContent = total + word;
    const applyLabel = $("#filters-apply-label");
    if (applyLabel) applyLabel.textContent = "Show " + total + word;
  }

  function initFilterChrome() {
    const toggle = $("#filters-toggle");
    const panel = $("#filter-groups");
    if (!toggle || !panel) return;

    const backdrop = $("#filters-backdrop");
    const closeBtn = $("#filters-close");
    const applyBtn = $("#filters-apply");

    const sheetMode = () =>
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 899px)").matches;

    const setGroupOpen = (head, open) => {
      head.setAttribute("aria-expanded", String(open));
      const body = document.getElementById(head.getAttribute("aria-controls"));
      if (body) body.hidden = !open;
    };

    /* open the groups that hold an active filter, otherwise the first one */
    const openGroups = () => {
      const heads = Array.from(
        document.querySelectorAll(".filter-group__head"),
      );
      const active = activeFilters();
      let opened = false;
      heads.forEach((head) => {
        const section = head.closest("[data-filter-group]");
        const group = section ? section.dataset.filterGroup : "";
        if (active.some((f) => f.group === group)) {
          setGroupOpen(head, true);
          opened = true;
        }
      });
      if (!opened && heads.length) setGroupOpen(heads[0], true);
    };

    const open = () => {
      panel.hidden = false;
      openGroups();
      const sheet = sheetMode();
      if (sheet && backdrop) backdrop.hidden = false;
      if (sheet) document.body.classList.add("is-locked");
      requestAnimationFrame(() => {
        panel.classList.add("is-open");
        if (backdrop && !backdrop.hidden) backdrop.classList.add("is-open");
      });
      toggle.setAttribute("aria-expanded", "true");
      if (sheet && closeBtn) closeBtn.focus();
    };

    const close = () => {
      const focusInside = panel.contains(document.activeElement);
      panel.classList.remove("is-open");
      if (backdrop) {
        backdrop.classList.remove("is-open");
        backdrop.hidden = true;
      }
      panel.hidden = true;
      document.body.classList.remove("is-locked");
      toggle.setAttribute("aria-expanded", "false");
      if (focusInside) toggle.focus();
    };

    toggle.addEventListener("click", () => (panel.hidden ? open() : close()));
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (applyBtn) applyBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) close();
    });

    /* leaving sheet mode must not leave the page scroll-locked */
    window.addEventListener("resize", () => {
      if (panel.hidden || sheetMode()) return;
      if (backdrop) {
        backdrop.classList.remove("is-open");
        backdrop.hidden = true;
      }
      document.body.classList.remove("is-locked");
    });

    /* group accordions */
    document.addEventListener("click", (e) => {
      const head = e.target.closest(".filter-group__head");
      if (!head) return;
      setGroupOpen(head, head.getAttribute("aria-expanded") !== "true");
    });
  }

  /* ---------------------------------------------------------
     RENDER
     ------------------------------------------------------- */
  function syncChips() {
    document.querySelectorAll("[data-group]").forEach((chip) => {
      const cur = state[chip.dataset.group];
      const on = Array.isArray(cur)
        ? cur.indexOf(chip.dataset.value) !== -1
        : cur === chip.dataset.value;
      chip.setAttribute("aria-pressed", String(on));
    });

    document.querySelectorAll("[data-quickcat]").forEach((chip) => {
      const id = chip.dataset.quickcat;
      const on = id
        ? state.category.length === 1 && state.category[0] === id
        : state.category.length === 0;
      chip.setAttribute("aria-pressed", String(on));
    });
  }

  function renderGrid(list, pages) {
    const grid = $("#grid");
    const empty = $("#empty");
    if (!grid) return;

    const shown = window.PAGER.slice(list, state.page, PER_PAGE);
    const visible = new Set(shown.map((it) => it.el));

    /* keep DOM order = list order so reveals and layout stay sane */
    list.forEach((it) => grid.appendChild(it.el));
    ITEMS.forEach((it) => {
      if (list.indexOf(it) === -1) grid.appendChild(it.el);
      it.el.hidden = !visible.has(it.el);
    });

    if (!shown.length) {
      grid.hidden = true;
      if (empty) empty.hidden = false;
    } else {
      grid.hidden = false;
      if (empty) empty.hidden = true;
    }
  }

  function renderCount(total) {
    const count = $("#count");
    if (count)
      count.innerHTML =
        "<b>" + total + "</b> " + (total === 1 ? "product" : "products");

    const dirty =
      state.q ||
      state.category.length ||
      state.brand.length ||
      state.type.length ||
      state.price ||
      state.availability;

    const reset = $("#reset");
    if (reset) reset.hidden = !dirty;
  }

  /* ---------------------------------------------------------
     PAGE HEAD — reacts to ?cat= and ?q= (text only, images are static)
     ------------------------------------------------------- */
  const DEFAULT_HEAD = {
    title: document.title,
    index: ($("#head-index") || {}).textContent,
    heading: ($("#page-title") || {}).textContent,
    lede: ($("#page-lede") || {}).textContent,
  };

  function categoryBy(id) {
    const chip = document.querySelector('[data-quickcat="' + id + '"]');
    if (!chip) return null;
    return {
      id: id,
      name: chip.dataset.label || chip.textContent.trim(),
      blurb: chip.dataset.blurb || "",
    };
  }

  function setCanonical(href) {
    const link = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute("href", "https://www.a2zridershub.com/" + href);
    const og = document.querySelector('meta[property="og:url"]');
    if (og) og.setAttribute("content", "https://www.a2zridershub.com/" + href);
  }

  function renderHead() {
    const title = $("#page-title");
    const lede = $("#page-lede");
    const index = $("#head-index");
    const crumbLabel = $("#crumb-cat-label");
    const crumbMark = $("#crumb-cat");

    const cat =
      state.category.length === 1 ? categoryBy(state.category[0]) : null;

    if (!cat && !state.q) {
      document.title = DEFAULT_HEAD.title;
      if (title) title.textContent = DEFAULT_HEAD.heading;
      if (lede) lede.textContent = DEFAULT_HEAD.lede;
      if (index) index.textContent = DEFAULT_HEAD.index;
      if (crumbLabel) crumbLabel.textContent = "";
      if (crumbMark) crumbMark.hidden = true;
      if (ARCHIVE) setCanonical("category.html");
      return;
    }

    if (cat) {
      const suffix = " in Biratnagar, Nepal — A2Z Riders Hub";
      document.title = cat.name + suffix;
      if (title) title.textContent = cat.name;
      if (lede)
        lede.textContent =
          cat.name + " from the A2Z Riders Hub catalogue — " + cat.blurb + ".";
      if (index) index.textContent = cat.name;
      if (crumbLabel) crumbLabel.textContent = cat.name;
      if (crumbMark) crumbMark.hidden = false;
      if (ARCHIVE) setCanonical("category.html?cat=" + cat.id);
      return;
    }

    document.title =
      "Search: “" + state.q + "” — A2Z Riders Hub Motorcycle Gear";
    if (title) title.textContent = "Search results";
    if (lede)
      lede.textContent =
        "Archive matches for “" +
        state.q +
        "”. Narrow it with a department chip or open the full catalogue filters.";
    if (index) index.textContent = "Search";
    if (crumbLabel) crumbLabel.textContent = "Search";
    if (crumbMark) crumbMark.hidden = false;
    if (ARCHIVE) setCanonical("category.html?q=" + encodeURIComponent(state.q));
  }

  function renderAll() {
    const list = filtered();
    const pages = window.PAGER.pageCount(list.length, PER_PAGE);
    const clamped = window.PAGER.clamp(state.page, pages);
    if (clamped !== state.page) {
      /* an out-of-range ?page= was requested — correct the address */
      state.page = clamped;
      writeUrl(false);
    }

    syncChips();
    renderHead();
    renderCount(list.length);
    renderChrome(list.length);
    renderGrid(list, pages);
  }

  /* ---------------------------------------------------------
     EVENTS
     ------------------------------------------------------- */
  function toggleValue(list, value) {
    const i = list.indexOf(value);
    if (i === -1) list.push(value);
    else list.splice(i, 1);
    return list;
  }

  function initEvents() {
    document.addEventListener("click", (e) => {
      const token = e.target.closest(".token");
      if (token) {
        removeFilter(token.dataset.tokenGroup, token.dataset.tokenValue);
        return;
      }

      const chip = e.target.closest(".chip");
      if (!chip) return;

      if (chip.dataset.quickcat != null) {
        const id = chip.dataset.quickcat;
        state.category = id ? [id] : [];
        state.page = 1;
        writeUrl(false);
        renderAll();
        return;
      }

      const group = chip.dataset.group;
      if (!group) return;
      const value = chip.dataset.value;

      if (MULTI.indexOf(group) !== -1) {
        state[group] = toggleValue(state[group], value);
      } else {
        state[group] = state[group] === value ? "" : value;
      }

      state.page = 1;
      writeUrl(false);
      renderAll();
    });

    /* search box */
    const q = $("#q");
    if (q) {
      q.value = state.q;
      let timer;
      q.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          state.q = q.value;
          state.page = 1;
          writeUrl(false);
          renderAll();
        }, 180);
      });
    }

    /* sort */
    const sort = $("#sort");
    if (sort) {
      sort.value = state.sort;
      sort.addEventListener("change", () => {
        state.sort = sort.value;
        state.page = 1;
        writeUrl(false);
        renderAll();
      });
    }

    /* clear */
    const clear = () => {
      state.q = "";
      state.category = [];
      state.brand = [];
      state.price = "";
      state.availability = "";
      state.type = [];
      state.sort = "featured";
      state.page = 1;
      if (q) q.value = "";
      if (sort) sort.value = "featured";
      writeUrl(false);
      renderAll();
    };
    const reset = $("#reset");
    if (reset) reset.addEventListener("click", clear);
    const emptyReset = $("#empty-reset");
    if (emptyReset) emptyReset.addEventListener("click", clear);

    /* back / forward */
    window.addEventListener("popstate", () => {
      readUrl();
      if (q) q.value = state.q;
      if (sort) sort.value = state.sort;
      renderAll();
    });
  }

  function boot() {
    indexCards();
    indexLabels();
    readUrl();
    initEvents();
    initFilterChrome();
    renderAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
