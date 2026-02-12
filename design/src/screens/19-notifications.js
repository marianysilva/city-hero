import { statusBar } from '../atoms/StatusBar.js';

const notif = (emoji, bg, title, desc, time, unread = false) => `
  <div class="flex items-start gap-3 px-3 py-3 ${unread ? 'bg-brand-50/60' : ''} border-b border-slate-100">
    <div class="w-10 h-10 rounded-xl ${bg} flex items-center justify-center text-lg relative">
      ${emoji}
      ${unread ? '<span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white"></span>' : ''}
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-[12px] font-bold text-slate-900 leading-snug">${title}</div>
      <div class="text-[11px] text-slate-500 leading-tight mt-0.5">${desc}</div>
    </div>
    <div class="text-[10px] text-slate-400 font-semibold whitespace-nowrap">${time}</div>
  </div>`;

/** Tela 19 · Notificações */
export default {
  title: 'Notificações',
  group: 'support',
  summary: 'Atualizações · recompensas · apoios',
  note: `Notificações com <b>ícone colorido por tipo</b> (status, XP, apoio social). XP gain usa amarelo-ouro para reforçar o loop de recompensa. Bloco "hoje" em destaque no topo.`,
  html: () => `
    <div class="relative h-full bg-white overflow-y-auto pb-20">
      ${statusBar('dark')}
      <div class="px-4 flex items-center gap-3">
        <button class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">←</button>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500 font-bold tracking-wider uppercase">Central</div>
          <div class="text-xl font-extrabold text-slate-900">Notificações · 5</div>
        </div>
        <button class="text-[11px] font-bold text-brand-600">Marcar lidas</button>
      </div>

      <div class="px-4 mt-2 flex gap-1.5 text-[11px] font-bold">
        <span class="px-3 py-1.5 rounded-full bg-slate-900 text-white">Tudo</span>
        <span class="px-3 py-1.5 rounded-full bg-slate-100">Status</span>
        <span class="px-3 py-1.5 rounded-full bg-slate-100">Conquistas</span>
        <span class="px-3 py-1.5 rounded-full bg-slate-100">Comunidade</span>
      </div>

      <div class="mt-3">
        <div class="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Hoje</div>
        ${notif('✅','bg-emerald-100','Seu ticket foi resolvido!','Buraco da R. São Pedro · confira o "antes x depois"','2m', true)}
        ${notif('⚡','bg-yellow-100', '+80 XP adicionados','Reporte validado pela equipe de Pavimentação','2m', true)}
        ${notif('🌙','bg-purple-100', 'Conquista em progresso: Vigia Noturno','Você está 3/5 · reporte mais 2 postes apagados','1h', true)}
      </div>

      <div class="mt-3">
        <div class="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Ontem</div>
        ${notif('🔥','bg-rose-100',  '5 pessoas apoiaram seu reporte','Lixo acumulado · Praça Central','ontem', true)}
        ${notif('🏛️','bg-sky-100',   'Nova obra perto de você','Recapeamento da Av. Atlântica começa segunda','ontem', true)}
      </div>

      <div class="mt-3">
        <div class="px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Essa semana</div>
        ${notif('📷','bg-slate-100',  'Alguém adicionou foto ao seu reporte','Carlos M. enriqueceu o ticket do poste','2 dias')}
        ${notif('🏆','bg-amber-100',  'Você subiu para Nível 15','Título atualizado: Guardião do Bairro','3 dias')}
      </div>
    </div>`
};
