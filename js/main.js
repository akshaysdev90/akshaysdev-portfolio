import { config } from './config.js';
import { initAnimations } from './animations.js';
import { initTheme } from './theme.js';

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
  const navList = document.getElementById('nav-list');
  navList.innerHTML = config.nav.links
    .map(
      (link) =>
        `<li><a href="${link.href}"${link.external ? ' target="_blank" rel="noopener"' : ''}>${link.label}</a></li>`
    )
    .join('');
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
    <article class="project-card reveal reveal-delay-${(i % 3) + 1}" data-project-id="${p.id}">
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
    <div class="project-card project-card--load-more reveal" id="load-more-card">
      <button class="load-more-btn">${loadMoreLabel}</button>
    </div>`;

  grid.innerHTML = visibleCards + loadMoreCard;

  document.getElementById('load-more-card').addEventListener('click', () => {
    loadHiddenProjects(hiddenProjects);
  });

  grid.querySelectorAll('.project-card:not(.project-card--load-more)').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.projectId;
      const project = [...projects, ...hiddenProjects].find((p) => String(p.id) === id);
      if (project) openLightbox([project]);
    });
  });
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
    card.innerHTML = `
      <div class="project-image">
        <img src="${p.image}" alt="${p.title}" loading="lazy"
             onerror="this.src='${createPlaceholderSVG(p.title, (startIndex + i) * 40)}'">
      </div>
      <div class="project-info">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-category">${p.category}</p>
      </div>`;
    card.addEventListener('click', () => openLightbox([p]));
    grid.insertBefore(card, loadMore);
  });

  loadMore.style.display = 'none';
  initAnimations();
}

function renderTestimonials() {
  const track = document.getElementById('testimonial-track');
  const dots = document.getElementById('testimonial-dots');

  track.innerHTML = config.testimonials.items
    .map(
      (t, i) => `
    <blockquote class="testimonial-item${i === 0 ? ' active' : ''}" data-index="${i}">
      <p class="testimonial-quote">"${t.quote}"</p>
      <footer class="testimonial-author">
        <strong>${t.author}</strong> — ${t.company}
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

  function goTo(index) {
    items[current].classList.remove('active');
    dotEls[current].classList.remove('active');
    current = index;
    items[current].classList.add('active');
    dotEls[current].classList.add('active');
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
  const banner = document.getElementById('brands-banner');
  const items = config.brands.list
    .map((b) => `<span class="brands-item">${b}</span><span class="brands-separator">·</span>`)
    .join('');

  banner.innerHTML = `<div class="brands-track">${items}${items}</div>`;
}

function renderSkills() {
  const toolsEl = document.getElementById('skills-tools');
  const tagsEl = document.getElementById('skills-tags');

  toolsEl.innerHTML = config.skills.tools
    .map(
      (t) =>
        `<div class="tool-icon" style="background:${t.color}" data-name="${t.name}" title="${t.name}">${t.icon.toUpperCase().slice(0, 2)}</div>`
    )
    .join('');

  tagsEl.innerHTML = config.skills.categories
    .map((c) => `<span class="skill-tag">${c}</span>`)
    .join('');
}

function renderFooter() {
  const linksEl = document.getElementById('footer-links');
  linksEl.innerHTML = config.footer.links
    .map((l) => `<a href="${l.href}"${l.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${l.label}</a>`)
    .join('');

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
  document.getElementById('hero-avatar').alt = config.hero.name;
  document.getElementById('hero-watermark').textContent = config.hero.watermark;
  document.getElementById('hero-watermark').style.opacity = config.hero.watermarkOpacity;
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
  const navList = document.getElementById('nav-list');
  const overlay = document.getElementById('nav-overlay');

  function setNavOpen(open) {
    navList.classList.toggle('open', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open);
    overlay.classList.toggle('active', open);
    overlay.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('nav-open', open);
  }

  toggle.addEventListener('click', () => {
    setNavOpen(!navList.classList.contains('open'));
  });

  overlay.addEventListener('click', () => setNavOpen(false));

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navList.classList.contains('open')) {
      setNavOpen(false);
    }
  });

  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && navList.classList.contains('open')) {
      setNavOpen(false);
    }
  }, { passive: true });
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
}

document.addEventListener('DOMContentLoaded', init);
