/* =============================================
   ZININGI IZINCEBA ZAKHE — WEBSITE SCRIPT
   ============================================= */

const BOOKING_EMAIL = 'bookings@izincebazakhe.com';

/* ──────────────────────────────────────────────
   NAVBAR: Solid background on scroll
   ────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ──────────────────────────────────────────────
   MOBILE MENU: Hamburger toggle
   ────────────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  const toggle = (forceClose = false) => {
    const isOpen = !forceClose && !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';

    // Animate bars → X
    const bars = hamburger.querySelectorAll('.bar');
    if (isOpen) {
      bars[0].style.cssText = 'transform: rotate(45deg) translate(5px, 5px)';
      bars[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
      bars[2].style.cssText = 'transform: rotate(-45deg) translate(5px, -5px)';
    } else {
      bars.forEach(b => (b.style.cssText = ''));
    }
  };

  hamburger.addEventListener('click', () => toggle());

  // Close when a menu link is clicked
  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggle(true));
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggle(true);
  });
})();

/* ──────────────────────────────────────────────
   SCROLL REVEAL: Animate elements into view
   ────────────────────────────────────────────── */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
})();

/* ──────────────────────────────────────────────
   DYNAMIC GALLERY + LIGHTBOX
   ─────────────────────────────────────────────
   Gallery images are loaded from gallery-manifest.json,
   which is generated at build time by generate-manifest.js.

   To add new photos: just upload image files to the
   /gallery folder on GitHub — no HTML editing needed.
   ────────────────────────────────────────────── */
(function initDynamicGallery() {
  const grid        = document.getElementById('galleryGrid');
  const loadingEl   = document.getElementById('galleryLoading');
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightboxImg');
  const lbCaption   = document.getElementById('lightboxCaption');
  const lbClose     = document.getElementById('lightboxClose');
  const lbPrev      = document.getElementById('lightboxPrev');
  const lbNext      = document.getElementById('lightboxNext');

  if (!grid || !lightbox) return;

  let galleryItems = [];
  let currentIndex = 0;

  // ── Lightbox controls ──────────────────────────
  const openLightbox = (index) => {
    currentIndex = index;
    const item    = galleryItems[index];
    const src     = item.getAttribute('data-src');
    const caption = item.getAttribute('data-caption') || '';
    lbImg.src            = src;
    lbImg.alt            = caption;
    lbCaption.innerHTML  = caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbImg.focus?.();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  };

  const prevImage = () => {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  };

  const nextImage = () => {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    openLightbox(currentIndex);
  };

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prevImage);
  lbNext.addEventListener('click', nextImage);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
  });

  // ── Scroll-reveal observer (re-usable for dynamically added items) ──
  const revealObserver = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  // ── Build gallery item DOM from manifest entry ──
  const createItem = (entry, index) => {
    const div = document.createElement('div');
    div.className = 'gallery-item reveal-up';
    div.setAttribute('data-index',   index);
    div.setAttribute('data-src',     entry.src);
    div.setAttribute('data-caption', entry.caption);
    div.setAttribute('tabindex',     '0');

    const img = document.createElement('img');
    img.src     = entry.src;
    img.alt     = entry.alt || entry.caption;
    img.loading = 'lazy';

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = '<span>View</span>';

    div.appendChild(img);
    div.appendChild(overlay);

    div.addEventListener('click', () => openLightbox(index));
    div.addEventListener('keydown', e => { if (e.key === 'Enter') openLightbox(index); });

    revealObserver.observe(div);
    return div;
  };

  // ── Fetch manifest and render gallery ──────────
  fetch('gallery-manifest.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(manifest => {
      if (loadingEl) loadingEl.remove();

      if (!manifest.length) {
        grid.innerHTML = '<p style="text-align:center;color:var(--gold);padding:2rem">No images in the gallery yet.</p>';
        return;
      }

      const fragment = document.createDocumentFragment();
      manifest.forEach((entry, i) => fragment.appendChild(createItem(entry, i)));
      grid.appendChild(fragment);

      // Make live NodeList for lightbox navigation
      galleryItems = Array.from(grid.querySelectorAll('.gallery-item'));
    })
    .catch(err => {
      console.warn('Gallery manifest not found — gallery hidden.', err);
      if (loadingEl) loadingEl.remove();
    });
})();

/* ──────────────────────────────────────────────
   BOOKING FORM — mailto handler
   ────────────────────────────────────────────── */
(function initBookingForm() {
  const form        = document.getElementById('bookingForm');
  const successBox  = document.getElementById('formSuccess');
  if (!form) return;

  // Validate a single field
  const validate = (field) => {
    const val = field.value.trim();
    let error = '';
    if (field.required && !val) {
      error = 'This field is required.';
    } else if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      error = 'Please enter a valid email address.';
    } else if (field.type === 'date' && val) {
      const selected = new Date(val + 'T00:00:00');
      const minDate  = new Date();
      minDate.setHours(0, 0, 0, 0);
      minDate.setDate(minDate.getDate() + 7);
      if (selected < minDate) error = 'Orders must be placed at least 7 days in advance.';
    }

    // Show/clear inline error
    let errEl = field.parentNode.querySelector('.field-error');
    if (error) {
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'field-error';
        errEl.style.cssText = 'color:var(--rose);font-size:0.75rem;margin-top:0.25rem';
        field.parentNode.appendChild(errEl);
      }
      errEl.textContent = error;
      field.style.borderColor = 'var(--rose)';
      return false;
    } else {
      if (errEl) errEl.remove();
      field.style.borderColor = '';
      return true;
    }
  };

  // Live validation on blur
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => {
      const errEl = field.parentNode.querySelector('.field-error');
      if (errEl) validate(field);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Run full validation
    const fields  = Array.from(form.querySelectorAll('input[required], select[required]'));
    const allValid = fields.every(f => validate(f));
    if (!allValid) {
      const firstErr = form.querySelector('.field-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Collect values
    const name     = document.getElementById('clientName').value.trim();
    const email    = document.getElementById('clientEmail').value.trim();
    const phone    = document.getElementById('clientPhone').value.trim();
    const date     = document.getElementById('eventDate').value;
    const type     = document.getElementById('eventType').value;
    const guests   = document.getElementById('guestCount').value;
    const message  = document.getElementById('specialRequests').value.trim();

    // Format date nicely
    const formattedDate = date
      ? new Date(date + 'T00:00:00').toLocaleDateString('en-ZA', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
      : 'Not specified';

    // Build email body
    const subject = encodeURIComponent(`Booking Request — ${type} | ${formattedDate}`);
    const body    = encodeURIComponent(
`Hi Ziningi,

I'd like to book your services. Here are my details:

────────────────────────────
  NAME:         ${name}
  EMAIL:        ${email}
  PHONE:        ${phone || 'Not provided'}
  SERVICE:      ${type}
  DATE:         ${formattedDate}
  GUESTS:       ${guests || 'Not specified'}
────────────────────────────

MESSAGE / SPECIAL REQUESTS:
${message || 'None'}

Looking forward to hearing from you!

Kind regards,
${name}
`
    );

    // Open mail client
    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${subject}&body=${body}`;

    // Show success state after short delay (time for mail client to open)
    setTimeout(() => {
      form.style.display = 'none';
      successBox.classList.add('visible');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 800);
  });
})();

/* ──────────────────────────────────────────────
   SMOOTH SCROLL for anchor links
   (fallback for older browsers)
   ────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 72; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ──────────────────────────────────────────────
   ACTIVE NAV LINK highlight on scroll
   ────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const highlightNav = () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color = href === current ? 'var(--gold)' : '';
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });
})();

/* ──────────────────────────────────────────────
   HERO IMAGE: subtle parallax on scroll
   ────────────────────────────────────────────── */
(function initHeroParallax() {
  const heroImg = document.querySelector('.hero-img');
  if (!heroImg) return;

  const onScroll = () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroImg.style.transform = `scale(1.04) translateY(${scrolled * 0.06}px)`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ──────────────────────────────────────────────
   SET MIN DATE — orders must be placed at least
   7 days before the event date
   ────────────────────────────────────────────── */
(function setMinDate() {
  const dateInput = document.getElementById('eventDate');
  if (!dateInput) return;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  dateInput.setAttribute('min', minDate.toISOString().split('T')[0]);
})();
