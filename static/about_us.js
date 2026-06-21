/* KBI — About Us  |  Scroll-reveal + smooth anchors */

document.addEventListener("DOMContentLoaded", () => {

  /* ── Generic reveal (sections, cards, etc.) ─────────── */
  const ioGeneric = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in-view");
      ioGeneric.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal-au").forEach(el => ioGeneric.observe(el));

  /* ── Team: stagger each member ───────────────────────── */
  const ioTeam = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const members = e.target.querySelectorAll(".au-member");
      members.forEach((m, i) => {
        setTimeout(() => m.classList.add("in-view"), i * 110);
      });
      ioTeam.unobserve(e.target);
    });
  }, { threshold: 0.1 });

  const teamGrid = document.querySelector(".au-team-grid");
  if (teamGrid) ioTeam.observe(teamGrid);

  /* ── Smooth anchor scrolling ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const id = link.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

});
