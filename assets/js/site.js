/* =============================================================
   A2Z RIDERS HUB — Shared site behaviour
   -------------------------------------------------------------
   Header compaction + scroll progress, mobile drawer, search
   overlay with live results, scroll reveals, image parallax,
   active navigation, WhatsApp / tel link binding, icons.
   ============================================================= */

(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* guard: matchMedia is missing in very old browsers and some test DOMs */
  const reduceMotion =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------------------------------------------------------
     ICONS — inline 1px stroke SVG
     --------------------------------------------------------- */
  const ICONS = {
    search:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16M14 6l6 6-6 6"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14"/><path d="m3 7 9 6 9-6"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.6"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12Z"/><path d="M9.2 9.4c.3-.1.7 0 .9.4l.7 1.3c.2.3.1.7-.1.9l-.5.5c-.2.2-.2.5 0 .8a5.5 5.5 0 0 0 2.5 2.2c.3.1.6.1.8-.1l.5-.6c.2-.3.6-.4.9-.2l1.3.7c.4.2.5.6.3 1-.4.9-1.6 1.4-2.6 1.2a8.2 8.2 0 0 1-5.3-5.3c-.2-1 .3-2.1 1.2-2.6Z"/></svg>',

    /* feature icons — minimal line work, no illustration */
    shield:
      '<svg class="feature__icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 3 27 8v8.5C27 24 21.9 28 16 29.5 10.1 28 5 24 5 16.5V8Z"/><path d="m11 16.2 3.4 3.4L21 13"/></svg>',
    rider:
      '<svg class="feature__icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="19" cy="7" r="3.4"/><path d="M13 26.5 17 17l-3.6-3.2 2.6-3.3 4.6 2.4 3.4 3.4"/><path d="M9.5 13.5a12.5 12.5 0 1 0 15.6 15"/></svg>',
    diamond:
      '<svg class="feature__icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 3 27 10l-11 19L5 10Z"/><path d="M5 10h22M16 3 11 10l5 19 5-19-5-7"/></svg>',
    pinMap:
      '<svg class="feature__icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 28s9-9.1 9-15.4A9 9 0 0 0 7 12.6C7 18.9 16 28 16 28Z"/><circle cx="16" cy="12.4" r="3.2"/><path d="M3 4h5M3 4v5M29 28h-5M29 28v-5"/></svg>',
  };

  const SOCIAL_ICONS = {
    facebook:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6A21 21 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.1v2.3H7.6V13h2.7v8Z"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.3c2.5 0 2.8 0 3.8.06a5 5 0 0 1 1.7.32 3.4 3.4 0 0 1 1.9 1.9c.2.5.3 1 .32 1.7.05 1 .06 1.3.06 3.8s0 2.8-.06 3.8a5 5 0 0 1-.32 1.7 3.4 3.4 0 0 1-1.9 1.9c-.5.2-1 .3-1.7.32-1 .05-1.3.06-3.8.06s-2.8 0-3.8-.06a5 5 0 0 1-1.7-.32 3.4 3.4 0 0 1-1.9-1.9 5 5 0 0 1-.32-1.7C4.3 16.8 4.3 16.5 4.3 14s0-2.8.06-3.8a5 5 0 0 1 .32-1.7 3.4 3.4 0 0 1 1.9-1.9c.5-.2 1-.3 1.7-.32C9.2 4.3 9.5 4.3 12 4.3Zm0 1.8c-2.4 0-2.7 0-3.6.06a3 3 0 0 0-1 .2 1.6 1.6 0 0 0-.9.9c-.14.3-.2.6-.2 1-.05.9-.06 1.2-.06 3.6s0 2.7.06 3.6c0 .4.06.7.2 1 .24.36.56.66.9.9.3.14.6.2 1 .2.9.05 1.2.06 3.6.06s2.7 0 3.6-.06c.4 0 .7-.06 1-.2a2.5 2.5 0 0 0 .9-.9c.14-.3.2-.6.2-1 .05-.9.06-1.2.06-3.6s0-2.7-.06-3.6a2.1 2.1 0 0 0-.2-1 1.6 1.6 0 0 0-.9-.9c-.3-.14-.6-.2-1-.2-.9-.05-1.2-.06-3.6-.06Zm0 3.1a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 1.8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm4.9-2.1a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0Z"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21.6 8.2a2.5 2.5 0 0 0-1.75-1.77C18.3 6 12 6 12 6s-6.3 0-7.85.43A2.5 2.5 0 0 0 2.4 8.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.75 1.77C5.7 18 12 18 12 18s6.3 0 7.85-.43a2.5 2.5 0 0 0 1.75-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-3.8ZM10 15V9l5.2 3Z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16.5 2h-3v13.2a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12V9.6a5.9 5.9 0 0 0-.78-.06A5.75 5.75 0 1 0 16.5 15.3V8.9a7 7 0 0 0 4 1.27V7.05A4.05 4.05 0 0 1 16.5 3Z"/></svg>',
  };

  /* ---------------------------------------------------------
     HEADER: compaction + scroll progress
     --------------------------------------------------------- */
  function initHeader() {
    const header = $(".site-header");
    if (!header) return;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle("is-stuck", y > 40);

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      header.style.setProperty("--scroll-progress", pct.toFixed(2) + "%");

      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();
  }

  /* ---------------------------------------------------------
     MOBILE DRAWER
     --------------------------------------------------------- */
  function initDrawer() {
    const toggle = $(".menu-toggle");
    const drawer = $(".drawer");
    if (!toggle || !drawer) return;

    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      document.body.classList.toggle("is-locked", open);
      toggle.setAttribute("aria-expanded", String(open));
      drawer.setAttribute("aria-hidden", String(!open));
      if (open) {
        const first = drawer.querySelector("a, button");
        if (first) setTimeout(() => first.focus(), 320);
      }
    };

    toggle.addEventListener("click", () => {
      setOpen(!document.body.classList.contains("menu-open"));
    });

    $$("[data-drawer-close]").forEach((b) =>
      b.addEventListener("click", () => {
        setOpen(false);
        toggle.focus();
      }),
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (
        window.innerWidth >= 900 &&
        document.body.classList.contains("menu-open")
      ) {
        setOpen(false);
      }
    });
  }

  /* ---------------------------------------------------------
     SEARCH OVERLAY — static link index, DOM-only filtering
     --------------------------------------------------------- */
  function initSearch() {
    const overlay = $("#search");
    if (!overlay) return;
    const input = $("#search-input", overlay);
    const results = $("#search-results", overlay);
    const openers = $$("[data-search-open]");

    const startGroup = $("[data-search-start]", results);
    const groups = $$("[data-search-group]", results);
    const allGroup = $("[data-search-all]", results);
    const allLink = $("[data-search-all-link]", results);
    const emptyGroup = $("[data-search-empty]", results);
    const emptyTerm = $("[data-search-empty-term]", results);
    const items = $$(".search__item", results);

    let lastFocused = null;

    const open = () => {
      lastFocused = document.activeElement;
      overlay.classList.add("is-open");
      document.body.classList.add("is-locked");
      setTimeout(() => input && input.focus(), 120);
      filter(input ? input.value : "");
    };

    const close = () => {
      overlay.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      if (lastFocused) lastFocused.focus();
    };

    openers.forEach((b) => b.addEventListener("click", open));

    $$("[data-search-close]", overlay).forEach((b) =>
      b.addEventListener("click", close),
    );

    document.addEventListener("keydown", (e) => {
      const isOpen = overlay.classList.contains("is-open");

      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? close() : open();
        return;
      }
      if (e.key === "Escape" && isOpen) {
        close();
        return;
      }
      if (e.key === "/" && !isOpen && !isTyping(e.target)) {
        e.preventDefault();
        open();
        return;
      }
      if (isOpen && e.key === "Enter") {
        const q = input.value.trim();
        if (q)
          window.location.href = "category.html?q=" + encodeURIComponent(q);
      }
    });

    if (input) input.addEventListener("input", () => filter(input.value));

    function isTyping(el) {
      return (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      );
    }

    /* show the static items whose data-find matches the term */
    function filter(raw) {
      const term = (raw || "").trim().toLowerCase();

      if (!term) {
        if (startGroup) startGroup.hidden = false;
        groups.forEach((g) => (g.hidden = true));
        if (allGroup) allGroup.hidden = true;
        if (emptyGroup) emptyGroup.hidden = true;
        return;
      }

      if (startGroup) startGroup.hidden = true;

      items.forEach((a) => {
        a.hidden = (a.dataset.find || "").toLowerCase().indexOf(term) === -1;
      });

      let shown = 0;
      groups.forEach((g) => {
        const hits = $$(".search__item", g).filter((a) => !a.hidden);
        g.hidden = hits.length === 0;
        shown += hits.length;
      });

      if (allGroup) {
        allGroup.hidden = false;
        if (allLink)
          allLink.href =
            "category.html?q=" + encodeURIComponent((raw || "").trim());
      }

      if (emptyGroup) {
        emptyGroup.hidden = shown > 0;
        if (!shown && emptyTerm)
          emptyTerm.textContent =
            "Nothing found for “" +
            (raw || "").trim() +
            "”. Try a broader term, or send us a WhatsApp enquiry and we will check stock directly.";
      }
    }
  }

  /* ---------------------------------------------------------
     SCROLL REVEALS
     --------------------------------------------------------- */
  function initReveal() {
    const targets = $$(".reveal, .reveal-lines");
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((t) => io.observe(t));
  }

  /* ---------------------------------------------------------
     PARALLAX — restrained, transform only
     --------------------------------------------------------- */
  function initParallax() {
    const layers = $$("[data-parallax]");
    if (!layers.length || reduceMotion) return;

    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      layers.forEach((el) => {
        const rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * speed;
        el.style.transform = "translate3d(0," + (-offset).toFixed(1) + "px,0)";
      });
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     HERO entrance
     --------------------------------------------------------- */
  function initHero() {
    const hero = $(".hero");
    if (!hero) return;
    requestAnimationFrame(() => {
      setTimeout(() => document.body.classList.add("is-loaded"), 60);
    });
  }

  /* ---------------------------------------------------------
     ACTIVE NAV (dropdown / drawer sub links are skipped — the
     group entry stands in for them)
     --------------------------------------------------------- */
  function initActiveNav() {
    const file = (
      location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();
    $$("[data-nav] a").forEach((a) => {
      if (a.closest(".nav__dropdown") || a.closest(".drawer__sub")) return;
      const href = (a.getAttribute("href") || "").split("?")[0].toLowerCase();
      if (href === file) a.setAttribute("aria-current", "page");
    });

    const trigger = $("[data-nav-trigger]");
    if (trigger && file === "category.html")
      trigger.setAttribute("aria-current", "page");
  }

  /* ---------------------------------------------------------
     CATEGORIES DROPDOWN (desktop nav)
     --------------------------------------------------------- */
  function initNavDropdown() {
    const groups = $$(".nav__group");
    if (!groups.length) return;

    const setOpen = (group, open) => {
      group.classList.toggle("is-open", open);
      const trigger = $("[data-nav-trigger]", group);
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
    };

    groups.forEach((group) => {
      const trigger = $("[data-nav-trigger]", group);
      if (!trigger) return;

      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        setOpen(group, !group.classList.contains("is-open"));
      });

      group.addEventListener("focusout", (e) => {
        if (!group.contains(e.relatedTarget)) setOpen(group, false);
      });
    });

    document.addEventListener("click", (e) => {
      groups.forEach((group) => {
        if (!group.contains(e.target)) setOpen(group, false);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      groups.forEach((group) => {
        if (!group.classList.contains("is-open")) return;
        setOpen(group, false);
        const trigger = $("[data-nav-trigger]", group);
        if (trigger) trigger.focus();
      });
    });
  }

  /* ---------------------------------------------------------
     BIND WHATSAPP / TEL LINKS + CONTACT PLACEHOLDERS
     --------------------------------------------------------- */
  function initLinks() {
    $$("[data-wa]").forEach((el) => {
      el.setAttribute("href", SITE.waLink(el.dataset.wa || "a product"));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
    $$("[data-tel]").forEach((el) => el.setAttribute("href", SITE.telLink()));
    $$("[data-map]").forEach((el) => {
      el.setAttribute("href", SITE.mapLink());
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });

    $$("[data-contact]").forEach((el) => {
      const val = SITE.CONTACT[el.dataset.contact];
      if (val) el.textContent = val;
    });
    $$("[data-icon]").forEach((el) => {
      const name = el.dataset.icon;
      if (ICONS[name] || SOCIAL_ICONS[name])
        el.innerHTML = ICONS[name] || SOCIAL_ICONS[name];
    });
  }

  /* ---------------------------------------------------------
     COUNT-UP for stats (once)
     --------------------------------------------------------- */
  function initCounters() {
    const nodes = $$("[data-count]");
    if (!nodes.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => (n.textContent = n.dataset.count));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const node = e.target;
          const target = parseFloat(node.dataset.count);
          const suffix = node.dataset.suffix || "";
          const dur = 1100;
          const start = performance.now();
          io.unobserve(node);

          const step = (now) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            node.textContent = Math.round(target * eased) + suffix;
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );

    nodes.forEach((n) => io.observe(n));
  }

  /* ---------------------------------------------------------
     SOCIAL LINKS + COPYRIGHT YEAR
     --------------------------------------------------------- */
  function initMeta() {
    const host = $("#socials");
    if (host) {
      host.innerHTML = SITE.SOCIAL.map(
        (s) =>
          '<a href="' +
          escapeHtml(s.url) +
          '" target="_blank" rel="noopener" aria-label="A2Z Riders Hub on ' +
          escapeHtml(s.label) +
          '">' +
          (SOCIAL_ICONS[s.icon] || "") +
          "</a>",
      ).join("");
    }

    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------
     BOOT
     --------------------------------------------------------- */
  function boot() {
    initHeader();
    initDrawer();
    initNavDropdown();
    initSearch();
    initHero();
    initActiveNav();
    initLinks();
    initMeta();
    initCounters();
    initReveal();
    initParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* expose for page scripts */
  window.A2Z = {
    $,
    $$,
    escapeHtml,
    ICONS,
    SOCIAL_ICONS,
    /* call after injecting markup that contains .reveal */
    observeReveals: initReveal,
    initParallax,
  };
})();
