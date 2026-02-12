import { statusBar } from '../atoms/StatusBar.js';
import { staticBottomNav } from '../organisms/BottomNav.js';

/** Tela 22 · Detalhe do Programa · Bolsa Família (gráficos + denunciar) */
const evolBars = [980, 1020, 1085, 1140, 1200, 1240];
const maxEvol  = Math.max(...evolBars);
const linePts  = [320, 328, 342, 356, 370, 380];
const maxLine  = Math.max(...linePts);
const svgW = 280, svgH = 70, svgPad = 6;

const linePath = linePts.map((v, i) => {
  const x = svgPad + (i / (linePts.length - 1)) * (svgW - svgPad * 2);
  const y = svgH - svgPad - (v / maxLine) * (svgH - svgPad * 2);
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ');

const areaPath = linePath + ` L${svgW - svgPad},${svgH - svgPad} L${svgPad},${svgH - svgPad} Z`;

export default {
  title: 'Detalhe · Bolsa Família',
  group: 'support',
  summary: 'Programa · gráficos · denunciar irregularidade',
  note: `Tela piloto de detalhe de programa. Usa <b>dados agregados</b> (nunca lista CPF, mesmo sendo nominalmente público) para reduzir risco de xenofobia/vingança contra beneficiários. Dois gráficos: <b>evolução de famílias</b> por semestre (6 barras) e <b>valor distribuído</b> mensal (linha estilizada com área). Bloco de <b>critérios de elegibilidade</b> com os cortes atuais do MDS. Bloco <b>"Como é fiscalizado"</b> explicando o papel de CadÚnico, CRAS, CGU. Dois CTAs competem pela atenção: <b>"Abrir Portal da Transparência"</b> (cinza — saída pra webview oficial) e <b>"Denunciar irregularidade"</b> (vermelho — vai pra Tela C). Rodapé com disclaimer legal sobre denúncia caluniosa (Art. 339 CP).`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="relative overflow-hidden pb-4" style="background:linear-gradient(135deg,#0EA5E9 0%,#0F766E 100%)">
        ${statusBar('light')}
        <div class="px-4 flex items-center justify-between">
          <button data-nav="prev" class="w-9 h-9 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center">←</button>
          <div class="flex gap-2">
            <button class="w-9 h-9 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center" title="Compartilhar" aria-label="Compartilhar">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </button>
          </div>
        </div>
        <div class="px-4 mt-3">
          <div class="inline-flex items-center gap-1.5">
            <span class="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black tracking-wider text-white">FEDERAL</span>
            <span class="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black tracking-wider text-white">SOCIAL</span>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <span class="text-3xl">🤝</span>
            <div class="flex-1 leading-tight">
              <div class="text-2xl font-extrabold text-white">Bolsa Família</div>
              <div class="text-[11px] text-white/85">Transferência condicionada de renda · MDS · Caixa Econômica</div>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-1.5">
            <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-2">
              <div class="text-[15px] font-black text-white leading-none">1.240</div>
              <div class="text-[8px] font-bold uppercase text-white/80 mt-1">famílias</div>
            </div>
            <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-2">
              <div class="text-[15px] font-black text-white leading-none"><span class="text-[9px] opacity-70 font-bold mr-0.5">R$</span>380k</div>
              <div class="text-[8px] font-bold uppercase text-white/80 mt-1">repasse/mês</div>
            </div>
            <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-2">
              <div class="text-[15px] font-black text-white leading-none"><span class="text-[9px] opacity-70 font-bold mr-0.5">R$</span>306</div>
              <div class="text-[8px] font-bold uppercase text-white/80 mt-1">ticket médio</div>
            </div>
          </div>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Famílias beneficiadas</div>
            <div class="text-[13px] font-extrabold text-slate-900 mt-0.5">Últimos 6 semestres</div>
          </div>
          <div class="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">+26% em 3 anos</div>
        </div>
        <div class="mt-3 flex items-end gap-1.5 h-24">
          ${evolBars.map(v => `
            <div class="flex-1 flex flex-col items-center gap-1">
              <div class="text-[9px] font-black text-slate-600">${(v / 1000).toFixed(2).replace('.', ',')}k</div>
              <div class="w-full rounded-t" style="height:${(v / maxEvol) * 100}%;background:linear-gradient(180deg,#38BDF8,#0EA5E9)"></div>
            </div>
          `).join('')}
        </div>
        <div class="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
          <span>23/2</span><span>24/1</span><span>24/2</span><span>25/1</span><span>25/2</span><span>26/1</span>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valor distribuído</div>
            <div class="text-[13px] font-extrabold text-slate-900 mt-0.5">R$ mil · últimos 6 meses</div>
          </div>
          <div class="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">+19% em 6m</div>
        </div>
        <svg viewBox="0 0 ${svgW} ${svgH}" class="w-full mt-3" preserveAspectRatio="none">
          <defs>
            <linearGradient id="bfArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"   stop-color="#0EA5E9" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="${areaPath}" fill="url(#bfArea)"/>
          <path d="${linePath}" fill="none" stroke="#0EA5E9" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
          ${linePts.map((v, i) => {
            const x = svgPad + (i / (linePts.length - 1)) * (svgW - svgPad * 2);
            const y = svgH - svgPad - (v / maxLine) * (svgH - svgPad * 2);
            return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="#fff" stroke="#0EA5E9" stroke-width="1.5"/>`;
          }).join('')}
        </svg>
        <div class="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
          <span>Nov</span><span>Dez</span><span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">✅</span>
          <div class="text-[13px] font-extrabold text-slate-900">Critérios de elegibilidade</div>
        </div>
        <ul class="space-y-2 text-[11px] text-slate-700 leading-snug">
          <li class="flex gap-2"><span class="text-emerald-600 font-black">›</span><span>Renda familiar <b>per capita de até R$ 218/mês</b> (critério de pobreza).</span></li>
          <li class="flex gap-2"><span class="text-emerald-600 font-black">›</span><span>Cadastro atualizado no <b>CadÚnico</b> há menos de 24 meses.</span></li>
          <li class="flex gap-2"><span class="text-emerald-600 font-black">›</span><span>Crianças com <b>frequência escolar ≥ 85%</b> e vacinação em dia.</span></li>
          <li class="flex gap-2"><span class="text-emerald-600 font-black">›</span><span>Pré-natal e acompanhamento de <b>gestantes e nutrizes</b>.</span></li>
        </ul>
        <button class="mt-3 text-[10px] font-extrabold text-brand-600 uppercase tracking-wider">Ver regras completas →</button>
      </div>

      <div class="mx-4 mt-3 bg-slate-900 text-white rounded-2xl p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">🛡️</span>
          <div class="text-[13px] font-extrabold">Como é fiscalizado</div>
        </div>
        <div class="text-[11px] text-white/80 leading-snug">
          O <b>CRAS</b> acompanha as famílias no território · a <b>CGU</b> audita desvios e cortes indevidos · o <b>MDS</b> cruza dados com Receita, INSS e folha de emprego · <b>CityHero</b> é um canal adicional, não substitui os oficiais.
        </div>
        <div class="mt-2.5 flex flex-wrap gap-1.5">
          <span class="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-black tracking-wider">CadÚnico</span>
          <span class="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-black tracking-wider">CRAS</span>
          <span class="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-black tracking-wider">CGU</span>
          <span class="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-black tracking-wider">MP</span>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-3 shadow-soft flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-lg">🏛️</div>
        <div class="flex-1 leading-tight">
          <div class="text-[12px] font-extrabold text-slate-900">Portal da Transparência</div>
          <div class="text-[10px] text-slate-500">Dados oficiais do Governo Federal</div>
        </div>
        <button class="px-3 py-1.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px]">Abrir ↗</button>
      </div>

      <button data-nav="goto" data-target="Denunciar irregularidade" class="mx-4 mt-3 block w-[calc(100%-32px)] text-left rounded-2xl overflow-hidden shadow-soft active:scale-[.99] transition bg-gradient-to-br from-rose-500 to-red-600 text-white p-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">🚨</div>
          <div class="flex-1 leading-tight">
            <div class="font-extrabold text-[14px]">Denunciar irregularidade</div>
            <div class="text-[10px] text-white/90 mt-0.5">Suspeita de fraude, desvio ou cadastro indevido?</div>
          </div>
          <span class="text-xl">→</span>
        </div>
      </button>

      <div class="mx-4 mt-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
        <span class="text-sm">⚠️</span>
        <div class="text-[10px] text-amber-900 leading-snug">
          Denúncia caluniosa pode configurar <b>crime (Art. 339 do Código Penal)</b>. Só envie se tiver indícios reais. Dados pessoais são protegidos pela <b>LGPD</b> — não é possível consultar beneficiários por nome aqui.
        </div>
      </div>
     </div>

      ${staticBottomNav('more')}
    </div>`
};
