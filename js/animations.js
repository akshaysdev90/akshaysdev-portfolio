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
    initInteractiveTiger(config);
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

function initInteractiveTiger(config) {
  const tiger = document.getElementById('hero-tiger');
  const hero = document.getElementById('hero');
  if (!tiger || !hero || tiger.hidden) return;

  const strength = config.hero?.tiger?.strength ?? 0.35;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let rafId = 0;

  const tick = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    tiger.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  hero.addEventListener('mousemove', (e) => {
    if (dragging) return;
    const rect = hero.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = nx * 60 * strength + dragOffsetX;
    targetY = ny * 40 * strength + dragOffsetY;
  });

  hero.addEventListener('mouseleave', () => {
    if (!dragging) {
      targetX = dragOffsetX;
      targetY = dragOffsetY;
    }
  });

  tiger.addEventListener('pointerdown', (e) => {
    dragging = true;
    tiger.classList.add('is-dragging');
    tiger.setPointerCapture(e.pointerId);
    dragStartX = e.clientX - dragOffsetX;
    dragStartY = e.clientY - dragOffsetY;
  });

  tiger.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dragOffsetX = e.clientX - dragStartX;
    dragOffsetY = e.clientY - dragStartY;
    // Keep it roughly in the hero white area
    dragOffsetX = Math.max(-120, Math.min(160, dragOffsetX));
    dragOffsetY = Math.max(-100, Math.min(80, dragOffsetY));
    targetX = dragOffsetX;
    targetY = dragOffsetY;
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    tiger.classList.remove('is-dragging');
    try {
      tiger.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  tiger.addEventListener('pointerup', endDrag);
  tiger.addEventListener('pointercancel', endDrag);

  // Soft spring-back toward the home spot after a short delay
  tiger.addEventListener('pointerup', () => {
    setTimeout(() => {
      if (dragging) return;
      dragOffsetX *= 0.35;
      dragOffsetY *= 0.35;
      targetX = dragOffsetX;
      targetY = dragOffsetY;
    }, 1400);
  });

  window.addEventListener(
    'beforeunload',
    () => cancelAnimationFrame(rafId),
    { once: true }
  );
}
