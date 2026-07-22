import { initTigerWow } from './tiger.js?v=20';

export function initAnimations(config) {
  if (!config.animation.enabled) {
    document.body.classList.add('no-animations');
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    return;
  }

  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: window.innerWidth < 768 ? 0.08 : 0.12,
      rootMargin: '0px 0px -20px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  if (!isTouch && !isReducedMotion) {
    initParallax(config);
    initMagneticHover();
    initCursorFollow();
    initTigerWow(config);
    initBrandsParallax();
  } else {
    // Still show the tiger settled when motion is reduced / touch
    const scene = document.getElementById('hero-tiger');
    if (scene && !scene.hidden) scene.classList.add('is-settled');
  }
}

function initParallax(config) {
  const watermark = document.getElementById('hero-watermark');
  if (!watermark) return;

  const strength = config.animation.parallaxStrength;

  window.addEventListener(
    'scroll',
    () => {
      const scrollY = window.scrollY;
      watermark.style.transform = `translateY(calc(-50% + ${scrollY * strength}px))`;
    },
    { passive: true }
  );
}

function initMagneticHover() {
  const cards = document.querySelectorAll('.project-card:not(.project-card--load-more)');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const img = card.querySelector('.project-image img');
      if (img) {
        img.style.transform = `scale(1.05) translate(${x * 0.02}px, ${y * 0.02}px)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      const img = card.querySelector('.project-image img');
      if (img) img.style.transform = '';
    });
  });
}

function initCursorFollow() {
  const accent = document.querySelector('.testimonial-accent');
  if (!accent || window.matchMedia('(max-width: 1023px)').matches) return;

  const section = accent.closest('.testimonials');
  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    accent.style.transform = `translateY(${y * 0.05}px)`;
  });
}

function initBrandsParallax() {
  const grid = document.getElementById('brands-grid');
  const section = document.getElementById('brands');
  if (!grid || !section) return;

  const cells = [...grid.querySelectorAll('.brands-cell')];
  if (!cells.length) return;

  let mouseX = 0.5;
  let mouseY = 0.5;
  let scrollOffset = 0;
  let rafId = 0;
  let visible = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    { threshold: 0.1 }
  );
  observer.observe(section);

  const tick = () => {
    if (visible) {
      // Shared vertical shift keeps logos optically aligned in each row.
      const yShared = (mouseY - 0.5) * 10 + scrollOffset * 8;
      cells.forEach((cell) => {
        const depth = parseFloat(cell.dataset.depth) || 0.4;
        const x = (mouseX - 0.5) * 28 * depth;
        cell.style.transform = `translate3d(${x}px, ${yShared}px, 0)`;
      });
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;
  });

  section.addEventListener('mouseleave', () => {
    mouseX = 0.5;
    mouseY = 0.5;
  });

  window.addEventListener(
    'scroll',
    () => {
      if (!visible) return;
      const rect = section.getBoundingClientRect();
      const progress = 1 - (rect.top + rect.height / 2) / window.innerHeight;
      scrollOffset = Math.max(-1, Math.min(1, progress));
    },
    { passive: true }
  );

  window.addEventListener(
    'beforeunload',
    () => cancelAnimationFrame(rafId),
    { once: true }
  );
}
