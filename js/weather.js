/**
 * Immersive location-aware climate on the hero only.
 * Visitors feel weather on screen (rain, snow, fog, clouds…) — not a text status.
 */

const WEATHER_CACHE_KEY = 'portfolio-climate-v2';
const CACHE_TTL_MS = 30 * 60 * 1000;

function climateFromCode(code) {
  if (code === 0) return 'clear';
  if (code >= 1 && code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  if (code >= 95 && code <= 99) return 'storm';
  return 'cloudy';
}

function readCache() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.fetchedAt || Date.now() - data.fetchedAt > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  try {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({ ...payload, fetchedAt: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

function getPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 4500, maximumAge: 600000 }
    );
  });
}

function fetchWithTimeout(url, ms = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function getPositionFromIp() {
  const res = await fetchWithTimeout('https://get.geojs.io/v1/ip/geo.json', 6000);
  if (!res.ok) throw new Error('geojs failed');
  const data = await res.json();
  const lat = parseFloat(data.latitude);
  const lon = parseFloat(data.longitude);
  if (Number.isNaN(lat) || Number.isNaN(lon)) throw new Error('invalid coords');
  return { lat, lon };
}

async function fetchWeather(lat, lon) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'weather_code,precipitation,cloud_cover,temperature_2m');
  url.searchParams.set('timezone', 'auto');

  const res = await fetchWithTimeout(url, 8000);
  if (!res.ok) throw new Error('open-meteo failed');
  const data = await res.json();
  const current = data.current || {};
  const code = Number(current.weather_code);
  return {
    code: Number.isFinite(code) ? code : 2,
    temperature: Number(current.temperature_2m),
  };
}

function spawnParticle(kind, w, h, randomY) {
  const x = Math.random() * (w + 80) - 40;
  const y = randomY ? Math.random() * h : -20 - Math.random() * h * 0.35;

  if (kind === 'snow') {
    return {
      x,
      y,
      r: 2 + Math.random() * 4.5,
      vy: 0.45 + Math.random() * 0.9,
      vx: -0.5 + Math.random() * 1,
      wobble: Math.random() * Math.PI * 2,
      alpha: 0.55 + Math.random() * 0.4,
    };
  }

  if (kind === 'cloudy' || kind === 'fog') {
    return {
      x: Math.random() * w * 1.4 - w * 0.2,
      y: Math.random() * h * 0.75,
      r: 90 + Math.random() * 220,
      vx: 0.15 + Math.random() * 0.35,
      vy: -0.02 + Math.random() * 0.05,
      alpha: kind === 'fog' ? 0.14 + Math.random() * 0.12 : 0.16 + Math.random() * 0.14,
    };
  }

  if (kind === 'clear') {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.8 + Math.random() * 1.8,
      vx: 0.08 + Math.random() * 0.15,
      vy: -0.05 + Math.random() * 0.1,
      alpha: 0.25 + Math.random() * 0.35,
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  // rain / drizzle / storm
  const isStorm = kind === 'storm';
  const isDrizzle = kind === 'drizzle';
  return {
    x,
    y,
    len: isDrizzle ? 10 + Math.random() * 12 : 16 + Math.random() * 22,
    vy: isStorm
      ? 5.5 + Math.random() * 4
      : isDrizzle
        ? 1.4 + Math.random() * 1.4
        : 2.0 + Math.random() * 2.2, // slow rain, but visible
    vx: isStorm ? 1.6 + Math.random() * 1.8 : 0.25 + Math.random() * 0.45,
    width: isDrizzle ? 1.1 : isStorm ? 1.8 : 1.45,
    alpha: isDrizzle ? 0.35 + Math.random() * 0.25 : 0.45 + Math.random() * 0.35,
  };
}

function particleCount(kind, area) {
  const density = Math.min(1.6, Math.max(0.7, area / (1280 * 720)));
  const base = {
    clear: 55,
    cloudy: 22,
    fog: 18,
    drizzle: 120,
    rain: 160,
    snow: 90,
    storm: 220,
  }[kind] || 80;
  return Math.round(base * density);
}

function drawAtmosphere(ctx, kind, w, h, dark, flash, t) {
  // Full-hero mood wash so climate is felt immediately
  if (kind === 'cloudy') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, dark ? 'rgba(90,100,120,0.42)' : 'rgba(130,140,155,0.38)');
    g.addColorStop(0.45, dark ? 'rgba(70,80,95,0.22)' : 'rgba(150,155,165,0.2)');
    g.addColorStop(1, dark ? 'rgba(40,45,55,0.08)' : 'rgba(180,185,190,0.08)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  if (kind === 'fog') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, dark ? 'rgba(190,200,210,0.35)' : 'rgba(210,215,220,0.48)');
    g.addColorStop(0.5, dark ? 'rgba(170,180,190,0.28)' : 'rgba(200,205,210,0.35)');
    g.addColorStop(1, dark ? 'rgba(140,150,160,0.12)' : 'rgba(220,222,225,0.18)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  if (kind === 'rain' || kind === 'drizzle') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, dark ? 'rgba(70,90,120,0.28)' : 'rgba(120,140,165,0.22)');
    g.addColorStop(1, dark ? 'rgba(40,50,70,0.1)' : 'rgba(150,160,175,0.08)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  if (kind === 'storm') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, dark ? 'rgba(40,45,70,0.45)' : 'rgba(70,80,105,0.35)');
    g.addColorStop(1, dark ? 'rgba(20,25,40,0.18)' : 'rgba(90,100,120,0.14)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    if (flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flash * 0.28})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  if (kind === 'snow') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, dark ? 'rgba(180,195,220,0.22)' : 'rgba(200,215,235,0.28)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  if (kind === 'clear') {
    const pulse = 0.85 + Math.sin(t * 0.0012) * 0.15;
    const glow = ctx.createRadialGradient(
      w * 0.78,
      h * 0.08,
      10,
      w * 0.78,
      h * 0.08,
      w * 0.55
    );
    glow.addColorStop(0, dark
      ? `rgba(255,220,150,${0.16 * pulse})`
      : `rgba(255,200,110,${0.32 * pulse})`);
    glow.addColorStop(0.45, dark
      ? `rgba(255,210,140,${0.06 * pulse})`
      : `rgba(255,220,160,${0.12 * pulse})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Soft sun rays
    ctx.save();
    ctx.translate(w * 0.78, h * 0.08);
    ctx.globalAlpha = dark ? 0.05 : 0.09;
    for (let i = 0; i < 7; i += 1) {
      const a = -0.9 + i * 0.22 + Math.sin(t * 0.0004 + i) * 0.03;
      ctx.rotate(a);
      const ray = ctx.createLinearGradient(0, 0, 0, h * 0.9);
      ray.addColorStop(0, 'rgba(255,200,120,0.7)');
      ray.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = ray;
      ctx.fillRect(-18, 0, 36, h * 0.9);
      ctx.rotate(-a);
    }
    ctx.restore();
  }
}

function startEffect(canvas, kind) {
  const ctx = canvas.getContext('2d', { alpha: true });
  let particles = [];
  let flash = 0;
  let raf = 0;
  let running = true;
  let lastStorm = performance.now();

  const resize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: particleCount(kind, rect.width * rect.height) }, () =>
      spawnParticle(kind, rect.width, rect.height, true)
    );
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  const loop = (now) => {
    if (!running) return;
    const dark = document.documentElement.classList.contains('dark');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (kind === 'storm' && now - lastStorm > 3200 + Math.random() * 4200) {
      flash = 1;
      lastStorm = now;
    }
    if (flash > 0) flash = Math.max(0, flash - 0.035);

    for (const p of particles) {
      if (kind === 'snow') {
        p.wobble += 0.025;
        p.x += p.vx + Math.sin(p.wobble) * 0.55;
        p.y += p.vy;
        if (p.y > h + 12) Object.assign(p, spawnParticle(kind, w, h, false));
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
      } else if (kind === 'cloudy' || kind === 'fog') {
        p.x += p.vx;
        p.y += p.vy + Math.sin(now * 0.0004 + p.x * 0.01) * 0.08;
        if (p.x > w + p.r) p.x = -p.r;
      } else if (kind === 'clear') {
        p.twinkle += 0.04;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;
      } else {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > h + p.len || p.x > w + 30) Object.assign(p, spawnParticle(kind, w, h, false));
      }
    }

    ctx.clearRect(0, 0, w, h);
    drawAtmosphere(ctx, kind, w, h, dark, flash, now);

    const ink = dark ? '235,240,255' : '35,45,60';
    const cloud = dark ? '160,170,190' : '110,120,135';

    for (const p of particles) {
      if (kind === 'snow') {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink},${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === 'cloudy' || kind === 'fog') {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(${cloud},${p.alpha})`);
        g.addColorStop(0.55, `rgba(${cloud},${p.alpha * 0.45})`);
        g.addColorStop(1, `rgba(${cloud},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === 'clear') {
        const a = p.alpha * (0.65 + Math.sin(p.twinkle) * 0.35);
        ctx.beginPath();
        ctx.fillStyle = dark
          ? `rgba(255,230,180,${a})`
          : `rgba(180,140,60,${a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = `rgba(${ink},${p.alpha})`;
        ctx.lineWidth = p.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.5, p.y + p.len);
        ctx.stroke();
      }
    }

    raf = requestAnimationFrame(loop);
  };

  raf = requestAnimationFrame(loop);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}

async function resolveClimate(config) {
  const forced = config?.hero?.weather?.force;
  if (forced) return { kind: forced };

  const cached = readCache();
  if (cached?.kind) return cached;

  let coords = await getPosition();
  if (!coords) coords = await getPositionFromIp();

  const weather = await fetchWeather(coords.lat, coords.lon);
  const payload = {
    kind: climateFromCode(weather.code),
    code: weather.code,
    temperature: weather.temperature,
  };
  writeCache(payload);
  return payload;
}

export async function initWeather(config) {
  const weatherCfg = config?.hero?.weather || {};
  if (weatherCfg.enabled === false) return;

  const canvas = document.getElementById('hero-climate');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.hidden = true;
    return;
  }

  try {
    const climate = await resolveClimate(config);
    const kind = climate.kind || 'cloudy';

    hero.dataset.climate = kind;
    canvas.hidden = false;
    canvas.setAttribute('data-climate', kind);
    startEffect(canvas, kind);
  } catch (err) {
    console.warn('Climate effects unavailable:', err);
    canvas.hidden = true;
  }
}
