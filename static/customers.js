/* ══════════════════════════════════════════════════════
   KBI Customers Page — Counter animation
   ══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initCounters();
});

/* ─────────────────────────────────────────────────────
   ANIMATED STAT COUNTERS
───────────────────────────────────────────────────── */
function initCounters() {
  // Counter animation rewrites textContent — which would clobber whatever
  // the admin just typed into the editable stat numbers. Skip it for admins.
  if (document.getElementById('adminBar')) return;
  const nums = document.querySelectorAll('.cust-stat__num[data-target]');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      animateCount(el, target, suffix);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => io.observe(n));
}

function animateCount(el, target, suffix) {
  const duration = 1600;
  const fps      = 60;
  const steps    = Math.round(duration / (1000 / fps));
  let   step     = 0;

  const timer = setInterval(() => {
    step++;
    const progress = step / steps;
    const eased = 1 - Math.pow(1 - progress, 2);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;

    if (step >= steps) {
      clearInterval(timer);
      el.textContent = target + suffix;
    }
  }, 1000 / fps);
}
