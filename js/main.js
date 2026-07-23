import { config } from './config.js?v=47';
import { initAnimations } from './animations.js?v=28';
import { initTheme } from './theme.js?v=20';
import { initWeather } from './weather.js?v=46';

function applyThemeVars() {
  const { theme, typography } = config;
  const root = document.documentElement;

  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-accent-hover', theme.accentHover);
  root.style.setProperty('--color-bg-primary', theme.bgPrimary);
  root.style.setProperty('--color-bg-secondary', theme.bgSecondary);
  root.style.setProperty('--color-bg-dark', theme.bgDark);
  root.style.setProperty('--color-text-primary', theme.textPrimary);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);
  root.style.setProperty('--color-text-muted', theme.textMuted);
  root.style.setProperty('--color-text-on-dark', theme.textOnDark);
  root.style.setProperty('--color-border', theme.border);
  root.style.setProperty('--color-card-overlay', theme.cardOverlay);
  root.style.setProperty('--font-heading', typography.fontHeading);
  root.style.setProperty('--font-body', typography.fontBody);
  root.style.setProperty('--font-display', typography.fontDisplay);
  root.style.setProperty('--reveal-duration', `${config.animation.revealDuration}ms`);
}

function populateNav() {
  const linksHtml = config.nav.links
    .map((link) => {
      const isExternal = Boolean(link.external) || link.href.startsWith('http');
      const external = isExternal ? ' target="_blank" rel="noopener"' : '';
      const download = link.download ? ` download="${link.download}"` : '';
      return `<li><a href="${link.href}"${external}${download}>${link.label}</a></li>`;
    })
    .join('');

  const desktop = document.getElementById('nav-list-desktop');
  const mobile = document.getElementById('nav-list');
  if (desktop) desktop.innerHTML = linksHtml;
  if (mobile) mobile.innerHTML = linksHtml;
}

function createPlaceholderSVG(title, hue = 0) {
  const colors = [
    `hsl(${hue}, 8%, 85%)`,
    `hsl(${hue}, 12%, 75%)`,
    `hsl(${hue}, 6%, 90%)`,
  ];
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect fill="${colors[0]}" width="800" height="600"/>
      <rect fill="${colors[1]}" x="40" y="40" width="720" height="520" rx="2"/>
      <text x="400" y="310" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="${colors[2]}" opacity="0.6">${title}</text>
    </svg>
  `)}`;
}

function renderProjects() {
  const grid = document.getElementById('works-grid');
  const { projects, hiddenProjects, loadMoreLabel } = config.works;

  const visibleCards = projects
    .map(
      (p, i) => `
    <article class="project-card reveal reveal-delay-${(i % 3) + 1}" data-project-id="${p.id}" tabindex="0" role="link" aria-label="${p.title}">
      <div class="project-image">
        <img src="${p.image}" alt="${p.title}" loading="lazy"
             onerror="this.src='${createPlaceholderSVG(p.title, i * 40)}'">
      </div>
      <div class="project-info">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-category">${p.category}</p>
        <p class="project-desc">${p.description || ''}</p>
      </div>
    </article>`
    )
    .join('');

  const loadMoreCard = `
    <div class="project-card project-card--load-more reveal" id="load-more-card" tabindex="0" role="button" aria-label="${loadMoreLabel}">
      <button class="load-more-btn" tabindex="-1">${loadMoreLabel}</button>
    </div>`;

  grid.innerHTML = visibleCards + loadMoreCard;

  const activateLoadMore = () => loadHiddenProjects(hiddenProjects);
  document.getElementById('load-more-card').addEventListener('click', activateLoadMore);
  document.getElementById('load-more-card').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateLoadMore();
    }
  });

  grid.querySelectorAll('.project-card:not(.project-card--load-more)').forEach((card) => {
    const open = () => {
      const id = card.dataset.projectId;
      const project = [...projects, ...hiddenProjects].find((p) => String(p.id) === id);
      if (project) openProject(project);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}

/**
 * Click behavior for a project card:
 * - If `link` is a real URL, open the project page in a new tab.
 * - Otherwise open the lightbox with the project's `images` gallery
 *   (or its single `image` as fallback).
 */
function openProject(project) {
  if (project.link && project.link !== '#') {
    window.open(project.link, '_blank', 'noopener');
    return;
  }
  const gallery = (project.images && project.images.length ? project.images : [project.image])
    .map((src) => ({ image: src, title: project.title }));
  openLightbox(gallery);
}

function loadHiddenProjects(hiddenProjects) {
  const grid = document.getElementById('works-grid');
  const loadMore = document.getElementById('load-more-card');
  const startIndex = config.works.projects.length;

  hiddenProjects.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = `project-card hidden-project`;
    card.style.animationDelay = `${i * 100}ms`;
    card.dataset.projectId = p.id;
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    card.setAttribute('aria-label', p.title);
    card.innerHTML = `
      <div class="project-image">
        <img src="${p.image}" alt="${p.title}" loading="lazy"
             onerror="this.src='${createPlaceholderSVG(p.title, (startIndex + i) * 40)}'">
      </div>
      <div class="project-info">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-category">${p.category}</p>
      </div>`;
    const open = () => openProject(p);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
    grid.insertBefore(card, loadMore);
  });

  loadMore.style.display = 'none';
  initAnimations();
}

function renderTestimonials() {
  const track = document.getElementById('testimonial-track');
  const dots = document.getElementById('testimonial-dots');
  const accent = document.getElementById('testimonial-accent');

  track.innerHTML = config.testimonials.items
    .map(
      (t, i) => `
    <blockquote class="testimonial-item${i === 0 ? ' active' : ''}" data-index="${i}">
      <p class="testimonial-quote">"${t.quote}"</p>
      <footer class="testimonial-author">
        <span>${[t.role, t.company].filter(Boolean).join(' — ')}</span>
      </footer>
    </blockquote>`
    )
    .join('');

  dots.innerHTML = config.testimonials.items
    .map((_, i) => `<button class="testimonial-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Testimonial ${i + 1}"></button>`)
    .join('');

  let current = 0;
  const items = track.querySelectorAll('.testimonial-item');
  const dotEls = dots.querySelectorAll('.testimonial-dot');

  function updateAccent(index) {
    const photo = config.testimonials.items[index].photo;
    accent.innerHTML = photo
      ? `<img src="${photo}" alt="">`
      : '';
  }

  updateAccent(0);

  function goTo(index) {
    items[current].classList.remove('active');
    dotEls[current].classList.remove('active');
    current = index;
    items[current].classList.add('active');
    dotEls[current].classList.add('active');
    updateAccent(index);
  }

  document.getElementById('testimonial-prev').addEventListener('click', () => {
    goTo(current === 0 ? items.length - 1 : current - 1);
  });

  document.getElementById('testimonial-next').addEventListener('click', () => {
    goTo(current === items.length - 1 ? 0 : current + 1);
  });

  dotEls.forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
  });

  let autoplay = setInterval(() => {
    goTo(current === items.length - 1 ? 0 : current + 1);
  }, 6000);

  track.closest('.testimonial-slider').addEventListener('mouseenter', () => clearInterval(autoplay));
  track.closest('.testimonial-slider').addEventListener('mouseleave', () => {
    autoplay = setInterval(() => {
      goTo(current === items.length - 1 ? 0 : current + 1);
    }, 6000);
  });
}

function renderBrands() {
  const grid = document.getElementById('brands-grid');
  if (!grid) return;

  grid.innerHTML = config.brands.list
    .map((b, i) => {
      const depth = (0.35 + ((i % 4) * 0.12)).toFixed(2);
      const scale = b.scale ?? 1;
      return `
      <article class="brands-cell" data-depth="${depth}" data-name="${b.name}" style="--logo-scale: ${scale}">
        <img class="brands-logo" src="${b.logo}" alt="${b.name}" loading="lazy" decoding="async" draggable="false">
      </article>`;
    })
    .join('');
}

function renderToolTile(tool) {
  return `
    <div class="tool-icon" data-name="${tool.name}" title="${tool.name}">
      <img class="tool-icon__img" src="${tool.logo}" alt="${tool.name}" loading="lazy" width="48" height="48">
    </div>`;
}

function renderSkills() {
  const trackEl = document.getElementById('skills-track');
  const marqueeEl = document.getElementById('skills-marquee');
  const tagsEl = document.getElementById('skills-tags');
  const tiles = config.skills.tools.map(renderToolTile).join('');

  trackEl.innerHTML = `
    <div class="skills-set">${tiles}</div>
    <div class="skills-set" aria-hidden="true">${tiles}</div>`;

  marqueeEl.style.setProperty('--skills-scroll-duration', `${config.skills.scrollSpeed}s`);

  const measure = () => initSeamlessMarquee(trackEl);
  requestAnimationFrame(measure);
  trackEl.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', measure, { once: true });
  });

  tagsEl.innerHTML = config.skills.categories
    .map((c) => `<span class="skill-tag">${c}</span>`)
    .join('');
}

function initSeamlessMarquee(trackEl) {
  const set = trackEl.querySelector('.skills-set');
  const marqueeEl = trackEl.closest('.skills-marquee');
  if (!set || !marqueeEl) return;

  const measure = () => {
    const gap = parseFloat(getComputedStyle(set).gap) || 16;

    // Size tiles so `visibleCount` logos fit in the viewport, capped to a sensible size
    const count = config.skills.visibleCount || 5;
    const maxSize = config.skills.maxTileSize || 72;
    const tileSize = Math.min((marqueeEl.clientWidth - gap * (count - 1)) / count, maxSize);
    marqueeEl.style.setProperty('--tool-tile-size', `${tileSize}px`);

    const distance = set.getBoundingClientRect().width + gap;
    trackEl.style.setProperty('--marquee-distance', `${distance}px`);
  };

  measure();

  if (trackEl._marqueeResize) {
    window.removeEventListener('resize', trackEl._marqueeResize);
  }

  trackEl._marqueeResize = measure;
  window.addEventListener('resize', trackEl._marqueeResize, { passive: true });
}

function renderFooterLink(link) {
  const external = link.href.startsWith('http');
  const download = link.download ? ` download="${link.download}"` : '';
  return `<a href="${link.href}"${external ? ' target="_blank" rel="noopener"' : ''}${download}>${link.label}</a>`;
}

function renderFooter() {
  const linksEl = document.getElementById('footer-links');
  linksEl.innerHTML = config.footer.links.map(renderFooterLink).join('');

  document.getElementById('footer-copy').textContent =
    `${config.footer.copyright} © ${config.meta.year}`;
}

function populateConfigText() {
  document.querySelectorAll('[data-config]').forEach((el) => {
    const path = el.dataset.config.split('.');
    let value = config;
    for (const key of path) value = value[key];
    if (value) el.textContent = value;
  });

  document.title = config.meta.title;
  const heroAvatar = document.getElementById('hero-avatar');
  if (heroAvatar) {
    heroAvatar.alt = config.hero.name;
    if (config.hero.avatar) heroAvatar.src = config.hero.avatar;
  }

  const watermark = document.getElementById('hero-watermark');
  if (config.hero.watermark) {
    watermark.hidden = false;
    watermark.textContent = config.hero.watermark;
    watermark.style.opacity = config.hero.watermarkOpacity;
  } else {
    watermark.hidden = true;
  }

  const tiger = document.getElementById('hero-tiger');
  const tigerCfg = config.hero.tiger || {};
  if (tigerCfg.enabled) {
    tiger.hidden = false;
    const img = document.getElementById('hero-tiger-img');
    if (img && tigerCfg.image) img.src = tigerCfg.image;
  } else {
    tiger.hidden = true;
  }

  const heroCta = document.getElementById('hero-cta');
  if (heroCta && config.hero.cta) {
    heroCta.textContent = config.hero.cta.label;
    heroCta.href = config.hero.cta.href;
  }
}

function openLightbox(projects) {
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightbox-content');

  content.innerHTML = projects
    .map(
      (p) =>
        `<img src="${p.image}" alt="${p.title}" onerror="this.src='${createPlaceholderSVG(p.title)}'">`
    )
    .join('');

  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const drawer = document.getElementById('nav-drawer');
  const navList = document.getElementById('nav-list');
  const overlay = document.getElementById('nav-overlay');
  const header = document.getElementById('header');
  const logo = document.querySelector('.logo');
  const hero = document.getElementById('hero');

  function setNavOpen(open) {
    drawer.classList.toggle('open', open);
    navList.classList.toggle('open', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    overlay.classList.toggle('active', open);
    overlay.setAttribute('aria-hidden', String(!open));
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('nav-open', open);
  }

  function updateLogoScale() {
    if (!logo || !hero) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      logo.style.setProperty('--nav-logo-scale', '1');
      return;
    }

    const heroRect = hero.getBoundingClientRect();
    const heroHeight = hero.offsetHeight || 1;
    // 0 in hero → 1 after leaving ~65% of hero
    const progress = Math.min(1, Math.max(0, -heroRect.top / (heroHeight * 0.65)));
    const eased = progress * progress * (3 - 2 * progress);
    // Soften on small screens so the wordmark doesn't collide with the toggle
    const maxScale = window.innerWidth < 768 ? 1.7 : 2.5;
    const scale = 1 + eased * (maxScale - 1);
    logo.style.setProperty('--nav-logo-scale', scale.toFixed(3));
  }

  let logoRaf = 0;
  function onScrollFrame() {
    header.classList.toggle('scrolled', window.scrollY > 40);
    updateLogoScale();
    logoRaf = 0;
  }

  function requestScrollUpdate() {
    if (logoRaf) return;
    logoRaf = requestAnimationFrame(onScrollFrame);
  }

  toggle.addEventListener('click', () => {
    setNavOpen(!drawer.classList.contains('open'));
  });

  overlay.addEventListener('click', () => setNavOpen(false));

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      setNavOpen(false);
    }
  });

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });

  window.addEventListener('resize', () => {
    updateLogoScale();
    if (window.innerWidth >= 1024 && drawer.classList.contains('open')) {
      setNavOpen(false);
    }
  }, { passive: true });

  updateLogoScale();
}

function initLightbox() {
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function init() {
  applyThemeVars();
  populateConfigText();
  populateNav();
  renderProjects();
  renderTestimonials();
  renderBrands();
  renderSkills();
  renderFooter();
  initNav();
  initLightbox();
  initAnimations(config);
  initTheme(config);
  initWeather(config);
}

document.addEventListener('DOMContentLoaded', init);
