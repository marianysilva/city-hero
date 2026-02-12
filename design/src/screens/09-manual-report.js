import { statusBar } from '../atoms/StatusBar.js';

/** Tela 09 · Reporte Manual (fallback da IA) */
export default {
  title: 'Reporte Manual',
  group: 'core',
  summary: 'Fallback quando IA não reconhece',
  note: `Quando o YOLOv8 não tem confiança alta (<60%), ou o usuário clica em "escolher manualmente", cai aqui. <b>Grid de 9 categorias</b> cobre o catálogo (features 11). Mini-mapa confirma localização. Footer reforça que a IA aprende a cada reporte — converte "falha" em "contribuição pro modelo".`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
      <div class="flex-1 min-h-0 overflow-y-auto">
        ${statusBar('dark')}
        <div class="px-4 flex items-center gap-3">
          <button class="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">←</button>
          <div>
            <div class="text-lg font-extrabold text-slate-900">Vamos juntos</div>
            <div class="text-[11px] text-slate-500 -mt-0.5">A IA ficou em dúvida. Escolha a categoria.</div>
          </div>
        </div>

        <div class="mx-4 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
          <span class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-sm">🤖</span>
          <div class="flex-1 leading-tight">
            <div class="text-[12px] font-extrabold text-amber-900">Confiança baixa · 42%</div>
            <div class="text-[11px] text-amber-800">A IA não bateu o martelo. Você confirma a categoria, a gente continua daqui.</div>
          </div>
        </div>

        <div class="mx-4 mt-3 flex gap-3">
          <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0" style="background-image:url('feed-photos/buraco-report.png');background-size:cover;background-position:center"></div>
          <div class="flex-1 flex flex-col justify-center text-[11px] text-slate-600 leading-snug">
            <div class="font-bold text-slate-900">Sua foto</div>
            <div class="text-slate-500">R. São Pedro, 320 · GPS 4m</div>
            <button class="text-brand-600 text-[11px] font-bold mt-0.5 text-left">Trocar foto</button>
          </div>
        </div>

        <div class="mx-4 mt-4">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Categoria</div>
          <div class="grid grid-cols-3 gap-2">
            ${[
              { ic: '🕳️', l: 'Buraco',        c: 'bg-amber-100 text-amber-800', active: true },
              { ic: '🗑️', l: 'Lixo',          c: 'bg-emerald-50 text-emerald-700' },
              { ic: '💡', l: 'Iluminação',    c: 'bg-yellow-50 text-yellow-700' },
              { ic: '🎨', l: 'Pichação',      c: 'bg-fuchsia-50 text-fuchsia-700' },
              { ic: '🚦', l: 'Semáforo',      c: 'bg-rose-50 text-rose-700' },
              { ic: '🌳', l: 'Árvore / Poda', c: 'bg-green-50 text-green-700' },
              { ic: '💧', l: 'Alagamento',    c: 'bg-sky-50 text-sky-700' },
              { ic: '🚧', l: 'Sinalização',   c: 'bg-orange-50 text-orange-700' },
              { ic: '➕', l: 'Outro',         c: 'bg-slate-100 text-slate-700' },
            ].map(cat => `
              <button class="relative p-3 rounded-xl ${cat.c} flex flex-col items-center gap-1 ${cat.active ? 'ring-2 ring-brand-500 bg-brand-50 text-brand-700' : ''}">
                <span class="text-xl">${cat.ic}</span>
                <span class="text-[10px] font-extrabold leading-tight text-center">${cat.l}</span>
                ${cat.active ? '<span class="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-black flex items-center justify-center">✓</span>' : ''}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="mx-4 mt-4 rounded-2xl overflow-hidden bg-white shadow-soft">
          <div class="relative h-28 bg-slate-100">
            <svg class="absolute inset-0" width="100%" height="100%" viewBox="0 0 272 112" preserveAspectRatio="none">
              <rect width="272" height="112" fill="#fafaf9"/>
              <g fill="#ebe1cf">
                <rect x="0"   y="0"  width="80" height="45"/>
                <rect x="88"  y="0"  width="88" height="45"/>
                <rect x="184" y="0"  width="88" height="45"/>
                <rect x="0"   y="53" width="80" height="59"/>
                <rect x="88"  y="53" width="88" height="59"/>
                <rect x="184" y="53" width="88" height="59"/>
              </g>
              <circle cx="136" cy="56" r="22" fill="#F97316" opacity="0.15"/>
              <circle cx="136" cy="56" r="10" fill="#F97316" opacity="0.35"/>
            </svg>
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-2xl">📍</div>
          </div>
          <div class="px-3 py-2 flex items-center justify-between text-[11px]">
            <div class="leading-tight">
              <div class="font-extrabold text-slate-900">R. São Pedro, 320</div>
              <div class="text-slate-500">Confirme ou arraste o pin</div>
            </div>
            <button class="text-brand-600 font-bold">Ajustar</button>
          </div>
        </div>

        <div class="h-3"></div>
      </div>

      <div class="relative bg-white/95 backdrop-blur border-t border-slate-100 p-3 z-30">
        <button data-nav="goto" data-target="Confirmação do Reporte" class="w-full py-3 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-extrabold shadow-lg">
          Continuar →
        </button>
        <p class="text-center text-[10px] text-slate-400 mt-2 leading-snug">
          🤖 A IA aprende com cada reporte manual. Obrigada!
        </p>
      </div>
    </div>`
};
