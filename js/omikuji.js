import { createProphecyOracle, PROPHECY_CAPACITY } from './fortunes.js?v=152';

/**
 * Interactive omikuji (fortune slip) machine — whole machine is the control.
 */
export function initOmikuji(config) {
  const section = config?.fortune;
  if (!section || section.enabled === false) return;

  const stage = document.getElementById('works-omikuji');
  const machine = document.getElementById('omikuji-machine');
  const slipEl = document.getElementById('omikuji-slip');
  const slipBackdrop = document.getElementById('omikuji-backdrop');
  const drawBtn = document.querySelector('[data-omikuji-draw]');
  if (!machine || !slipEl) return;

  const custom = Array.isArray(section.fortunes) ? section.fortunes : [];
  const oracle = createProphecyOracle({ extras: custom });

  const slipRank = slipEl.querySelector('[data-slip-rank]');
  const slipRankEn = slipEl.querySelector('[data-slip-rank-en]');
  const slipTitle = slipEl.querySelector('[data-slip-title]');
  const slipBody = slipEl.querySelector('[data-slip-body]');
  const slipClose = slipEl.querySelector('[data-slip-close]');
  const slipAgain = slipEl.querySelector('[data-slip-again]');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CAST_MS = reduceMotion ? 0 : 3400;
  const CLOSE_MS = 280;

  let busy = false;
  let revealTimer = 0;
  let closeTimer = 0;
  let lastId = '';

  function setBusy(next) {
    busy = next;
    machine.classList.toggle('is-busy', next);
    machine.setAttribute('aria-disabled', next ? 'true' : 'false');
    if (drawBtn) drawBtn.disabled = next;
  }

  function pickFortune() {
    let fortune = oracle.draw();
    // Extremely defensive: never serve the exact same slip twice in a row.
    if (fortune.id === lastId) {
      fortune = oracle.draw();
    }
    lastId = fortune.id;
    return fortune;
  }

  function clearRevealTimer() {
    if (revealTimer) {
      window.clearTimeout(revealTimer);
      revealTimer = 0;
    }
  }

  function openSlip(fortune) {
    clearRevealTimer();
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = 0;
    }

    if (slipRank) slipRank.textContent = fortune.rank || '吉';
    if (slipRankEn) slipRankEn.textContent = fortune.rankEn || 'Blessing';
    if (slipTitle) slipTitle.textContent = fortune.title || '';
    if (slipBody) slipBody.textContent = fortune.body || '';

    slipEl.classList.remove('is-open', 'is-casting', 'is-revealed');
    slipEl.hidden = false;
    slipEl.setAttribute('aria-hidden', 'false');
    if (slipBackdrop) {
      slipBackdrop.hidden = false;
      slipBackdrop.setAttribute('aria-hidden', 'false');
    }

    requestAnimationFrame(() => {
      slipEl.classList.add('is-open', 'is-casting');
      slipBackdrop?.classList.add('is-open');
      stage?.classList.remove('is-drawing');
      stage?.classList.add('is-blessed');

      if (CAST_MS === 0) {
        slipEl.classList.remove('is-casting');
        slipEl.classList.add('is-revealed');
        slipClose?.focus();
        return;
      }

      revealTimer = window.setTimeout(() => {
        slipEl.classList.remove('is-casting');
        slipEl.classList.add('is-revealed');
        slipClose?.focus();
        revealTimer = 0;
      }, CAST_MS);
    });
  }

  function closeSlip({ refocus = true } = {}) {
    clearRevealTimer();
    slipEl.classList.remove('is-open', 'is-casting', 'is-revealed');
    slipBackdrop?.classList.remove('is-open');
    closeTimer = window.setTimeout(() => {
      slipEl.hidden = true;
      slipEl.setAttribute('aria-hidden', 'true');
      if (slipBackdrop) {
        slipBackdrop.hidden = true;
        slipBackdrop.setAttribute('aria-hidden', 'true');
      }
      machine.classList.remove('is-dispensing', 'is-active');
      stage?.classList.remove('is-drawing', 'is-blessed');
      setBusy(false);
      if (refocus) drawBtn?.focus();
      closeTimer = 0;
    }, CLOSE_MS);
  }

  function dispense() {
    if (busy) return;
    setBusy(true);
    const fortune = pickFortune();

    machine.classList.add('is-active');
    stage?.classList.add('is-drawing');
    stage?.classList.remove('is-blessed');

    window.setTimeout(() => {
      machine.classList.add('is-dispensing');
    }, 700);

    window.setTimeout(() => {
      openSlip(fortune);
    }, 1250);
  }

  machine.dataset.prophecyCapacity = String(PROPHECY_CAPACITY);
  machine.addEventListener('click', dispense);
  machine.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dispense();
    }
  });
  drawBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dispense();
  });

  slipClose?.addEventListener('click', () => closeSlip());
  slipAgain?.addEventListener('click', () => {
    closeSlip({ refocus: false });
    window.setTimeout(dispense, 320);
  });
  slipBackdrop?.addEventListener('click', () => {
    if (slipEl.classList.contains('is-casting')) return;
    closeSlip();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !slipEl.hidden) closeSlip();
  });
}
