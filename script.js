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
   Images are loaded from two sources merged together:
     1. Cloudinary (new uploads via /admin)   — shown first
     2. gallery-manifest.json (existing local files) — fallback
   Videos are loaded from Cloudinary and prepended above
   the existing hardcoded video section.
   ────────────────────────────────────────────── */
(function initDynamicGallery() {
  const grid      = document.getElementById('galleryGrid');
  const loadingEl = document.getElementById('galleryLoading');
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbClose   = document.getElementById('lightboxClose');
  const lbPrev    = document.getElementById('lightboxPrev');
  const lbNext    = document.getElementById('lightboxNext');

  if (!grid || !lightbox) return;

  const PAGE_SIZE  = 20;
  let allImages    = [];
  let renderedCount = 0;
  let galleryItems = [];
  let currentIndex = 0;

  // ── Lightbox ───────────────────────────────────
  const openLightbox = (index) => {
    currentIndex = index;
    const item    = galleryItems[index];
    const src     = item.getAttribute('data-src');
    const caption = item.getAttribute('data-caption') || '';
    lbImg.src           = src;
    lbImg.alt           = caption;
    lbCaption.innerHTML = caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
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
  lbPrev.addEventListener('click',  prevImage);
  lbNext.addEventListener('click',  nextImage);

  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

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

  // ── Scroll-reveal ──────────────────────────────
  const revealObserver = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  // ── Build a gallery card ───────────────────────
  const createItem = (entry, globalIndex) => {
    const div = document.createElement('div');
    div.className = 'gallery-item reveal-up';
    div.setAttribute('data-index',   globalIndex);
    div.setAttribute('data-src',     entry.src);
    div.setAttribute('data-caption', entry.caption || 'Culinary Creation');
    div.setAttribute('tabindex',     '0');

    const img  = document.createElement('img');
    img.src     = entry.thumb || entry.src;
    img.alt     = entry.caption || 'A dish prepared by Ziningi';
    img.loading = 'lazy';

    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = '<span>View</span>';

    div.appendChild(img);
    div.appendChild(overlay);

    div.addEventListener('click',   () => openLightbox(globalIndex));
    div.addEventListener('keydown', e => { if (e.key === 'Enter') openLightbox(globalIndex); });

    revealObserver.observe(div);
    return div;
  };

  // ── Render next page of images ─────────────────
  const renderPage = () => {
    const batch = allImages.slice(renderedCount, renderedCount + PAGE_SIZE);
    if (!batch.length) return;

    const fragment = document.createDocumentFragment();
    batch.forEach((entry, i) => fragment.appendChild(createItem(entry, renderedCount + i)));
    grid.appendChild(fragment);
    renderedCount += batch.length;

    galleryItems = Array.from(grid.querySelectorAll('.gallery-item'));

    // Show or hide "Load more" button
    const btn = document.getElementById('galleryLoadMore');
    if (btn) btn.style.display = renderedCount >= allImages.length ? 'none' : 'block';
  };

  // ── "Load more" button ─────────────────────────
  const addLoadMoreBtn = () => {
    if (document.getElementById('galleryLoadMore')) return;
    const btn = document.createElement('button');
    btn.id        = 'galleryLoadMore';
    btn.textContent = 'Load more';
    btn.style.cssText = [
      'display:block', 'margin:2rem auto 0', 'padding:0.75rem 2.5rem',
      'background:transparent', 'border:1px solid var(--gold)', 'color:var(--gold)',
      'border-radius:9px', 'font-size:0.88rem', 'font-family:Inter,sans-serif',
      'cursor:pointer', 'letter-spacing:0.04em', 'transition:background .2s,color .2s',
    ].join(';');
    btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--gold)'; btn.style.color = 'var(--dark)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; btn.style.color = 'var(--gold)'; });
    btn.addEventListener('click', renderPage);
    grid.insertAdjacentElement('afterend', btn);
  };

  // ── Fetch both sources and merge ───────────────
  Promise.allSettled([
    fetch('/.netlify/functions/gallery').then(r => r.ok ? r.json() : { images: [] }),
    fetch('gallery-manifest.json').then(r => r.ok ? r.json() : []),
  ]).then(([cloudRes, manifestRes]) => {
    if (loadingEl) loadingEl.remove();

    const cloudImages    = cloudRes.status    === 'fulfilled' ? (cloudRes.value.images    || []) : [];
    const manifestImages = manifestRes.status === 'fulfilled' ? (manifestRes.value || []) : [];
    const cloudVideos    = cloudRes.status    === 'fulfilled' ? (cloudRes.value.videos    || []) : [];

    // Merge: Cloudinary photos (newest) first, then existing local photos
    allImages = [...cloudImages, ...manifestImages];

    if (!allImages.length) {
      grid.innerHTML = '<p style="text-align:center;color:var(--gold);padding:2rem">No images in the gallery yet.</p>';
      return;
    }

    addLoadMoreBtn();
    renderPage();

    // Render all videos (Cloudinary + legacy) sorted newest first
    renderAllVideos(cloudVideos);
  });

  // ── All videos merged and sorted by date ───────
  const LEGACY_VIDEOS = [
    { src: 'media%20files/WhatsApp%20Video%202026-05-23%20at%2022.49.16.mp4', date: '2026-05-23T22:49:16' },
    { src: 'media%20files/WhatsApp%20Video%202026-05-23%20at%2022.48.55.mp4', date: '2026-05-23T22:48:55' },
    { src: 'media%20files/WhatsApp%20Video%202026-05-23%20at%2022.48.44.mp4', date: '2026-05-23T22:48:44' },
    { src: 'media%20files/WhatsApp%20Video%202026-05-23%20at%2022.48.25.mp4', date: '2026-05-23T22:48:25' },
    { src: 'media%20files/WhatsApp%20Video%202026-05-23%20at%2022.48.18.mp4', date: '2026-05-23T22:48:18' },
    { src: 'media%20files/WhatsApp%20Video%202026-05-23%20at%2022.48.03.mp4', date: '2026-05-23T22:48:03' },
    { src: 'media%20files/WhatsApp%20Video%202026-05-23%20at%2022.47.47.mp4', date: '2026-05-23T22:47:47' },
    { src: 'media%20files/WhatsApp%20Video%202026-05-23%20at%2022.47.13.mp4', date: '2026-05-23T22:47:13' },
  ];

  function renderAllVideos(cloudVideos) {
    const videosGrid    = document.getElementById('videosGrid');
    const videosLoading = document.getElementById('videosLoading');
    if (!videosGrid) return;
    if (videosLoading) videosLoading.remove();

    const allVideos = [...cloudVideos, ...LEGACY_VIDEOS]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!allVideos.length) return;

    const fragment = document.createDocumentFragment();
    allVideos.forEach((v, i) => {
      const card = document.createElement('div');
      card.className = 'video-card reveal-up';

      const video = document.createElement('video');
      video.className = 'video-player';
      video.controls  = true;
      video.preload   = 'none';
      video.setAttribute('aria-label', `Kitchen video ${i + 1}`);
      if (v.poster) video.poster = v.poster;

      const source = document.createElement('source');
      source.src   = v.src;
      source.type  = 'video/mp4';

      video.appendChild(source);
      card.appendChild(video);
      fragment.appendChild(card);
      revealObserver.observe(card);
    });

    videosGrid.appendChild(fragment);
  }
})();

/* ──────────────────────────────────────────────
   BOOKING FORM — mailto handler
   ────────────────────────────────────────────── */
(function initBookingForm() {
  const form       = document.getElementById('bookingForm');
  const successBox = document.getElementById('formSuccess');
  if (!form) return;

  // ── Field validation ──────────────────────────
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
      if (selected < minDate) error = 'Please select a date at least 7 days from today.';
    }
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

  // Live validation on blur / input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur',  () => validate(field));
    field.addEventListener('input', () => {
      if (field.parentNode.querySelector('.field-error')) validate(field);
    });
  });

  // ── Submit ────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const requiredFields = Array.from(form.querySelectorAll('input[required], select[required]'));
    const allValid = requiredFields.every(f => validate(f));
    if (!allValid) {
      const firstErr = form.querySelector('.field-error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const name    = document.getElementById('clientName').value.trim();
    const email   = document.getElementById('clientEmail').value.trim();
    const phone   = document.getElementById('clientPhone').value.trim();
    const date    = document.getElementById('eventDate').value;
    const type    = document.getElementById('eventType').value;
    const guests  = document.getElementById('guestCount').value;
    const message = document.getElementById('specialRequests').value.trim();

    const formattedDate = date
      ? new Date(date + 'T00:00:00').toLocaleDateString('en-ZA', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
      : 'Not specified';

    const subject = encodeURIComponent(`Booking Request — ${type} | ${formattedDate}`);
    const body    = encodeURIComponent(
`Hi Ziningi,

I'd like to book your services. Here are my details:

  NAME:    ${name}
  EMAIL:   ${email}
  PHONE:   ${phone || 'Not provided'}
  SERVICE: ${type}
  DATE:    ${formattedDate}
  GUESTS:  ${guests || 'Not specified'}

MESSAGE / SPECIAL REQUESTS:
${message || 'None'}

Kind regards,
${name}`
    );

    // Open mail client with pre-filled email
    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${subject}&body=${body}`;

    // Show success message — includes fallback email address
    // in case the mail client doesn't open
    setTimeout(() => {
      form.style.display = 'none';
      successBox.classList.add('visible');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600);
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

