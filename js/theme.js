const STORAGE_KEY = 'portfolio-theme-overrides';

const defaults = {
  accent: '#E8341A',
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F2F2F2',
  textPrimary: '#1A1A1A',
  headingFont: "'Cormorant Garamond', Georgia, serif",
  animations: true,
};

function loadOverrides() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

function applyOverrides(overrides) {
  const root = document.documentElement;

  if (overrides.accent) {
    root.style.setProperty('--color-accent', overrides.accent);
  }
  if (overrides.bgPrimary) {
    root.style.setProperty('--color-bg-primary', overrides.bgPrimary);
  }
  if (overrides.bgSecondary) {
    root.style.setProperty('--color-bg-secondary', overrides.bgSecondary);
  }
  if (overrides.textPrimary) {
    root.style.setProperty('--color-text-primary', overrides.textPrimary);
  }
  if (overrides.headingFont) {
    root.style.setProperty('--font-heading', overrides.headingFont);
    root.style.setProperty('--font-display', overrides.headingFont);
  }
  if (overrides.animations === false) {
    document.body.classList.add('no-animations');
  } else {
    document.body.classList.remove('no-animations');
  }
}

export function initTheme(config) {
  const saved = loadOverrides();
  applyOverrides(saved);

  const toggle = document.getElementById('customizer-toggle');
  const panel = document.getElementById('customizer');
  const close = document.getElementById('customizer-close');

  toggle.addEventListener('click', () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  });

  close.addEventListener('click', () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  });

  const bindings = {
    'accent-color': 'accent',
    'bg-primary': 'bgPrimary',
    'bg-secondary': 'bgSecondary',
    'text-primary': 'textPrimary',
    'heading-font': 'headingFont',
    'animation-toggle': 'animations',
  };

  Object.entries(bindings).forEach(([inputId, key]) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (saved[key] !== undefined) {
      if (input.type === 'checkbox') input.checked = saved[key];
      else input.value = saved[key];
    } else if (key === 'accent') input.value = config.theme.accent;
    else if (key === 'bgPrimary') input.value = config.theme.bgPrimary;
    else if (key === 'bgSecondary') input.value = config.theme.bgSecondary;
    else if (key === 'textPrimary') input.value = config.theme.textPrimary;

    input.addEventListener('input', () => {
      const overrides = loadOverrides();
      overrides[key] = input.type === 'checkbox' ? input.checked : input.value;
      saveOverrides(overrides);
      applyOverrides(overrides);
    });
  });

  document.getElementById('customizer-reset').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
}
