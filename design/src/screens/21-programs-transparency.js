import { statusBar } from '../atoms/StatusBar.js';
import { staticBottomNav } from '../organisms/BottomNav.js';

/** Molecule local · ProgramCard — usado só neste hub. */
const fmtMetric = (m) => m.startsWith('R$ ')
  ? `<span class="text-[9px] opacity-60 font-bold mr-0.5">R$</span>${m.slice(3)}`
  : m;

const progCard = ({ emoji, iconBg, level, levelColor, name, metric, metricColor, subtitle, target }) => `
  <button ${target ? `data-nav="goto" data-target="${target}"` : ''} class="text-left bg-white rounded-2xl p-3 shadow-soft flex flex-col gap-1.5 active:scale-[.98] transition">
    <div class="flex items-start justify-between">
      <div class="w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center text-[17px]">${emoji}</div>
      <span class="px-1.5 py-0.5 rounded-full text-[8px] font-black tracking-wider ${levelColor}">${level}</span>
    </div>
    <div class="text-[12px] font-extrabold text-slate-900 leading-tight mt-1">${name}</div>
    <div class="text-[16px] font-black ${metricColor} leading-none">${fmtMetric(metric)}</div>
    <div class="text-[9px] text-slate-500 leading-tight">${subtitle}</div>
  </button>`;

/** Tela 21 · Programas & Transparência (hub de controle social) */
export default {
  title: 'Programas & Transparência',
  group: 'support',
  summary: 'Hub de programas públicos · dados abertos',
  note: `Hub que reúne <b>todos os programas sociais e repasses</b> que passam pela prefeitura — federal, estadual e municipal. Objetivo: transformar o app num <b>canal de controle social</b>. Cada card puxa dados do <b>Portal da Transparência</b> + dados cedidos pela prefeitura (via convênio Open Data). Bolsa Família vira o piloto porque o cadastro é nominalmente público (STF MS 36.020/2020). Cards menores (BPC, Merenda, Habitação) abrem detalhes semelhantes, só que com menos granularidade quando o dado individual é protegido por LGPD. Cada detalhe tem uma CTA <b>"Denunciar irregularidade"</b> que orquestra para CGU, Ministério Público e Ouvidoria — CityHero não armazena a denúncia, só rotea.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto pb-24">
      ${statusBar('dark')}

      <div class="px-4 flex items-center gap-3">
        <button class="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center">←</button>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Controle social</div>
          <div class="text-xl font-extrabold text-slate-900">Programas & transparência</div>
        </div>
        <button class="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center" title="Compartilhar" aria-label="Compartilhar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-600"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </button>
      </div>

      <div class="mx-4 mt-2 p-3.5 rounded-2xl text-white shadow-soft" style="background:linear-gradient(135deg,#0F766E 0%,#6366F1 100%)">
        <div class="flex items-center gap-2">
          <span class="text-xl">🔍</span>
          <div class="flex-1 leading-tight">
            <div class="text-[10px] font-black uppercase tracking-wider text-white/80">Pôrto Belo · abr/2026</div>
            <div class="text-[13px] font-extrabold">11 programas monitorados</div>
          </div>
        </div>
        <div class="mt-2.5 grid grid-cols-3 gap-2">
          <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-1.5">
            <div class="text-[15px] font-black leading-none"><span class="text-[9px] opacity-70 font-bold mr-0.5">R$</span>18,4M</div>
            <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">investido/ano</div>
          </div>
          <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-1.5">
            <div class="text-[15px] font-black leading-none">4.860</div>
            <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">beneficiários</div>
          </div>
          <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-1.5">
            <div class="text-[15px] font-black leading-none">3</div>
            <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">níveis de gov.</div>
          </div>
        </div>
      </div>

      <div class="px-4 mt-3 flex gap-1.5 text-[11px] font-bold overflow-x-auto no-scrollbar">
        <span class="px-3 py-1.5 rounded-full bg-slate-900 text-white whitespace-nowrap">Todos</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Social</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Saúde</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Educação</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Habitação</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Estrutural</span>
      </div>

      <button data-nav="goto" data-target="Detalhe · Bolsa Família" class="mx-4 mt-3 block w-[calc(100%-32px)] text-left rounded-2xl overflow-hidden shadow-soft active:scale-[.99] transition">
        <div class="p-4 text-white" style="background:linear-gradient(135deg,#0EA5E9 0%,#0F766E 100%)">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black tracking-wider">FEDERAL · SOCIAL</span>
            <span class="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black tracking-wider">⭐ EM DESTAQUE</span>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <span class="text-2xl">🤝</span>
            <div class="flex-1">
              <div class="font-extrabold text-[16px] leading-tight">Bolsa Família</div>
              <div class="text-[11px] text-white/85 leading-tight">Transferência de renda condicionada — acompanhe semestre a semestre.</div>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-1.5">
            <div class="bg-white/15 rounded-lg px-2 py-1.5 backdrop-blur">
              <div class="text-[13px] font-black leading-none">1.240</div>
              <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">famílias</div>
            </div>
            <div class="bg-white/15 rounded-lg px-2 py-1.5 backdrop-blur">
              <div class="text-[13px] font-black leading-none"><span class="text-[8px] opacity-70 font-bold mr-0.5">R$</span>380k</div>
              <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">/mês</div>
            </div>
            <div class="bg-white/15 rounded-lg px-2 py-1.5 backdrop-blur">
              <div class="text-[13px] font-black leading-none"><span class="text-[8px] opacity-70 font-bold mr-0.5">R$</span>306</div>
              <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">ticket médio</div>
            </div>
          </div>
          <div class="mt-3 flex items-end gap-1 h-8">
            ${[62, 64, 68, 71, 74, 76].map((v, i) => `<div class="flex-1 rounded-t" style="height:${v}%;background-color:rgba(255,255,255,${0.4 + i * 0.1})"></div>`).join('')}
          </div>
        </div>
        <div class="bg-slate-900 px-4 py-2.5 flex items-center gap-2">
          <span class="text-[11px] text-white flex-1 font-semibold">📈 Cresceu 22% em 12 meses</span>
          <span class="px-3 py-1 rounded-full bg-white text-slate-900 font-extrabold text-[11px]">Ver detalhes →</span>
        </div>
      </button>

      <div class="px-4 mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Outros programas</div>
      <div class="px-4 mt-2 grid grid-cols-2 gap-2">
        ${progCard({ emoji: '👵', iconBg: 'bg-purple-100', level: 'FEDERAL',   levelColor: 'bg-purple-100 text-purple-700',   name: 'BPC · LOAS',             metric: '486',       metricColor: 'text-purple-600', subtitle: 'idosos e PCD beneficiados' })}
        ${progCard({ emoji: '🍲', iconBg: 'bg-amber-100',  level: 'FEDERAL',   levelColor: 'bg-amber-100 text-amber-700',     name: 'Merenda Escolar (PNAE)', metric: '3.840',     metricColor: 'text-amber-600',  subtitle: 'alunos · R$ 612k/ano' })}
        ${progCard({ emoji: '💊', iconBg: 'bg-rose-100',   level: 'MUNICIPAL', levelColor: 'bg-rose-100 text-rose-700',       name: 'Farmácia Básica',        metric: 'R$ 1,2M',   metricColor: 'text-rose-600',   subtitle: 'medicamentos distribuídos/ano' })}
        ${progCard({ emoji: '🏠', iconBg: 'bg-sky-100',    level: 'FEDERAL',   levelColor: 'bg-sky-100 text-sky-700',         name: 'Minha Casa Minha Vida',  metric: '112',       metricColor: 'text-sky-600',    subtitle: 'unidades em contratação' })}
        ${progCard({ emoji: '🚌', iconBg: 'bg-orange-100', level: 'MUNICIPAL', levelColor: 'bg-orange-100 text-orange-700',   name: 'Transporte Escolar',     metric: '980',       metricColor: 'text-orange-600', subtitle: 'alunos · 12 rotas rurais' })}
        ${progCard({ emoji: '🆘', iconBg: 'bg-emerald-100',level: 'MUNICIPAL', levelColor: 'bg-emerald-100 text-emerald-700', name: 'Benefícios Eventuais',   metric: 'R$ 184k',   metricColor: 'text-emerald-600',subtitle: 'auxílio funeral, natalidade' })}
        ${progCard({ emoji: '🥛', iconBg: 'bg-teal-100',   level: 'MUNICIPAL', levelColor: 'bg-teal-100 text-teal-700',       name: 'Leite das Crianças',     metric: '640',       metricColor: 'text-teal-600',   subtitle: 'famílias atendidas/mês' })}
        ${progCard({ emoji: '🎭', iconBg: 'bg-fuchsia-100',level: 'FEDERAL',   levelColor: 'bg-fuchsia-100 text-fuchsia-700', name: 'Lei Paulo Gustavo',      metric: 'R$ 240k',   metricColor: 'text-fuchsia-600',subtitle: 'editais culturais 2026' })}
      </div>

      <div class="px-4 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Transparência estrutural</div>
      <div class="px-4 mt-2 grid grid-cols-2 gap-2">
        ${progCard({ emoji: '🏛️', iconBg: 'bg-indigo-100',level: 'ELEITOS',   levelColor: 'bg-indigo-100 text-indigo-700',name: 'Políticos eleitos',    metric: '23',    metricColor: 'text-indigo-700',subtitle: 'vereadores, deputados e senadores da cidade', target: 'Políticos da Cidade' })}
        ${progCard({ emoji: '📋', iconBg: 'bg-slate-100', level: 'MUNICIPAL', levelColor: 'bg-slate-200 text-slate-700', name: 'Licitações em aberto', metric: '8',     metricColor: 'text-slate-800', subtitle: 'R$ 4,7M em disputa' })}
        ${progCard({ emoji: '💼', iconBg: 'bg-slate-100', level: 'MUNICIPAL', levelColor: 'bg-slate-200 text-slate-700', name: 'Folha salarial',       metric: '1.124', metricColor: 'text-slate-800', subtitle: 'servidores · nominalmente público' })}
      </div>

      <div class="mx-4 mt-4 bg-white rounded-2xl p-3 shadow-soft flex items-center gap-2">
        <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg">🛡️</div>
        <div class="flex-1 leading-tight">
          <div class="text-[11px] font-extrabold text-slate-800">Fonte dos dados</div>
          <div class="text-[10px] text-slate-500">Portal da Transparência · CGU · dados cedidos pela prefeitura. Atualizado toda 2ª-feira.</div>
        </div>
      </div>

      <div class="mx-4 mt-2 mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2">
        <span class="text-base">⚖️</span>
        <div class="text-[10px] text-emerald-900 leading-snug">
          <b>Lei de Acesso à Informação (12.527/2011)</b> garante que você consulte qualquer programa com recursos públicos. Dados pessoais protegidos pela <b>LGPD</b>.
        </div>
      </div>
     </div>

      ${staticBottomNav('more')}
    </div>`
};
