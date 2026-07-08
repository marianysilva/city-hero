import { statusBar } from "../atoms/StatusBar.js";

/** Tela 05 · Onboarding · Seu bairro (feed hiperlocal + permissões) */
export default {
  title: "Onboarding · Seu bairro",
  group: "onboarding",
  summary: "Feed hiperlocal + permissões",
  note: `Último passo pede <b>permissões</b> (localização e câmera) em linguagem humana. Estado mostra 3 vizinhos reportando agora — prova social imediata.`,
  html: () => `
    <div class="relative h-full bg-gradient-to-b from-white to-sky-50">
      ${statusBar("dark")}
      <div class="px-6 pt-2 flex items-center justify-between">
        <button data-nav="back" class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">←</button>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Passo 5 de 5</span>
      </div>

      <div class="relative mx-6 mt-4 h-72 rounded-3xl overflow-hidden shadow-soft" style="background:#fafaf9;">
        <svg class="absolute inset-0" width="100%" height="100%" viewBox="0 0 272 288" preserveAspectRatio="none">
          <defs>
            <linearGradient id="seaGrad4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#bae6fd"/>
              <stop offset="100%" stop-color="#7dd3fc"/>
            </linearGradient>
            <linearGradient id="sandGrad4" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#fef3c7"/>
              <stop offset="100%" stop-color="#fde68a"/>
            </linearGradient>
            <g id="bldg">
              <polygon points="20,0 22,2 22,32 20,30" fill="#94a3b8"/>
              <polygon points="0,30 20,30 22,32 2,32" fill="#94a3b8"/>
              <rect x="0" y="0" width="20" height="30" rx="1.2" fill="#e5e7eb" stroke="#cbd5e1" stroke-width="0.5"/>
              <rect x="3" y="3" width="3" height="2" fill="#cbd5e1" opacity="0.8"/>
              <rect x="9" y="3" width="3" height="2" fill="#cbd5e1" opacity="0.8"/>
            </g>
            <g id="tree4">
              <ellipse cx="0" cy="2.5" rx="3.2" ry="1" fill="#14532d" opacity="0.3"/>
              <circle cx="0" cy="0" r="3.5" fill="#4ade80"/>
              <circle cx="-1" cy="-0.8" r="1.5" fill="#86efac"/>
            </g>
          </defs>
          <rect width="272" height="288" fill="#fafaf9"/>
          <g fill="#ebe1cf">
            <rect x="0"   y="0"   width="62" height="84"/>
            <rect x="70"  y="0"   width="54" height="84"/>
            <rect x="132" y="0"   width="54" height="84"/>
            <rect x="0"   y="92"  width="62" height="80"/>
            <rect x="70"  y="92"  width="54" height="80"/>
            <rect x="132" y="92"  width="54" height="80"/>
            <rect x="0"   y="180" width="62" height="108"/>
            <rect x="70"  y="180" width="54" height="108"/>
            <rect x="132" y="180" width="54" height="108"/>
          </g>
          <rect x="248" y="0" width="24" height="288" fill="url(#seaGrad4)"/>
          <path d="M214,0 Q220,70 212,140 Q208,210 216,288 L248,288 L248,0 Z" fill="url(#sandGrad4)"/>
          <g stroke="#fff" stroke-width="1" fill="none" opacity="0.9">
            <path d="M252,34 Q256,30 260,34 T268,34"/>
            <path d="M252,96 Q256,92 260,96 T268,96"/>
            <path d="M252,158 Q256,154 260,158 T268,158"/>
            <path d="M252,222 Q256,218 260,222 T268,222"/>
            <path d="M252,274 Q256,270 260,274 T268,274"/>
          </g>
          <rect x="186" y="0" width="22" height="288" fill="#f5f5f4"/>
          <line x1="197" y1="0" x2="197" y2="288" stroke="#fde68a" stroke-width="0.8" stroke-dasharray="6 8"/>
          <g fill="#94a3b8" opacity="0.65">
            <path d="M191,36 L194,40 L188,40 Z"/>
            <path d="M191,108 L194,112 L188,112 Z"/>
            <path d="M191,180 L194,184 L188,184 Z"/>
            <path d="M191,252 L194,256 L188,256 Z"/>
          </g>
          <use href="#bldg" transform="translate(6,8) scale(0.8,0.7)"/>
          <use href="#bldg" transform="translate(32,10) scale(0.65,0.9)"/>
          <use href="#bldg" transform="translate(6,40) scale(1,0.85)"/>
          <use href="#bldg" transform="translate(36,44) scale(0.75,0.8)"/>
          <use href="#bldg" transform="translate(72,8) scale(0.55,0.6)"/>
          <use href="#bldg" transform="translate(88,6) scale(0.45,0.55)"/>
          <use href="#bldg" transform="translate(108,10) scale(0.5,0.5)"/>
          <g transform="translate(80,34)">
            <polygon points="32,0 34,2 34,40 32,38" fill="#a3a3a3"/>
            <polygon points="0,38 32,38 34,40 2,40" fill="#a3a3a3"/>
            <rect x="0" y="0" width="32" height="38" rx="1.5" fill="#f1f5f4" stroke="#d6d3d1" stroke-width="0.6"/>
            <polygon points="-2,2 16,-8 34,2" fill="#d6d3d1" stroke="#a3a3a3" stroke-width="0.4"/>
            <line x1="5"  y1="6" x2="5"  y2="34" stroke="#a3a3a3" stroke-width="1"/>
            <line x1="12" y1="6" x2="12" y2="34" stroke="#a3a3a3" stroke-width="1"/>
            <line x1="20" y1="6" x2="20" y2="34" stroke="#a3a3a3" stroke-width="1"/>
            <line x1="27" y1="6" x2="27" y2="34" stroke="#a3a3a3" stroke-width="1"/>
            <line x1="16" y1="-14" x2="16" y2="-4" stroke="#475569" stroke-width="0.6"/>
            <path d="M16,-14 L23,-12 L16,-10 Z" fill="#22c55e"/>
          </g>
          <use href="#bldg" transform="translate(136,8) scale(0.8,0.7)"/>
          <use href="#bldg" transform="translate(160,10) scale(0.7,0.75)"/>
          <use href="#bldg" transform="translate(136,42) scale(0.65,0.75)"/>
          <use href="#bldg" transform="translate(156,40) scale(0.9,0.85)"/>
          <path d="M6,94 Q0,118 4,142 Q2,160 18,168 Q40,174 56,162 Q62,142 58,122 Q56,100 42,96 Q22,92 6,94 Z" fill="#bbf7d0"/>
          <use href="#tree4" transform="translate(16,110)"/>
          <use href="#tree4" transform="translate(38,116) scale(1.2)"/>
          <use href="#tree4" transform="translate(24,134) scale(1.1)"/>
          <use href="#tree4" transform="translate(48,144)"/>
          <use href="#tree4" transform="translate(20,156) scale(1.1)"/>
          <rect x="28" y="126" width="12" height="1.8" rx="0.9" fill="#78350f" opacity="0.8"/>
          <use href="#bldg" transform="translate(72,96) scale(0.55,0.75)"/>
          <use href="#bldg" transform="translate(94,98) scale(0.6,0.8)"/>
          <use href="#bldg" transform="translate(72,130) scale(0.7,0.85)"/>
          <use href="#bldg" transform="translate(100,134) scale(0.5,0.75)"/>
          <use href="#bldg" transform="translate(134,94) scale(0.55,0.7)"/>
          <use href="#bldg" transform="translate(154,96) scale(0.55,0.7)"/>
          <g transform="translate(134,130)">
            <polygon points="22,0 24,2 24,32 22,30" fill="#94a3b8"/>
            <polygon points="0,30 22,30 24,32 2,32" fill="#94a3b8"/>
            <rect x="0" y="0" width="22" height="30" rx="1.2" fill="#fef2f2" stroke="#fca5a5" stroke-width="0.5"/>
          </g>
          <use href="#bldg" transform="translate(160,128) scale(0.7,0.8)"/>
          <use href="#bldg" transform="translate(6,196) scale(0.9,0.7)"/>
          <use href="#bldg" transform="translate(34,198) scale(0.75,0.8)"/>
          <use href="#bldg" transform="translate(6,230) scale(0.6,1)"/>
          <use href="#bldg" transform="translate(30,234) scale(0.85,0.95)"/>
          <use href="#bldg" transform="translate(10,270) scale(0.5,0.5)"/>
          <path d="M74,194 Q66,222 78,252 Q94,274 114,272 Q130,266 126,244 Q130,220 112,200 Q94,190 74,194 Z" fill="#bbf7d0"/>
          <circle cx="98" cy="234" r="22" fill="#86efac"/>
          <circle cx="98" cy="234" r="3.5" fill="#16a34a"/>
          <rect x="88" y="230" width="18" height="2" rx="1" fill="#78350f" opacity="0.8"/>
          <use href="#tree4" transform="translate(80,204)"/>
          <use href="#tree4" transform="translate(120,214)"/>
          <use href="#tree4" transform="translate(76,258) scale(1.1)"/>
          <use href="#tree4" transform="translate(118,260) scale(1.1)"/>
          <use href="#bldg" transform="translate(136,196) scale(0.85,0.75)"/>
          <use href="#bldg" transform="translate(162,198) scale(0.7,0.8)"/>
          <use href="#bldg" transform="translate(136,232) scale(0.7,0.95)"/>
          <use href="#bldg" transform="translate(160,234) scale(0.9,0.9)"/>
          <use href="#bldg" transform="translate(140,274) scale(0.55,0.4)"/>
          <use href="#tree4" transform="translate(220,18) scale(1.3)"/>
          <use href="#tree4" transform="translate(223,70) scale(1.25)"/>
          <use href="#tree4" transform="translate(220,128) scale(1.3)"/>
          <use href="#tree4" transform="translate(223,186) scale(1.25)"/>
          <use href="#tree4" transform="translate(220,240) scale(1.3)"/>
          <use href="#tree4" transform="translate(223,276) scale(1.25)"/>
          <text x="10" y="90" fill="#475569" font-size="5.5" font-weight="800" letter-spacing="0.4">R. DAS FLORES</text>
          <text x="10" y="186" fill="#475569" font-size="5.5" font-weight="800" letter-spacing="0.4">AV. CENTRAL</text>
          <g transform="translate(72,144) rotate(-90)"><text x="0" y="0" fill="#475569" font-size="5.5" font-weight="800" letter-spacing="0.4">R. SÃO PEDRO</text></g>
          <g transform="translate(194,150) rotate(-90)"><text x="0" y="0" fill="#475569" font-size="6"   font-weight="800" letter-spacing="0.4">AV. ATLÂNTICA</text></g>
        </svg>

        <div class="absolute flex flex-col items-center" style="top:34px; left:84px;">
          <div class="mt-1 px-1.5 py-0.5 rounded bg-white/95 shadow border border-slate-100 text-[8px] font-black text-slate-700 leading-none whitespace-nowrap">Prefeitura</div>
        </div>
        <div class="absolute flex flex-col items-center" style="top:164px; left:140px;">
          <div class="w-6 h-6 rounded-md bg-yellow-400 shadow border border-white flex items-center justify-center text-[10px]">🛡️</div>
        </div>

        <div class="absolute" style="top:178px; left:120px;"><div class="pulse-dot"></div></div>

        <div class="pin"    style="background:#EF4444;top:68px;left:62px"><span>🕳️</span></div>
        <div class="pin sm" style="background:#10B981;top:172px;left:42px"><span>🗑️</span></div>
        <div class="pin sm" style="background:#0EA5E9;top:40px;left:172px"><span>💡</span></div>
        <div class="pin sm" style="background:#A855F7;top:120px;left:188px"><span>🎨</span></div>

        <div class="absolute bg-white rounded-lg px-2 py-1 shadow-md border border-slate-100 whitespace-nowrap" style="top:92px; left:78px;">
          <div class="text-[9px] font-black text-slate-800 leading-tight">Buraco</div>
          <div class="text-[7.5px] text-slate-500 font-semibold leading-tight">R. das Flores · 2d</div>
        </div>

        <div class="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-xl p-3 shadow border border-slate-100 flex items-center gap-3">
          <div class="flex -space-x-2">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-2 border-white"></div>
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 border-2 border-white"></div>
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 border-2 border-white"></div>
          </div>
          <div class="text-[11px] text-slate-700 leading-tight">
            <b>3 vizinhos</b> estão reportando<br/>perto de você agora.
          </div>
        </div>
      </div>

      <div class="px-7 mt-6 text-center">
        <h2 class="text-2xl font-extrabold text-slate-900 leading-tight">Seu bairro, em tempo real.</h2>
        <p class="text-slate-600 mt-2 leading-relaxed text-[13px]">
          Apoie problemas que te afetam, veja cada "antes → depois"
          e fique de olho em <b>obras, programas e orçamento</b> da prefeitura.
        </p>
      </div>

      <div class="absolute bottom-6 left-0 right-0 flex items-center justify-between px-7">
        <div class="flex gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span class="w-6 h-1.5 rounded-full bg-brand-500"></span>
        </div>
        <button data-nav="next" class="px-5 py-3 rounded-full bg-brand-500 text-white font-bold text-sm shadow">Permitir &amp; continuar</button>
      </div>
    </div>`,
};
