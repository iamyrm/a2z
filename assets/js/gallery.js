/* =============================================================
   A2Z RIDERS HUB — Product gallery
   -------------------------------------------------------------
   Static thumbnails carry data-full / data-alt; this only swaps
   the main image and toggles the restrained click-to-zoom.
   ============================================================= */

(function () {
  "use strict";

  const main = document.querySelector("#gallery-main");
  if (!main) return;

  const img = main.querySelector("img");
  const thumbs = Array.from(document.querySelectorAll(".gallery__thumb"));
  if (!img) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const full = thumb.dataset.full;
      if (!full || img.getAttribute("src") === full) return;

      img.style.opacity = "0";
      setTimeout(() => {
        const alt = thumb.dataset.alt || "";
        img.src = full;
        img.alt = alt;
        main.setAttribute("aria-label", alt);
        img.style.opacity = "1";
      }, 180);

      thumbs.forEach((t) =>
        t.setAttribute("aria-selected", String(t === thumb)),
      );
    });
  });

  /* restrained click-to-zoom */
  main.addEventListener("click", () => {
    main.classList.toggle("is-zoomed");
  });
  main.addEventListener("mouseleave", () =>
    main.classList.remove("is-zoomed"),
  );
})();
