import { statusBar } from "../atoms/StatusBar.js";
import { staticBottomNav } from "../organisms/BottomNav.js";

const svc = (emoji, label, color) => `
  <button class="bg-white rounded-2xl p-3 shadow-soft flex flex-col items-center gap-1.5 text-center">
    <div class="w-11 h-11 rounded-xl ${color} flex items-center justify-center text-lg">${emoji}</div>
    <div class="text-[11px] font-bold text-slate-800 leading-tight">${label}</div>
  </button>`;

/** Tela 24 · Serviços & Obras (hub integrações da prefeitura) */
export default {
  title: "Serviços & Obras",
  group: "support",
  summary: "Integrações da prefeitura · obras em andamento",
  note: `Hub que integra a Prefeitura sem precisar sair do app (webview). Card destaque exibe <b>obras em andamento no mapa</b> — feature "Projects in Progress" do briefing. Cor azul institucional convive com o lúdico nos ícones.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      ${statusBar("dark")}
      <div class="px-4 flex items-center gap-3">
        <button class="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center">←</button>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500 font-bold tracking-wider uppercase">Mais</div>
          <div class="text-xl font-extrabold text-slate-900">Serviços da cidade</div>
        </div>
      </div>

      <button data-nav="goto" data-target="Obras em Andamento" class="mx-4 mt-3 block w-[calc(100%-2rem)] text-left rounded-2xl overflow-hidden shadow-soft active:scale-[.99] transition" style="background:linear-gradient(135deg,#0EA5E9 0%,#6366F1 100%)">
        <div class="p-4 text-white">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wider">OBRAS ATIVAS · 6</span>
            <span class="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wider">R$ 2.3M</span>
          </div>
          <div class="mt-2 font-extrabold text-lg leading-tight">Acompanhe as obras do seu bairro</div>
          <div class="text-[11px] text-white/80 mt-0.5">Cronograma, orçamento e status em tempo real.</div>
        </div>
        <div class="bg-white/10 backdrop-blur px-4 py-3 flex items-center gap-2">
          <div class="flex -space-x-2">
            <div class="w-8 h-8 rounded-full bg-amber-400   border-2 border-white flex items-center justify-center text-xs">🏗️</div>
            <div class="w-8 h-8 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center text-xs">🌳</div>
            <div class="w-8 h-8 rounded-full bg-rose-400    border-2 border-white flex items-center justify-center text-xs">🏫</div>
          </div>
          <div class="text-[11px] text-white flex-1 leading-tight">
            Recapeamento · Arborização · Escola Nova
          </div>
          <span class="px-3 py-1.5 rounded-full bg-white text-indigo-700 font-extrabold text-[11px]">Ver todas</span>
        </div>
      </button>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-3 shadow-soft flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">🔎</div>
        <div class="flex-1">
          <div class="font-extrabold text-[13px] text-slate-900">Acompanhar ticket externo</div>
          <div class="text-[10px] text-slate-500">Já tem um protocolo da Prefeitura? Cole aqui.</div>
        </div>
        <button class="text-[11px] font-extrabold text-brand-600">Colar</button>
      </div>

      <div class="mx-4 mt-3 grid grid-cols-3 gap-2">
        ${svc("💰", "Pagar IPTU", "bg-yellow-100")}
        ${svc("🚗", "Multas", "bg-rose-100")}
        ${svc("🗑️", "Agendar coleta", "bg-emerald-100")}
        ${svc("💉", "Vacinação", "bg-sky-100")}
        ${svc("🏥", "UBS mais próxima", "bg-red-100")}
        ${svc("📅", "Eventos", "bg-purple-100")}
        ${svc("📣", "Ouvidoria", "bg-orange-100")}
        ${svc("🌡️", "Dengue", "bg-teal-100")}
        ${svc("➕", "Mais", "bg-slate-100")}
      </div>

      <div class="mx-4 mt-3 mb-4 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-4 text-white flex items-center gap-3">
        <div class="text-3xl">🤖</div>
        <div class="flex-1">
          <div class="font-extrabold text-sm">CiBo · assistente da cidade</div>
          <div class="text-[11px] text-white/70">"Quando passa o caminhão de lixo aqui?"</div>
        </div>
        <button class="px-3 py-1.5 rounded-full bg-white text-slate-900 font-extrabold text-[11px]">Perguntar</button>
      </div>
     </div>

      ${staticBottomNav("more")}
    </div>`,
};
