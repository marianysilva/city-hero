import { statusBar } from "../atoms/StatusBar.js";

/** Tela 10 · Confirmação do Reporte */
export default {
  title: "Confirmação do Reporte",
  group: "core",
  summary: "Pré-envio · IA já preencheu tudo",
  note: `Pós-captura. A IA pré-seleciona categoria e severidade. <b>Usuário só confirma ou corrige</b>. Campo de descrição é opcional. Mostra anonimização já aplicada ("2 placas borradas") — reforça confiança.`,
  html: () => `
    <div class="relative h-full bg-white flex flex-col overflow-hidden">
      ${statusBar("dark")}
      <div class="px-4 flex items-center gap-3 shrink-0">
        <button class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">←</button>
        <div class="text-lg font-extrabold text-slate-900">Revisar reporte</div>
      </div>

      <div class="px-4 mt-3 shrink-0">
        <div class="relative h-36 rounded-2xl overflow-hidden bg-slate-200" style="background-image:url('feed-photos/buraco-report.png');background-size:cover;background-position:center">
          <div class="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-[10px] font-bold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 2 placas anonimizadas · 0 rostos
          </div>
          <div class="absolute top-2 right-2 flex gap-2">
            <button class="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-sm shadow">🔄</button>
            <button class="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-sm shadow">✏️</button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-4 pt-3 pb-3 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Categoria · IA</div>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm">🕳️</span>
              <span class="font-extrabold text-slate-900">Buraco na via</span>
              <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">94%</span>
            </div>
          </div>
          <button class="text-[11px] font-bold text-brand-600">Trocar</button>
        </div>

        <div>
          <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Severidade · IA sugere</div>
          <div class="mt-1 flex gap-1.5">
            <button class="flex-1 py-2 rounded-lg bg-slate-100 text-[12px] font-semibold">Leve</button>
            <button class="flex-1 py-2 rounded-lg bg-brand-500 text-white text-[12px] font-extrabold shadow">Moderado ⚡</button>
            <button class="flex-1 py-2 rounded-lg bg-slate-100 text-[12px] font-semibold">Grave</button>
          </div>
        </div>

        <div class="bg-slate-50 rounded-xl p-3 flex items-center gap-2 text-[12px]">
          <span class="text-lg">📍</span>
          <div class="flex-1 leading-tight">
            <div class="font-bold text-slate-900">R. São Pedro, 320</div>
            <div class="text-slate-500 text-[11px]">GPS precisão 4m · validado ao vivo</div>
          </div>
          <button class="text-brand-600 text-[11px] font-bold">Ajustar</button>
        </div>

        <div>
          <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Comentário (opcional)</div>
          <div class="bg-slate-50 rounded-xl p-3 text-[12px] text-slate-400">Ex.: "Já furou pneu de 2 motos hoje…"</div>
        </div>

        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-base">🥷</span>
            <div class="text-[10px] font-black uppercase tracking-wider text-slate-500 flex-1">Como se identificar</div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button id="anon-off" onclick="this.className='p-2.5 rounded-xl border-2 border-brand-500 bg-brand-50 text-left transition';document.getElementById('anon-on').className='p-2.5 rounded-xl border border-slate-200 bg-white text-left transition';var s=document.getElementById('send-report-btn');if(s)s.setAttribute('data-target','Liga de Heróis');" type="button" class="p-2.5 rounded-xl border-2 border-brand-500 bg-brand-50 text-left transition">
              <div class="text-[12px] font-extrabold text-brand-700">Identificada</div>
              <div class="text-[9px] text-brand-900/70 leading-tight mt-0.5">Perfil no feed · vira apoios e XP visível</div>
            </button>
            <button id="anon-on" onclick="this.className='p-2.5 rounded-xl border-2 border-violet-500 bg-violet-50 text-left transition';document.getElementById('anon-off').className='p-2.5 rounded-xl border border-slate-200 bg-white text-left transition';var s=document.getElementById('send-report-btn');if(s)s.setAttribute('data-target','Envio Anônimo');" type="button" class="p-2.5 rounded-xl border border-slate-200 bg-white text-left transition">
              <div class="text-[12px] font-extrabold text-slate-700">Anônima</div>
              <div class="text-[9px] text-slate-500 leading-tight mt-0.5">🥷 Herói Anônimo · XP mantida</div>
            </button>
          </div>
        </div>
      </div>

      <div class="shrink-0 pt-2 pb-2.5 px-4 bg-white border-t border-slate-100">
        <div class="flex items-center justify-center gap-1.5 mb-1.5 text-[10px]">
          <span class="text-slate-500">Você vai ganhar</span>
          <span class="font-extrabold text-brand-600">+50 XP · 🏅 Olho Vivo</span>
        </div>
        <button id="send-report-btn" data-nav="goto" data-target="Liga de Heróis" class="w-full py-2.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-extrabold text-[13px] shadow-lg">
          Enviar reporte →
        </button>
      </div>
    </div>`,
};
