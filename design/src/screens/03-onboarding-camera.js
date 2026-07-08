import { statusBar } from "../atoms/StatusBar.js";

/** Tela 03 · Onboarding · Câmera IA */
export default {
  title: "Onboarding · Câmera IA",
  group: "onboarding",
  summary: "Explica a super-habilidade #1",
  note: `Mostra o "wow" de IA logo na entrada. Ilustração com bounding box reforça que <b>o usuário não precisa digitar categoria</b> — a IA faz.`,
  html: () => `
    <div class="relative h-full bg-gradient-to-b from-brand-50 to-white">
      ${statusBar("dark")}
      <div class="px-6 pt-2 flex items-center justify-between">
        <button data-nav="back" class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">←</button>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Passo 2 de 5</span>
      </div>

      <div class="relative mx-6 mt-4 rounded-3xl overflow-hidden h-72 shadow-xl bg-slate-900">
        <div class="absolute inset-x-0 top-0" style="height:30%; background: linear-gradient(180deg,#bae6fd 0%, #e0f2fe 55%, #f1f5f9 100%);"></div>

        <svg class="absolute inset-x-0" style="top:58px; height:32px;" viewBox="0 0 272 32" preserveAspectRatio="none">
          <path d="M0,32 L0,14 L18,14 L18,8 L32,8 L32,16 L50,16 L50,4 L64,4 L64,12 L80,12 L80,18 L98,18 L98,10 L116,10 L116,16 L136,16 L136,6 L156,6 L156,14 L176,14 L176,20 L194,20 L194,12 L212,12 L212,8 L232,8 L232,16 L254,16 L254,10 L272,10 L272,32 Z" fill="#475569"/>
        </svg>

        <div class="absolute" style="top:30%; bottom:0; left:0; right:0; background: linear-gradient(180deg,#d6d3d1 0%, #a8a29e 100%);"></div>
        <div class="absolute" style="top:30%; bottom:0; left:0; right:0; background: linear-gradient(180deg,#44403c 0%, #1c1917 100%); clip-path: polygon(35% 0, 65% 0, 100% 100%, 0 100%);"></div>

        <svg class="absolute inset-0" viewBox="0 0 272 288" preserveAspectRatio="none" style="width:100%; height:100%; pointer-events:none;">
          <line x1="0" y1="288" x2="95" y2="86" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
          <line x1="272" y1="288" x2="177" y2="86" stroke="rgba(255,255,255,0.55)" stroke-width="2"/>
          <line x1="136" y1="288" x2="136" y2="86" stroke="#fbbf24" stroke-width="5" stroke-dasharray="14 18" stroke-linecap="round"/>
        </svg>

        <svg class="absolute" style="bottom:72px; left:50%; transform:translateX(-50%); width:132px; height:58px;" viewBox="0 0 132 58">
          <defs>
            <radialGradient id="phGrad" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stop-color="#000"/>
              <stop offset="65%" stop-color="#0a0a0a"/>
              <stop offset="100%" stop-color="#1c1917" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <ellipse cx="66" cy="40" rx="54" ry="16" fill="#000" opacity=".45"/>
          <path d="M22,30 Q10,12 44,8 Q72,3 100,16 Q124,28 108,44 Q78,54 46,50 Q14,44 22,30 Z" fill="url(#phGrad)"/>
          <path d="M30,22 Q50,17 76,18" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <circle cx="60" cy="32" r="1.5" fill="#3f3f46" opacity=".8"/>
          <circle cx="78" cy="28" r="1" fill="#3f3f46" opacity=".6"/>
        </svg>

        <div class="absolute" style="top:54%; left:50%; transform:translateX(-50%); width:64%; height:30%;">
          <div class="absolute top-0 left-0 w-5 h-5" style="border-top:3px solid #22d3ee; border-left:3px solid #22d3ee; border-top-left-radius:4px;"></div>
          <div class="absolute top-0 right-0 w-5 h-5" style="border-top:3px solid #22d3ee; border-right:3px solid #22d3ee; border-top-right-radius:4px;"></div>
          <div class="absolute bottom-0 left-0 w-5 h-5" style="border-bottom:3px solid #22d3ee; border-left:3px solid #22d3ee; border-bottom-left-radius:4px;"></div>
          <div class="absolute bottom-0 right-0 w-5 h-5" style="border-bottom:3px solid #22d3ee; border-right:3px solid #22d3ee; border-bottom-right-radius:4px;"></div>
        </div>

        <div class="absolute bg-cyan-400 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1" style="top:50%; left:50%; transform:translate(-50%,-120%);">
          <span>🕳️</span> BURACO · 94%
        </div>

        <div class="absolute top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur text-white text-[9px] font-black tracking-wider flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> IA ATIVA
        </div>

        <div class="absolute bottom-4 left-3 px-2 py-1 rounded-md bg-emerald-500/95 text-white text-[9px] font-black flex items-center gap-1 shadow">
          <span>📍</span> GPS OK
        </div>
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-[3px] border-white bg-white/10 backdrop-blur shadow-lg flex items-center justify-center">
          <div class="w-9 h-9 rounded-full bg-white"></div>
        </div>
      </div>

      <div class="px-7 mt-6 text-center">
        <div class="text-3xl mb-1">📸</div>
        <h2 class="text-2xl font-extrabold text-slate-900 leading-tight">Aponte. A IA reconhece.</h2>
        <p class="text-slate-600 mt-2 leading-relaxed text-[13px]">
          Buraco, lixo, poste apagado, vandalismo — nossa IA reconhece
          <b>na hora</b> e preenche o reporte. Sem formulário gigante.
        </p>
      </div>

      <div class="absolute bottom-6 left-0 right-0 flex items-center justify-between px-7">
        <div class="flex gap-1.5">
          <span class="w-6 h-1.5 rounded-full bg-brand-500"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
        </div>
        <button data-nav="next" class="px-5 py-3 rounded-full bg-slate-900 text-white font-bold text-sm">Próximo →</button>
      </div>
    </div>`,
};
