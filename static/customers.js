/* ══════════════════════════════════════════════════════
   KBI Customers Page — Counter animation
   ══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  initFilter();
});

/* ─────────────────────────────────────────────────────
   SECTOR FILTER
───────────────────────────────────────────────────── */
function initFilter() {
  const pills = document.querySelectorAll('.cust-pill');
  const cards = document.querySelectorAll('#custGrid .cust-cell');
  if (!pills.length || !cards.length) return;

  function applyFilter(sector) {
    cards.forEach(card => {
      const match = sector === 'all' || card.dataset.sector === sector;
      card.classList.toggle('hidden', !match);
    });
    pills.forEach(p => p.classList.toggle('active', p.dataset.sector === sector));
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => applyFilter(pill.dataset.sector));
  });

  // Auto-activate from URL: /customers?sector=offroad
  const param = new URLSearchParams(window.location.search).get('sector');
  if (param) applyFilter(param);
}

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
