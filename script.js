(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Loader */
  const loader = document.getElementById("page-loader");
  function hideLoader() {
    if (!loader) return;
    loader.classList.add("done");
    loader.setAttribute("aria-busy", "false");
  }
  if (document.readyState === "complete") {
    requestAnimationFrame(hideLoader);
  } else {
    window.addEventListener("load", () => requestAnimationFrame(hideLoader), { once: true });
  }

  /* Lucide icons */
  function initIcons() {
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIcons);
  } else {
    initIcons();
  }

  /* Year */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Sticky header blur */
  const header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* Hero CTA buttons — scroll to section */
  function scrollToSelector(sel) {
    if (!sel) return;
    var el = document.querySelector(sel);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
  }
  document.querySelectorAll(".hero-actions button[data-scroll-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      scrollToSelector(btn.getAttribute("data-scroll-target"));
    });
  });

  /* Navbar collapse — refresh icons after Bootstrap toggles */
  const navCollapse = document.getElementById("navCollapse");
  if (navCollapse && typeof bootstrap !== "undefined") {
    navCollapse.addEventListener("shown.bs.collapse", initIcons);
  }

  /* Close mobile nav on anchor click */
  if (navCollapse && typeof bootstrap !== "undefined") {
    navCollapse.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth < 992 && navCollapse.classList.contains("show")) {
          bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
        }
      });
    });
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll(".reveal");
  let revealObserver = null;
  let statsObserver = null;
  if (revealEls.length && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObserver.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* Stat counters */
  const statValues = document.querySelectorAll("[data-counter]");

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el, target, suffix, duration) {
    const start = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(p);
      const val = Math.round(target * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }

  function runCounters() {
    statValues.forEach(function (el) {
      const raw = el.getAttribute("data-counter");
      const suffix = el.getAttribute("data-suffix") || "";
      const target = parseInt(raw, 10);
      if (Number.isNaN(target)) return;
      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }
      animateCounter(el, target, suffix, 1600);
    });
  }

  const statsPanel = document.querySelector(".stats-panel");
  if (statsPanel && "IntersectionObserver" in window) {
    let ran = false;
    statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !ran) {
            ran = true;
            runCounters();
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    statsObserver.observe(statsPanel);
  } else if (statValues.length) {
    runCounters();
  }

  /* Bootstrap testimonial carousel — icons after slide */
  const testimonialCarousel = document.getElementById("testimonialCarousel");
  if (testimonialCarousel && typeof bootstrap !== "undefined") {
    testimonialCarousel.addEventListener("slid.bs.carousel", initIcons);
  }

  /* Newsletter demo submit */
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.checkValidity()) {
        newsletterForm.reset();
      }
    });
  }

  /* Quote request form (client-side validation only until API exists) */
  const quoteForm = document.getElementById("quote-form");
  function onQuoteSubmit(e) {
    e.preventDefault();
    var form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.reset();
    var general = document.getElementById("quote-type-general");
    if (general) general.checked = true;
  }
  if (quoteForm) {
    quoteForm.addEventListener("submit", onQuoteSubmit);
  }

  window.addEventListener(
    "pagehide",
    function () {
      window.removeEventListener("scroll", onScrollHeader);
      if (navCollapse) navCollapse.removeEventListener("shown.bs.collapse", initIcons);
      if (testimonialCarousel && typeof bootstrap !== "undefined") {
        testimonialCarousel.removeEventListener("slid.bs.carousel", initIcons);
      }
      if (quoteForm) quoteForm.removeEventListener("submit", onQuoteSubmit);
      if (revealObserver) revealObserver.disconnect();
      if (statsObserver) statsObserver.disconnect();
    },
    { once: true }
  );
})();
