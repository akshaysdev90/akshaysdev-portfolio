/**
 * Immersive location-aware climate on the hero only.
 * Accuracy-first: GPS → IP fallbacks, Open-Meteo current obs,
 * WMO codes refined by rain / snow / cloud cover / wind,
 * GPS upgrade + cache invalidation when the visitor moves.
 */

const WEATHER_CACHE_KEY = 'portfolio-climate-v5';
const CACHE_TTL_MS = 8 * 60 * 1000; // keep conditions fresh
const LOCATION_DRIFT_KM = 12; // refetch when visitor moved this far

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

/**
 * Map Open-Meteo / WMO weather_code + live measurements → climate kind + intensity.
 * Precipitation readings override ambiguous codes when present.
 */
function resolveClimateFromObs(obs) {
  const code = obs.code;
  const rain = Number(obs.rain) || 0;
  const showers = Number(obs.showers) || 0;
  const snowfall = Number(obs.snowfall) || 0;
  const precipitation = Number(obs.precipitation) || 0;
  const clouds = Number(obs.cloudCover) || 0;
  const humidity = Number(obs.humidity) || 0;
  const wind = Number(obs.wind) || 0;
  const liquid = Math.max(rain, showers, precipitation);

  // --- Active precipitation (most trustworthy signal) ---
  if (snowfall > 0.05 || (code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    const intensity = clamp((snowfall || precipitation || 0.4) / 2.5, 0.4, 1);
    return { kind: 'snow', intensity, code };
  }

  if (code >= 95 && code <= 99) {
    return {
      kind: 'storm',
      intensity: clamp(0.75 + liquid / 6, 0.75, 1),
      code,
    };
  }

  if (liquid > 0.05 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    // Heavy rain / violent showers → storm feel
    if (liquid >= 4 || code === 65 || code === 67 || code === 82) {
      return { kind: 'storm', intensity: clamp(liquid / 6, 0.7, 1), code };
    }
    // Light rain / drizzle / slight showers
    if (
      liquid < 0.5
      || (code >= 51 && code <= 57)
      || code === 61
      || code === 66
      || code === 80
    ) {
      return {
        kind: 'drizzle',
        intensity: clamp(0.35 + liquid / 1.2, 0.35, 0.85),
        code,
      };
    }
    return {
      kind: 'rain',
      intensity: clamp(0.45 + liquid / 2.2, 0.45, 1),
      code,
    };
  }

  // --- Fog ---
  if (code === 45 || code === 48 || (clouds >= 95 && humidity >= 92 && wind < 8)) {
    return {
      kind: 'fog',
      intensity: clamp(0.55 + humidity / 200, 0.55, 1),
      code,
    };
  }

  // --- Sky (WMO 0–3 + cloud cover) ---
  if (code === 0 || (code === 1 && clouds < 30)) {
    return {
      kind: 'clear',
      intensity: clamp(1 - clouds / 100, 0.55, 1),
      code,
    };
  }

  if (code === 1 || code === 2) {
    // Mainly clear / partly cloudy
    if (clouds < 40) {
      return { kind: 'clear', intensity: clamp(0.75 - clouds / 200, 0.5, 0.9), code };
    }
    return {
      kind: 'cloudy',
      intensity: clamp(clouds / 100, 0.4, 0.8),
      code,
    };
  }

  // Overcast (3) or unknown cloudy
  return {
    kind: 'cloudy',
    intensity: clamp(Math.max(clouds / 100, 0.7), 0.7, 1),
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

function getPosition(options) {
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
          accuracy: pos.coords.accuracy,
          source: 'gps',
        }),
      () => resolve(null),
      options
    );
  });
}

function fetchWithTimeout(url, ms = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function getPositionFromIpProviders() {
  const providers = [
    async () => {
      const res = await fetchWithTimeout('https://get.geojs.io/v1/ip/geo.json', 5000);
      if (!res.ok) throw new Error('geojs');
      const data = await res.json();
      return {
        lat: parseFloat(data.latitude),
        lon: parseFloat(data.longitude),
        source: 'ip-geojs',
      };
    },
    async () => {
      const res = await fetchWithTimeout('https://ipapi.co/json/', 5000);
      if (!res.ok) throw new Error('ipapi');
      const data = await res.json();
      return {
        lat: parseFloat(data.latitude),
        lon: parseFloat(data.longitude),
        source: 'ip-ipapi',
      };
    },
  ];

  for (const provider of providers) {
    try {
      const coords = await provider();
      if (Number.isFinite(coords.lat) && Number.isFinite(coords.lon)) return coords;
    } catch {
      /* try next */
    }
  }
  throw new Error('All IP geolocation providers failed');
}

async function resolveCoords() {
  const gpsPromise = getPosition({
    enableHighAccuracy: true,
    timeout: 6000,
    maximumAge: 120_000,
  });
  const ipPromise = getPositionFromIpProviders().catch(() => null);

  // Prefer GPS if it arrives quickly (most accurate)
  const gpsQuick = await Promise.race([
    gpsPromise,
    new Promise((resolve) => setTimeout(() => resolve(null), 2800)),
  ]);
  if (gpsQuick) return gpsQuick;

  // Otherwise take whichever finishes first between late GPS and IP
  const raced = await Promise.race([
    gpsPromise.then((g) => (g ? { ...g, win: 'gps' } : Promise.reject())),
    ipPromise.then((ip) => (ip ? { ...ip, win: 'ip' } : Promise.reject())),
  ]).catch(() => null);

  if (raced) return raced;

  const gpsLate = await gpsPromise;
  if (gpsLate) return gpsLate;
  const ip = await ipPromise;
  if (ip) return ip;
  throw new Error('Unable to resolve location');
}

async function fetchWeather(lat, lon) {
  // Keep ~100m precision — enough for local weather cells
  const qLat = Number(lat.toFixed(4));
  const qLon = Number(lon.toFixed(4));

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
  // Latest 15-min slice catches precip that just started
  url.searchParams.set(
    'minutely_15',
    'precipitation,rain,snowfall,weather_code,cloud_cover'
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('cell_selection', 'nearest');

  const res = await fetchWithTimeout(url, 9000);
  if (!res.ok) throw new Error('open-meteo failed');
  const data = await res.json();
  const c = data.current || {};
  const m = data.minutely_15 || {};

  // Pick the 15-min slice nearest to the current observation time (not the forecast end)
  const currentMs = c.time ? Date.parse(c.time) : Date.now();
  let minuteIdx = -1;
  if (Array.isArray(m.time) && m.time.length) {
    let bestDiff = Infinity;
    for (let i = 0; i < m.time.length; i += 1) {
      const t = Date.parse(m.time[i]);
      if (!Number.isFinite(t)) continue;
      const diff = Math.abs(t - currentMs);
      if (diff < bestDiff) {
        bestDiff = diff;
        minuteIdx = i;
      }
    }
  }

  const minutePrecip = minuteIdx >= 0 ? Number(m.precipitation?.[minuteIdx]) || 0 : 0;
  const minuteRain = minuteIdx >= 0 ? Number(m.rain?.[minuteIdx]) || 0 : 0;
  const minuteSnow = minuteIdx >= 0 ? Number(m.snowfall?.[minuteIdx]) || 0 : 0;
  const minuteCode = minuteIdx >= 0 ? Number(m.weather_code?.[minuteIdx]) : NaN;
  const minuteClouds = minuteIdx >= 0 ? Number(m.cloud_cover?.[minuteIdx]) : NaN;

  // Prefer current weather_code; only override when minutely is within ~20 min and disagrees with precip
  const currentCode = Number(c.weather_code);
  const code = Number.isFinite(currentCode) ? currentCode : minuteCode;

  return {
    code: Number.isFinite(code) ? code : 2,
    temperature: Number(c.temperature_2m),
    precipitation: Math.max(Number(c.precipitation) || 0, minutePrecip),
    rain: Math.max(Number(c.rain) || 0, minuteRain),
    showers: Number(c.showers) || 0,
    snowfall: Math.max(Number(c.snowfall) || 0, minuteSnow),
    cloudCover: Number.isFinite(Number(c.cloud_cover))
      ? Number(c.cloud_cover)
      : (Number.isFinite(minuteClouds) ? minuteClouds : 0),
    wind: Number(c.wind_speed_10m) || 0,
    humidity: Number(c.relative_humidity_2m) || 0,
    isDay: Number(c.is_day) === 1,
    lat: qLat,
    lon: qLon,
  };
}

function spawnParticle(kind, w, h, randomY, intensity) {
  const x = Math.random() * (w + 80) - 40;
  const y = randomY ? Math.random() * h : -20 - Math.random() * h * 0.35;
  const i = intensity ?? 1;

  if (kind === 'snow') {
    return {
      x,
      y,
      r: (2 + Math.random() * 4.5) * (0.85 + i * 0.25),
      vy: (0.45 + Math.random() * 0.9) * (0.85 + i * 0.3),
      vx: -0.5 + Math.random() * 1,
      wobble: Math.random() * Math.PI * 2,
      alpha: (0.5 + Math.random() * 0.4) * (0.75 + i * 0.25),
    };
  }

  const isStorm = kind === 'storm';
  const isDrizzle = kind === 'drizzle';
  return {
    x,
    y,
    len: (isDrizzle ? 10 + Math.random() * 12 : 16 + Math.random() * 22) * (0.9 + i * 0.15),
    vy: isStorm
      ? 5.5 + Math.random() * 4
      : isDrizzle
        ? 1.4 + Math.random() * 1.4
        : 2.0 + Math.random() * 2.2,
    vx: isStorm ? 1.6 + Math.random() * 1.8 : 0.25 + Math.random() * 0.45,
    width: (isDrizzle ? 1.1 : isStorm ? 1.8 : 1.45) * (0.9 + i * 0.15),
    alpha: (isDrizzle ? 0.35 + Math.random() * 0.25 : 0.45 + Math.random() * 0.35)
      * (0.75 + i * 0.3),
  };
}

function particleCount(kind, area, intensity) {
  const density = Math.min(1.6, Math.max(0.7, area / (1280 * 720)));
  const base = {
    drizzle: 120,
    rain: 160,
    snow: 90,
    storm: 220,
  }[kind];
  if (!base) return 0;
  return Math.round(base * density * (0.55 + intensity * 0.7));
}

/** Canvas particles only — atmosphere is CSS gradients on .hero-climate-wash */
function needsParticles(kind) {
  return kind === 'rain' || kind === 'drizzle' || kind === 'snow' || kind === 'storm';
}

function startEffect(canvas, wash, kind, intensity = 1) {
  const level = clamp(intensity, 0.35, 1);
  let flashTimer = 0;

  if (wash) {
    wash.hidden = false;
    wash.classList.remove('is-flashing');
  }

  if (!needsParticles(kind)) {
    canvas.hidden = true;
    return () => {
      if (flashTimer) window.clearInterval(flashTimer);
      if (wash) wash.classList.remove('is-flashing');
    };
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  let particles = [];
  let raf = 0;
  let running = true;
  canvas.hidden = false;

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
    particles = Array.from(
      { length: particleCount(kind, rect.width * rect.height, level) },
      () => spawnParticle(kind, rect.width, rect.height, true, level)
    );
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (kind === 'storm' && wash) {
    flashTimer = window.setInterval(() => {
      if (!running) return;
      wash.classList.remove('is-flashing');
      // Force reflow so the flash animation can replay
      void wash.offsetWidth;
      wash.classList.add('is-flashing');
    }, 3200 + Math.random() * 4200);
  }

  const loop = () => {
    if (!running) return;
    const dark = document.documentElement.classList.contains('dark');
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    for (const p of particles) {
      if (kind === 'snow') {
        p.wobble += 0.025;
        p.x += p.vx + Math.sin(p.wobble) * 0.55;
        p.y += p.vy;
        if (p.y > h + 12) Object.assign(p, spawnParticle(kind, w, h, false, level));
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
      } else {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > h + p.len || p.x > w + 30) {
          Object.assign(p, spawnParticle(kind, w, h, false, level));
        }
      }
    }

    ctx.clearRect(0, 0, w, h);
    const ink = dark ? '235,240,255' : '35,45,60';

    for (const p of particles) {
      if (kind === 'snow') {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink},${p.alpha})`;
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
    if (flashTimer) window.clearInterval(flashTimer);
    if (wash) wash.classList.remove('is-flashing');
    canvas.hidden = true;
  };
}

async function buildClimatePayload(coords) {
  const weather = await fetchWeather(coords.lat, coords.lon);
  const resolved = resolveClimateFromObs(weather);
  const fetchedAt = Date.now();
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
    fetchedAt,
  };
}

function climatesDiffer(a, b) {
  if (!a || !b) return true;
  if (a.kind !== b.kind) return true;
  if (Boolean(a.isDay) !== Boolean(b.isDay)) return true;
  return Math.abs((a.intensity || 0) - (b.intensity || 0)) > 0.12;
}

async function resolveClimate(config) {
  const forced = config?.hero?.weather?.force;
  if (forced) {
    return { kind: forced, intensity: 1, isDay: true, source: 'force' };
  }

  const cached = readCache();
  if (cached?.kind) return { ...cached, source: 'cache' };

  const coords = await resolveCoords();
  const payload = await buildClimatePayload(coords);
  writeCache(payload);
  return { ...payload, source: 'live' };
}

/**
 * After first paint: prefer GPS over IP, refresh if visitor moved,
 * or soft-refresh near end of cache TTL.
 */
async function refineClimate(previous) {
  if (!previous || previous.source === 'force') return null;

  const gps = await getPosition({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60_000,
  });

  if (gps) {
    const drifted =
      !Number.isFinite(previous.lat)
      || !Number.isFinite(previous.lon)
      || haversineKm(previous.lat, previous.lon, gps.lat, gps.lon) >= LOCATION_DRIFT_KM
      || String(previous.geoSource || '').startsWith('ip');

    if (drifted) {
      const payload = await buildClimatePayload(gps);
      writeCache(payload);
      return { ...payload, source: 'gps-refine' };
    }
  }

  // Soft revalidate same spot if cache is getting stale
  const age = previous.fetchedAt ? Date.now() - previous.fetchedAt : CACHE_TTL_MS;
  if (
    age > CACHE_TTL_MS * 0.6
    && Number.isFinite(previous.lat)
    && Number.isFinite(previous.lon)
  ) {
    const payload = await buildClimatePayload({
      lat: previous.lat,
      lon: previous.lon,
      source: previous.geoSource || 'refresh',
    });
    writeCache(payload);
    return { ...payload, source: 'refresh' };
  }

  return null;
}

export async function initWeather(config) {
  const weatherCfg = config?.hero?.weather || {};
  if (weatherCfg.enabled === false) return;

  const canvas = document.getElementById('hero-climate');
  const wash = document.getElementById('hero-climate-wash');
  const hero = document.getElementById('hero');
  if (!hero || (!canvas && !wash)) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (canvas) canvas.hidden = true;
    if (wash) wash.hidden = true;
    return;
  }

  let stopEffect = null;

  const applyClimate = (climate) => {
    const kind = climate.kind || 'cloudy';
    const intensity = typeof climate.intensity === 'number' ? climate.intensity : 1;
    const isDay = climate.isDay !== false;

    hero.dataset.climate = kind;
    hero.dataset.climateIntensity = intensity.toFixed(2);
    hero.dataset.climateDay = isDay ? '1' : '0';
    hero.style.setProperty('--climate-intensity', String(clamp(intensity, 0.35, 1)));

    if (wash) {
      wash.hidden = false;
      wash.setAttribute('data-climate', kind);
    }
    if (canvas) canvas.setAttribute('data-climate', kind);

    if (stopEffect) stopEffect();
    stopEffect = startEffect(canvas || { hidden: true }, wash, kind, intensity);
  };

  try {
    const climate = await resolveClimate(config);
    applyClimate(climate);

    // Keep effect accurate: upgrade IP→GPS and refresh when conditions change
    void refineClimate(climate)
      .then((next) => {
        if (next && climatesDiffer(climate, next)) applyClimate(next);
      })
      .catch(() => {
        /* keep first accurate snapshot */
      });
  } catch (err) {
    console.warn('Climate effects unavailable:', err);
    if (canvas) canvas.hidden = true;
    if (wash) wash.hidden = true;
  }
}
