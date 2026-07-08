import { statusBar } from "../atoms/StatusBar.js";

/** Tela 04 · Onboarding · Gamificação */
export default {
  title: "Onboarding · Gamificação",
  group: "onboarding",
  summary: "Por que reportar: XP, níveis, medalhas",
  note: `Apresenta a jornada <b>Cidadão → Vigilante → Guardião</b>. Emblema com brilho (shine) puxa atenção; barra de XP antecipa o loop de progresso que o usuário vai viver.`,
  html: () => `
    <div class="relative h-full bg-gradient-to-b from-white to-amber-50">
      ${statusBar("dark")}
      <div class="px-6 pt-2 flex items-center justify-between">
        <button data-nav="back" class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">←</button>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Passo 3 de 5</span>
      </div>

      <div class="mt-6 flex flex-col items-center">
        <div class="relative">
          <div class="w-36 h-36 rounded-full shine flex items-center justify-center shadow-2xl">
            <div class="w-28 h-28 rounded-full bg-white flex items-center justify-center text-6xl">🏆</div>
          </div>
          <div class="absolute -top-2 -right-2 bg-civic-rose text-white text-[10px] font-black px-2 py-1 rounded-full shadow">NÍVEL 15</div>
          <div class="absolute -bottom-1 -left-3 bg-white px-3 py-1 rounded-full shadow border border-slate-200 text-[10px] font-extrabold text-slate-800">Guardião</div>
        </div>

        <div class="mt-10 flex gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center text-xl shadow">🥇</div>
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-300 to-indigo-500 flex items-center justify-center text-xl shadow">⚡</div>
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-300 to-green-600 flex items-center justify-center text-xl shadow">🌳</div>
          <div class="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl opacity-60">🔒</div>
          <div class="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl opacity-60">🔒</div>
        </div>
      </div>

      <div class="px-7 mt-8 text-center">
        <h2 class="text-2xl font-extrabold text-slate-900 leading-tight">Cada reporte vale XP.</h2>
        <p class="text-slate-600 mt-2 leading-relaxed text-[13px]">
          Vire <b>Guardião do bairro</b>. Destrave medalhas, suba no ranking e
          deixe sua marca na cidade. Toda ação conta.
        </p>
      </div>

      <div class="absolute bottom-6 left-0 right-0 flex items-center justify-between px-7">
        <div class="flex gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span class="w-6 h-1.5 rounded-full bg-brand-500"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
        </div>
        <button data-nav="next" class="px-5 py-3 rounded-full bg-slate-900 text-white font-bold text-sm">Próximo →</button>
      </div>
    </div>`,
};
