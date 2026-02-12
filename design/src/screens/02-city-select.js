import { statusBar } from '../atoms/StatusBar.js';
import { searchBar } from '../atoms/SearchBar.js';

/** Tela 02 · Escolher Cidade */
export default {
  title: 'Escolher Cidade',
  group: 'onboarding',
  summary: 'First-run multi-tenant · detecta ou escolhe',
  note: `App detecta a cidade pelo GPS automaticamente. <b>Pôrto Belo</b> é a cidade piloto (badge "Ativa"). Outras cidades SC aparecem como "Em breve" (prova social de expansão). Usuário pode trocar a qualquer momento em "Perfil da Cidade". Essencial pra arquitetura multi-tenant (cores, serviços e prefeitura mudam por cidade).`,
  html: () => `
    <div class="relative h-full bg-gradient-to-b from-white to-brand-50">
      ${statusBar('dark')}
      <div class="px-6 pt-2 flex items-center justify-between">
        <button class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">←</button>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Passo 1 de 5</span>
      </div>

      <div class="mx-6 mt-5 p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-civic-purple text-white shadow-lg relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10"></div>
        <div class="absolute -right-10 -bottom-8 w-28 h-28 rounded-full bg-white/10"></div>
        <div class="relative">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">📍</span>
            <div class="text-[10px] font-black uppercase tracking-wider text-white/80">Detectamos</div>
          </div>
          <div class="mt-2 text-lg font-extrabold">Pôrto Belo, SC</div>
          <div class="text-[11px] text-white/80">Precisão GPS · 8m</div>
          <button data-nav="next" class="mt-3 w-full py-2.5 rounded-xl bg-white text-brand-700 font-extrabold text-[13px] shadow">
            Confirmar ✓
          </button>
        </div>
      </div>

      <div class="mx-6 mt-4">
        ${searchBar('Buscar outra cidade…')}
      </div>

      <div class="mx-6 mt-3 space-y-2">
        <div class="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-brand-200 ring-2 ring-brand-100">
          <span class="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center text-lg">🏖️</span>
          <div class="flex-1 min-w-0">
            <div class="font-extrabold text-slate-900 text-[13px]">Pôrto Belo · SC</div>
            <div class="text-[10px] text-slate-500">Piloto oficial · 18mil cidadãos</div>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">ATIVA</span>
        </div>

        ${[
          { flag: '🏝️', name: 'Bombinhas · SC',            sub: 'Em conversa com a prefeitura' },
          { flag: '⛵', name: 'Itapema · SC',              sub: 'Piloto iniciando em maio' },
          { flag: '🏙️', name: 'Balneário Camboriú · SC',   sub: 'Lista de espera' },
        ].map(c => `
          <div class="flex items-center gap-3 p-2.5 rounded-xl bg-white/60 border border-slate-200 opacity-70">
            <span class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg">${c.flag}</span>
            <div class="flex-1 min-w-0">
              <div class="font-extrabold text-slate-700 text-[13px]">${c.name}</div>
              <div class="text-[10px] text-slate-500">${c.sub}</div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black">EM BREVE</span>
          </div>
        `).join('')}
      </div>

      <div class="absolute bottom-4 left-0 right-0 px-6">
        <p class="text-center text-[10px] text-slate-400 leading-snug">
          Viajando? Troque a cidade em <b>Perfil da Cidade</b>.
        </p>
      </div>
    </div>`
};
