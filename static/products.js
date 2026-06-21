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
  // 3D cover-flow: center prominent, sides scale + rotate to peek from edges.
  // |rel| >= 3 = parked off-stage (fully transparent) on its own side.
  const FAR_TX = 820;

  function getTransform(rel) {
    switch (rel) {
      case  0: return { tx:    0, sc: 1.00, ry:   0, op: 1.00, z: 10 };
      case  1: return { tx:  310, sc: 0.82, ry: -10, op: 0.72, z:  7 };
      case -1: return { tx: -310, sc: 0.82, ry:  10, op: 0.72, z:  7 };
      case  2: return { tx:  570, sc: 0.66, ry: -18, op: 0.42, z:  4 };
      case -2: return { tx: -570, sc: 0.66, ry:  18, op: 0.42, z:  4 };
      default: return { tx: rel > 0 ? FAR_TX : -FAR_TX, sc: 0.52, ry: rel > 0 ? -24 : 24, op: 0, z: 1 };
    }
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

  /* Pills — single selection: one category active at a time */
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      activeFilters = new Set([pill.dataset.category]);
      pills.forEach(p => p.classList.toggle('active', p === pill));
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
    const n = visCards.length;

    visCards.forEach((card, i) => {
      // ── Shortest-path rel: each card glides to its new slot the short way ──
      let rel = i - activeIndex;
      if (rel >  n / 2) rel -= n;
      else if (rel < -n / 2) rel += n;

      const { tx, sc, ry, op, z } = getTransform(rel);

      // Cards deep in the back are invisible and swap sides as the loop wraps;
      // disabling their transition keeps that swap unseen. Every on-stage card
      // (|rel| <= 3) animates, so a step is always a single smooth glide — no
      // teleporting, no forced reflow, no alternating jumps.
      card.style.transition = Math.abs(rel) > 3 ? 'none' : '';
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
  function startAuto() { autoTimer = setInterval(() => step(1), 2200); }
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
  // In admin edit mode the carousel is frozen into a static grid (admin.css)
  // so cards can be added/deleted without the ticker moving — don't autoplay.
  if (!document.body.classList.contains('edit-mode')) startAuto();
});
