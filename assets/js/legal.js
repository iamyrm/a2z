/* =============================================================
   A2Z RIDERS HUB — Legal pages (terms / privacy)
   -------------------------------------------------------------
   Highlights the table-of-contents entry for the section
   currently in view. The links work without JavaScript — this
   only adds the "you are here" state.
   ============================================================= */

(function () {
  "use strict";

  function setActive(id) {
    document.querySelectorAll(".legal__toc a").forEach((a) => {
      const match = a.getAttribute("href") === "#" + id;
      if (match) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  function boot() {
    const sections = Array.from(
      document.querySelectorAll(".legal__body section[id]"),
    );
    const toc = document.querySelector(".legal__toc");
    if (!sections.length || !toc) return;

    setActive(sections[0].id);

    if (!("IntersectionObserver" in window)) return;

    const visible = new Map();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        });

        if (!visible.size) return;
        const top = [...visible.entries()].sort((a, b) => b[1] - a[1])[0][0];
        setActive(top);
      },
      {
        /* watch a band around the reading line, not the whole viewport */
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0, 0.25, 0.6, 1],
      },
    );

    sections.forEach((s) => io.observe(s));

    /* keep the highlight honest when a hash is opened directly */
    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target && target.id) setActive(target.id);
    }

    window.addEventListener(
      "hashchange",
      () => {
        const id = location.hash.replace("#", "");
        if (id) setActive(id);
      },
      { passive: true },
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
