/**
 * Lib · nav
 *
 * Event delegation for in-screen prototype navigation.
 * Buttons in screen HTML carry:
 *   data-nav="next" | "prev" | "goto" | "gov"
 *   data-target="<screen title>"   (only with "goto")
 *
 * The handler only fires while flow-mode is visible (grid mode is static).
 *
 * Wiring the click handler is centralized here so the renderer stays small
 * and screens don't need to know about the flow runtime.
 */

export const wireFlowNavigation = ({ screens, getIdx, setIdx, isFlowOpen }) => {
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-nav]");
    if (!el) return;
    if (!isFlowOpen()) return;

    const action = el.dataset.nav;
    const idx = getIdx();

    if (action === "next") {
      setIdx(idx + 1);
    } else if (action === "prev") {
      setIdx(idx - 1);
    } else if (action === "goto" && el.dataset.target) {
      const target = screens.findIndex((s) => s.title === el.dataset.target);
      if (target >= 0) setIdx(target);
    } else if (action === "gov") {
      // Gov.br: primeiro acesso segue onboarding; recorrente iria direto para Home.
      setIdx(idx + 1);
    }
  });
};
