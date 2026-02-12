import { statusBar } from '../atoms/StatusBar.js';

const STEPS = [
  { c: 'bg-slate-400',   t: 'Reporte enviado',               d: '20/03 · 10:14', sub: 'Maria S. · foto anonimizada' },
  { c: 'bg-sky-500',     t: 'Triagem pela IA',               d: '20/03 · 10:15', sub: 'Score 87 · prioridade alta' },
  { c: 'bg-indigo-500',  t: 'Chamado aberto na prefeitura',  d: '20/03 · 10:22', sub: 'Secretaria de Obras · SLA 15 dias' },
  { c: 'bg-amber-500',   t: 'Reenviado automaticamente',     d: '04/04 · 10:22', sub: '15 dias sem resposta · escalado', flag: true },
  { c: 'bg-sky-500',     t: 'Resposta da prefeitura',        d: '05/04 · 14:30', sub: 'Equipe designada · vistoria agendada' },
  { c: 'bg-amber-500',   t: 'Agendado para reparo',          d: '06/04 · 08:00', sub: 'Pavimentação Zona Sul' },
  { c: 'bg-emerald-500', t: 'Resolvido',                     d: '08/04 · 16:40', sub: 'Foto "depois" anexada' },
];

/** Tela 14 · Detalhe do Ticket (resolvido · before/after) */
export default {
  title: 'Detalhe do Ticket',
  group: 'support',
  summary: 'Before/after · timeline · apoios',
  note: `Tela que fecha o ciclo de confiança. <b>Slider "antes × depois"</b> é o prova-visual. Timeline mostra trajeto do ticket. Botão "Apoiar" é persistente e visível.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="relative h-56 ba-wrap">
        <div class="absolute inset-0" style="background-image:url('feed-photos/buraco.png');background-size:cover;background-position:center"></div>
        <div class="ba-after" style="background-image:url('feed-photos/buraco-tapado.png');background-size:cover;background-position:center"></div>
        <div class="ba-handle"></div>
        <div class="absolute top-11 left-4 flex items-center gap-2">
          <button class="w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center">←</button>
          <div class="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-white text-[10px] font-black">ANTES → DEPOIS</div>
        </div>
        <div class="absolute top-11 right-4">
          <button class="w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center">⋯</button>
        </div>
        <div class="absolute bottom-3 left-3 flex gap-2">
          <span class="px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black">🕳️ BURACO</span>
          <span class="px-2 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black">✓ RESOLVIDO</span>
        </div>
      </div>

      ${statusBar('dark')}

      <div class="px-4 -mt-10 relative z-10">
        <div class="bg-white rounded-2xl p-4 shadow-soft">
          <div class="font-extrabold text-slate-900">Buraco fundo · R. São Pedro, 320</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Reportado por Maria S. · há 3 dias · 80m de você</div>

          <div class="mt-3 grid grid-cols-3 gap-2 text-center">
            <div><div class="font-black text-slate-900 text-lg">34</div><div class="text-[10px] text-slate-500 font-bold uppercase">Apoios</div></div>
            <div><div class="font-black text-slate-900 text-lg">8</div><div class="text-[10px] text-slate-500 font-bold uppercase">Comentários</div></div>
            <div><div class="font-black text-emerald-600 text-lg">2d</div><div class="text-[10px] text-slate-500 font-bold uppercase">Atendido em</div></div>
          </div>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trajeto do ticket</div>
          <div class="text-[10px] font-bold text-slate-400">Protocolo #48219</div>
        </div>
        ${STEPS.map((ev, i, arr) => `
          <div class="flex gap-2.5 ${i < arr.length - 1 ? 'pb-3' : ''} relative">
            <div class="flex flex-col items-center">
              <div class="w-3 h-3 rounded-full ${ev.c} ring-4 ring-white ${ev.flag ? 'animate-pulse' : ''}"></div>
              ${i < arr.length - 1 ? '<div class="w-0.5 flex-1 bg-slate-200 -mt-0.5"></div>' : ''}
            </div>
            <div class="flex-1 pb-1">
              <div class="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">
                ${ev.t}
                ${ev.flag ? '<span class="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">SLA</span>' : ''}
              </div>
              <div class="text-[10px] text-slate-500">${ev.d} · ${ev.sub}</div>
            </div>
          </div>`).join('')}
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tags da comunidade · moderadas</div>
        <div class="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          <span class="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700">🚸 Perigoso para pedestres · 12</span>
          <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">🚗 Atrapalha trânsito · 9</span>
          <span class="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">🌧️ Piora com chuva · 5</span>
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
        <button data-nav="goto" data-target="NPS · Feedback" class="flex-1 py-3 rounded-full bg-emerald-500 text-white font-extrabold text-sm shadow-lg">⭐ Avaliar +15 XP</button>
      </div>
    </div>`
};
