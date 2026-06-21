document.addEventListener('DOMContentLoaded', function () {

  /* ── Contact Form Submission ───────────────────── */
  const form = document.getElementById('cu-contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.cu-btn--form');
      const original = btn.textContent;

      btn.disabled = true;
      btn.textContent = 'Sending…';

      const formData = {
        name:    form.elements['name'].value,
        email:   form.elements['email'].value,
        phone:   form.elements['phone'].value,
        message: form.elements['message'].value,
      };

      try {
        const response = await fetch('/submit-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await response.json();

        if (result.success) {
          alert(result.message || 'Message sent! We\'ll get back to you soon.');
          form.reset();
        } else {
          alert(result.message || 'Something went wrong. Please try again.');
        }
      } catch {
        alert('Connection error. Please check your internet and try again.');
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });

    /* Real-time validation highlight */
    form.querySelectorAll('input[required], textarea[required]').forEach(field => {
      field.addEventListener('blur', function () {
        this.style.borderColor = this.value.trim() ? '' : '#e74c3c';
      });
      field.addEventListener('input', function () {
        if (this.value.trim()) this.style.borderColor = '';
      });
    });
  }

  /* ── Newsletter Subscribe (stub) ──────────────── */
  const nlBtn = document.querySelector('.cu-newsletter__btn');
  if (nlBtn) {
    nlBtn.addEventListener('click', () => {
      const input = document.querySelector('.cu-newsletter__input');
      if (!input || !input.value.trim()) return;
      // Stub — wire up to backend when ready
      alert('Thank you for subscribing! We\'ll keep you updated.');
      input.value = '';
    });
  }

  /* ── Scroll-reveal ────────────────────────────── */
  const revealEls = document.querySelectorAll('.cu-info-card, .cu-map-item, .cu-newsletter, .cu-form-wrap');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .55s ease, transform .55s ease';
      io.observe(el);
    });
  }

});
