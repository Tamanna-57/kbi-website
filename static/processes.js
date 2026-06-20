/* ════════════════════════════════════════════════════
   KBI — Processes Page JS
   Scroll-reveal for editorial sections
   ════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* Scroll-reveal would hide every section behind opacity:0 until you
     scroll past it — which makes editing impossible. Skip it for admins
     so every process card is immediately visible and editable. */
  if (document.getElementById('adminBar')) return;

  /* Scroll-reveal for editorial articles and quality items */
  const revealEls = document.querySelectorAll('.proc-ed__text-col, .proc-ed__img-col, .proc-quality-item, .proc-stat');
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity  = '1';
      entry.target.style.transform = 'none';
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  revealEls.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = `opacity .6s ease ${(i % 3) * 0.1}s, transform .6s ease ${(i % 3) * 0.1}s`;
    io.observe(el);
  });

});
