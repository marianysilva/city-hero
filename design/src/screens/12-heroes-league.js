import { statusBar } from "../atoms/StatusBar.js";

/** Tela 12 · Liga de Heróis (pós-envio · compartilhamento viral) */
export default {
  title: "Liga de Heróis",
  group: "core",
  summary: "Pós-envio · celebra + viraliza",
  note: `Tela pós-envio que faz três coisas ao mesmo tempo: <b>celebra</b> o envio (XP + medalha), <b>explica o valor do compartilhamento</b> com dado ("reportes com apoio resolvem em 3 dias vs 7") e <b>oferece os canais certos</b> pro contexto BR (WhatsApp é primário). O <b>preview card</b> simula a prévia de link que aparece no WhatsApp/iMessage — reforça que o que vai ser compartilhado é bonito e bem-feito, não uma denúncia crua. Cada compartilhamento vira <b>loop de aquisição</b>: quem recebe o link aterrissa num webview do reporte com CTA "baixe o app e apoie" — é como CityHero cresce sem pagar CAC. O framing <i>"todo herói tem sua liga"</i> conecta a gamificação existente (Nível, Medalha) com a mecânica de convite. Conquista teaser <b>Formador de Liga</b> dá um objetivo claro (3 amigos).`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="relative overflow-hidden" style="background:linear-gradient(135deg,#10B981 0%,#059669 60%,#047857 100%)">
        ${statusBar("light")}
        <svg class="absolute inset-0 pointer-events-none" width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio="none">
          <circle cx="24"  cy="30"  r="3"   fill="#FDE68A" opacity=".8"/>
          <circle cx="290" cy="42"  r="2.5" fill="#A7F3D0" opacity=".7"/>
          <circle cx="60"  cy="110" r="2"   fill="#FEF3C7" opacity=".6"/>
          <circle cx="262" cy="130" r="3"   fill="#FBBF24" opacity=".7"/>
          <path d="M 40 70 l 4 -2 l -1 5 Z"          fill="#FDE68A" opacity=".8"/>
          <path d="M 280 92 l 5 1 l -2 4 Z"          fill="#BEF264" opacity=".7"/>
          <path d="M 120 20 l 3 -3 l 3 3 l -3 3 Z"   fill="#FEF3C7" opacity=".7"/>
          <path d="M 230 150 l 3 -3 l 3 3 l -3 3 Z"  fill="#FBBF24" opacity=".7"/>
        </svg>
        <div class="relative px-6 pt-1 pb-6 text-white text-center">
          <div class="w-16 h-16 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-3xl mx-auto shadow-lg">✓</div>
          <div class="mt-3 text-[10px] font-black uppercase tracking-wider text-white/85">Protocolo #2847 · enviado</div>
          <div class="font-extrabold text-xl mt-1 leading-tight">Ótimo trabalho, herói!</div>
          <div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-[11px] font-bold">
            <span class="text-amber-300">+50 XP</span>
            <span class="w-1 h-1 rounded-full bg-white/60"></span>
            <span>🏅 Olho Vivo desbloqueada</span>
          </div>
        </div>
      </div>

      <div class="px-6 mt-4 text-center">
        <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[9px] font-black tracking-wider uppercase mb-2">🦸 Próximo passo</div>
        <div class="text-[20px] font-extrabold text-slate-900 leading-tight">Todo herói tem sua liga.</div>
        <p class="text-[12px] text-slate-600 mt-2 leading-relaxed">
          Compartilhe seu reporte e traga aliados. Reportes com apoio público são <b class="text-slate-900">resolvidos em 3 dias</b> em média — contra <b>7 dias</b> quando ficam só seus.
        </p>
      </div>

      <div class="mx-4 mt-4">
        <div class="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5 px-1">Prévia do compartilhamento</div>
        <div class="rounded-2xl bg-white shadow-soft overflow-hidden border border-slate-100">
          <div class="relative h-32 bg-slate-200" style="background-image:url('feed-photos/buraco-report.png');background-size:cover;background-position:center">
            <div class="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black tracking-wider">🕳️ BURACO · MODERADO</div>
            <div class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/55 backdrop-blur text-white text-[9px] font-bold">📍 R. São Pedro, 320 · Pôrto Belo</div>
          </div>
          <div class="p-3">
            <div class="text-[13px] font-extrabold text-slate-900 leading-tight">Buraco urgente na R. São Pedro</div>
            <div class="text-[11px] text-slate-600 mt-1 italic leading-snug">"Já furou pneu de 2 motos hoje. Precisa ser resolvido antes do próximo acidente."</div>
            <div class="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-brand-500 to-civic-purple flex items-center justify-center text-white text-[9px] font-black">J</div>
              <span>Reportado por <b>João</b> · Guardião de Pôrto Belo · agora</span>
            </div>
          </div>
          <div class="bg-slate-900 px-3 py-2.5 flex items-center gap-2">
            <span class="text-base">🦸</span>
            <div class="flex-1 text-white leading-tight">
              <div class="text-[11px] font-extrabold">cityhero.app/r/2847</div>
              <div class="text-[9px] text-white/70">Apoie este reporte · baixe o app e vire herói</div>
            </div>
            <span class="px-2 py-1 rounded-full bg-white text-slate-900 text-[9px] font-black">Apoiar</span>
          </div>
        </div>
      </div>

      <div class="px-4 mt-4">
        <div class="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">Onde compartilhar</div>
        <div class="grid grid-cols-5 gap-1">
          <button class="flex flex-col items-center gap-1 p-1 rounded-xl active:bg-slate-100">
            <div class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-soft">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.9-.5-1.8-1-2.5-1.9-.7-.9-1.3-1.9-1.5-2.4-.2-.4-.1-.6.1-.8.2-.2.3-.3.5-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.3 3.1c.2.2 2.2 3.4 5.4 4.6.8.3 1.4.5 1.8.7.8.2 1.4.2 2 .1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2.2C6.6 2.2 2.2 6.6 2.2 12c0 1.9.5 3.6 1.4 5.1L2 22l5-1.6c1.4.8 3.1 1.3 4.9 1.3h.1c5.4 0 9.8-4.4 9.8-9.8 0-2.6-1-5-2.9-6.9-1.8-1.9-4.2-2.8-6.9-2.8z"/></svg>
            </div>
            <span class="text-[9px] font-bold text-slate-700 leading-none text-center">WhatsApp</span>
          </button>
          <button class="flex flex-col items-center gap-1 p-1 rounded-xl active:bg-slate-100">
            <div class="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-soft text-lg" style="background:linear-gradient(135deg,#833AB4 0%,#FD1D1D 50%,#FCB045 100%)">📸</div>
            <span class="text-[9px] font-bold text-slate-700 leading-none text-center">Stories</span>
          </button>
          <button class="flex flex-col items-center gap-1 p-1 rounded-xl active:bg-slate-100">
            <div class="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-soft text-lg font-black">𝕏</div>
            <span class="text-[9px] font-bold text-slate-700 leading-none text-center">X / Threads</span>
          </button>
          <button class="flex flex-col items-center gap-1 p-1 rounded-xl active:bg-slate-100">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-soft">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <span class="text-[9px] font-bold text-slate-700 leading-none text-center">Copiar link</span>
          </button>
          <button class="flex flex-col items-center gap-1 p-1 rounded-xl active:bg-slate-100">
            <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shadow-soft">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </div>
            <span class="text-[9px] font-bold text-slate-700 leading-none text-center">Mais</span>
          </button>
        </div>
      </div>

      <div class="mx-4 mt-3 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div class="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
          <span class="text-xs">✨</span>
          <span class="text-[10px] font-black uppercase tracking-wider text-slate-600">Mensagem sugerida</span>
          <button class="ml-auto text-[10px] font-extrabold text-brand-600">Editar</button>
        </div>
        <div class="p-3 text-[11px] text-slate-700 leading-snug bg-emerald-50/40">
          🚨 Preciso do seu apoio! Reportei um <b>buraco perigoso</b> na R. São Pedro, 320. Quanto mais gente apoiar, mais rápido a prefeitura resolve.<br/>
          👉 cityhero.app/r/2847
        </div>
      </div>

      <div class="mx-4 mt-3 rounded-2xl p-3 bg-gradient-to-br from-violet-50 via-white to-amber-50 border border-violet-200 flex items-center gap-3">
        <div class="relative shrink-0">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-amber-400 flex items-center justify-center text-xl shadow-inner">🦸</div>
          <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-violet-200 flex items-center justify-center text-[9px] font-black text-violet-700">0/3</div>
        </div>
        <div class="flex-1 leading-tight">
          <div class="text-[11px] font-extrabold text-slate-900">Formador de Liga</div>
          <div class="text-[10px] text-slate-600">+20 XP por compartilhamento · 3 amigos que baixarem o app destravam a medalha</div>
        </div>
      </div>

      <div class="h-4"></div>
     </div>

      <div class="relative bg-white/95 backdrop-blur border-t border-slate-100 p-3 flex items-center gap-2 z-30">
        <button data-nav="goto" data-target="Detalhe · Em andamento" class="px-5 py-3 rounded-full bg-slate-100 text-slate-600 font-bold text-[12px]">Pular</button>
        <button data-nav="goto" data-target="Detalhe · Em andamento" class="flex-1 py-3 rounded-full font-extrabold text-white text-[13px] shadow-lg" style="background:linear-gradient(135deg,#7C3AED 0%,#F97316 100%)">
          🚀 Compartilhar & formar liga
        </button>
      </div>
    </div>`,
};
