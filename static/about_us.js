/* ══════════════════════════════════════════════════════
   KBI — About Us Page  Scripts
══════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

  /* ── Scroll-reveal: generic sections ──────────────── */
  const ioReveal = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in-view");
      ioReveal.unobserve(e.target);
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal-au").forEach(el => ioReveal.observe(el));

  /* ── Scroll-reveal: timeline items (staggered) ─────── */
  const ioTl = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const items = e.target.querySelectorAll(".reveal-tl");
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add("in-view"), i * 120);
      });
      ioTl.unobserve(e.target);
    });
  }, { threshold: 0.08 });

  const timeline = document.querySelector(".au-timeline");
  if (timeline) ioTl.observe(timeline);

  /* ── Smooth scroll for in-page anchor links ────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

});
