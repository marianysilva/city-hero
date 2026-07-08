import { statusBar } from "../atoms/StatusBar.js";

/** Tela 15 · NPS · Feedback pós-resolução */
export default {
  title: "NPS · Feedback",
  group: "support",
  summary: "Fecha o ciclo · 5 faces + tags + XP",
  note: `Aparece automaticamente quando um reporte do usuário é marcado como "resolvido". <b>Escala de 5 faces</b> (mais humana que 0-10 mobile) + chips de tags moderadas. O survey <b>gera +15 XP</b> pra garantir resposta. Dados alimentam o BI de "Citizen Sentiment Analysis" (feature 4) e o scorecard da prefeitura.`,
  html: () => `
    <div class="relative h-full bg-gradient-to-b from-emerald-50 via-white to-white flex flex-col overflow-hidden">
      <div class="flex-1 min-h-0 overflow-y-auto">
        ${statusBar("dark")}
        <div class="px-4 flex items-center justify-end">
          <button class="text-slate-500 text-[12px] font-bold">Agora não</button>
        </div>

        <div class="mx-4 mt-2 rounded-3xl overflow-hidden bg-white shadow-soft">
          <div class="relative h-36 ba-wrap">
            <div class="absolute inset-0" style="background-image:url('feed-photos/buraco.png');background-size:cover;background-position:center"></div>
            <div class="ba-after" style="background-image:url('feed-photos/buraco-tapado.png');background-size:cover;background-position:center"></div>
            <div class="ba-handle"></div>
            <div class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-white text-[10px] font-black">ANTES → DEPOIS</div>
          </div>
          <div class="p-3 text-center">
            <div class="text-[10px] font-black uppercase tracking-wider text-emerald-600">Resolvido em 18 dias</div>
            <div class="font-extrabold text-slate-900 mt-0.5">Seu buraco virou asfalto ✨</div>
            <div class="text-[11px] text-slate-500">R. São Pedro, 320 · Protocolo #48219</div>
          </div>
        </div>

        <div class="mx-4 mt-3 p-4 rounded-2xl bg-white shadow-soft">
          <div class="text-[13px] font-extrabold text-slate-900 text-center">Como foi o atendimento da prefeitura?</div>
          <div class="flex items-center justify-between mt-3 px-1">
            ${[
              { e: "😡", l: "Péssimo" },
              { e: "😕", l: "Ruim" },
              { e: "😐", l: "Ok" },
              { e: "🙂", l: "Bom", active: true },
              { e: "😍", l: "Excelente" },
            ]
              .map(
                (r) => `
              <button class="flex flex-col items-center gap-1 ${r.active ? "" : "opacity-55"}">
                <span class="w-12 h-12 rounded-full ${r.active ? "bg-brand-100 ring-2 ring-brand-500" : "bg-slate-50"} flex items-center justify-center text-2xl transition">${r.e}</span>
                <span class="text-[10px] font-bold text-slate-600">${r.l}</span>
              </button>
            `,
              )
              .join("")}
          </div>
        </div>

        <div class="mx-4 mt-3 p-4 rounded-2xl bg-white shadow-soft">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">O que mais pesou? <span class="text-slate-400 normal-case font-normal">(toque pra marcar)</span></div>
          <div class="flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span class="px-2.5 py-1.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">⚡ Rápido <span class="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center">✓</span></span>
            <span class="px-2.5 py-1.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">🔧 Bem feito <span class="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center">✓</span></span>
            <span class="px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600">💬 Comunicação clara</span>
            <span class="px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600">⏳ Demorou</span>
            <span class="px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600">🧱 Solução provisória</span>
            <span class="px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600">😕 Voltou a quebrar</span>
          </div>
        </div>

        <div class="mx-4 mt-3 p-4 rounded-2xl bg-white shadow-soft">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Comentário (opcional)</div>
          <div class="bg-slate-50 rounded-xl p-3 text-[12px] text-slate-400 min-h-[52px]">Ex.: "Podiam avisar antes de fechar a rua…"</div>
        </div>

        <div class="h-3"></div>
      </div>

      <div class="relative bg-white/95 backdrop-blur border-t border-slate-100 p-3 z-30">
        <button class="w-full py-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold shadow-lg flex items-center justify-center gap-2">
          Enviar feedback
          <span class="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-black">+15 XP</span>
        </button>
        <p class="text-center text-[10px] text-slate-400 mt-2 leading-snug">
          Seu feedback vira dado público no painel da cidade.
        </p>
      </div>
    </div>`,
};
