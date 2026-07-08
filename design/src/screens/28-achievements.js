import { statusBar } from "../atoms/StatusBar.js";
import { staticBottomNav } from "../organisms/BottomNav.js";

const badge = (emoji, name, desc, color, unlocked = true, progress = null) => `
  <div class="flex flex-col items-center p-2">
    <div class="w-16 h-16 rounded-2xl ${unlocked ? color : "bg-slate-100"} flex items-center justify-center text-2xl ${unlocked ? "shadow" : "opacity-60"}">${unlocked ? emoji : "🔒"}</div>
    <div class="mt-1.5 text-[10px] font-extrabold text-center leading-tight ${unlocked ? "text-slate-800" : "text-slate-400"}">${name}</div>
    <div class="text-[9px] text-slate-400 text-center leading-tight">${desc}</div>
    ${progress !== null ? `<div class="mt-1 w-full h-1 rounded-full bg-slate-200 overflow-hidden"><div class="h-full bg-brand-500" style="width:${progress}%"></div></div>` : ""}
  </div>`;

/** Tela 28 · Conquistas & Medalhas (gamificação · grid de badges) */
export default {
  title: "Conquistas & Medalhas",
  group: "gamification",
  summary: "Grid de badges · locked/unlocked",
  note: `Separação clara entre <b>desbloqueadas</b> (coloridas, vivas) e <b>em progresso</b> (cinza + barra). Medalha destaque no topo (in-progress) usa <i>fear of missing out</i> para puxar mais uma ação. O banner foi usado pra <b>apresentar o superpoder novo</b> — a conquista <b>Fiscal Cívico</b> (clicável, leva direto pro hub de Programas & Transparência) é a forma mais gentil de ensinar que o herói pode vigiar obras e programas, sem precisar de 4ª tela de onboarding.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      ${statusBar("dark")}
      <div class="px-4 flex items-center gap-3">
        <button class="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center">←</button>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500 font-bold tracking-wider uppercase">Jornada do Herói</div>
          <div class="text-xl font-extrabold text-slate-900">Conquistas · 12/30</div>
        </div>
      </div>

      <button data-nav="goto" data-target="Programas & Transparência" class="mx-4 mt-3 block w-[calc(100%-32px)] text-left rounded-2xl p-4 shadow-xl relative overflow-hidden active:scale-[.99] transition" style="background: linear-gradient(135deg,#0F766E 0%, #6366F1 100%)">
        <div class="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10"></div>
        <div class="flex items-center gap-3 text-white">
          <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">🕵️</div>
          <div class="flex-1">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-white/80">Próxima · novo superpoder</span>
              <span class="px-1.5 py-0 rounded-full bg-amber-400 text-amber-950 text-[8px] font-black tracking-wider">NOVO</span>
            </div>
            <div class="font-extrabold text-lg">Fiscal Cívico</div>
            <div class="text-[11px] text-white/90">Explore 3 programas da prefeitura · 0/3</div>
            <div class="mt-2 h-1.5 rounded-full bg-white/25 overflow-hidden"><div class="h-full bg-white" style="width:0%"></div></div>
          </div>
        </div>
      </button>

      <div class="px-4 mt-4 flex gap-2 text-[11px] font-bold">
        <span class="px-3 py-1.5 rounded-full bg-slate-900 text-white">Todas</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200">Desbloqueadas · 12</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200">Em progresso · 18</span>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-2 shadow-soft grid grid-cols-4 gap-1">
        ${badge("🥇", "Primeiro Reporte", "Seu debut!", "bg-gradient-to-br from-yellow-300 to-orange-500")}
        ${badge("⚡", "Raio Rápido", "5 reportes em 1 dia", "bg-gradient-to-br from-sky-300 to-indigo-600")}
        ${badge("🌳", "3 Bairros", "Diversidade", "bg-gradient-to-br from-emerald-300 to-green-600")}
        ${badge("🔥", "10 Apoios", "Voz ativa", "bg-gradient-to-br from-rose-300 to-red-500")}

        ${badge("👀", "Olho Vivo", "Detectou sem IA", "bg-gradient-to-br from-amber-300 to-yellow-500")}
        ${badge("📸", "100 Fotos", "Documentador", "bg-gradient-to-br from-purple-300 to-fuchsia-600")}
        ${badge("🌙", "Vigia Noturno", "5 postes apagados", "bg-gradient-to-br from-indigo-400 to-slate-700")}
        ${badge("🤝", "Mutirão", "5 validações", "bg-gradient-to-br from-cyan-300 to-sky-600")}

        ${badge("🕵️", "Fiscal Cívico", "Explore 3 programas", "", false, 0)}
        ${badge("🧱", "Calçada Zero", "10 calçadas", "", false, 20)}
        ${badge("🕳️", "Anti-buraco", "25 buracos", "", false, 40)}
        ${badge("🏆", "Lenda", "Top 1 do bairro", "", false, 10)}
      </div>

      <div class="mx-4 mt-3 mb-4 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-4 text-white flex items-center gap-3">
        <div class="text-3xl">💎</div>
        <div class="flex-1">
          <div class="font-extrabold text-sm">Titulo atual: Guardião</div>
          <div class="text-[11px] text-white/80">Próximo título: <b>Sentinela</b> em Nível 20</div>
        </div>
      </div>
     </div>

      ${staticBottomNav("profile")}
    </div>`,
};
