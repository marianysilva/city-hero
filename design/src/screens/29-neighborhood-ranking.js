import { statusBar } from "../atoms/StatusBar.js";
import { staticBottomNav } from "../organisms/BottomNav.js";

/** Tela 29 · Ranking do Bairro (gamificação · pódio) */
export default {
  title: "Ranking do Bairro",
  group: "gamification",
  summary: "Pódio · top 10 · sua posição",
  note: `Pódio no topo dá o "wow" visual. Lista abaixo enumera 4–10 com stats. Card fixo inferior mostra <b>a posição do usuário</b> mesmo fora do top — motiva a subir.`,
  html: () => `
    <div class="relative h-full flex flex-col overflow-hidden" style="background: linear-gradient(180deg,#EEF2FF 0%, #FFFFFF 100%);">
     <div class="flex-1 min-h-0 overflow-y-auto">
      ${statusBar("dark")}
      <div class="px-4 flex items-center gap-3">
        <button class="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center">←</button>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500 font-bold tracking-wider uppercase">Ranking</div>
          <div class="text-xl font-extrabold text-slate-900">Heróis de Pôrto Belo</div>
        </div>
        <button class="text-[11px] font-bold text-brand-600">Semanal ▾</button>
      </div>

      <div class="mx-4 mt-4 h-48 relative">
        <div class="absolute left-2 bottom-0 w-1/3 flex flex-col items-center">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-sky-300 to-indigo-500 border-4 border-white mb-1 flex items-center justify-center text-2xl">🧑‍🎨</div>
          <div class="text-[11px] font-extrabold">Maria S.</div>
          <div class="text-[10px] text-slate-500">3.120 XP</div>
          <div class="mt-1 w-full h-16 rounded-t-xl bg-gradient-to-b from-slate-200 to-slate-300 flex items-start justify-center pt-2 font-black text-slate-600 text-lg">2</div>
        </div>
        <div class="absolute left-1/2 -translate-x-1/2 bottom-0 w-1/3 flex flex-col items-center">
          <div class="text-xl -mb-1">👑</div>
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 border-4 border-white mb-1 flex items-center justify-center text-2xl">🦹</div>
          <div class="text-[11px] font-extrabold">Carlos M.</div>
          <div class="text-[10px] text-slate-500">4.890 XP</div>
          <div class="mt-1 w-full h-24 rounded-t-xl bg-gradient-to-b from-yellow-300 to-amber-500 flex items-start justify-center pt-2 font-black text-white text-lg">1</div>
        </div>
        <div class="absolute right-2 bottom-0 w-1/3 flex flex-col items-center">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-300 to-green-600 border-4 border-white mb-1 flex items-center justify-center text-2xl">🧑</div>
          <div class="text-[11px] font-extrabold">Ana L.</div>
          <div class="text-[10px] text-slate-500">2.780 XP</div>
          <div class="mt-1 w-full h-12 rounded-t-xl bg-gradient-to-b from-amber-200 to-amber-400 flex items-start justify-center pt-2 font-black text-white text-lg">3</div>
        </div>
      </div>

      <div class="mx-4 mt-2 bg-white rounded-2xl shadow-soft overflow-hidden">
        ${[
          ["4", "Pedro H.", "2.450", "bg-gradient-to-br from-pink-300 to-rose-500"],
          ["5", "Juliana C.", "2.380", "bg-gradient-to-br from-purple-300 to-fuchsia-500"],
          ["6", "Bruno R.", "2.100", "bg-gradient-to-br from-teal-300 to-cyan-600"],
          ["7", "Sofia V.", "1.950", "bg-gradient-to-br from-lime-300 to-green-500"],
          ["8", "Rafa L.", "1.800", "bg-gradient-to-br from-orange-300 to-red-500"],
        ]
          .map(
            ([p, n, xp, c]) => `
          <div class="flex items-center gap-3 px-3 py-2.5 border-b border-slate-100">
            <div class="w-6 text-center text-slate-500 font-black text-sm">${p}</div>
            <div class="w-9 h-9 rounded-full ${c} flex items-center justify-center text-white font-bold text-xs">${n.charAt(0)}</div>
            <div class="flex-1 font-bold text-[13px] text-slate-800">${n}</div>
            <div class="text-[11px] font-black text-slate-700">${xp} <span class="text-slate-400 font-normal">XP</span></div>
          </div>
        `,
          )
          .join("")}
      </div>

      <div class="mx-4 mt-3 mb-4 rounded-2xl shadow-xl p-3 flex items-center gap-3" style="background: linear-gradient(90deg,#0F172A,#1E293B);">
        <div class="w-8 text-center text-brand-400 font-black text-sm">12</div>
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-civic-purple flex items-center justify-center text-white font-black">J</div>
        <div class="flex-1 text-white">
          <div class="font-extrabold text-[13px]">Você</div>
          <div class="text-[10px] text-slate-400">Falta 180 XP para entrar no Top 10</div>
        </div>
        <button class="px-3 py-1.5 rounded-full bg-brand-500 text-white text-[11px] font-extrabold">Reportar</button>
      </div>
     </div>

      ${staticBottomNav("profile")}
    </div>`,
};
