import { statusBar } from "../atoms/StatusBar.js";
import { staticBottomNav } from "../organisms/BottomNav.js";

/** Tela 27 · Perfil Cidadão (gamificação · vitrine do herói) */
export default {
  title: "Perfil Cidadão",
  group: "gamification",
  summary: "XP · Nível · Conquistas · Gov.br",
  note: `Perfil = vitrine do herói. Topo em gradiente com avatar grande, level e selo <b>Gov.br verificado</b>. Stats em grid de 3 comunicam impacto concreto. "Próximo nível" cria loop de progresso.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="relative pb-14" style="background: linear-gradient(160deg,#F97316 0%, #EA580C 40%, #7C3AED 100%);">
        ${statusBar("light")}
        <div class="px-4 pt-1 flex items-center justify-between text-white">
          <button class="text-xl">←</button>
          <div class="text-[11px] font-bold tracking-wider">MEU PERFIL</div>
          <span class="text-xl opacity-0" aria-hidden="true">←</span>
        </div>
        <div class="mt-4 flex flex-col items-center text-white px-4 text-center">
          <div class="relative">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-pink-300 to-orange-400 border-4 border-white flex items-center justify-center text-5xl shadow-2xl">🦸</div>
            <div class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white flex items-center justify-center text-sm font-black text-brand-600 shadow">15</div>
          </div>
          <div class="mt-3 flex items-center gap-2">
            <h2 class="text-xl font-extrabold">João Silva</h2>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-[10px] font-bold border border-white/30">
              <span class="w-2 h-2 rounded-full bg-emerald-300"></span> Gov.br verificado
            </span>
          </div>
          <div class="mt-1 text-white/90 text-[12px] font-semibold">🛡️ Guardião do Bairro · Pôrto Belo, SC</div>
        </div>
      </div>

      <div class="mx-4 -mt-10 bg-white rounded-2xl shadow-xl p-4">
        <div class="flex items-center justify-between text-[11px] text-slate-500 font-bold">
          <span>XP · 2.450 / 3.000</span>
          <span>Próximo: Nível 16 ⚡</span>
        </div>
        <div class="xp-track mt-2"><div class="xp-fill" style="width:82%"></div></div>
        <div class="mt-1 text-[11px] text-slate-500">Faltam <b class="text-brand-600">550 XP</b> · ≈ 11 reportes</div>
      </div>

      <div class="mx-4 mt-3 grid grid-cols-3 gap-2">
        <div class="bg-white rounded-2xl p-3 text-center shadow-soft">
          <div class="text-xl font-black text-slate-900">47</div>
          <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reportes</div>
        </div>
        <div class="bg-white rounded-2xl p-3 text-center shadow-soft">
          <div class="text-xl font-black text-slate-900">38</div>
          <div class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Resolvidos</div>
        </div>
        <div class="bg-white rounded-2xl p-3 text-center shadow-soft">
          <div class="text-xl font-black text-slate-900">214</div>
          <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Apoios</div>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-3 flex items-start gap-3 shadow-soft">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg flex-shrink-0">🔒</div>
        <div class="flex-1">
          <div class="font-bold text-[13px] text-slate-900">Anonimização automática</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Rostos e placas são borrados antes da publicação. Obrigatório por lei (LGPD).</div>
          <div class="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
            <span>✓</span> Sempre ativa
          </div>
        </div>
      </div>

      <div class="mx-4 mt-3">
        <div class="flex items-center justify-between mb-2 px-1">
          <div class="font-extrabold text-slate-900">Conquistas</div>
          <button data-nav="goto" data-target="Conquistas & Medalhas" class="text-[11px] font-bold text-brand-600">Ver todas</button>
        </div>
        <div class="bg-white rounded-2xl p-3 flex gap-3 shadow-soft">
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center text-xl">🥇</div>
            <div class="text-[9px] font-bold mt-1 text-center">Primeiro Reporte</div>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-300 to-indigo-600 flex items-center justify-center text-xl">⚡</div>
            <div class="text-[9px] font-bold mt-1 text-center">5 Apoios</div>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-300 to-green-600 flex items-center justify-center text-xl">🌳</div>
            <div class="text-[9px] font-bold mt-1 text-center">3 Bairros</div>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl opacity-60">🔒</div>
            <div class="text-[9px] text-slate-400 font-bold mt-1 text-center">Vigia Noturno</div>
          </div>
        </div>
      </div>

      <div class="mx-4 mt-3 mb-4">
        <div class="font-extrabold text-slate-900 mb-2 px-1">Atividade recente</div>
        <div class="bg-white rounded-2xl shadow-soft">
          ${[
            ["🕳️", "Buraco · R. São Pedro", "Resolvido · +80 XP", "bg-emerald-500"],
            ["🗑️", "Lixo · Praça Central", "Em andamento", "bg-amber-500"],
            ["💡", "Poste · R. das Flores", "Triagem", "bg-slate-400"],
          ]
            .map(
              ([e, t, s, c], i) => `
            <div class="flex items-center gap-3 px-3 py-2.5 ${i < 2 ? "border-b border-slate-100" : ""}">
              <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">${e}</div>
              <div class="flex-1">
                <div class="text-[12px] font-bold text-slate-900 leading-tight">${t}</div>
                <div class="text-[10px] text-slate-500">${s}</div>
              </div>
              <span class="w-2 h-2 rounded-full ${c}"></span>
            </div>`,
            )
            .join("")}
        </div>
      </div>
     </div>

      ${staticBottomNav("profile")}
    </div>`,
};
