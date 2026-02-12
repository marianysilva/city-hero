import { statusBar } from '../atoms/StatusBar.js';
import { bottomNav } from '../organisms/BottomNav.js';
import { mountLeafletMap } from '../organisms/LeafletMap.js';

/** Tela 06 · Home · Mapa Hiperlocal (com Leaflet real) */
export default {
  title: 'Home · Mapa Hiperlocal',
  group: 'core',
  summary: 'Entrada principal · pins por categoria',
  note: `Header fixo com nível/XP para lembrar que todo uso da tela é jogo. Pulse azul = "você tá aqui" (validado por GPS). FAB centralizado grita <b>câmera</b>, que é a ação n°1. O pin selecionado (correspondente ao card de ticket no rodapé) aparece <b>destacado</b> dos demais — maior, com ring branco + halo da cor da categoria — pra o usuário relacionar visualmente card ↔ pin.`,
  html: () => `
    <div class="relative h-full bg-slate-100">
      ${statusBar('dark')}
      <div class="absolute top-11 left-0 right-0 px-4 z-20">
        <div class="bg-white rounded-2xl shadow-soft px-3 py-2 flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-civic-purple flex items-center justify-center text-white font-black text-sm">J</div>
          <div class="flex-1">
            <div class="text-[11px] text-slate-500 leading-tight">Pôrto Belo · SC</div>
            <div class="text-[13px] font-extrabold text-slate-900 leading-tight flex items-center gap-1">João, Nível 15 <span class="text-yellow-500">★</span></div>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-slate-500 font-semibold">XP</div>
            <div class="text-[12px] font-extrabold text-brand-600">2.450</div>
          </div>
        </div>
        <div class="mt-2 flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
          <span class="px-3 py-1.5 rounded-full bg-slate-900 text-white whitespace-nowrap">Todos · 24</span>
          <span class="px-3 py-1.5 rounded-full bg-white shadow-soft whitespace-nowrap">🕳️ Buracos</span>
          <span class="px-3 py-1.5 rounded-full bg-white shadow-soft whitespace-nowrap">🗑️ Lixo</span>
          <span class="px-3 py-1.5 rounded-full bg-white shadow-soft whitespace-nowrap">💡 Iluminação</span>
          <span class="px-3 py-1.5 rounded-full bg-white shadow-soft whitespace-nowrap">🚧 Calçada</span>
        </div>
      </div>

      <div class="map-home-host absolute inset-0 top-0 z-0 bg-slate-200"></div>

      <div class="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 z-20">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-2xl">🕳️</div>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500">R. São Pedro, 320 · 80m</div>
          <div class="text-[13px] font-bold text-slate-900 leading-tight">Buraco fundo · 12 apoios</div>
        </div>
        <button class="px-3 py-1.5 rounded-full bg-brand-500 text-white text-[11px] font-extrabold">Apoiar</button>
      </div>

      ${bottomNav('home')}
    </div>`,
  onMount: (root) => {
    const host = root.querySelector('.map-home-host');
    if (!host) return null;
    // Pôrto Belo · centro levemente a oeste para que todos os pins caiam em terra.
    return mountLeafletMap(host, {
      center: [-27.1588, -48.5558],
      zoom: 16,
      markers: [
        { pos: [-27.1572, -48.5570], bg: '#F59E0B', emoji: '🕳️', selected: true, title: 'Buraco fundo · R. São Pedro 320' },
        { pos: [-27.1570, -48.5548], bg: '#10B981', emoji: '🗑️',           title: 'Lixo acumulado · Av. Atlântica' },
        { pos: [-27.1578, -48.5532], bg: '#0EA5E9', emoji: '💡', sm: true, title: 'Poste apagado · R. São Pedro' },
        { pos: [-27.1592, -48.5578], bg: '#7C3AED', emoji: '🚧', sm: true, title: 'Calçada quebrada · R. Central' },
        { pos: [-27.1598, -48.5552], bg: '#F59E0B', emoji: '🕳️', sm: true, title: 'Buraco pequeno · R. João Meller' },
        { pos: [-27.1610, -48.5562], bg: '#F43F5E', emoji: '⚠️',           title: 'Risco · esquina R. XV' },
        { pos: [-27.1612, -48.5540], bg: '#10B981', emoji: '🗑️', sm: true, title: 'Descarte irregular' },
      ],
    });
  }
};
