/**
 * Hero tiger wow: materialize reveal, cursor-lit dissolve dust, magnetic stare.
 */

export function initTigerWow(config) {
  const scene = document.getElementById('hero-tiger');
  const hero = document.getElementById('hero');
  const tigerEl = document.getElementById('hero-tiger-img');
  const canvas = document.getElementById('hero-tiger-dust');
  if (!scene || !hero || !tigerEl || !canvas || scene.hidden) return;

  const cfg = config.hero?.tiger || {};
  const strength = cfg.strength ?? 0.3;
  const stareMax = cfg.stare ?? 7;
  const materializeMs = cfg.materializeMs ?? 2400;
  const particleCount = cfg.particles ?? 160;
  const isDark = () => document.documentElement.classList.contains('dark');

  const ctx = canvas.getContext('2d', { alpha: true });
  let particles = [];
  let homes = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let ready = false;
  let phase = 'boot'; // boot | materializing | alive
  let phaseStart = 0;
  let rafId = 0;

  // Parallax + stare
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let stareTX = 0;
  let stareTY = 0;
  let stareX = 0;
  let stareY = 0;
  let mouseSceneX = -9999;
  let mouseSceneY = -9999;
  let cursorNear = 0; // 0–1 energy for dissolve trail

  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function resize() {
    const rect = scene.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function sampleHomes(img) {
    const tw = img.naturalWidth || img.width;
    const th = img.naturalHeight || img.height;
    if (!tw || !th) return [];

    const sample = document.createElement('canvas');
    const sw = 120;
    const sh = Math.round((th / tw) * sw);
    sample.width = sw;
    sample.height = sh;
    const sctx = sample.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(img, 0, 0, sw, sh);
    const data = sctx.getImageData(0, 0, sw, sh).data;

    const displayW = tigerEl.clientWidth || w * 0.9;
    const displayH = tigerEl.clientHeight || displayW * (th / tw);
    const offsetX = (w - displayW) / 2;
    const offsetY = h - displayH;

    const pts = [];
    for (let y = 0; y < sh; y += 2) {
      for (let x = 0; x < sw; x += 2) {
        const i = (y * sw + x) * 4;
        const a = data[i + 3];
        const lum = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        if (a < 40) continue;
        // Prefer darker ink + rear/left trail (dissolve side of the art)
        const trailBias = 1 - x / sw;
        if (lum > 210 && trailBias < 0.35) continue;
        if (Math.random() > 0.22 + trailBias * 0.35) continue;
        pts.push({
          x: offsetX + (x / sw) * displayW,
          y: offsetY + (y / sh) * displayH,
          trail: trailBias, // 1 = rear, 0 = head
        });
      }
    }

    // Ensure we have enough trail-focused points
    if (pts.length < 40) {
      for (let i = 0; i < 80; i++) {
        pts.push({
          x: offsetX + displayW * (0.05 + Math.random() * 0.45),
          y: offsetY + displayH * (0.25 + Math.random() * 0.55),
          trail: 0.6 + Math.random() * 0.4,
        });
      }
    }
    return pts;
  }

  function spawnParticles() {
    particles = [];
    const count = Math.min(particleCount, Math.max(homes.length, 80));
    for (let i = 0; i < count; i++) {
      const home = homes[i % homes.length];
      const scatter = 80 + Math.random() * 140;
      const ang = Math.random() * Math.PI * 2;
      particles.push({
        homeX: home.x,
        homeY: home.y,
        trail: home.trail,
        x: home.x + Math.cos(ang) * scatter,
        y: home.y + Math.sin(ang) * scatter,
        vx: 0,
        vy: 0,
        size: 0.6 + Math.random() * 1.8,
        alpha: 0.15 + Math.random() * 0.55,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpd: 0.02 + Math.random() * 0.04,
      });
    }
  }

  function dustColor(alpha) {
    if (isDark()) return `rgba(242, 242, 242, ${alpha})`;
    return `rgba(20, 20, 20, ${alpha})`;
  }

  function startMaterialize() {
    phase = 'materializing';
    phaseStart = performance.now();
    scene.classList.remove('is-settled');
    tigerEl.style.opacity = '0';
    tigerEl.style.filter = 'blur(14px)';
  }

  function settle() {
    phase = 'alive';
    scene.classList.add('is-settled');
    tigerEl.style.opacity = '';
    tigerEl.style.filter = '';
  }

  function updateParticles(now, dt) {
    const materializeT =
      phase === 'materializing'
        ? Math.min(1, (now - phaseStart) / materializeMs)
        : 1;

    if (phase === 'materializing') {
      const ease = 1 - Math.pow(1 - materializeT, 3);
      tigerEl.style.opacity = String(Math.pow(ease, 1.6));
      tigerEl.style.filter = `blur(${(1 - ease) * 14}px)`;
      if (materializeT >= 1) settle();
    }

    // Cursor energy on the dissolve/trail side (left-back of tiger)
    let energy = 0;
    if (mouseSceneX > -9000) {
      const trailCX = w * 0.28;
      const trailCY = h * 0.55;
      const dx = mouseSceneX - trailCX;
      const dy = mouseSceneY - trailCY;
      const dist = Math.hypot(dx, dy);
      energy = Math.max(0, 1 - dist / (Math.min(w, h) * 0.72));
      energy = energy * energy;
    }
    cursorNear += (energy - cursorNear) * 0.12;

    for (const p of particles) {
      p.wobble += p.wobbleSpd;

      if (phase === 'materializing') {
        const ease = 1 - Math.pow(1 - materializeT, 3);
        const jx = Math.cos(p.wobble) * (1 - ease) * 10;
        const jy = Math.sin(p.wobble * 1.3) * (1 - ease) * 10;
        p.x += (p.homeX + jx - p.x) * (0.04 + ease * 0.12);
        p.y += (p.homeY + jy - p.y) * (0.04 + ease * 0.12);
        p.alpha = 0.2 + ease * 0.55 * p.trail;
        continue;
      }

      // Alive: settle to home with idle drift; amplify on trail when cursor near
      const swirl = cursorNear * p.trail;
      const idleX = Math.cos(p.wobble) * (0.35 + swirl * 4);
      const idleY = Math.sin(p.wobble * 1.4) * (0.3 + swirl * 3.5);

      // Cursor attraction / orbit on trail particles
      let pullX = 0;
      let pullY = 0;
      if (swirl > 0.02 && mouseSceneX > -9000) {
        const dx = mouseSceneX - p.x;
        const dy = mouseSceneY - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const force = swirl * (18 / d);
        // swirl tangentially + slight pull
        pullX = (-dy / d) * force * 6 + dx * force * 0.08;
        pullY = (dx / d) * force * 6 + dy * force * 0.08;
        // densify: spawn jitter toward home trail
        if (Math.random() < swirl * 0.08) {
          p.x = p.homeX + (Math.random() - 0.5) * 18;
          p.y = p.homeY + (Math.random() - 0.5) * 18;
        }
      }

      const homePull = 0.06 + (1 - p.trail) * 0.04;
      p.vx += (p.homeX + idleX - p.x) * homePull + pullX * 0.02;
      p.vy += (p.homeY + idleY - p.y) * homePull + pullY * 0.02;
      p.vx *= 0.86;
      p.vy *= 0.86;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.alpha = 0.12 + p.trail * 0.35 + swirl * 0.45;
      p.size = 0.55 + p.trail * 1.1 + swirl * 1.4 + Math.random() * 0.15;
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      ctx.beginPath();
      ctx.fillStyle = dustColor(Math.min(0.85, p.alpha));
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    stareX += (stareTX - stareX) * 0.1;
    stareY += (stareTY - stareY) * 0.1;

    scene.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    tigerEl.style.transform = `rotateY(${stareX}deg) rotateX(${stareY}deg)`;

    if (ready) {
      updateParticles(now, dt);
      drawParticles();
    }

    rafId = requestAnimationFrame(tick);
  }

  function onPointerMove(e) {
    const heroRect = hero.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const nx = (e.clientX - heroRect.left) / heroRect.width - 0.5;
    const ny = (e.clientY - heroRect.top) / heroRect.height - 0.5;

    if (!dragging) {
      targetX = nx * 50 * strength + dragOffsetX;
      targetY = ny * 32 * strength + dragOffsetY;
    }

    // Magnetic stare — head faces cursor (tiger faces left, so +X tilt looks toward right = cursor on right)
    stareTX = Math.max(-stareMax, Math.min(stareMax, -nx * stareMax * 2));
    stareTY = Math.max(-stareMax * 0.6, Math.min(stareMax * 0.6, ny * stareMax * 1.2));

    mouseSceneX = e.clientX - sceneRect.left;
    mouseSceneY = e.clientY - sceneRect.top;
  }

  function boot() {
    requestAnimationFrame(() => {
      resize();
      homes = sampleHomes(tigerEl);
      spawnParticles();
      ready = true;
      startMaterialize();
    });
  }

  if (tigerEl.complete && tigerEl.naturalWidth) {
    boot();
  } else {
    tigerEl.addEventListener('load', boot, { once: true });
  }

  window.addEventListener('resize', () => {
    resize();
    if (tigerEl.naturalWidth) {
      homes = sampleHomes(tigerEl);
      // Remap homes onto existing particles
      particles.forEach((p, i) => {
        const home = homes[i % homes.length];
        if (!home) return;
        p.homeX = home.x;
        p.homeY = home.y;
        p.trail = home.trail;
      });
    }
  }, { passive: true });

  hero.addEventListener('mousemove', onPointerMove);
  hero.addEventListener('mouseleave', () => {
    if (!dragging) {
      targetX = dragOffsetX;
      targetY = dragOffsetY;
    }
    stareTX = 0;
    stareTY = 0;
    mouseSceneX = -9999;
    mouseSceneY = -9999;
  });

  scene.addEventListener('pointerdown', (e) => {
    dragging = true;
    scene.classList.add('is-dragging');
    scene.setPointerCapture(e.pointerId);
    dragStartX = e.clientX - dragOffsetX;
    dragStartY = e.clientY - dragOffsetY;
  });

  scene.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dragOffsetX = Math.max(-120, Math.min(160, e.clientX - dragStartX));
    dragOffsetY = Math.max(-100, Math.min(80, e.clientY - dragStartY));
    targetX = dragOffsetX;
    targetY = dragOffsetY;
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    scene.classList.remove('is-dragging');
    try {
      scene.releasePointerCapture(e.pointerId);
    } catch (_) {}
    setTimeout(() => {
      if (dragging) return;
      dragOffsetX *= 0.35;
      dragOffsetY *= 0.35;
      targetX = dragOffsetX;
      targetY = dragOffsetY;
    }, 1200);
  };

  scene.addEventListener('pointerup', endDrag);
  scene.addEventListener('pointercancel', endDrag);

  // Theme toggle may flip dust color mid-flight — redraw handles it each frame
  rafId = requestAnimationFrame(tick);

  window.addEventListener(
    'beforeunload',
    () => cancelAnimationFrame(rafId),
    { once: true }
  );
}
