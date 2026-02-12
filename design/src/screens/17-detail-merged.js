import { statusBar } from '../atoms/StatusBar.js';

/** Tela 17 · Detalhe · Reporte Mesclado (duplicata detectada) */
export default {
  title: 'Detalhe · Reporte Mesclado',
  group: 'support',
  summary: 'Duplicata detectada · juntado ao ticket principal',
  note: `Estado quando a IA detecta que o mesmo problema já foi reportado. O reporte do cidadão <b>contribui para o mesmo ticket</b>, ganha XP e é notificado junto. Banner topo explica o que aconteceu + link pro ticket principal.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      ${statusBar('dark')}
      <div class="px-4 pt-2 flex items-center gap-3">
        <button class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">←</button>
        <div class="flex-1 min-w-0">
          <div class="text-lg font-extrabold text-slate-900 leading-tight">Seu reporte</div>
          <div class="mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
            <span>✓</span> Apoiando ticket #4821
          </div>
        </div>
      </div>

      <div class="mx-4 mt-3 rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
        <div class="flex items-start gap-2.5">
          <span class="text-xl">🔗</span>
          <div class="flex-1">
            <div class="font-extrabold text-amber-900 text-[13px]">Juntamos ao reporte #4821</div>
            <div class="text-[11px] text-amber-800 mt-0.5 leading-snug">A IA identificou que esse buraco já tinha sido reportado a <b>80m</b> daqui, há 3 dias. Em vez de criar duplicata, seu reporte virou apoio.</div>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-2 text-[11px]">
          <span class="px-2 py-1 rounded-full bg-emerald-500 text-white font-black text-[10px]">+50 XP creditado</span>
          <span class="px-2 py-1 rounded-full bg-white text-amber-800 font-bold text-[10px] border border-amber-200">Notificações ativadas</span>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-3 shadow-soft">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Seu reporte</div>
        <div class="flex gap-3">
          <div class="w-14 h-14 rounded-xl flex-shrink-0 bg-slate-200" style="background-image:url('feed-photos/buraco-duplicado-2.png');background-size:cover;background-position:center"></div>
          <div class="flex-1 min-w-0">
            <div class="font-extrabold text-slate-900 text-[13px] truncate">Buraco · Av. Gov. Celso Ramos, 320</div>
            <div class="text-[10px] text-slate-500 mt-0.5">Hoje · 10:15 · GPS 4m</div>
            <div class="mt-1 flex gap-1 flex-wrap">
              <span class="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">🕳️ BURACO</span>
            </div>
          </div>
        </div>
      </div>

      <button data-nav="goto" data-target="Detalhe · Em andamento" class="mx-4 mt-3 w-[calc(100%-2rem)] bg-white rounded-2xl p-3 shadow-soft text-left active:scale-[0.99] transition">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ticket principal</div>
        <div class="flex gap-3 items-center">
          <div class="w-14 h-14 rounded-xl flex-shrink-0 bg-slate-200" style="background-image:url('feed-photos/buraco-duplicado-1.png');background-size:cover;background-position:center"></div>
          <div class="flex-1 min-w-0">
            <div class="font-extrabold text-slate-900 text-[13px] truncate">#4821 · Buraco fundo · Av. Gov. Celso Ramos, 240</div>
            <div class="text-[10px] text-slate-500 mt-0.5">Aberto há 3 dias · Maria S. · 34 apoios</div>
            <div class="mt-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span class="text-[10px] font-black text-amber-700 uppercase">Em andamento · Equipe Pavimentação</span>
            </div>
          </div>
          <span class="text-slate-400 text-lg">›</span>
        </div>
      </button>

      <div class="h-3"></div>
     </div>

      <div class="relative bg-white/95 backdrop-blur border-t border-slate-100 p-3 flex gap-2 z-30">
        <button class="flex-1 py-3 rounded-full bg-white border border-slate-200 font-bold text-[13px] text-slate-700 leading-tight">É outro problema</button>
        <button data-nav="goto" data-target="Detalhe · Em andamento" class="flex-1 py-3 rounded-full bg-brand-500 text-white font-extrabold text-sm shadow-lg">Ver ticket →</button>
      </div>
    </div>`
};
