import { statusBar } from '../atoms/StatusBar.js';

/** Tela 11 · Envio Anônimo (pós-envio paralelo · modo sombra) */
export default {
  title: 'Envio Anônimo',
  group: 'core',
  summary: 'Pós-envio anônimo · privado, sem apelo viral',
  note: `Versão alternativa da <b>Liga de Heróis</b> quando o toggle 🥷 estiver on na Confirmação do Reporte. Não pede compartilhamento social (contradiz o modo), mas oferece link anônimo compartilhável. Reforça o que o herói mantém (XP, titularidade, updates) e deixa transparente quem vê o nome real (só prefeitura, por LAI). CTA principal: acompanhar no Meus Reportes.`,
  html: () => `
    <div class="relative h-full bg-white flex flex-col overflow-hidden">
      ${statusBar('light')}

      <div class="relative px-4 pt-3 pb-5 text-white overflow-hidden shrink-0" style="background:linear-gradient(135deg,#0F172A 0%,#4C1D95 55%,#6366F1 100%)">
        <svg class="absolute -top-4 -right-6 opacity-[0.12]" width="180" height="180" viewBox="0 0 100 100" fill="none">
          <circle cx="80" cy="20" r="45" fill="white"/>
          <circle cx="60" cy="55" r="25" fill="white"/>
          <circle cx="90" cy="75" r="15" fill="white"/>
        </svg>
        <div class="relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl mb-3 ring-1 ring-white/20">🥷</div>
          <div class="text-[10px] font-black uppercase tracking-wider text-white/70">Protocolo #2847 · envio anônimo</div>
          <h1 class="text-[22px] font-extrabold mt-1 leading-[1.1]">Você age como ninja.<br>O problema foi exposto.</h1>
          <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-[11px] font-extrabold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            +50 XP · 🏅 Olho Vivo desbloqueada
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-24">

        <div>
          <div class="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Como aparece no feed público</div>
          <div class="rounded-2xl border border-slate-200 p-2.5 bg-white shadow-soft">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" style="background:linear-gradient(135deg,#1E293B,#0F172A)">🥷</span>
              <div class="flex-1 leading-tight min-w-0">
                <div class="text-[12px] font-extrabold text-slate-900">Herói Anônimo</div>
                <div class="text-[10px] text-slate-500 truncate">R. São Pedro, 320 · há 1 min</div>
              </div>
              <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">MODERADO</span>
            </div>
            <div class="h-20 rounded-lg bg-slate-200 overflow-hidden" style="background-image:url('feed-photos/buraco-report.png');background-size:cover;background-position:center"></div>
            <div class="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
              <span>👍 0 apoios</span>
              <span>💬 0</span>
              <span class="ml-auto text-emerald-600 font-bold">aberto</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
          <div class="flex items-center gap-1.5 mb-2.5">
            <span class="text-[10px] font-black uppercase tracking-wider text-emerald-700">O que você mantém</span>
          </div>
          <div class="grid grid-cols-2 gap-2.5 text-[12px]">
            ${[
              ['XP e medalhas',   'sem penalidade'],
              ['Atualizações',    'push a cada mudança'],
              ['Titularidade',    'só você edita'],
              ['Ranking e Liga',  'conta pro seu nível'],
            ].map(([title, sub]) => `
              <div class="flex items-start gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">✓</span>
                <div class="leading-tight">
                  <div class="font-extrabold text-slate-900">${title}</div>
                  <div class="text-[10px] text-slate-600">${sub}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="rounded-2xl p-3.5 bg-slate-50 border border-slate-200">
          <div class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2.5">Quem vê seu nome</div>
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-[12px]">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span class="font-bold text-slate-800">Prefeitura</span>
              <span class="text-[10px] text-slate-500">· obrigação legal (LAI)</span>
            </div>
            <div class="flex items-center gap-2 text-[12px]">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span class="font-bold text-slate-800">Você</span>
              <span class="text-[10px] text-slate-500">· em Meus Reportes</span>
            </div>
            <div class="pt-2.5 mt-2.5 border-t border-slate-200">
              <div class="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">NÃO vê</div>
              <div class="flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                <span class="px-2 py-0.5 rounded-lg bg-white border border-slate-200">Vizinhos no feed</span>
                <span class="px-2 py-0.5 rounded-lg bg-white border border-slate-200">Quem receber o link</span>
                <span class="px-2 py-0.5 rounded-lg bg-white border border-slate-200">Outros heróis</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl p-3.5 border border-violet-200" style="background:linear-gradient(135deg,rgba(124,58,237,0.06) 0%,rgba(99,102,241,0.06) 100%)">
          <div class="flex items-start gap-2 mb-2.5">
            <span class="text-lg">🔗</span>
            <div class="leading-tight flex-1">
              <div class="text-[12px] font-extrabold text-slate-900">Amplificar sem se expor</div>
              <div class="text-[10px] text-slate-600 mt-0.5">O link mostra "🥷 Herói Anônimo · R. São Pedro" — seu perfil fica fora.</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button class="py-2 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 active:scale-[.98]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2z"/></svg>
              WhatsApp
            </button>
            <button class="py-2 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 active:scale-[.98]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
              Copiar link
            </button>
          </div>
        </div>

        <button class="w-full text-center text-[11px] text-slate-500 py-2 leading-snug">
          Mudou de ideia? Dá pra <u class="text-violet-700 font-bold">tornar público</u> em Meus Reportes a qualquer momento.
        </button>
      </div>

      <div class="absolute bottom-0 left-0 right-0 pt-3 pb-3 px-4 bg-white border-t border-slate-100">
        <button data-nav="goto" data-target="Detalhe · Em andamento" class="w-full py-3 rounded-full font-extrabold text-white text-[13px] shadow-lg active:scale-[.99] transition" style="background:linear-gradient(135deg,#4C1D95 0%,#6366F1 100%)">
          Acompanhar reporte →
        </button>
      </div>
    </div>`
};
