/* KBI — Certifications page JS
   Scroll-reveal for cert pairs and award cards only.  */

document.addEventListener('DOMContentLoaded', () => {

  /* Scroll-reveal: fade up cert articles and award cards as they enter view */
  const revealTargets = document.querySelectorAll(
    '.ch-cert__inner, .ch-award-card'
  );

  if (!revealTargets.length) return;

  revealTargets.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(28px)';
    el.style.transition = 'opacity .7s cubic-bezier(.25,.46,.45,.94), transform .7s cubic-bezier(.25,.46,.45,.94)';
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'none';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => io.observe(el));
});
