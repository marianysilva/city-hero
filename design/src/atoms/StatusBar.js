/**
 * Atom · StatusBar
 *
 * Simula a status bar iOS (hora, sinal, bateria) em cima de cada tela.
 * Variante `light` é usada em telas com hero gradiente escuro.
 */
export const statusBar = (theme = "dark") => `
  <div class="status-bar" style="color:${theme === "light" ? "#fff" : "#0F172A"}">
    <span>10:34</span>
    <span class="right">
      <span>GPS</span>
      <span>·</span>
      <span>4G</span>
      <span>·</span>
      <span>100%</span>
    </span>
  </div>`;
