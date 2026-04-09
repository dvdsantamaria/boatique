/* ========================================
   Boatique Marine - Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {
  // Detect current page
  const path = window.location.pathname;
  const pageFile = path.split('/').pop() || 'index.html';
  const pageName = pageFile.replace('.html', '') || 'index';

  // Navbar active state
  const navLinks = document.querySelectorAll('.nav-link[data-page], .mobile-nav-link[data-page]');
  navLinks.forEach(function (link) {
    const linkPage = link.dataset.page;
    if (linkPage === pageName || (pageName === 'index' && linkPage === 'index')) {
      link.classList.add('active');
    }
  });

  // Navbar background behavior
  const navbar = document.getElementById('navbar');
  const isHomePage = pageName === 'index' || pageName === '';
  const forceSolidNavbar = isHomePage;
  
  if (forceSolidNavbar || !isHomePage) {
    navbar.classList.add('scrolled');
  }

  let lastScrollY = window.scrollY;
  const scrollDeltaThreshold = 8;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (forceSolidNavbar || currentScrollY > 50 || !isHomePage) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (!navbar || mobileNav?.classList.contains('open')) {
      lastScrollY = currentScrollY;
      return;
    }

    // Keep navbar visible near the top to avoid jitter.
    if (currentScrollY <= 24) {
      navbar.classList.remove('navbar-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    const delta = currentScrollY - lastScrollY;
    if (Math.abs(delta) < scrollDeltaThreshold) {
      return;
    }

    if (delta > 0) {
      navbar.classList.add('navbar-hidden');
    } else {
      navbar.classList.remove('navbar-hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // Smooth scroll for anchor links with fixed-header offset
  const getNavbarOffset = () => {
    const nav = document.getElementById('navbar');
    if (!nav) return 0;
    return Math.ceil(nav.getBoundingClientRect().height) + 28;
  };

  const scrollToHashTarget = (hash, behavior = 'smooth') => {
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;

    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const top = Math.max(0, targetTop - getNavbarOffset());
    window.scrollTo({ top, behavior });
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const hash = this.getAttribute('href');
      if (!hash || hash === '#') return;
      e.preventDefault();
      if (window.location.hash !== hash) {
        history.pushState(null, '', hash);
      }
      scrollToHashTarget(hash, 'smooth');
    });
  });

  if (window.location.hash) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToHashTarget(window.location.hash, 'auto');
      });
    });
  }

  window.addEventListener('hashchange', () => {
    scrollToHashTarget(window.location.hash, 'smooth');
  });

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      mobileMenuBtn.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      if (isOpen) {
        navbar.classList.remove('navbar-hidden');
      }
      
      // Update aria-label
      mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close Menu' : 'Open Menu');
    });

    // Close menu when clicking on a link
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        mobileNav.classList.remove('open');
        mobileMenuBtn.classList.remove('open');
        document.body.classList.remove('menu-open');
        mobileMenuBtn.setAttribute('aria-label', 'Open Menu');
        navbar.classList.remove('navbar-hidden');
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        mobileMenuBtn.classList.remove('open');
        document.body.classList.remove('menu-open');
        mobileMenuBtn.setAttribute('aria-label', 'Open Menu');
        navbar.classList.remove('navbar-hidden');
      }
    });
  }

  // Hero load animation
  const heroBg = document.getElementById('hero-bg');
  const heroTitle = document.getElementById('hero-title');
  const heroBtn = document.getElementById('hero-btn');

  if (heroBg) heroBg.classList.add('loaded');
  if (heroTitle) heroTitle.classList.add('loaded');
  if (heroBtn) heroBtn.classList.add('loaded');

  // IntersectionObserver for scroll reveal
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay;
        if (delay) {
          entry.target.style.transitionDelay = delay + 'ms';
        }
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
    observer.observe(el);
  });

  // Video error handling - show fallback image if video fails
  const heroVideo = document.querySelector('.hero-video-container video');
  if (heroVideo) {
    const heroMedia = heroVideo.parentElement;
    const fallbackImg = heroMedia.querySelector('.hero-fallback-img');
    const videoSources = heroVideo.querySelectorAll('source[data-src]');

    const revealHeroVideo = () => {
      heroMedia.classList.add('is-video-ready');
    };

    videoSources.forEach(function(source) {
      if (!source.src) {
        source.src = source.dataset.src;
      }
    });
    heroVideo.load();

    heroVideo.loop = true;
    heroVideo.muted = true;
    heroVideo.playsInline = true;

    const playHeroVideo = () => {
      const playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Some browsers block autoplay until user interaction.
          // Keep video element available and only fallback on real load error.
        });
      }
    };

    heroVideo.addEventListener('error', function() {
      heroMedia.classList.remove('is-video-ready');
      heroMedia.classList.add('has-video-error');
      this.style.display = 'none';
      if (fallbackImg) {
        fallbackImg.style.opacity = '1';
      }
    });

    heroVideo.addEventListener('loadeddata', function() {
      revealHeroVideo();
      playHeroVideo();
    });
    heroVideo.addEventListener('ended', function() {
      this.currentTime = 0;
      playHeroVideo();
    });

    playHeroVideo();
  }

  // Handle Formspark submissions with Toast
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">✓</div>
      <div class="toast-message">${message}</div>
    `;
    toastContainer.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add('show'), 10);

    // Fade out and remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  const forms = document.querySelectorAll('form[action*="submit-form.com"]');
  forms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;
      
      try {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';

        const formData = new FormData(form);
        const object = {};
        formData.forEach((value, key) => object[key] = value);
        
        const response = await fetch(form.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(object)
        });

        if (response.ok) {
          showToast('Your request has been submitted.');
          form.reset();
        } else {
          showToast('Something went wrong. Please try again.');
        }
      } catch (error) {
        showToast('Error connecting to the server.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }
    });
  });
});
