/**
 * Cinematic Works reel — scroll-scrubbed stage, straight wipe, cursor lens.
 */
export function initWorksReel(config) {
  const root = document.getElementById('works-reel');
  const section = document.getElementById('works');
  if (!root || !section || root.dataset.ready === '1') return;

  const projects = [...(config?.works?.projects || [])];
  if (!projects.length) return;

  root.dataset.ready = '1';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const compactQuery = window.matchMedia('(max-width: 1023px)');

  const stage = root;
  const media = root.querySelector('.works-reel__media');
  const numEl = root.querySelector('.works-reel__num');
  const titleEl = root.querySelector('.works-reel__title');
  const catEl = root.querySelector('.works-reel__cat');
  const descEl = root.querySelector('.works-reel__desc');
  const openBtn = root.querySelector('.works-reel__open');
  const rail = root.querySelector('.works-reel__rail');
  const progress = root.querySelector('.works-reel__progress-bar');
  const frame = root.querySelector('.works-reel__frame');

  let active = 0;
  let lockedByRail = false;
  let lockTimer = 0;
  let syncingRail = false;

  function isCompact() {
    return compactQuery.matches;
  }

  function placeholder(title, i) {
    const hue = i * 40;
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="hsl(${hue}, 10%, 78%)"/>
            <stop offset="100%" stop-color="hsl(${hue + 20}, 14%, 62%)"/>
          </linearGradient>
        </defs>
        <rect fill="url(#g)" width="1600" height="1000"/>
        <text x="800" y="520" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="rgba(255,255,255,0.55)">${title}</text>
      </svg>
    `)}`;
  }

  rail.innerHTML = projects
    .map((p, i) => {
      const index = String(i + 1).padStart(2, '0');
      return `
        <button type="button" class="works-reel__item" role="option" data-index="${i}" aria-selected="${i === 0 ? 'true' : 'false'}">
          <span class="works-reel__item-index">${index}</span>
          <span class="works-reel__item-body">
            <span class="works-reel__item-title">${p.title}</span>
            <span class="works-reel__item-cat">${p.category}</span>
          </span>
          <span class="works-reel__item-line" aria-hidden="true"></span>
        </button>`;
    })
    .join('');

  const items = [...rail.querySelectorAll('.works-reel__item')];
  const mediaCache = new Map();

  function setProgress(index, local = 1) {
    if (!progress) return;
    const n = Math.max(1, projects.length);
    const segment = Math.min(1, Math.max(0.08, local));
    const t = (index + segment) / n;
    progress.style.transform = `scaleX(${Math.max(0.08, Math.min(1, t))})`;
  }

  function scrollRailTo(index) {
    if (!isCompact()) return;
    const el = items[index];
    if (!el) return;
    syncingRail = true;
    el.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: reduced ? 'auto' : 'smooth',
    });
    window.setTimeout(() => {
      syncingRail = false;
    }, reduced ? 50 : 420);
  }

  function resolveSrc(project, i) {
    return new Promise((resolve) => {
      const key = project.image || `ph-${i}`;
      if (mediaCache.has(key)) {
        resolve(mediaCache.get(key));
        return;
      }
      const fallback = placeholder(project.title, i);
      if (!project.image) {
        mediaCache.set(key, fallback);
        resolve(fallback);
        return;
      }
      const probe = new Image();
      probe.onload = () => {
        mediaCache.set(key, project.image);
        resolve(project.image);
      };
      probe.onerror = () => {
        mediaCache.set(key, fallback);
        resolve(fallback);
      };
      probe.src = project.image;
    });
  }

  async function setMedia(project, i) {
    if (!media) return;
    const src = await resolveSrc(project, i);
    media.style.backgroundImage = `url("${src}")`;
    media.style.backgroundPosition = project.imagePosition || 'center';
  }

  async function setActive(index, { local = 1, syncRail = true } = {}) {
    const next = Math.max(0, Math.min(projects.length - 1, index));

    if (next === active && root.dataset.booted === '1') {
      setProgress(next, local);
      return;
    }

    const prev = active;
    active = next;
    const project = projects[active];
    const label = String(active + 1).padStart(2, '0');

    root.dataset.active = String(active);
    stage.dataset.dir = next >= prev ? '1' : '-1';

    await setMedia(project, active);

    stage.classList.remove('is-swap');
    void stage.offsetWidth;
    stage.classList.add('is-swap');

    if (numEl) numEl.textContent = label;
    if (titleEl) titleEl.textContent = project.title;
    if (catEl) catEl.textContent = project.category;
    if (descEl) descEl.textContent = project.description || '';

    items.forEach((el, i) => {
      const on = i === active;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    setProgress(active, local);
    if (syncRail) scrollRailTo(active);

    root.dataset.booted = '1';
  }

  function openActive() {
    const project = projects[active];
    if (!project) return;
    root.dispatchEvent(
      new CustomEvent('works:open', { detail: { project }, bubbles: true })
    );
  }

  items.forEach((el) => {
    const go = () => {
      const i = Number(el.dataset.index);
      lockedByRail = true;
      window.clearTimeout(lockTimer);
      lockTimer = window.setTimeout(() => {
        lockedByRail = false;
      }, 900);
      setActive(i);
    };
    el.addEventListener('pointerenter', () => {
      if (touch || isCompact()) return;
      go();
    });
    el.addEventListener('focus', go);
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const i = Number(el.dataset.index);
      if (i === active) openActive();
      else go();
    });
  });

  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openActive();
  });

  frame?.addEventListener('click', () => openActive());
  frame?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openActive();
    }
  });

  // Cursor lens + soft image parallax (desktop)
  if (!reduced && !touch && frame) {
    frame.addEventListener('pointermove', (e) => {
      const rect = frame.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const nx = Math.max(0, Math.min(1, x));
      const ny = Math.max(0, Math.min(1, y));
      frame.style.setProperty('--mx', `${(nx * 100).toFixed(2)}%`);
      frame.style.setProperty('--my', `${(ny * 100).toFixed(2)}%`);
      frame.style.setProperty('--tx', ((nx - 0.5) * 2).toFixed(3));
      frame.style.setProperty('--ty', ((ny - 0.5) * 2).toFixed(3));
      frame.classList.add('is-hot');
    });
    frame.addEventListener('pointerleave', () => {
      frame.classList.remove('is-hot');
      frame.style.setProperty('--tx', '0');
      frame.style.setProperty('--ty', '0');
    });
  }

  // Mobile/tablet: horizontal rail scroll scrubs projects + status bar
  let railTicking = false;
  rail.addEventListener(
    'scroll',
    () => {
      if (!isCompact() || syncingRail) return;
      if (railTicking) return;
      railTicking = true;
      requestAnimationFrame(() => {
        railTicking = false;
        const railRect = rail.getBoundingClientRect();
        const focusX = railRect.left + Math.min(railRect.width * 0.42, 160);
        let best = active;
        let bestDist = Infinity;
        items.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const mid = r.left + r.width / 2;
          const d = Math.abs(mid - focusX);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });

        const maxScroll = rail.scrollWidth - rail.clientWidth;
        const scrollT = maxScroll > 0 ? rail.scrollLeft / maxScroll : 0;
        const scaled = scrollT * Math.max(1, projects.length - 1);
        const local = scaled - Math.floor(scaled) || 1;

        lockedByRail = true;
        window.clearTimeout(lockTimer);
        lockTimer = window.setTimeout(() => {
          lockedByRail = false;
        }, 400);

        setActive(best, { local: best === Math.floor(scaled) ? Math.max(0.15, local) : 1, syncRail: false });
      });
    },
    { passive: true }
  );

  // Desktop: vertical page scroll scrubs the reel
  function updateFromScroll() {
    if (lockedByRail || reduced || isCompact()) return;
    const rect = section.getBoundingClientRect();
    const runway = section.offsetHeight - window.innerHeight;
    if (runway <= 0) return;
    const scrolled = Math.min(Math.max(-rect.top, 0), runway);
    const t = scrolled / runway;
    const scaled = t * projects.length;
    const index = Math.min(projects.length - 1, Math.floor(scaled));
    const local = scaled - index;
    setActive(index, { local, syncRail: false });
  }

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateFromScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener('keydown', (e) => {
    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.25;
    if (!inView) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      setActive(active + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive(active - 1);
    } else if (e.key === 'Enter' && document.activeElement?.closest?.('.works-reel')) {
      openActive();
    }
  });

  // Swipe on the preview frame (mobile/tablet)
  if (frame && (touch || compactQuery.matches)) {
    let startX = 0;
    let startY = 0;
    frame.addEventListener(
      'pointerdown',
      (e) => {
        startX = e.clientX;
        startY = e.clientY;
      },
      { passive: true }
    );
    frame.addEventListener('pointerup', (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) setActive(active + 1);
      else setActive(active - 1);
    });
  }

  setActive(0);
  updateFromScroll();
}
