/* ============================================================
   KBI Products — 3D center-focused carousel + filter/search
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const track      = document.getElementById('productsGrid');
  const trackWrap  = track.closest('.prod-track-wrap');
  const arrowLeft  = document.getElementById('prodArrowLeft');
  const arrowRight = document.getElementById('prodArrowRight');
  const searchInput = document.getElementById('productSearch');
  const pills       = document.querySelectorAll('.prod-pill');
  const dotsEl      = document.getElementById('prodDots');

  let activeFilters = new Set(['all']);
  let activeIndex   = 0;
  let autoTimer     = null;

  /* ============================================================
     3D TRANSFORM MAP
     rel position → visual properties
     ============================================================ */
  const TRANSFORM_MAP = {
     0:  { tx:    0, sc: 1.22, ry:   0, op: 1.00, z: 10 },
     1:  { tx:  310, sc: 0.88, ry:  -8, op: 0.65, z:  7 },
    '-1':{ tx: -310, sc: 0.88, ry:   8, op: 0.65, z:  7 },
     2:  { tx:  580, sc: 0.72, ry: -16, op: 0.38, z:  4 },
    '-2':{ tx: -580, sc: 0.72, ry:  16, op: 0.38, z:  4 },
  };

  function getTransform(rel) {
    const abs = Math.abs(rel);
    if (abs > 2) return { tx: rel > 0 ? 860 : -860, sc: 0.5, ry: rel > 0 ? -24 : 24, op: 0, z: 1 };
    return TRANSFORM_MAP[rel] || TRANSFORM_MAP[String(rel)];
  }

  function getVisibleCards() {
    return [...track.querySelectorAll('.prod-card:not(.hidden)')];
  }

  /* ============================================================
     FILTER + SEARCH
     ============================================================ */
  function applyFilters() {
    const term  = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const cards = track.querySelectorAll('.prod-card');
    let visible = 0;

    cards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      const cats = card.dataset.category.toLowerCase().split(',').map(s => s.trim());
      const desc = card.querySelector('.prod-card__desc')?.textContent.toLowerCase() || '';

      const matchSearch = !term || name.includes(term) || desc.includes(term)
        || cats.some(c => c.includes(term));
      const matchFilter = activeFilters.has('all') || cats.some(c => activeFilters.has(c));

      if (matchSearch && matchFilter) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    let noRes = track.querySelector('.prod-no-results');
    if (visible === 0) {
      if (!noRes) {
        noRes = document.createElement('p');
        noRes.className = 'prod-no-results';
        noRes.textContent = 'No products match your search.';
        track.appendChild(noRes);
      }
    } else {
      noRes?.remove();
    }

    const visCards = getVisibleCards();
    activeIndex = Math.min(activeIndex, Math.max(0, visCards.length - 1));
    buildDots();
    updateCarousel();
  }

  /* Pills */
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.category;
      if (cat === 'all') {
        activeFilters = new Set(['all']);
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      } else {
        activeFilters.delete('all');
        document.querySelector('.prod-pill[data-category="all"]').classList.remove('active');
        if (activeFilters.has(cat)) {
          activeFilters.delete(cat);
          pill.classList.remove('active');
        } else {
          activeFilters.add(cat);
          pill.classList.add('active');
        }
        if (activeFilters.size === 0) {
          activeFilters.add('all');
          document.querySelector('.prod-pill[data-category="all"]').classList.add('active');
        }
      }
      activeIndex = 0;
      applyFilters();
    });
  });

  /* Search */
  if (searchInput) searchInput.addEventListener('input', () => {
    activeIndex = 0;
    applyFilters();
  });

  /* ============================================================
     DOTS
     ============================================================ */
  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    getVisibleCards().forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'prod-carousel-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }

  /* ============================================================
     CAROUSEL LOGIC
     ============================================================ */
  function goTo(idx) {
    const visCards = getVisibleCards();
    if (!visCards.length) return;
    activeIndex = ((idx % visCards.length) + visCards.length) % visCards.length;
    updateCarousel();
    resetAuto();
  }

  function step(dir) { goTo(activeIndex + dir); }

  function updateCarousel() {
    const visCards = getVisibleCards();
    const dots = dotsEl ? dotsEl.querySelectorAll('.prod-carousel-dot') : [];

    visCards.forEach((card, i) => {
      const rel = i - activeIndex;
      const { tx, sc, ry, op, z } = getTransform(rel);
      card.style.transform = `translateX(${tx}px) scale(${sc}) rotateY(${ry}deg)`;
      card.style.opacity   = op;
      card.style.zIndex    = z;
      card.classList.toggle('prod-card--active', rel === 0);
    });

    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
  }

  /* ============================================================
     NAVIGATION — arrows, keyboard, touch, click-to-focus
     ============================================================ */
  arrowLeft.addEventListener('click',  () => step(-1));
  arrowRight.addEventListener('click', () => step( 1));

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step( 1);
  });

  /* Touch drag */
  let touchX = 0;
  trackWrap.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    clearInterval(autoTimer);
  }, { passive: true });
  trackWrap.addEventListener('touchend', e => {
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) step(dx > 0 ? 1 : -1);
    startAuto();
  });

  /* Mouse drag — allows direction reversal */
  let dragStartX = null;
  let wasDragging = false;

  trackWrap.addEventListener('mousedown', e => {
    dragStartX = e.clientX;
    wasDragging = false;
    clearInterval(autoTimer);
    trackWrap.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (dragStartX === null) return;
    if (Math.abs(e.clientX - dragStartX) > 8) wasDragging = true;
  });

  window.addEventListener('mouseup', e => {
    if (dragStartX !== null) {
      const dx = dragStartX - e.clientX;
      if (wasDragging && Math.abs(dx) > 40) step(dx > 0 ? 1 : -1);
      dragStartX = null;
      startAuto();
    }
    trackWrap.style.cursor = 'grab';
  });

  trackWrap.addEventListener('click', e => {
    if (wasDragging) { wasDragging = false; return; }
    const card = e.target.closest('.prod-card:not(.hidden)');
    if (!card) return;
    const idx = getVisibleCards().indexOf(card);
    if (idx !== -1 && idx !== activeIndex) goTo(idx);
  });

  /* ============================================================
     AUTO-PLAY
     ============================================================ */
  function startAuto() { autoTimer = setInterval(() => step(1), 4000); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  trackWrap.addEventListener('mouseenter', () => clearInterval(autoTimer));
  trackWrap.addEventListener('mouseleave', () => {
    dragStartX = null;
    trackWrap.style.cursor = 'grab';
    startAuto();
  });

  /* ============================================================
     INIT
     ============================================================ */
  buildDots();
  updateCarousel();
  startAuto();
});
