/**
 * Organism · BottomNav
 *
 * Barra inferior de 5 abas com FAB central para câmera.
 * Dois modos:
 *   - bottomNav(active):       absolute, sobrepõe conteúdo (Home, Feed)
 *   - staticBottomNav(active): relative, fora do scroll (telas com CTA/conteúdo longo)
 */

const NAV_ITEMS = [
  ["home", "Mapa", "🗺️"],
  ["feed", "Feed", "📰"],
  ["camera", "", ""],
  ["profile", "Perfil", "🦸"],
  ["more", "Mais", "☰"],
];

const renderTabs = (active) =>
  NAV_ITEMS.map(([key, label, icon]) =>
    key === "camera"
      ? `<button class="relative -mt-6 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-civic-purple shadow-lg flex items-center justify-center text-white text-2xl">📷</button>`
      : `<button class="tab-btn ${active === key ? "active" : ""} flex flex-col items-center gap-0.5 px-2 py-1">
           <span class="text-lg">${icon}</span>
           <span class="text-[10px] font-semibold">${label}</span>
         </button>`,
  ).join("");

export const bottomNav = (active = "home") => `
  <div class="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 px-4 pt-2 pb-4 flex items-end justify-around z-30">
    ${renderTabs(active)}
  </div>`;

export const staticBottomNav = (active = "home") => `
  <div class="relative bg-white/95 backdrop-blur border-t border-slate-100 px-4 pt-2 pb-4 flex items-end justify-around z-30">
    ${renderTabs(active)}
  </div>`;
