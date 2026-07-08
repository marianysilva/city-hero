/**
 * Entry · main.js
 *
 * Ponto único de inicialização. Importa o registry de telas e liga os dois
 * modos (grid estático + flow interativo). Roda na carga da página.
 */

import { SCREENS } from "./screens/index.js";
import { renderGrid, createFlow, bindModeSwitch, bindFlowButtons, isFlowOpen } from "./renderer.js";
import { wireFlowNavigation } from "./lib/nav.js";

window.addEventListener("load", () => {
  renderGrid(SCREENS);

  const flow = createFlow(SCREENS);
  flow.init();

  bindModeSwitch();
  bindFlowButtons(flow);

  wireFlowNavigation({
    screens: SCREENS,
    getIdx: flow.getIdx,
    setIdx: flow.setIdx,
    isFlowOpen,
  });
});
