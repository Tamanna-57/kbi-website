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
});
