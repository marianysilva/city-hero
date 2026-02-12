import { statusBar } from '../atoms/StatusBar.js';

const STEPS = [
  { c: 'bg-slate-400',   t: 'Reporte enviado',                d: '14/04 · 21:30', sub: 'Carlos M. · foto anonimizada' },
  { c: 'bg-sky-500',     t: 'Triagem pela IA',                d: '14/04 · 21:31', sub: 'Score 92 · prioridade urgente' },
  { c: 'bg-indigo-500',  t: 'Chamado aberto na prefeitura',   d: '14/04 · 21:45', sub: 'Secretaria de Iluminação · SLA 7 dias' },
  { c: 'bg-emerald-500', t: 'Resposta da prefeitura',         d: '15/04 · 09:15', sub: 'Equipe designada · aguardando peça' },
  { c: 'bg-amber-500',   t: 'Agendado para reparo',           d: 'Amanhã · 14:00', sub: 'Equipe de Iluminação Pública', flag: true },
  { c: 'bg-slate-200',   t: 'Em execução',                    d: 'Aguardando',     sub: 'Você será notificado' },
  { c: 'bg-slate-200',   t: 'Resolvido',                      d: 'Previsto até 22/04', sub: 'Foto "depois" será anexada' },
];

/** Tela 13 · Detalhe · Em andamento */
export default {
  title: 'Detalhe · Em andamento',
  group: 'support',
  summary: 'Ticket aberto · apoiar · compartilhar',
  note: `Estado <b>em aberto</b> do ticket. Foto única (sem before/after), SLA visível e CTAs persistentes: <b>Apoiar</b> (engajamento social no app · +10 XP) + <b>Compartilhar</b> (pressão pública externa, via link anônimo ou identificado). O botão "Enriquecer" (adicionar fotos de outro ângulo por vizinhos) foi movido pro menu ⋯ — é útil mas secundária, limpa a decisão principal.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="relative h-56 overflow-hidden" style="background-image:url('feed-photos/luz.png');background-size:cover;background-position:center">
        <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 40%,rgba(0,0,0,.45) 100%)"></div>
        <div class="absolute top-11 left-4 flex items-center gap-2">
          <button class="w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center">←</button>
          <div class="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-white text-[10px] font-black">ABERTO HÁ 5 DIAS</div>
        </div>
        <div class="absolute top-11 right-4">
          <button class="w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center">⋯</button>
        </div>
        <div class="absolute bottom-3 left-3 flex gap-2">
          <span class="px-2 py-1 rounded-full bg-sky-500 text-white text-[10px] font-black">💡 POSTE</span>
          <span class="px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> EM ANDAMENTO</span>
        </div>
      </div>

      ${statusBar('dark')}

      <div class="px-4 -mt-10 relative z-10">
        <div class="bg-white rounded-2xl p-4 shadow-soft">
          <div class="font-extrabold text-slate-900">Poste apagado · R. Central, 45</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Reportado por Carlos M. · há 5 dias · 120m de você</div>

          <div class="mt-3 grid grid-cols-3 gap-2 text-center">
            <div><div class="font-black text-slate-900 text-lg">47</div><div class="text-[10px] text-slate-500 font-bold uppercase">Apoios</div></div>
            <div><div class="font-black text-slate-900 text-lg">12</div><div class="text-[10px] text-slate-500 font-bold uppercase">Comentários</div></div>
            <div><div class="font-black text-amber-600 text-lg">2d</div><div class="text-[10px] text-slate-500 font-bold uppercase">SLA restante</div></div>
          </div>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trajeto do ticket</div>
          <div class="text-[10px] font-bold text-slate-400">Protocolo #49102</div>
        </div>
        ${STEPS.map((ev, i, arr) => `
          <div class="flex gap-2.5 ${i < arr.length - 1 ? 'pb-3' : ''} relative">
            <div class="flex flex-col items-center">
              <div class="w-3 h-3 rounded-full ${ev.c} ring-4 ring-white ${ev.flag ? 'animate-pulse' : ''}"></div>
              ${i < arr.length - 1 ? '<div class="w-0.5 flex-1 bg-slate-200 -mt-0.5"></div>' : ''}
            </div>
            <div class="flex-1 pb-1">
              <div class="text-[12px] font-bold ${ev.c === 'bg-slate-200' ? 'text-slate-400' : 'text-slate-900'} flex items-center gap-1.5">
                ${ev.t}
                ${ev.flag ? '<span class="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">AGENDADO</span>' : ''}
              </div>
              <div class="text-[10px] ${ev.c === 'bg-slate-200' ? 'text-slate-400' : 'text-slate-500'}">${ev.d} · ${ev.sub}</div>
            </div>
          </div>`).join('')}
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tags da comunidade · moderadas</div>
        <div class="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">🌙 Perigoso à noite · 18</span>
          <span class="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">🚸 Área de escola · 11</span>
          <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">⚡ 4+ postes apagados · 6</span>
          <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">+ Nova tag</span>
        </div>
      </div>

      <div class="h-3"></div>
     </div>

      <div class="relative bg-white/95 backdrop-blur border-t border-slate-100 p-3 flex gap-2 z-30">
        <button class="flex-1 py-3 rounded-full bg-slate-100 font-bold text-sm text-slate-700 flex items-center justify-center gap-1.5">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          Compartilhar
        </button>
        <button class="flex-1 py-3 rounded-full bg-brand-500 text-white font-extrabold text-sm shadow-lg">🔥 Apoiar +10 XP</button>
      </div>
    </div>`
};
