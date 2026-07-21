const STORAGE_KEY = 'portfolio-color-mode';

/**
 * Dark palette — overrides the light theme variables from config
 * when night mode is active.
 */
const darkPalette = {
  bgPrimary: '#121212',
  bgSecondary: '#1C1C1C',
  bgDark: '#0A0A0A',
  textPrimary: '#F2F2F2',
  textSecondary: '#A9A9A9',
  textMuted: '#7A7A7A',
  border: '#2C2C2C',
  cardOverlay: 'rgba(0, 0, 0, 0.85)',
};

function applyPalette(theme) {
  const root = document.documentElement;
  root.style.setProperty('--color-bg-primary', theme.bgPrimary);
  root.style.setProperty('--color-bg-secondary', theme.bgSecondary);
  root.style.setProperty('--color-bg-dark', theme.bgDark);
  root.style.setProperty('--color-text-primary', theme.textPrimary);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);
  root.style.setProperty('--color-text-muted', theme.textMuted);
  root.style.setProperty('--color-border', theme.border);
  root.style.setProperty('--color-card-overlay', theme.cardOverlay);
}

export function initTheme(config) {
  const toggle = document.getElementById('theme-toggle');

  const apply = (mode) => {
    const dark = mode === 'dark';
    applyPalette(dark ? { ...config.theme, ...darkPalette } : config.theme);
    document.documentElement.classList.toggle('dark', dark);
    toggle.setAttribute('aria-label', dark ? 'Switch to day mode' : 'Switch to night mode');
  };

  let mode = localStorage.getItem(STORAGE_KEY) || 'light';
  apply(mode);

  toggle.addEventListener('click', () => {
    mode = mode === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, mode);
    apply(mode);
  });
}
