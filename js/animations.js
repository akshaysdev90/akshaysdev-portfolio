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
