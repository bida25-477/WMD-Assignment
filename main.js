/* ============================================================
   Choppies Supermarket — main.js
   Handles: nav scroll effects, page transitions, animations,
   form validation, counter animations, mobile menu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. ACTIVE NAV LINK ─────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav ul li a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  /* ─── 2. SCROLL-AWARE NAVBAR ─────────────────────────────── */
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    }, { passive: true });
  }

  /* ─── 3. MOBILE HAMBURGER MENU ───────────────────────────── */
  if (nav) {
    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.setAttribute('aria-label', 'Toggle navigation');
    hamburger.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
    nav.appendChild(hamburger);

    const navUl = nav.querySelector('ul');
    hamburger.addEventListener('click', () => {
      const isOpen = navUl.classList.toggle('nav--open');
      hamburger.classList.toggle('hamburger--active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navUl.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navUl.classList.remove('nav--open');
        hamburger.classList.remove('hamburger--active');
      });
    });
  }

  /* ─── 4. INTERSECTION OBSERVER — REVEAL ON SCROLL ────────── */
  const revealEls = document.querySelectorAll(
    'article, #stats div, table, .page-banner, #store-info, section'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger sibling cards
      el.style.transitionDelay = `${(i % 6) * 60}ms`;
      observer.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ─── 5. ANIMATED STAT COUNTERS ──────────────────────────── */
  const statsSection = document.querySelector('#stats');
  if (statsSection) {
    const statHeadings = statsSection.querySelectorAll('h3');

    const animateCounter = (el, target, suffix) => {
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statHeadings.forEach(h3 => {
            const raw = h3.textContent.trim();
            // Extract numeric value and suffix (like +, k, etc.)
            const match = raw.match(/^(\d[\d,]*)\s*(\+?)$/);
            if (match) {
              const num = parseInt(match[1].replace(/,/g, ''), 10);
              const suffix = match[2] || '';
              animateCounter(h3, num, suffix);
            }
          });
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });

    counterObserver.observe(statsSection);
  }

  /* ─── 6. CONTACT FORM VALIDATION & UX ───────────────────── */
  const form = document.querySelector('form');
  if (form) {
    // Real-time inline validation
    const showError = (input, msg) => {
      let err = input.parentElement.querySelector('.field-error');
      if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        input.parentElement.appendChild(err);
      }
      err.textContent = msg;
      input.classList.add('input--error');
    };

    const clearError = (input) => {
      const err = input.parentElement.querySelector('.field-error');
      if (err) err.remove();
      input.classList.remove('input--error');
    };

    const validateInput = (input) => {
      clearError(input);
      if (input.required && !input.value.trim()) {
        showError(input, 'This field is required.');
        return false;
      }
      if (input.type === 'email' && input.value) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(input.value)) {
          showError(input, 'Please enter a valid email address.');
          return false;
        }
      }
      if (input.minLength > 0 && input.value.length < input.minLength) {
        showError(input, `Minimum ${input.minLength} characters required.`);
        return false;
      }
      return true;
    };

    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => validateInput(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('input--error')) validateInput(field);
      });
    });

    // Submit handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('input, select, textarea').forEach(field => {
        if (!validateInput(field)) valid = false;
      });

      if (valid) {
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = 'Sending…';
        btn.disabled = true;

        // Simulate submission (replace with real fetch when backend is ready)
        setTimeout(() => {
          showSuccessMessage(form);
          btn.textContent = original;
          btn.disabled = false;
        }, 1400);
      }
    });

    const showSuccessMessage = (formEl) => {
      const msg = document.createElement('div');
      msg.className = 'form-success';
      msg.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="8 12 11 15 16 9"/>
        </svg>
        <p>Thank you! Your message has been sent. We'll be in touch soon.</p>
      `;
      formEl.replaceWith(msg);
      // Animate in
      requestAnimationFrame(() => msg.classList.add('form-success--visible'));
    };
  }

  /* ─── 7. SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─── 8. PRODUCT CARD HOVER RIPPLE ───────────────────────── */
  document.querySelectorAll('#specials article').forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.setProperty('--hover-scale', '1.03');
    });
    card.addEventListener('mouseleave', function () {
      this.style.setProperty('--hover-scale', '1');
    });
  });

  /* ─── 9. FOOTER YEAR AUTO-UPDATE ─────────────────────────── */
  document.querySelectorAll('footer p').forEach(p => {
    if (p.textContent.includes('2026')) {
      p.innerHTML = p.innerHTML.replace('2026', new Date().getFullYear());
    }
  });

  /* ─── 10. BACK TO TOP BUTTON ─────────────────────────────── */
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  `;
  document.body.appendChild(backToTop);

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('back-to-top--visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ─── 11. TABLE ROW HIGHLIGHT ─────────────────────────────── */
  document.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('mouseenter', () => row.classList.add('row--highlight'));
    row.addEventListener('mouseleave', () => row.classList.remove('row--highlight'));
  });

});
