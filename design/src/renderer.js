/**
 * Renderer · grid + flow modes
 *
 * Recebe o array SCREENS (cada item é um Screen object) e injeta nos dois
 * modos da landing: grid (todas as telas) e flow (single phone + navegação).
 */

const GROUP_HOST = {
  onboarding:   'group-onboarding',
  core:         'group-core',
  gamification: 'group-gamification',
  support:      'group-core', // telas "de apoio" moram junto com o núcleo
};

/** renderiza o grid estático (mode = All screens) */
export const renderGrid = (SCREENS) => {
  SCREENS.forEach((screen, i) => {
    const tpl = document.getElementById('tpl-phone-wrap').content.cloneNode(true);
    const bodyEl = tpl.querySelector('.body');
    bodyEl.innerHTML = screen.html();

    tpl.querySelector('.label-index').textContent   = `TELA ${String(i + 1).padStart(2, '0')}`;
    tpl.querySelector('.label-title').textContent   = screen.title;
    tpl.querySelector('.label-summary').textContent = screen.summary || '';

    const container = document.getElementById(GROUP_HOST[screen.group]);
    if (!container) return;
    container.appendChild(tpl);

    if (typeof screen.onMount === 'function') {
      // aguarda layout para Leaflet medir o host corretamente
      requestAnimationFrame(() => screen.onMount(bodyEl));
    }
  });
};

/**
 * Flow mode state container. createFlow devolve um controlador com getIdx/setIdx
 * para o sistema de navegação (lib/nav.js) chamar.
 */
export const createFlow = (SCREENS) => {
  let flowIdx = 0;
  let activeMount = null;

  const nav   = document.getElementById('flow-nav');
  const body  = document.getElementById('flow-phone-body');
  const notes = document.getElementById('flow-notes');

  const renderNav = () => {
    nav.innerHTML = '';
    SCREENS.forEach((screen, i) => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 flex items-center gap-2 nav-item';
      btn.innerHTML = `
        <span class="text-[10px] font-bold text-slate-400 w-6">${String(i + 1).padStart(2, '0')}</span>
        <span class="font-semibold text-slate-700">${screen.title}</span>`;
      btn.onclick = () => select(i);
      nav.appendChild(btn);
    });
  };

  const select = (i) => {
    flowIdx = Math.max(0, Math.min(SCREENS.length - 1, i));
    const screen = SCREENS[flowIdx];

    // teardown do mount anterior (Leaflet, timers, etc.)
    if (activeMount && typeof activeMount.destroy === 'function') {
      try { activeMount.destroy(); } catch (e) {}
    }
    activeMount = null;

    body.innerHTML  = screen.html();
    notes.innerHTML = screen.note || '<em class="text-slate-400">Sem notas.</em>';

    document.querySelectorAll('#flow-nav .nav-item').forEach((b, idx) => {
      b.classList.toggle('bg-brand-50', idx === flowIdx);
      b.classList.toggle('text-brand-700', idx === flowIdx);
    });

    if (typeof screen.onMount === 'function') {
      requestAnimationFrame(() => {
        activeMount = screen.onMount(body) || null;
      });
    }
  };

  return {
    init: () => { renderNav(); select(0); },
    getIdx: () => flowIdx,
    setIdx: select,
  };
};

/** liga os botões Grid/Flow do header da landing */
export const bindModeSwitch = () => {
  const btnGrid = document.getElementById('mode-grid');
  const btnFlow = document.getElementById('mode-flow');
  const grid    = document.getElementById('grid-mode');
  const flow    = document.getElementById('flow-mode');

  btnGrid.onclick = () => {
    btnGrid.classList.add('pill-active');
    btnFlow.classList.remove('pill-active');
    grid.classList.remove('hidden');
    flow.classList.add('hidden');
  };
  btnFlow.onclick = () => {
    btnFlow.classList.add('pill-active');
    btnGrid.classList.remove('pill-active');
    flow.classList.remove('hidden');
    grid.classList.add('hidden');
  };
};

export const isFlowOpen = () =>
  !document.getElementById('flow-mode').classList.contains('hidden');

/** liga os botões de navegação linear (← / →) */
export const bindFlowButtons = (flow) => {
  document.getElementById('flow-prev').onclick = () => flow.setIdx(flow.getIdx() - 1);
  document.getElementById('flow-next').onclick = () => flow.setIdx(flow.getIdx() + 1);
};
