import { statusBar } from "../atoms/StatusBar.js";
import { searchBar } from "../atoms/SearchBar.js";
import { staticBottomNav } from "../organisms/BottomNav.js";

const row = (emoji, title, sub, color, status, extra = "") => `
  <div class="flex items-center gap-3 px-3 py-3 border-b border-slate-100">
    <div class="w-11 h-11 rounded-xl ${color || "bg-slate-100"} flex items-center justify-center text-xl">${emoji}</div>
    <div class="flex-1 min-w-0">
      <div class="font-bold text-[13px] text-slate-900 truncate">${title}</div>
      <div class="text-[11px] text-slate-500 truncate">${sub}</div>
      ${extra}
    </div>
    <span class="px-2 py-0.5 rounded-full text-[9px] font-black whitespace-nowrap ${status.cls}">${status.label}</span>
  </div>`;

/** Tela 16 · Meus Reportes */
export default {
  title: "Meus Reportes",
  group: "support",
  summary: "Histórico com status · pendentes · resolvidos",
  note: `Inclui "pendente de upload" para o <b>modo offline</b>: o cidadão sabe que o reporte está guardado mesmo sem sinal. Cores de status consistentes com o resto do app. <b>Bridge card no rodapé</b> convida a explorar Programas & Transparência enquanto o reporte tá em andamento — descoberta contextual, sem interromper a tarefa principal.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      ${statusBar("dark")}
      <div class="px-4 flex items-center gap-3">
        <button class="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center">←</button>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500 font-bold tracking-wider uppercase">Histórico</div>
          <div class="text-xl font-extrabold text-slate-900">Meus reportes · 47</div>
        </div>
      </div>

      <div class="px-4 mt-3">${searchBar("Buscar nos meus reportes…")}</div>

      <div class="mx-4 mt-3 grid grid-cols-4 gap-2 text-center">
        <div class="bg-white rounded-xl p-2 shadow-soft"><div class="font-black text-slate-900">47</div><div class="text-[9px] text-slate-500 font-bold uppercase">Total</div></div>
        <div class="bg-white rounded-xl p-2 shadow-soft"><div class="font-black text-emerald-600">38</div><div class="text-[9px] text-emerald-600 font-bold uppercase">Resolv.</div></div>
        <div class="bg-white rounded-xl p-2 shadow-soft"><div class="font-black text-amber-500">7</div><div class="text-[9px] text-amber-500 font-bold uppercase">Andam.</div></div>
        <div class="bg-white rounded-xl p-2 shadow-soft"><div class="font-black text-slate-400">2</div><div class="text-[9px] text-slate-400 font-bold uppercase">Triag.</div></div>
      </div>

      <div class="mx-4 mt-3 flex gap-1.5 text-[11px] font-bold">
        <span class="px-3 py-1.5 rounded-full bg-slate-900 text-white">Todos</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200">Pendentes</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200">Em andamento</span>
      </div>

      <button data-nav="goto" data-target="Fila de Sincronização" class="mx-4 mt-3 w-[calc(100%-32px)] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-3 flex items-center gap-3 text-left">
        <div class="text-2xl">📡</div>
        <div class="flex-1">
          <div class="font-extrabold text-amber-800 text-[13px]">2 reportes aguardando envio</div>
          <div class="text-[11px] text-amber-700">Serão sincronizados quando tiver rede.</div>
        </div>
        <span class="text-[11px] font-extrabold text-amber-800">Ver</span>
      </button>

      <div class="mx-4 mt-3 mb-4 bg-white rounded-2xl shadow-soft overflow-hidden">
        ${row("🕳️", "Buraco · R. São Pedro", "22/03 · há 2 dias", "", { label: "RESOLVIDO", cls: "bg-emerald-100 text-emerald-700" }, '<div class="mt-1 text-[10px] text-emerald-600 font-bold">+80 XP · Foto depois disponível ✓</div>')}
        ${row("🗑️", "Lixo acumulado · Praça Central", "20/03 · há 4 dias", "bg-emerald-50", { label: "EM ANDAMENTO", cls: "bg-amber-100 text-amber-700" })}
        ${row("💡", "Poste apagado · R. das Flores", "18/03 · há 6 dias", "bg-sky-50", { label: "TRIAGEM", cls: "bg-slate-100 text-slate-600" })}
        ${row("🕳️", "Buraco · Av. Atlântica", "15/03 · há 9 dias", "bg-amber-50", { label: "RESOLVIDO", cls: "bg-emerald-100 text-emerald-700" })}
        ${row("🌳", "Poda · R. dos Ipês", "12/03 · há 12 dias", "bg-green-50", { label: "RESOLVIDO", cls: "bg-emerald-100 text-emerald-700" })}
        ${row("🎨", "Pichação · Túnel Sul", "10/03 · há 14 dias", "bg-rose-50", { label: "ARQUIVADO", cls: "bg-slate-100 text-slate-500" })}
      </div>

      <button data-nav="goto" data-target="Programas & Transparência" class="mx-4 mt-3 mb-4 w-[calc(100%-32px)] rounded-2xl p-3.5 flex items-center gap-3 text-white text-left active:scale-[.99] transition shadow-soft" style="background:linear-gradient(135deg,#0F172A 0%,#0F766E 100%)">
        <span class="text-2xl shrink-0">🕵️</span>
        <div class="flex-1 leading-tight">
          <div class="text-[10px] font-black uppercase tracking-wider text-white/70">Enquanto isso</div>
          <div class="text-[12px] font-extrabold">Dá uma olhada no que a prefeitura anda fazendo</div>
          <div class="text-[10px] text-white/80 mt-0.5">11 programas · R$ 18,4M monitorados</div>
        </div>
        <span class="text-lg shrink-0">→</span>
      </button>
     </div>

      ${staticBottomNav("profile")}
    </div>`,
};
