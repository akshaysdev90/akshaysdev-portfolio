/**
 * Location-aware hero climate.
 * GPS (fast + accurate) → parallel IP providers → optional defaults → Open-Meteo.
 * Cache is only a fast first paint; live weather always revalidates.
 */

const WEATHER_CACHE_KEY = 'portfolio-climate-v7';
const CACHE_TTL_MS = 5 * 60 * 1000;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

/** WMO weather_code + live measurements → climate kind */
function resolveClimateFromObs(obs) {
  const code = Number(obs.code);
  const rain = Number(obs.rain) || 0;
  const showers = Number(obs.showers) || 0;
  const snowfall = Number(obs.snowfall) || 0;
  const precipitation = Number(obs.precipitation) || 0;
  const clouds = Number(obs.cloudCover) || 0;
  const humidity = Number(obs.humidity) || 0;
  const wind = Number(obs.wind) || 0;
  const liquid = Math.max(rain, showers, precipitation);

  if (snowfall > 0.05 || (code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return {
      kind: 'snow',
      intensity: clamp((snowfall || precipitation || 0.4) / 2.5, 0.4, 1),
      code,
    };
  }

  if (code >= 95 && code <= 99) {
    return {
      kind: 'storm',
      intensity: clamp(0.75 + liquid / 6, 0.75, 1),
      code,
    };
  }

  // Active precip always wins over sky code
  if (liquid > 0.1 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    if (liquid >= 4 || code === 65 || code === 67 || code === 82) {
      return { kind: 'storm', intensity: clamp(liquid / 6, 0.7, 1), code };
    }
    if (
      liquid < 0.6
      || (code >= 51 && code <= 57)
      || code === 61
      || code === 66
      || code === 80
    ) {
      return {
        kind: 'drizzle',
        intensity: clamp(0.4 + liquid / 1.2, 0.4, 0.85),
        code,
      };
    }
    return {
      kind: 'rain',
      intensity: clamp(0.5 + liquid / 2.2, 0.5, 1),
      code,
    };
  }

  if (code === 45 || code === 48 || (clouds >= 95 && humidity >= 92 && wind < 8)) {
    return {
      kind: 'fog',
      intensity: clamp(0.55 + humidity / 200, 0.55, 1),
      code,
    };
  }

  // Clear / mainly clear
  if (code === 0 || (code === 1 && clouds < 35)) {
    return {
      kind: 'clear',
      intensity: clamp(1 - clouds / 100, 0.55, 1),
      code,
    };
  }

  // Partly cloudy
  if (code === 1 || code === 2) {
    if (clouds < 45) {
      return {
        kind: 'clear',
        intensity: clamp(0.75 - clouds / 200, 0.5, 0.9),
        code,
      };
    }
    return {
      kind: 'cloudy',
      intensity: clamp(clouds / 100, 0.45, 0.85),
      code,
    };
  }

  // Overcast / default
  return {
    kind: 'cloudy',
    intensity: clamp(Math.max(clouds / 100, 0.65), 0.65, 1),
    code,
  };
}

function readCache() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.fetchedAt || Date.now() - data.fetchedAt > CACHE_TTL_MS) return null;
    if (!data.kind || typeof data.intensity !== 'number') return null;
    if (!Number.isFinite(data.lat) || !Number.isFinite(data.lon)) return null;
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

function clearLegacyCaches() {
  try {
    [
      'portfolio-climate-v1',
      'portfolio-climate-v2',
      'portfolio-climate-v3',
      'portfolio-climate-v4',
      'portfolio-climate-v5',
      'portfolio-climate-v6',
    ].forEach((key) => localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}

function fetchWithTimeout(url, ms = 7000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

function getGpsPosition(options) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    if (typeof window.isSecureContext === 'boolean' && !window.isSecureContext) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          source: 'gps',
        }),
      (err) => {
        console.debug('[climate] GPS unavailable:', err?.code, err?.message);
        resolve(null);
      },
      options
    );
  });
}

function gpsOrFail(promise) {
  return promise.then((coords) => {
    if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lon)) {
      throw new Error('gps-null');
    }
    return coords;
  });
}

async function getIpPosition() {
  const providers = [
    async () => {
      const res = await fetchWithTimeout('https://get.geojs.io/v1/ip/geo.json', 4500);
      if (!res.ok) throw new Error('geojs');
      const data = await res.json();
      return {
        lat: parseFloat(data.latitude),
        lon: parseFloat(data.longitude),
        source: 'ip-geojs',
      };
    },
    async () => {
      const res = await fetchWithTimeout('https://ipwho.is/', 4500);
      if (!res.ok) throw new Error('ipwho');
      const data = await res.json();
      if (data.success === false) throw new Error('ipwho-error');
      return {
        lat: parseFloat(data.latitude),
        lon: parseFloat(data.longitude),
        source: 'ip-ipwho',
      };
    },
    async () => {
      const res = await fetchWithTimeout('https://ipapi.co/json/', 4500);
      if (!res.ok) throw new Error('ipapi');
      const data = await res.json();
      if (data.error) throw new Error('ipapi-error');
      return {
        lat: parseFloat(data.latitude),
        lon: parseFloat(data.longitude),
        source: 'ip-ipapi',
      };
    },
    async () => {
      const res = await fetchWithTimeout('https://api.ip.sb/geoip', 4500);
      if (!res.ok) throw new Error('ipsb');
      const data = await res.json();
      return {
        lat: parseFloat(data.latitude),
        lon: parseFloat(data.longitude),
        source: 'ip-ipsb',
      };
    },
  ];

  const settled = await Promise.all(
    providers.map((provider) =>
      provider()
        .then((coords) =>
          Number.isFinite(coords?.lat) && Number.isFinite(coords?.lon) ? coords : null
        )
        .catch((err) => {
          console.debug('[climate] IP provider failed:', err?.message || err);
          return null;
        })
    )
  );

  return settled.find(Boolean) || null;
}

/**
 * Prefer GPS (fast + accurate in parallel). Fall back to every IP provider,
 * then optional config defaults. Returns coords and a pending GPS upgrade promise.
 */
async function resolveCoords(defaults = null) {
  const gpsFastP = getGpsPosition({
    enableHighAccuracy: false,
    timeout: 8000,
    maximumAge: 5 * 60 * 1000,
  });
  const gpsAccurateP = getGpsPosition({
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0,
  });
  const anyGpsP = Promise.any([gpsOrFail(gpsFastP), gpsOrFail(gpsAccurateP)]).catch(
    () => null
  );
  const ipP = getIpPosition();

  // Give GPS a fair window before accepting IP
  const gpsQuick = await Promise.race([
    anyGpsP,
    new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
  ]);
  if (gpsQuick) {
    console.debug('[climate] location via', gpsQuick.source, gpsQuick.lat, gpsQuick.lon);
    return { coords: gpsQuick, gpsUpgrade: Promise.resolve(null) };
  }

  const ip = await ipP;
  if (ip) {
    console.debug('[climate] location via', ip.source, ip.lat, ip.lon);
    return { coords: ip, gpsUpgrade: anyGpsP };
  }

  const gpsLate = await anyGpsP;
  if (gpsLate) {
    console.debug('[climate] location via late', gpsLate.source, gpsLate.lat, gpsLate.lon);
    return { coords: gpsLate, gpsUpgrade: Promise.resolve(null) };
  }

  if (
    defaults
    && Number.isFinite(Number(defaults.lat))
    && Number.isFinite(Number(defaults.lon))
  ) {
    const fallback = {
      lat: Number(defaults.lat),
      lon: Number(defaults.lon),
      source: 'default',
    };
    console.debug('[climate] location via default', fallback.lat, fallback.lon);
    return { coords: fallback, gpsUpgrade: anyGpsP };
  }

  throw new Error('Unable to resolve location');
}

async function fetchWeather(lat, lon) {
  const qLat = Number(Number(lat).toFixed(4));
  const qLon = Number(Number(lon).toFixed(4));

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(qLat));
  url.searchParams.set('longitude', String(qLon));
  url.searchParams.set(
    'current',
    [
      'weather_code',
      'temperature_2m',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'cloud_cover',
      'wind_speed_10m',
      'relative_humidity_2m',
      'is_day',
    ].join(',')
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '1');

  const res = await fetchWithTimeout(url.toString(), 9000);
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const data = await res.json();
  const c = data.current || {};
  const code = Number(c.weather_code);

  return {
    code: Number.isFinite(code) ? code : 2,
    temperature: Number(c.temperature_2m),
    precipitation: Number(c.precipitation) || 0,
    rain: Number(c.rain) || 0,
    showers: Number(c.showers) || 0,
    snowfall: Number(c.snowfall) || 0,
    cloudCover: Number(c.cloud_cover) || 0,
    wind: Number(c.wind_speed_10m) || 0,
    humidity: Number(c.relative_humidity_2m) || 0,
    isDay: Number(c.is_day) === 1,
    lat: qLat,
    lon: qLon,
    observedAt: c.time || null,
  };
}

async function buildClimatePayload(coords) {
  const weather = await fetchWeather(coords.lat, coords.lon);
  const resolved = resolveClimateFromObs(weather);
  return {
    kind: resolved.kind,
    intensity: resolved.intensity,
    code: weather.code,
    temperature: weather.temperature,
    precipitation: weather.precipitation,
    rain: weather.rain,
    snowfall: weather.snowfall,
    cloudCover: weather.cloudCover,
    isDay: weather.isDay,
    lat: weather.lat,
    lon: weather.lon,
    geoSource: coords.source || 'unknown',
    observedAt: weather.observedAt,
    fetchedAt: Date.now(),
  };
}

function climatesDiffer(a, b) {
  if (!a || !b) return true;
  if (a.kind !== b.kind) return true;
  if (Boolean(a.isDay) !== Boolean(b.isDay)) return true;
  return Math.abs((a.intensity || 0) - (b.intensity || 0)) > 0.15;
}

function replaceParticle(target, next) {
  // Clear leftover keys from previous particle shape (avoids wind/lean bugs)
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
  Object.assign(target, next);
}

/* ------------------------------------------------------------------ */
/* Effects                                                            */
/* ------------------------------------------------------------------ */

function spawnSnow(w, h, randomY, intensity) {
  const i = intensity ?? 1;
  return {
    type: 'snow',
    x: Math.random() * (w + 80) - 40,
    y: randomY ? Math.random() * h : -20 - Math.random() * h * 0.35,
    r: (2.2 + Math.random() * 4.8) * (0.9 + i * 0.3),
    vy: (0.45 + Math.random() * 0.95) * (0.9 + i * 0.3),
    vx: -0.5 + Math.random() * 1,
    wobble: Math.random() * Math.PI * 2,
    alpha: (0.55 + Math.random() * 0.35) * (0.85 + i * 0.2),
  };
}

function spawnRainDrop(kind, w, h, randomY, intensity) {
  const isStorm = kind === 'storm';
  const isDrizzle = kind === 'drizzle';
  const roll = Math.random();
  const layer = isDrizzle
    ? (roll < 0.62 ? 0 : roll < 0.93 ? 1 : 2)
    : isStorm
      ? (roll < 0.32 ? 0 : roll < 0.68 ? 1 : 2)
      : (roll < 0.5 ? 0 : roll < 0.84 ? 1 : 2);

  // Nearly vertical — max ~3°
  const leanRad = (isStorm ? 0.045 : isDrizzle ? 0.015 : 0.028)
    + (Math.random() - 0.5) * 0.012;

  const base = isStorm ? 3.0 : isDrizzle ? 1.2 : 1.9;
  const depthMul = layer === 0 ? 0.5 : layer === 1 ? 0.8 : 1.15;
  const speed = base * depthMul * (0.9 + intensity * 0.25) * (0.88 + Math.random() * 0.24);

  const len = (
    layer === 0
      ? 16 + Math.random() * 22
      : layer === 1
        ? 28 + Math.random() * 32
        : 42 + Math.random() * 48
  ) * (isDrizzle ? 0.7 : 1);

  const width = (
    layer === 0
      ? 0.7 + Math.random() * 0.4
      : layer === 1
        ? 1.05 + Math.random() * 0.6
        : 1.45 + Math.random() * 1.0
  );

  const alpha = (
    layer === 0
      ? 0.07 + Math.random() * 0.08
      : layer === 1
        ? 0.12 + Math.random() * 0.1
        : 0.2 + Math.random() * 0.18
  ) * (0.9 + intensity * 0.25);

  return {
    type: 'rain',
    layer,
    x: Math.random() * (w + 80) - 40,
    y: randomY ? Math.random() * (h + 60) - 30 : -len - Math.random() * 90,
    len,
    width,
    speed,
    leanRad,
    alpha,
    sheen: layer === 2 ? 0.2 + Math.random() * 0.35 : 0,
  };
}

function spawnParticle(kind, w, h, randomY, intensity) {
  if (kind === 'snow') return spawnSnow(w, h, randomY, intensity);
  return spawnRainDrop(kind, w, h, randomY, intensity);
}

function spawnSplash(x, y, intensity) {
  return {
    type: 'splash',
    x,
    y,
    life: 0,
    maxLife: 0.38 + Math.random() * 0.28,
    r: 2 + Math.random() * 4,
    alpha: (0.14 + Math.random() * 0.12) * (0.7 + intensity * 0.4),
    vx: (Math.random() - 0.5) * 0.8,
    vy: -0.35 - Math.random() * 0.7,
  };
}

function particleCount(kind, area, intensity) {
  const density = Math.min(1.45, Math.max(0.8, area / (1280 * 720)));
  const base = {
    drizzle: 100,
    rain: 160,
    snow: 110,
    storm: 210,
  }[kind];
  if (!base) return 0;
  return Math.round(base * density * (0.85 + intensity * 0.4));
}

function needsParticles(kind) {
  return kind === 'rain' || kind === 'drizzle' || kind === 'snow' || kind === 'storm';
}

function drawRainStreak(ctx, p, dark) {
  const lean = p.leanRad ?? 0;
  const body = dark ? '205, 220, 245' : '50, 60, 75';
  const tip = dark ? '245, 250, 255' : '130, 145, 165';
  const a = p.alpha;

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(lean);

  const g = ctx.createLinearGradient(0, 0, 0, p.len);
  g.addColorStop(0, `rgba(${body},0)`);
  g.addColorStop(0.15, `rgba(${body},${a * 0.45})`);
  g.addColorStop(0.45, `rgba(${tip},${a})`);
  g.addColorStop(0.85, `rgba(${body},${a * 0.55})`);
  g.addColorStop(1, `rgba(${body},0)`);

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, p.len * 0.5, Math.max(0.55, p.width * 0.55), p.len * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (p.layer === 2 && p.sheen > 0) {
    const hg = ctx.createLinearGradient(0, p.len * 0.3, 0, p.len * 0.7);
    hg.addColorStop(0, 'rgba(255,255,255,0)');
    hg.addColorStop(0.5, `rgba(255,255,255,${a * p.sheen * 0.4})`);
    hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(0, p.len * 0.5, Math.max(0.3, p.width * 0.18), p.len * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSplash(ctx, s, dark) {
  const t = s.life / s.maxLife;
  const fade = 1 - t;
  const rgb = dark ? '210, 225, 255' : '75, 90, 115';
  ctx.beginPath();
  ctx.strokeStyle = `rgba(${rgb},${s.alpha * fade * 0.65})`;
  ctx.lineWidth = 0.85;
  ctx.ellipse(s.x, s.y, s.r * (0.7 + t * 2.2), s.r * (0.2 + t * 0.4), 0, 0, Math.PI * 2);
  ctx.stroke();
}

function startEffect(canvas, wash, kind, intensity = 1) {
  const level = clamp(intensity, 0.35, 1);
  let flashTimer = 0;

  if (wash) {
    wash.hidden = false;
    wash.classList.remove('is-flashing');
  }

  if (!needsParticles(kind) || !canvas || typeof canvas.getContext !== 'function') {
    if (canvas) canvas.hidden = true;
    return () => {
      if (flashTimer) window.clearInterval(flashTimer);
      if (wash) wash.classList.remove('is-flashing');
    };
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  let drops = [];
  let splashes = [];
  let raf = 0;
  let running = true;
  let last = performance.now();
  canvas.hidden = false;

  const isPrecip = kind === 'rain' || kind === 'drizzle' || kind === 'storm';

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
    drops = Array.from(
      { length: particleCount(kind, rect.width * rect.height, level) },
      () => spawnParticle(kind, rect.width, rect.height, true, level)
    );
    splashes = [];
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (kind === 'storm' && wash) {
    flashTimer = window.setInterval(() => {
      if (!running) return;
      wash.classList.remove('is-flashing');
      void wash.offsetWidth;
      wash.classList.add('is-flashing');
    }, 3800 + Math.random() * 4000);
  }

  const loop = (now) => {
    if (!running) return;
    const dt = Math.min(32, now - last) / 16.67;
    last = now;

    const dark = document.documentElement.classList.contains('dark');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    for (const p of drops) {
      if (p.type === 'snow') {
        p.wobble += 0.025 * dt;
        p.x += (p.vx + Math.sin(p.wobble) * 0.55) * dt;
        p.y += p.vy * dt;
        if (p.y > h + 12) replaceParticle(p, spawnParticle(kind, w, h, false, level));
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
        continue;
      }

      const lean = p.leanRad ?? 0;
      p.x += Math.sin(lean) * p.speed * dt;
      p.y += Math.cos(lean) * p.speed * dt;

      if (p.y > h - 4) {
        if (p.layer >= 1 && Math.random() < 0.35) {
          splashes.push(spawnSplash(p.x, h - 2 - Math.random() * 5, level));
          if (splashes.length > 36) splashes.shift();
        }
        replaceParticle(p, spawnRainDrop(kind, w, h, false, level));
      } else if (p.x > w + 40 || p.x < -40) {
        replaceParticle(p, spawnRainDrop(kind, w, h, false, level));
      }
    }

    for (let i = splashes.length - 1; i >= 0; i -= 1) {
      const s = splashes[i];
      s.life += 0.016 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 0.08 * dt;
      if (s.life >= s.maxLife) splashes.splice(i, 1);
    }

    ctx.clearRect(0, 0, w, h);

    if (isPrecip) {
      const veil = ctx.createLinearGradient(0, 0, 0, h);
      if (dark) {
        veil.addColorStop(0, 'rgba(70, 90, 130, 0.1)');
        veil.addColorStop(0.55, 'rgba(40, 55, 85, 0.03)');
        veil.addColorStop(1, 'rgba(90, 120, 160, 0.08)');
      } else {
        veil.addColorStop(0, 'rgba(100, 115, 135, 0.07)');
        veil.addColorStop(0.5, 'rgba(130, 140, 155, 0.02)');
        veil.addColorStop(1, 'rgba(145, 160, 175, 0.1)');
      }
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, h);

      for (let layer = 0; layer <= 2; layer += 1) {
        for (const p of drops) {
          if (p.type === 'rain' && p.layer === layer) drawRainStreak(ctx, p, dark);
        }
      }
      for (const s of splashes) drawSplash(ctx, s, dark);
    } else {
      const ink = dark ? '235,240,255' : '35,45,60';
      for (const p of drops) {
        if (p.type !== 'snow') continue;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink},${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    raf = requestAnimationFrame(loop);
  };

  raf = requestAnimationFrame(loop);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    if (flashTimer) window.clearInterval(flashTimer);
    if (wash) wash.classList.remove('is-flashing');
    canvas.hidden = true;
  };
}

/* ------------------------------------------------------------------ */
/* Init                                                               */
/* ------------------------------------------------------------------ */

export async function initWeather(config) {
  const weatherCfg = config?.hero?.weather || {};
  if (weatherCfg.enabled === false) return;

  const canvas = document.getElementById('hero-climate');
  const wash = document.getElementById('hero-climate-wash');
  const hero = document.getElementById('hero');
  if (!hero || (!canvas && !wash)) return;

  clearLegacyCaches();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stopEffect = null;
  let applied = null;

  const applyClimate = (climate) => {
    if (!climate?.kind) return;
    const kind = climate.kind;
    const intensity = typeof climate.intensity === 'number' ? climate.intensity : 1;
    const isDay = climate.isDay === true;

    hero.dataset.climate = kind;
    hero.dataset.climateIntensity = intensity.toFixed(2);
    hero.dataset.climateDay = isDay ? '1' : '0';
    if (climate.code != null) hero.dataset.climateCode = String(climate.code);
    if (climate.geoSource) hero.dataset.climateSource = climate.geoSource;
    hero.style.setProperty('--climate-intensity', String(clamp(intensity, 0.35, 1)));

    if (wash) {
      wash.hidden = false;
      wash.setAttribute('data-climate', kind);
    }
    if (canvas) canvas.setAttribute('data-climate', kind);

    if (stopEffect) stopEffect();
    if (reducedMotion) {
      if (canvas) canvas.hidden = true;
      stopEffect = null;
    } else {
      stopEffect = startEffect(canvas, wash, kind, intensity);
    }
    applied = climate;
  };

  const forced = weatherCfg.force;
  if (forced) {
    applyClimate({
      kind: forced,
      intensity: 1,
      isDay: true,
      geoSource: 'force',
      source: 'force',
    });
    return;
  }

  // 1) Instant paint from fresh cache (if any)
  const cached = readCache();
  if (cached) applyClimate({ ...cached, source: 'cache' });

  const applyFromCoords = async (coords, sourceLabel) => {
    if (!coords) return null;
    const live = await buildClimatePayload(coords);
    writeCache(live);
    if (!applied || climatesDiffer(applied, live) || applied.geoSource !== live.geoSource) {
      applyClimate({ ...live, source: sourceLabel || 'live' });
    } else {
      applied = { ...live, source: sourceLabel || 'live' };
      if (live.geoSource) hero.dataset.climateSource = live.geoSource;
    }
    return live;
  };

  // 2) Always fetch live — GPS preferred, then IP, then config defaults
  try {
    const { coords, gpsUpgrade } = await resolveCoords(weatherCfg.defaultCoords || null);
    await applyFromCoords(coords, 'live');

    // 3) Upgrade to GPS when it arrives after an IP/default first paint
    if (
      gpsUpgrade
      && (String(coords.source || '').startsWith('ip') || coords.source === 'default')
    ) {
      void gpsUpgrade.then(async (gps) => {
        if (!gps) return;
        if (
          Number.isFinite(coords.lat)
          && Number.isFinite(coords.lon)
          && haversineKm(coords.lat, coords.lon, gps.lat, gps.lon) < 3
        ) {
          hero.dataset.climateSource = 'gps';
          return;
        }
        try {
          await applyFromCoords(gps, 'gps');
        } catch (err) {
          console.debug('[climate] GPS refine failed:', err);
        }
      });
    }
  } catch (err) {
    console.warn('Climate effects unavailable:', err);
    if (!applied) {
      applyClimate({
        kind: 'cloudy',
        intensity: 0.55,
        isDay: true,
        code: 2,
        geoSource: 'fallback',
        source: 'fallback',
      });
    }
  }
}
