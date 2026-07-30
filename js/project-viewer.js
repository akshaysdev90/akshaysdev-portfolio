/**
 * Full-project case study viewer.
 *
 * Easy content shape (in config.works.projects[].caseStudy):
 *   about      → left-column project story
 *   role, duration, roleType, team, year, client → right-column facts
 *   cover, sections: [{ title?, text?, points?: (string|{title,text})[], images?: string[] }]
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragraphsFromText(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function resolveCaseStudy(project) {
  const study = project.caseStudy || {};
  const cover = study.cover || project.image || '';
  const gallery =
    Array.isArray(project.images) && project.images.length
      ? project.images
      : cover
        ? [cover]
        : [];

  const sections = Array.isArray(study.sections)
    ? study.sections
    : [
        {
          title: 'Gallery',
          text: '',
          images: gallery,
        },
      ];

  return {
    year: study.year || '',
    role: study.role || '',
    duration: study.duration || '',
    roleType: study.roleType || '',
    team: study.team || '',
    client: study.client || '',
    cover,
    coverPosition: study.coverPosition || project.imagePosition || '',
    about: study.about || study.intro || project.description || '',
    sections,
    downloads: Array.isArray(study.downloads) ? study.downloads : [],
  };
}

function renderFacts(study) {
  const rows = [
    ['Role', study.role],
    ['Duration', study.duration],
    ['Role Type', study.roleType],
    ['Team', study.team],
    ['Year', study.year],
    ['Client', study.client],
  ].filter(([, value]) => Boolean(value));

  if (!rows.length) return '';

  return `<dl class="project-viewer__facts">
    ${rows
      .map(
        ([label, value]) => `
      <div class="project-viewer__fact">
        <dt>${escapeHtml(label)}</dt>
        <dd>${escapeHtml(value)}</dd>
      </div>`
      )
      .join('')}
  </dl>`;
}

function renderDownloads(downloads) {
  if (!Array.isArray(downloads) || !downloads.length) return '';
  const links = downloads
    .map((item) => {
      if (!item?.href || !item?.label) return '';
      const filename = item.download || item.href.split('/').pop() || 'download';
      return `<a class="project-viewer__download" href="${escapeHtml(item.href)}" download="${escapeHtml(filename)}">${escapeHtml(item.label)}</a>`;
    })
    .filter(Boolean)
    .join('');
  if (!links) return '';
  return `<div class="project-viewer__downloads">
    <p class="project-viewer__label">Download</p>
    ${links}
  </div>`;
}

function renderPoints(points) {
  if (!Array.isArray(points) || !points.length) return '';

  const items = points
    .map((point) => {
      if (typeof point === 'string') {
        return `<li class="project-viewer__point">${escapeHtml(point)}</li>`;
      }
      if (point && (point.title || point.text)) {
        const title = point.title
          ? `<strong class="project-viewer__point-title">${escapeHtml(point.title)}</strong>`
          : '';
        const text = point.text ? ` ${escapeHtml(point.text)}` : '';
        return `<li class="project-viewer__point">${title}${text}</li>`;
      }
      return '';
    })
    .filter(Boolean)
    .join('');

  return items ? `<ul class="project-viewer__points">${items}</ul>` : '';
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((item) => {
      if (typeof item === 'string') {
        return {
          src: item,
          caption: '',
          aspect: '',
          presentation: '',
          span: '',
          size: '',
          download: '',
          col: 0,
          row: 0,
          rowSpan: 1,
          colSpan: 1,
        };
      }
      if (item && item.src) {
        return {
          src: item.src,
          caption: item.caption || '',
          aspect: item.aspect || '',
          presentation: item.presentation || '',
          span: item.span || '',
          size: item.size || '',
          download: item.download || '',
          col: Number(item.col) || 0,
          row: Number(item.row) || 0,
          rowSpan: Number(item.rowSpan) || 1,
          colSpan: Number(item.colSpan) || 1,
        };
      }
      return null;
    })
    .filter(Boolean);
}

function renderImage(image, alt, index = 0, extraFigureClass = '') {
  if (!image?.src) return '';
  const caption = image.caption
    ? `<figcaption class="project-viewer__caption">
        <span class="project-viewer__caption-index">${String(index + 1).padStart(2, '0')}</span>
        <span>${escapeHtml(image.caption)}</span>
      </figcaption>`
    : '';
  const frameMods = [
    image.aspect === 'auto' || image.presentation === 'mark'
      ? 'project-viewer__frame--auto'
      : '',
    image.aspect === 'cover' ? 'project-viewer__frame--cover' : '',
    image.presentation === 'mark' ? 'project-viewer__frame--mark' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const frameClass = frameMods
    ? `project-viewer__frame ${frameMods}`
    : 'project-viewer__frame';
  const figureClass = [
    'project-viewer__figure',
    image.presentation === 'mark' ? 'project-viewer__figure--mark' : '',
    extraFigureClass,
  ]
    .filter(Boolean)
    .join(' ');
  return `<figure class="${figureClass}">
    <button type="button" class="project-viewer__zoom-trigger" data-project-zoom-src="${escapeHtml(image.src)}" aria-label="View larger image">
      <div class="${frameClass}">
        <img src="${escapeHtml(image.src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" onerror="this.closest('figure')?.classList.add('is-missing')">
      </div>
    </button>
    ${caption}
  </figure>`;
}

function renderMosaicGallery(images, projectTitle) {
  let galleryIndex = 0;
  const items = images
    .map((img) => {
      const col = img.col || 1;
      const row = img.row || 1;
      const rowSpan = img.rowSpan || 1;
      const colSpan = img.colSpan || 1;
      const itemClass = [
        'project-viewer__mosaic-item',
        rowSpan > 1 ? 'project-viewer__mosaic-item--tall' : '',
        img.presentation === 'mark' ? 'project-viewer__mosaic-item--mark' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const style = `grid-column: ${col} / span ${colSpan}; grid-row: ${row} / span ${rowSpan};`;
      const html = `<div class="${itemClass}" style="${style}">
        ${renderImage(img, projectTitle, galleryIndex)}
      </div>`;
      galleryIndex += 1;
      return html;
    })
    .join('');

  return `<div class="project-viewer__mosaic">${items}</div>`;
}

function chunkGalleryImages(images) {
  const chunks = [];
  let i = 0;
  while (i < images.length) {
    const current = images[i];
    const next = images[i + 1];
    const alone =
      current.span === 'full' ||
      i === images.length - 1 ||
      next?.span === 'full';
    if (alone) {
      chunks.push([current]);
      i += 1;
    } else {
      chunks.push([current, next]);
      i += 2;
    }
  }
  return chunks;
}

function renderPager(images, projectTitle) {
  if (!images.length) return '';
  const slides = images
    .map((img, i) => {
      const active = i === 0 ? ' is-active' : '';
      const fileName =
        img.download ||
        String(img.src || '')
          .split('?')[0]
          .split('/')
          .pop() ||
        `storyboard-page-${i + 1}.jpg`;
      const href = String(img.src || '').split('?')[0];
      return `<figure class="project-viewer__pager-slide${active}" data-pager-slide="${i}" data-pager-href="${escapeHtml(href)}" data-pager-filename="${escapeHtml(fileName)}">
        <button type="button" class="project-viewer__zoom-trigger" data-project-zoom-src="${escapeHtml(img.src)}" aria-label="View larger image">
          <div class="project-viewer__frame project-viewer__frame--auto">
            <img src="${escapeHtml(img.src)}" alt="${escapeHtml(projectTitle)} page ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">
          </div>
        </button>
        ${
          img.caption
            ? `<figcaption class="project-viewer__caption">
                <span class="project-viewer__caption-index">${String(i + 1).padStart(2, '0')}</span>
                <span>${escapeHtml(img.caption)}</span>
              </figcaption>`
            : ''
        }
      </figure>`;
    })
    .join('');

  const firstHref = String(images[0].src || '').split('?')[0];
  const firstName =
    images[0].download ||
    firstHref.split('/').pop() ||
    'storyboard-page-1.jpg';

  return `<div class="project-viewer__pager" data-project-pager data-pager-count="${images.length}">
    <div class="project-viewer__pager-toolbar">
      <button type="button" class="project-viewer__pager-btn" data-pager-prev aria-label="Previous page">Prev</button>
      <p class="project-viewer__pager-status" data-pager-status>01 / ${String(images.length).padStart(2, '0')}</p>
      <button type="button" class="project-viewer__pager-btn" data-pager-next aria-label="Next page">Next</button>
    </div>
    <div class="project-viewer__pager-stage">${slides}</div>
    <a class="project-viewer__pager-download" data-pager-download href="${escapeHtml(firstHref)}" download="${escapeHtml(firstName)}">Download this sheet</a>
  </div>`;
}

function renderGallery(images, projectTitle, galleryLayout = '') {
  if (!images.length) return '';
  if (galleryLayout === 'pager') {
    return renderPager(images, projectTitle);
  }
  if (galleryLayout === 'mosaic' || images.some((img) => img.col || img.row)) {
    return renderMosaicGallery(images, projectTitle);
  }
  const chunks = chunkGalleryImages(images);
  let galleryIndex = 0;
  return chunks
    .map((chunk) => {
      const hasMark = chunk.some((img) => img.presentation === 'mark');
      const mods = [
        `project-viewer__spread--${chunk.length}`,
        hasMark && chunk.length === 1 ? 'project-viewer__spread--mark' : '',
        hasMark && chunk.length === 2 ? 'project-viewer__spread--duo' : '',
        chunk.length === 1 && chunk[0]?.span === 'full' ? 'project-viewer__spread--wide' : '',
        chunk.length === 1 && chunk[0]?.size === 'sm' ? 'project-viewer__spread--sm' : '',
        chunk.length === 1 && chunk[0]?.size === 'md' ? 'project-viewer__spread--md' : '',
        chunk.length === 1 && chunk[0]?.size === 'lg' ? 'project-viewer__spread--lg' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return `<div class="project-viewer__spread ${mods}">
        ${chunk
          .map((img) => {
            const rendered = renderImage(img, projectTitle, galleryIndex);
            galleryIndex += 1;
            return rendered;
          })
          .join('')}
      </div>`;
    })
    .join('');
}

function youtubeIdFromUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^[\w-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace(/^\//, '').slice(0, 11);
    }
    const fromQuery = url.searchParams.get('v');
    if (fromQuery) return fromQuery;
    const embed = url.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
    if (embed) return embed[1];
  } catch {
    /* ignore */
  }
  const loose = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return loose?.[1] || '';
}

function renderVideo(video, title = 'Project video') {
  if (!video) return '';
  const raw = typeof video === 'string' ? video : video.src || video.url || '';
  const id = youtubeIdFromUrl(raw);
  if (!id) return '';
  const caption = typeof video === 'object' && video.caption
    ? `<figcaption class="project-viewer__caption">
        <span class="project-viewer__caption-index">01</span>
        <span>${escapeHtml(video.caption)}</span>
      </figcaption>`
    : '';
  const label = typeof video === 'object' && video.title
    ? video.title
    : title;
  return `<figure class="project-viewer__video">
    <div class="project-viewer__video-frame">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${escapeHtml(id)}?rel=0&modestbranding=1"
        title="${escapeHtml(label)}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>
    ${caption}
  </figure>`;
}

function renderVideos(videos, projectTitle) {
  if (!videos) return '';
  const list = Array.isArray(videos) ? videos : [videos];
  const html = list.map((video) => renderVideo(video, projectTitle)).filter(Boolean).join('');
  return html ? `<div class="project-viewer__videos">${html}</div>` : '';
}

function renderStats(stats) {
  if (!Array.isArray(stats) || !stats.length) return '';
  return `<aside class="project-viewer__stats" aria-label="Key metrics">
    ${stats
      .map((stat) => {
        if (!stat) return '';
        const value = stat.value
          ? `<p class="project-viewer__stat-value">${escapeHtml(stat.value)}</p>`
          : '';
        const label = stat.label
          ? `<p class="project-viewer__stat-label">${escapeHtml(stat.label)}</p>`
          : '';
        const detail = stat.text
          ? `<p class="project-viewer__stat-text">${escapeHtml(stat.text)}</p>`
          : '';
        if (!value && !label && !detail) return '';
        return `<div class="project-viewer__stat">${value}${label}${detail}</div>`;
      })
      .filter(Boolean)
      .join('')}
  </aside>`;
}

function renderSection(section, projectTitle, sectionIndex = 0) {
  const indexLabel = String(sectionIndex + 1).padStart(2, '0');
  const title = section.title
    ? `<div class="project-viewer__section-head">
        <span class="project-viewer__section-index" aria-hidden="true">${indexLabel}</span>
        <h3 class="project-viewer__section-title">${escapeHtml(section.title)}</h3>
      </div>`
    : '';
  const paras = paragraphsFromText(section.text)
    .map((p) => `<p class="project-viewer__p">${escapeHtml(p)}</p>`)
    .join('');
  const points = renderPoints(section.points);
  const stats = renderStats(section.stats);
  const images = normalizeImages(section.images);
  const gallery = renderGallery(images, projectTitle, section.galleryLayout || '');
  const videos = renderVideos(section.video || section.videos, projectTitle);

  const copy = paras || points
    ? `<div class="project-viewer__copy">${paras}${points}</div>`
    : '';

  const main =
    copy || stats
      ? `<div class="project-viewer__section-main${stats ? ' has-stats' : ''}">
          ${copy}
          ${stats}
        </div>`
      : '';

  if (!title && !main && !gallery && !videos) return '';
  const mediaOnly = Boolean((gallery || videos) && !main);
  const sectionClass = mediaOnly
    ? 'project-viewer__section project-viewer__section--media'
    : 'project-viewer__section';
  return `<section class="${sectionClass}">${title}${main}${videos}${gallery}</section>`;
}

function renderFooterLink(link) {
  const href = String(link.href || '');
  const external = /^https?:/i.test(href);
  const download = link.download ? ` download="${escapeHtml(link.download)}"` : '';
  const target = external ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${escapeHtml(href)}"${target}${download}>${escapeHtml(link.label || '')}</a>`;
}

function renderFooter(config) {
  const footer = config?.footer || {};
  const year = config?.meta?.year ?? new Date().getFullYear();
  const links = (footer.links || []).map(renderFooterLink).join('');
  return `
    <footer class="footer project-viewer__footer" aria-label="Site footer">
      <div class="footer-top">
        <p class="footer-cta">${escapeHtml(footer.cta || '')}</p>
        <div class="footer-links">${links}</div>
      </div>
      <p class="footer-motto">${escapeHtml(footer.motto || '')}</p>
      <h2 class="footer-name">${escapeHtml(footer.name || '')}</h2>
      <div class="footer-bottom">
        <hr>
        <p class="footer-copy">${escapeHtml(footer.copyright || '')} © ${escapeHtml(year)}</p>
      </div>
    </footer>
  `;
}

export function initProjectViewer(config = {}) {
  const root = document.getElementById('project-viewer');
  const article = root?.querySelector('[data-project-article]');
  const closeBtns = root?.querySelectorAll('[data-project-close]');
  if (!root || !article) return { open() {}, close() {} };

  let lastFocus = null;
  let zoomScale = 1;

  let zoomRoot = root.querySelector('[data-project-zoom]');
  if (!zoomRoot) {
    zoomRoot = document.createElement('div');
    zoomRoot.className = 'project-viewer__zoom';
    zoomRoot.hidden = true;
    zoomRoot.setAttribute('data-project-zoom', '');
    zoomRoot.setAttribute('aria-hidden', 'true');
    zoomRoot.innerHTML = `
      <button type="button" class="project-viewer__zoom-close" data-project-zoom-close aria-label="Close zoom">Close</button>
      <div class="project-viewer__zoom-stage" data-project-zoom-stage>
        <img class="project-viewer__zoom-image" data-project-zoom-image alt="">
      </div>
      <p class="project-viewer__zoom-hint">Scroll to zoom · drag to pan · Esc to close</p>
    `;
    root.appendChild(zoomRoot);
  }

  const zoomImage = zoomRoot.querySelector('[data-project-zoom-image]');
  const zoomStage = zoomRoot.querySelector('[data-project-zoom-stage]');

  function setZoomScale(next) {
    zoomScale = Math.min(4, Math.max(1, Number(next.toFixed(2))));
    if (zoomImage) {
      const zoomed = zoomScale > 1;
      zoomImage.classList.toggle('is-zoomed', zoomed);
      zoomImage.style.maxHeight = zoomed ? 'none' : '';
      zoomImage.style.width = zoomed ? `${Math.round(36 * zoomScale)}rem` : '';
      zoomImage.style.maxWidth = zoomed ? 'none' : '';
    }
    if (zoomStage) {
      zoomStage.classList.toggle('is-zoomed', zoomScale > 1);
    }
  }

  function closeZoom() {
    if (zoomRoot.hidden) return false;
    zoomRoot.hidden = true;
    zoomRoot.setAttribute('aria-hidden', 'true');
    root.classList.remove('is-zooming');
    setZoomScale(1);
    if (zoomStage) zoomStage.scrollTop = 0;
    return true;
  }

  function openZoom(src, alt = '') {
    if (!src || !zoomImage) return;
    zoomImage.src = src;
    zoomImage.alt = alt;
    setZoomScale(1);
    zoomRoot.hidden = false;
    zoomRoot.setAttribute('aria-hidden', 'false');
    root.classList.add('is-zooming');
    zoomRoot.querySelector('[data-project-zoom-close]')?.focus();
  }

  function close() {
    closeZoom();
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    root.hidden = true;
    document.body.classList.remove('project-viewer-open');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  function open(project) {
    if (!project) return;
    lastFocus = document.activeElement;
    const study = resolveCaseStudy(project);

    const aboutParas = paragraphsFromText(study.about)
      .map((p) => `<p class="project-viewer__about-text">${escapeHtml(p)}</p>`)
      .join('');

    const facts = renderFacts(study);
    const downloads = renderDownloads(study.downloads);
    const overview =
      aboutParas || facts || downloads
        ? `<div class="project-viewer__overview">
            <div class="project-viewer__about">
              <p class="project-viewer__label">Overview</p>
              ${aboutParas || `<p class="project-viewer__about-text">${escapeHtml(project.description || '')}</p>`}
            </div>
            <aside class="project-viewer__aside">${facts}${downloads}</aside>
          </div>`
        : '';

    const coverSrc = study.cover;
    const coverPosition = study.coverPosition || '';
    const coverStyle = coverPosition
      ? ` style="object-position: ${escapeHtml(coverPosition)}"`
      : '';
    const cover = coverSrc
      ? `<figure class="project-viewer__banner">
          <img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(project.title)}"${coverStyle} onerror="this.parentElement.classList.add('is-missing')">
        </figure>`
      : '';

    const bodySections = study.sections
      .map((section) => {
        if (!coverSrc || !Array.isArray(section.images)) return section;
        const images = normalizeImages(section.images).filter((img) => {
          const src = String(img.src || '').split('?')[0];
          const coverBase = String(coverSrc).split('?')[0];
          return src !== coverBase;
        });
        return { ...section, images };
      })
      .filter((section) => {
        const hasText = Boolean(section.title || section.text);
        const hasPoints = Array.isArray(section.points) && section.points.length > 0;
        const hasStats = Array.isArray(section.stats) && section.stats.length > 0;
        const hasImages = normalizeImages(section.images).length > 0;
        const hasVideo = Boolean(section.video || (Array.isArray(section.videos) && section.videos.length));
        return hasText || hasPoints || hasStats || hasImages || hasVideo;
      });

    article.innerHTML = `
      <header class="project-viewer__header">
        <p class="project-viewer__category">${escapeHtml(project.category || 'Project')}</p>
        <h2 class="project-viewer__title" id="project-viewer-title">${escapeHtml(project.title || 'Project')}</h2>
      </header>
      ${cover}
      ${overview}
      <div class="project-viewer__body">
        ${bodySections.map((section, i) => renderSection(section, project.title, i)).join('')}
      </div>
      ${renderFooter(config)}
    `;

    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('project-viewer-open');
    bindPagers(article);
    requestAnimationFrame(() => {
      root.classList.add('is-open');
      root.querySelector('[data-project-close]')?.focus();
      root.querySelector('.project-viewer__scroll')?.scrollTo(0, 0);
    });
  }

  closeBtns?.forEach((btn) => btn.addEventListener('click', close));

  root.querySelectorAll('[data-project-home]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      close();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  root.addEventListener('click', (e) => {
    const zoomTrigger = e.target.closest('[data-project-zoom-src]');
    if (zoomTrigger && article.contains(zoomTrigger)) {
      e.preventDefault();
      openZoom(
        zoomTrigger.getAttribute('data-project-zoom-src'),
        zoomTrigger.querySelector('img')?.alt || ''
      );
      return;
    }
    if (e.target === root) close();
  });

  zoomRoot.querySelector('[data-project-zoom-close]')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeZoom();
  });

  zoomRoot.addEventListener('click', (e) => {
    if (e.target === zoomRoot || e.target === zoomStage) closeZoom();
  });

  zoomStage?.addEventListener(
    'wheel',
    (e) => {
      if (zoomRoot.hidden) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      setZoomScale(zoomScale + delta);
    },
    { passive: false }
  );

  let dragState = null;
  zoomStage?.addEventListener('pointerdown', (e) => {
    if (zoomRoot.hidden || zoomScale <= 1) return;
    dragState = {
      x: e.clientX,
      y: e.clientY,
      left: zoomStage.scrollLeft,
      top: zoomStage.scrollTop,
    };
    zoomStage.setPointerCapture(e.pointerId);
  });
  zoomStage?.addEventListener('pointermove', (e) => {
    if (!dragState) return;
    zoomStage.scrollLeft = dragState.left - (e.clientX - dragState.x);
    zoomStage.scrollTop = dragState.top - (e.clientY - dragState.y);
  });
  zoomStage?.addEventListener('pointerup', () => {
    dragState = null;
  });
  zoomStage?.addEventListener('pointercancel', () => {
    dragState = null;
  });

  function bindPagers(scope) {
    scope.querySelectorAll('[data-project-pager]').forEach((pager) => {
      const slides = [...pager.querySelectorAll('[data-pager-slide]')];
      const status = pager.querySelector('[data-pager-status]');
      const prev = pager.querySelector('[data-pager-prev]');
      const next = pager.querySelector('[data-pager-next]');
      const download = pager.querySelector('[data-pager-download]');
      let index = 0;

      const paint = () => {
        slides.forEach((slide, i) => {
          slide.classList.toggle('is-active', i === index);
        });
        if (status) {
          status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
        }
        if (prev) prev.disabled = index <= 0;
        if (next) next.disabled = index >= slides.length - 1;
        const active = slides[index];
        if (download && active) {
          download.href = active.getAttribute('data-pager-href') || download.href;
          download.setAttribute(
            'download',
            active.getAttribute('data-pager-filename') || 'storyboard.jpg'
          );
          download.textContent = `Download page ${String(index + 1).padStart(2, '0')}`;
        }
      };

      prev?.addEventListener('click', (e) => {
        e.preventDefault();
        index = Math.max(0, index - 1);
        paint();
      });
      next?.addEventListener('click', (e) => {
        e.preventDefault();
        index = Math.min(slides.length - 1, index + 1);
        paint();
      });
      paint();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) {
      e.preventDefault();
      if (closeZoom()) return;
      close();
    }
  });

  return { open, close };
}
