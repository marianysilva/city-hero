import { statusBar } from '../atoms/StatusBar.js';
import { staticBottomNav } from '../organisms/BottomNav.js';

/** Tela 20 · Perfil da Cidade (dashboard de transparência) */
export default {
  title: 'Perfil da Cidade',
  group: 'core',
  summary: 'Dashboard de transparência · só números',
  note: `Painel de <b>transparência cívica em números</b>. Complementa a Tela 18 (Serviços & Obras = lista operacional) mostrando os <b>macros</b>: obras ativas, orçamento executado, impacto real no ano (buracos tapados, árvores plantadas, km de asfalto). Vira ferramenta política — o cidadão abre e vê de relance o que a prefeitura entregou. Conecta-se ao feature "Transparency Portal (Public View)".`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">

      <div class="relative h-52 overflow-hidden" style="background:linear-gradient(135deg,#7C3AED 0%,#F97316 55%,#F59E0B 100%)">
        <svg class="absolute bottom-0 left-0 w-full" viewBox="0 0 320 60" preserveAspectRatio="none" style="height:60px">
          <path d="M0,40 Q80,20 160,30 T320,25 L320,60 L0,60 Z" fill="rgba(255,255,255,0.15)"/>
          <path d="M0,50 Q80,35 160,45 T320,40 L320,60 L0,60 Z" fill="rgba(255,255,255,0.2)"/>
        </svg>
        ${statusBar('light')}
        <div class="absolute top-11 left-4 right-4 flex items-center justify-between">
          <button class="w-9 h-9 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center">←</button>
          <button class="w-9 h-9 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center">📤</button>
        </div>
        <div class="absolute bottom-5 left-4 right-4 text-white">
          <div class="text-[10px] font-black tracking-wider opacity-80">SANTA CATARINA · BRASIL</div>
          <div class="text-2xl font-extrabold leading-tight">Pôrto Belo</div>
          <div class="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur text-[10px] font-bold">
            <span>🦸</span> Cidade CityHero · desde mar/2025
          </div>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sobre a cidade</div>
        <div class="text-[12px] text-slate-700 leading-relaxed">
          Cidade litorânea com <b>22.456 habitantes</b> e 92 km² divididos em 18 bairros. Guarda praias, a Ilha de Pôrto Belo e forte tradição açoriana. Referência em turismo no litoral norte catarinense.
        </div>
      </div>

      <div class="mx-4 mt-3 grid grid-cols-4 gap-2">
        ${[
          ['22k','Habitantes','text-slate-900'],
          ['3,4k','Heróis','text-brand-600'],
          ['18','Bairros','text-slate-900'],
          ['92','km²','text-slate-900'],
        ].map(([n,l,c]) => `
          <div class="bg-white rounded-xl p-2.5 text-center shadow-soft">
            <div class="text-[16px] font-black ${c}">${n}</div>
            <div class="text-[9px] font-bold text-slate-500 uppercase leading-tight">${l}</div>
          </div>`).join('')}
      </div>

      <div class="mx-4 mt-3 rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
        <div class="flex items-center gap-2">
          <span class="text-2xl">📈</span>
          <div class="flex-1">
            <div class="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Juntos, este ano</div>
            <div class="font-extrabold text-slate-900 text-[14px] leading-tight">Sua cidade está <span class="text-emerald-600">23% melhor</span></div>
          </div>
        </div>
        <div class="mt-2.5 text-[11px] text-slate-700 leading-snug">
          Problemas abertos caíram <b>23%</b> vs. mês passado. Tempo médio de resolução: <b>4,2 dias</b> (antes: 7,8).
        </div>
        <div class="mt-3 flex items-end gap-1 h-10">
          ${[85, 78, 72, 68, 55, 47].map((v, i) => `
            <div class="flex-1 rounded-t" style="height:${v}%;background-color:${i < 3 ? '#A7F3D0' : i < 5 ? '#34D399' : '#10B981'}"></div>
          `).join('')}
        </div>
        <div class="flex justify-between text-[9px] font-bold text-slate-400 mt-0.5">
          <span>Nov</span><span>Dez</span><span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span>
        </div>
      </div>

      <div class="mx-4 mt-3">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Situação dos reportes</div>
        <div class="grid grid-cols-2 gap-2">
          ${[
            ['🚨','bg-rose-100','126','text-rose-600','Abertos','Aguardando análise'],
            ['🔍','bg-sky-100','34','text-sky-600','Em triagem','IA classificando'],
            ['🛠️','bg-amber-100','89','text-amber-600','Em andamento','Equipes em campo'],
            ['✅','bg-emerald-100','3.241','text-emerald-600','Resolvidos','Este ano'],
          ].map(([ic,bg,n,cn,t,s]) => `
            <div class="bg-white rounded-2xl p-3 shadow-soft">
              <div class="flex items-center justify-between">
                <div class="w-8 h-8 rounded-lg ${bg} flex items-center justify-center text-sm">${ic}</div>
                <div class="text-[20px] font-black ${cn}">${n}</div>
              </div>
              <div class="text-[12px] font-bold text-slate-800 mt-1">${t}</div>
              <div class="text-[10px] text-slate-500">${s}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="mx-4 mt-3">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Obras & orçamento · 2026</div>
        <div class="grid grid-cols-2 gap-2">
          ${[
            ['🏗️','bg-indigo-100','12','text-indigo-600','Obras ativas','6 concluídas no ano'],
            ['💰','bg-violet-100','<span class="text-[11px] opacity-60 font-bold mr-0.5">R$</span>2,3M','text-violet-600','Investido','68% do orçamento'],
            ['📊','bg-sky-100','58%','text-sky-600','Progresso médio','obras em execução'],
            ['⏱️','bg-emerald-100','142d','text-emerald-600','Prazo médio','pra entregar uma obra'],
          ].map(([ic,bg,n,cn,t,s]) => `
            <div class="bg-white rounded-2xl p-3 shadow-soft">
              <div class="flex items-center justify-between">
                <div class="w-8 h-8 rounded-lg ${bg} flex items-center justify-center text-sm">${ic}</div>
                <div class="text-[20px] font-black ${cn}">${n}</div>
              </div>
              <div class="text-[12px] font-bold text-slate-800 mt-1">${t}</div>
              <div class="text-[10px] text-slate-500">${s}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center justify-between mb-3">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Impacto em 2026</div>
          <div class="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">ATÉ ABR</div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          ${[
            { ic: '🕳️', n: '328',  l: 'Buracos tapados' },
            { ic: '💡', n: '96',   l: 'Postes repostos' },
            { ic: '🗑️', n: '127t', l: 'Lixo coletado' },
            { ic: '🌳', n: '840',  l: 'Árvores plantadas' },
            { ic: '🛣️', n: '14km', l: 'Asfalto novo' },
            { ic: '🎨', n: '89',   l: 'Pichações limpas' },
          ].map(m => `
            <div class="p-2 rounded-xl bg-slate-50 text-center">
              <div class="text-xl leading-none">${m.ic}</div>
              <div class="text-[15px] font-black text-slate-900 mt-1 leading-none">${m.n}</div>
              <div class="text-[9px] font-bold text-slate-500 uppercase leading-tight mt-1">${m.l}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center justify-between mb-3">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gestão atual</div>
          <div class="text-[10px] font-black text-slate-500">2025 — 2028</div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-civic-purple flex items-center justify-center text-white font-black">RD</div>
          <div class="flex-1">
            <div class="font-extrabold text-slate-900 text-[13px]">Ricardo Dequech</div>
            <div class="text-[10px] text-slate-500">Prefeito</div>
          </div>
          <button class="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider">Contato</button>
        </div>
        <div class="my-2.5 border-t border-slate-100"></div>
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-full flex items-center justify-center text-white font-black" style="background:linear-gradient(135deg,#0EA5E9,#10B981)">JB</div>
          <div class="flex-1">
            <div class="font-extrabold text-slate-900 text-[13px]">Juliana Brandão</div>
            <div class="text-[10px] text-slate-500">Vice-prefeita</div>
          </div>
          <button class="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider">Contato</button>
        </div>
      </div>

      <div class="mx-4 mt-3 mb-4 rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">🦸</span>
          <div class="flex-1">
            <div class="text-[10px] text-white/70 font-black uppercase tracking-wider">Sua contribuição</div>
            <div class="font-extrabold text-[13px] leading-tight">Você ajudou Pôrto Belo com <span class="text-brand-300">12 reportes</span> este ano.</div>
          </div>
        </div>
        <button class="mt-3 w-full py-2.5 rounded-full bg-white text-slate-900 font-extrabold text-[12px]">Ver conquistas coletivas →</button>
      </div>
     </div>

      ${staticBottomNav('more')}
    </div>`
};
