import { statusBar } from '../atoms/StatusBar.js';
import { staticBottomNav } from '../organisms/BottomNav.js';

const QUEUE = [
  {
    state: 'waiting', badge: 'AGUARDANDO', badgeC: 'bg-amber-100 text-amber-700',
    cat: '🕳️ Buraco', addr: 'R. Beira Mar, 1280', time: 'Hoje · 14:32', size: '1 foto · 2.4MB',
    img: 'feed-photos/buraco-report.png',
  },
  {
    state: 'syncing', badge: 'ENVIANDO · 64%', badgeC: 'bg-sky-100 text-sky-700',
    cat: '🗑️ Lixo acumulado', addr: 'Pç. Central', time: 'Hoje · 13:05', size: '2 fotos · 5.1MB',
    progress: 64,
  },
  {
    state: 'failed', badge: 'FALHOU · Tentar de novo', badgeC: 'bg-rose-100 text-rose-700',
    cat: '💡 Poste apagado', addr: 'R. das Flores, 45', time: 'Ontem · 21:14', size: '1 foto · 1.8MB',
    err: 'Timeout na autenticação',
  },
];

/** Tela 18 · Fila de Sincronização (modo offline) */
export default {
  title: 'Fila de Sincronização',
  group: 'support',
  summary: 'Modo offline · reportes aguardando sinal',
  note: `Tela acessada a partir de "Meus Reportes" ou de um banner persistente na Home quando há itens na fila. <b>Reportes ficam salvos localmente (WatermelonDB)</b> e sobem automaticamente quando o sinal volta. Estados cobertos: aguardando, sincronizando, enviado, falhou (retry manual). Reforça que XP é garantido mesmo offline — remove ansiedade.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
      <div class="flex-1 min-h-0 overflow-y-auto">
        ${statusBar('dark')}

        <div class="px-4 pt-2">
          <div class="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white flex items-start gap-3 shadow-lg">
            <span class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-lg">📶</span>
            <div class="flex-1 leading-tight">
              <div class="font-extrabold text-[13px]">Sem conexão · 3 reportes na fila</div>
              <div class="text-[11px] text-white/90 mt-0.5">Estão salvos no seu celular. Vão sozinhos quando o sinal voltar.</div>
            </div>
          </div>
        </div>

        <div class="px-4 mt-4 flex items-center justify-between">
          <div>
            <div class="text-lg font-extrabold text-slate-900">Fila de envio</div>
            <div class="text-[11px] text-slate-500 -mt-0.5">Última tentativa há 12 min</div>
          </div>
          <button class="px-3 py-2 rounded-full bg-slate-200 text-slate-400 text-[11px] font-extrabold flex items-center gap-1" disabled>
            🔄 Sincronizar
          </button>
        </div>

        <div class="px-4 mt-3 space-y-2">
          ${QUEUE.map(item => `
            <div class="p-3 rounded-2xl bg-white shadow-soft">
              <div class="flex gap-3">
                <div class="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center text-2xl" ${item.img ? `style="background-image:url('${item.img}');background-size:cover;background-position:center"` : ''}>
                  ${item.img ? '' : item.cat.split(' ')[0]}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <div class="font-extrabold text-slate-900 text-[13px] truncate">${item.cat}</div>
                    <span class="px-2 py-0.5 rounded-full ${item.badgeC} text-[9px] font-black whitespace-nowrap">${item.badge}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 mt-0.5 truncate">${item.addr}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">${item.time} · ${item.size}</div>
                  ${item.progress ? `
                    <div class="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-sky-400 to-sky-600" style="width:${item.progress}%"></div>
                    </div>` : ''}
                  ${item.err ? `
                    <div class="mt-1.5 flex items-center gap-1 text-[10px] text-rose-600">
                      <span>⚠️</span><span>${item.err}</span>
                    </div>` : ''}
                </div>
              </div>
              ${item.state === 'failed' ? `
                <div class="flex gap-2 mt-2.5">
                  <button class="flex-1 py-2 rounded-lg bg-rose-500 text-white text-[11px] font-extrabold">Tentar de novo</button>
                  <button class="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">Descartar</button>
                </div>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="mx-4 mt-4 mb-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5">
          <span class="text-xl">✨</span>
          <div class="text-[11px] text-emerald-800 leading-tight">
            <b>Seu XP está garantido</b> mesmo offline. Assim que o sinal voltar, a medalha entra no seu perfil.
          </div>
        </div>
      </div>

      ${staticBottomNav('profile')}
    </div>`
};
