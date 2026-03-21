/* ══════════════════════════════════════════════════════
   KBI Customers Page — 3D Carousel + Counter animation
   ══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initCounters();
});

/* ─────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────── */
const CUSTOMERS = [
  { img: '/static/pics/maruti_suzuki_img.png',   name: 'Maruti Suzuki',    tag: "India's Leading Carmaker"     },
  { img: '/static/pics/volvo_eicher.webp',        name: 'Volvo Eicher',     tag: 'Commercial Vehicles Leader'   },
  { img: '/static/pics/havells_img.png',          name: 'Havells',          tag: 'Electrical Equipment Giant'   },
  { img: '/static/pics/kobelco_img.png',          name: 'Kobelco',          tag: 'Construction Excellence'      },
  { img: '/static/pics/kubota_img.png',           name: 'Escorts Kubota',   tag: 'Agricultural Innovation'      },
  { img: '/static/pics/New_Holland_img.png',      name: 'New Holland',      tag: 'Global Agri Powerhouse'       },
  { img: '/static/pics/carraro_img.png',          name: 'Carraro',          tag: 'The Driveline Experts'        },
  { img: '/static/pics/Mahindra_Defence_img.jpg', name: 'Mahindra Defence', tag: 'Defence Solutions'            },
  { img: '/static/pics/caparo_img.png',           name: 'Caparo Maruti',    tag: 'Automotive Precision'         },
  { img: '/static/pics/eulermotors_img.jpg',      name: 'Euler Motors',     tag: 'EV Mobility Pioneer'          },
  { img: '/static/pics/Delton Cables.png',        name: 'Delton Cables',    tag: 'Power Cable Solutions'        },
  { img: '/static/pics/cords_cables.webp',        name: 'Cords Cables',     tag: 'Power Connectivity'           },
];

/* ─────────────────────────────────────────────────────
   3D CAROUSEL
   Transform map: relative position → visual props
───────────────────────────────────────────────────── */
const TRANSFORM_MAP = {
  //     tx       scale   ry      opacity   z
   0: { tx:    0, sc: 1.20, ry:   0, op: 1.00, z: 10 },
   1: { tx:  275, sc: 0.88, ry:  -8, op: 0.62, z:  7 },
  '-1':{ tx: -275, sc: 0.88, ry:   8, op: 0.62, z:  7 },
   2: { tx:  510, sc: 0.72, ry: -16, op: 0.32, z:  4 },
  '-2':{ tx: -510, sc: 0.72, ry:  16, op: 0.32, z:  4 },
};
function getTransform(relPos) {
  const abs = Math.abs(relPos);
  if (abs > 2) return { tx: relPos > 0 ? 720 : -720, sc: 0.5, ry: relPos > 0 ? -24 : 24, op: 0, z: 1 };
  return TRANSFORM_MAP[relPos] || TRANSFORM_MAP[String(relPos)];
}

let activeIndex  = 0;
let autoTimer    = null;
let isAnimating  = false;

function initCarousel() {
  const track = document.getElementById('custCarouselTrack');
  const dotsEl = document.getElementById('custDots');
  if (!track || !dotsEl) return;

  /* Build cards */
  CUSTOMERS.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'cust-car-card';
    card.dataset.index = i;
    card.innerHTML = `
      <div class="cust-car-card__img">
        <img src="${c.img}" alt="${c.name}" loading="lazy">
      </div>
      <div class="cust-car-card__body">
        <h3>${c.name}</h3>
        <span class="cust-car-card__sector">${c.tag}</span>
      </div>
    `;
    card.addEventListener('click', () => goTo(i));
    track.appendChild(card);
  });

  /* Build dots */
  CUSTOMERS.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'cust-car-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  /* Buttons */
  document.getElementById('custPrev')?.addEventListener('click', () => step(-1));
  document.getElementById('custNext')?.addEventListener('click', () => step( 1));

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step( 1);
  });

  /* Touch swipe */
  let touchX = 0;
  const stage = document.getElementById('custCarouselStage');
  stage?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  stage?.addEventListener('touchend',   e => {
    const dx = touchX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) step(dx > 0 ? 1 : -1);
  });

  /* Auto-play */
  startAuto();

  /* Initial render */
  updateCarousel();
}

function goTo(idx) {
  if (isAnimating) return;
  activeIndex = ((idx % CUSTOMERS.length) + CUSTOMERS.length) % CUSTOMERS.length;
  updateCarousel();
  resetAuto();
}

function step(dir) {
  goTo(activeIndex + dir);
}

function startAuto() {
  autoTimer = setInterval(() => step(1), 3200);
}
function resetAuto() {
  clearInterval(autoTimer);
  startAuto();
}

function updateCarousel() {
  const cards = document.querySelectorAll('.cust-car-card');
  const dots  = document.querySelectorAll('.cust-car-dot');
  const n = cards.length;

  cards.forEach((card, i) => {
    let rel = i - activeIndex;
    // Wrap around for circular feel
    if (rel >  n / 2) rel -= n;
    if (rel < -n / 2) rel += n;

    const { tx, sc, ry, op, z } = getTransform(rel);

    card.style.transform  = `translateX(${tx}px) scale(${sc}) rotateY(${ry}deg)`;
    card.style.opacity    = op;
    card.style.zIndex     = z;
    card.classList.toggle('cust-car-card--active', rel === 0);
  });

  dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
}

/* ─────────────────────────────────────────────────────
   ANIMATED STAT COUNTERS
───────────────────────────────────────────────────── */
function initCounters() {
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
    // Ease-out quad
    const eased = 1 - Math.pow(1 - progress, 2);
    const current = Math.round(eased * target);
    el.textContent = current + suffix;

    if (step >= steps) {
      clearInterval(timer);
      el.textContent = target + suffix;
    }
  }, 1000 / fps);
}
