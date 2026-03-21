/* ============================================================
   KBI Products — filter, search, drag-scroll, arrow nav
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Elements ── */
  const track      = document.getElementById('productsGrid');
  const trackWrap  = track.closest('.prod-track-wrap');
  const arrowLeft  = document.getElementById('prodArrowLeft');
  const arrowRight = document.getElementById('prodArrowRight');
  const searchInput = document.getElementById('productSearch');
  const pills       = document.querySelectorAll('.prod-pill');

  let activeFilters = new Set(['all']);

  /* ============================================================
     FILTER + SEARCH
     ============================================================ */
  function applyFilters() {
    const term = searchInput.value.trim().toLowerCase();
    const cards = track.querySelectorAll('.prod-card');
    let visible = 0;

    cards.forEach(card => {
      const name  = card.dataset.name.toLowerCase();
      const cats  = card.dataset.category.toLowerCase().split(',').map(s => s.trim());
      const desc  = card.querySelector('.prod-card__desc')?.textContent.toLowerCase() || '';

      const matchSearch = !term || name.includes(term) || desc.includes(term)
        || cats.some(c => c.includes(term));

      const matchFilter = activeFilters.has('all')
        || cats.some(c => activeFilters.has(c));

      if (matchSearch && matchFilter) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    // No-results message
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

    updateArrows();
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
      applyFilters();
    });
  });

  /* Search */
  searchInput.addEventListener('input', applyFilters);

  /* ============================================================
     DRAG SCROLL
     ============================================================ */
  let isDragging = false;
  let startX     = 0;
  let scrollLeft = 0;

  trackWrap.addEventListener('mousedown', e => {
    isDragging = true;
    trackWrap.classList.add('is-dragging');
    startX     = e.pageX - trackWrap.offsetLeft;
    scrollLeft = trackWrap.scrollLeft;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    trackWrap.classList.remove('is-dragging');
  });

  trackWrap.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - trackWrap.offsetLeft;
    const walk = (x - startX) * 1.6;
    trackWrap.scrollLeft = scrollLeft - walk;
    updateArrows();
  });

  /* Touch drag */
  let touchStartX = 0;
  let touchScrollLeft = 0;
  trackWrap.addEventListener('touchstart', e => {
    touchStartX     = e.touches[0].pageX;
    touchScrollLeft = trackWrap.scrollLeft;
  }, { passive: true });

  trackWrap.addEventListener('touchmove', e => {
    const dx = touchStartX - e.touches[0].pageX;
    trackWrap.scrollLeft = touchScrollLeft + dx;
    updateArrows();
  }, { passive: true });

  /* ============================================================
     ARROW NAVIGATION
     ============================================================ */
  const SCROLL_AMOUNT = 340;

  arrowLeft.addEventListener('click', () => {
    trackWrap.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    setTimeout(updateArrows, 350);
  });

  arrowRight.addEventListener('click', () => {
    trackWrap.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    setTimeout(updateArrows, 350);
  });

  function updateArrows() {
    const sl  = trackWrap.scrollLeft;
    const max = trackWrap.scrollWidth - trackWrap.clientWidth;
    arrowLeft.classList.toggle('hidden',  sl <= 2);
    arrowRight.classList.toggle('hidden', sl >= max - 2);
  }

  /* Enable overflow-x scroll on the wrap (CSS has overflow:hidden for clean look,
     but JS scroll still works — we just need to allow it) */
  trackWrap.style.overflowX = 'scroll';
  trackWrap.style.scrollbarWidth = 'none'; /* Firefox */
  trackWrap.style.msOverflowStyle = 'none';
  /* Hide scrollbar for webkit */
  const styleTag = document.createElement('style');
  styleTag.textContent = '.prod-track-wrap::-webkit-scrollbar { display: none; }';
  document.head.appendChild(styleTag);

  /* Initial arrow state */
  updateArrows();
  trackWrap.addEventListener('scroll', updateArrows);

  /* ============================================================
     3D FAN HOVER EFFECT
     Distance map: [scale, translateY, rotateY, brightness]
     Cards radiate outward from the hovered card in a triangular arc.
     Left cards lean right (+rotateY), right cards lean left (-rotateY).
     ============================================================ */
  const FAN = [
    { scale: 1.09, y: -22, ry:  0,  bright: 1.0 },   // dist 0 — active card
    { scale: 0.92, y:  -4, ry: 10,  bright: 0.88 },   // dist 1
    { scale: 0.80, y:   8, ry: 17,  bright: 0.72 },   // dist 2
    { scale: 0.70, y:  16, ry: 22,  bright: 0.58 },   // dist 3
    { scale: 0.62, y:  22, ry: 26,  bright: 0.46 },   // dist 4+
  ];

  function applyFan(hoverCard) {
    const visible = [...track.querySelectorAll('.prod-card:not(.hidden)')];
    const idx = visible.indexOf(hoverCard);
    if (idx === -1) return;

    visible.forEach((card, i) => {
      const dist = Math.abs(i - idx);
      const dir  = i < idx ? 1 : -1;          // left = +rotateY, right = -rotateY
      const d    = Math.min(dist, FAN.length - 1);
      const { scale, y, ry, bright } = FAN[d];

      const tf = dist === 0
        ? `perspective(1000px) translateY(${y}px) scale(${scale})`
        : `perspective(1000px) translateY(${y}px) scale(${scale}) rotateY(${ry * dir}deg)`;

      card.style.transform = tf;
      card.style.filter    = `brightness(${bright})`;
      card.style.zIndex    = String(30 - dist);
      card.style.boxShadow = dist === 0
        ? '0 22px 44px rgba(13,26,58,.28), 0 6px 16px rgba(13,26,58,.14)'
        : '';
    });
  }

  function resetFan() {
    track.querySelectorAll('.prod-card').forEach(card => {
      card.style.transform = '';
      card.style.filter    = '';
      card.style.zIndex    = '';
      card.style.boxShadow = '';
    });
  }

  /* Event delegation — only recalculate when the hovered card changes */
  let lastHoveredCard = null;

  track.addEventListener('mouseover', e => {
    const card = e.target.closest('.prod-card');
    if (card && !card.classList.contains('hidden') && card !== lastHoveredCard) {
      lastHoveredCard = card;
      applyFan(card);
    }
  });

  track.addEventListener('mouseleave', () => {
    lastHoveredCard = null;
    resetFan();
  });
});
