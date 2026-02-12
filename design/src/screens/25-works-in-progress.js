import { statusBar } from '../atoms/StatusBar.js';
import { searchBar } from '../atoms/SearchBar.js';
import { bottomNav } from '../organisms/BottomNav.js';
import { categoryChip } from '../atoms/CategoryChip.js';

/** Molecule local · WorkFeedCard — card de obra pública */
const obra = ({ orgBg, orgIcon, org, dist, dept, cat, emoji, catColor, photoUrl, title, desc, pct, budget, deadline, watchers, comments, status, statusColor }) => {
  const bar = catColor.replace('bg-', '').includes('amber')   ? '#F59E0B'
            : catColor.includes('rose')    ? '#F43F5E'
            : catColor.includes('emerald') ? '#10B981'
            : catColor.includes('sky')     ? '#0EA5E9'
            :                                '#6366F1';
  return `
    <button data-nav="goto" data-target="Detalhe da Obra" class="block text-left w-full bg-white rounded-2xl shadow-soft overflow-hidden mb-3 active:scale-[.99] transition">
      <div class="px-3 pt-3 flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg ${orgBg} flex items-center justify-center text-white text-sm">${orgIcon}</div>
        <div class="flex-1 leading-tight">
          <div class="text-[12px] font-bold text-slate-900">${org}</div>
          <div class="text-[10px] text-slate-500">${dept} · ${dist}</div>
        </div>
        <span class="px-2 py-0.5 rounded-full ${statusColor} text-[9px] font-black">${status}</span>
      </div>
      <div class="mx-3 mt-2 h-32 rounded-xl relative overflow-hidden bg-slate-200" style="background-image:url('${photoUrl}');background-size:cover;background-position:center">
        <div class="absolute inset-x-0 bottom-0 h-14" style="background:linear-gradient(180deg,transparent,rgba(0,0,0,.55))"></div>
        <div class="absolute bottom-2 left-2">${categoryChip(cat, catColor, emoji)}</div>
        <div class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur text-white text-[10px] font-black">${pct}%</div>
      </div>
      <div class="px-3 pt-2">
        <div class="text-[13px] font-extrabold text-slate-900 leading-tight">${title}</div>
        <div class="text-[11px] text-slate-500 mt-0.5">${desc}</div>
        <div class="mt-2 flex items-center gap-2">
          <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full" style="width:${pct}%;background:${bar}"></div>
          </div>
          <div class="text-[10px] font-black text-slate-600">${pct}%</div>
        </div>
        <div class="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500">
          <span class="font-bold">💰 ${budget}</span>
          <span>·</span>
          <span class="font-bold">📅 ${deadline}</span>
        </div>
      </div>
      <div class="px-3 py-2 mt-1 border-t border-slate-100 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
        <span class="flex items-center gap-1"><span class="text-sm">👀</span> ${watchers}</span>
        <span class="flex items-center gap-1"><span class="text-sm">💬</span> ${comments}</span>
        <span>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </span>
        <span class="ml-auto text-brand-600 font-extrabold">Ver detalhe →</span>
      </div>
    </button>`;
};

/** Tela 25 · Obras em Andamento (feed de obras) */
export default {
  title: 'Obras em Andamento',
  group: 'support',
  summary: 'Feed das obras · acompanhar progresso',
  note: `Reaproveita o layout do <b>Feed Cívico</b> (consistência visual — cidadão já sabe ler este padrão) mas adapta pro contexto de obras: avatar = órgão responsável, ações = <b>Acompanhar</b> (em vez de "Apoiar") + Comentários + Compartilhar. Cada card mostra foto real, <b>barra de progresso</b> e meta-info (valor + prazo). Status chip varia: iniciando, em andamento, reta final.`,
  html: () => `
    <div class="relative h-full bg-slate-50">
      ${statusBar('dark')}
      <div class="px-4 pb-2 flex items-center gap-3">
        <button data-nav="prev" class="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center">←</button>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Cidade</div>
          <div class="text-xl font-extrabold text-slate-900">Obras em andamento</div>
        </div>
      </div>
      <div class="px-4 mb-2">${searchBar('Buscar obras…')}</div>

      <div class="mx-4 mb-2 p-3 rounded-2xl text-white flex items-center gap-2 shadow-soft" style="background:linear-gradient(135deg,#4F46E5 0%,#0EA5E9 100%)">
        <span class="text-lg">🏗️</span>
        <div class="flex-1 leading-tight">
          <div class="text-[10px] font-black uppercase tracking-wider text-white/80">12 obras ativas · R$ 2,3M</div>
          <div class="text-[11px] text-white/90">58% de progresso médio · 6 concluídas no ano</div>
        </div>
      </div>

      <div class="px-4 mb-2 flex gap-1.5 text-[11px] font-bold overflow-x-auto">
        <span class="px-3 py-1.5 rounded-full bg-slate-900 text-white whitespace-nowrap">📍 Toda cidade</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Meu bairro</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Mais acompanhadas</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Reta final</span>
      </div>

      <div class="px-3 pb-24 overflow-y-auto" style="max-height: 430px">
        ${obra({
          orgBg: 'bg-gradient-to-br from-amber-500 to-orange-500', orgIcon: '🏗️',
          org: 'Sec. de Obras', dept: 'Pôrto Belo', dist: '680m de você',
          cat: 'Pavimentação', emoji: '🛣️', catColor: 'bg-amber-500',
          photoUrl: 'feed-photos/obra-recapamento.png',
          title: 'Recapeamento Av. Gov. Celso Ramos', desc: 'Asfalto novo em 2,3 km da via central.',
          pct: 72, budget: 'R$ 890k', deadline: 'Maio/2026', watchers: 340, comments: 42,
          status: 'EM ANDAMENTO', statusColor: 'bg-amber-100 text-amber-700',
        })}
        ${obra({
          orgBg: 'bg-gradient-to-br from-rose-500 to-pink-500', orgIcon: '🏫',
          org: 'Sec. de Educação', dept: 'Pôrto Belo', dist: '1,2 km de você',
          cat: 'Escola', emoji: '🏫', catColor: 'bg-rose-500',
          photoUrl: 'feed-photos/obra-predio-1.png',
          title: 'Escola Municipal Centro · Ampliação', desc: '4 salas novas + refeitório acessível.',
          pct: 48, budget: 'R$ 640k', deadline: 'Out/2026', watchers: 210, comments: 28,
          status: 'EM ANDAMENTO', statusColor: 'bg-amber-100 text-amber-700',
        })}
        ${obra({
          orgBg: 'bg-gradient-to-br from-sky-500 to-indigo-500', orgIcon: '🏥',
          org: 'Sec. de Saúde', dept: 'Pôrto Belo', dist: '2,4 km de você',
          cat: 'Saúde', emoji: '🏥', catColor: 'bg-sky-500',
          photoUrl: 'feed-photos/obra-predio-2.png',
          title: 'UBS Praia do Perequê · Reforma', desc: 'Posto de saúde reativado no verão.',
          pct: 22, budget: 'R$ 480k', deadline: 'Jan/2027', watchers: 180, comments: 15,
          status: 'INICIANDO', statusColor: 'bg-sky-100 text-sky-700',
        })}
        ${obra({
          orgBg: 'bg-gradient-to-br from-emerald-500 to-teal-500', orgIcon: '🧱',
          org: 'Sec. de Obras', dept: 'Pôrto Belo', dist: '320m de você',
          cat: 'Calçamento', emoji: '🧱', catColor: 'bg-emerald-500',
          photoUrl: 'feed-photos/obra-rua-1.png',
          title: 'Calçamento Rua das Palmeiras', desc: 'Troca de lajotas + acessibilidade nas calçadas.',
          pct: 85, budget: 'R$ 180k', deadline: 'Maio/2026', watchers: 96, comments: 11,
          status: 'RETA FINAL', statusColor: 'bg-emerald-100 text-emerald-700',
        })}
      </div>

      ${bottomNav('more')}
    </div>`
};
