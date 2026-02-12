import { statusBar } from '../atoms/StatusBar.js';
import { searchBar } from '../atoms/SearchBar.js';
import { bottomNav } from '../organisms/BottomNav.js';
import { categoryChip } from '../atoms/CategoryChip.js';

/** Molecule local · FeedCard — usada só nesta tela por enquanto. */
const feedItem = ({ avatar, name, address, dist, cat, emoji, color, photoUrl, desc, supports, comments, status, isAnonymous }) => {
  const avClass     = isAnonymous ? 'bg-gradient-to-br from-slate-700 to-slate-900' : avatar;
  const avContent   = isAnonymous ? '🥷' : name.charAt(0);
  const displayName = isAnonymous ? 'Herói Anônimo' : name;
  const anonPill    = isAnonymous ? `<span class="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[8px] font-black uppercase tracking-wider">anônimo</span>` : '';

  return `
    <div class="bg-white rounded-2xl shadow-soft overflow-hidden mb-3">
      <div class="px-3 pt-3 flex items-center gap-2">
        <div class="w-8 h-8 rounded-full ${avClass} flex items-center justify-center text-white font-bold ${isAnonymous ? 'text-sm' : 'text-xs'}">${avContent}</div>
        <div class="flex-1 leading-tight min-w-0">
          <div class="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">${displayName}${anonPill}</div>
          <div class="text-[10px] text-slate-500 truncate">📍 ${address} · ${dist} · há 12 min</div>
        </div>
        ${status ? `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black">${status}</span>` : ''}
      </div>
      <div class="mx-3 mt-2 h-32 rounded-xl relative overflow-hidden bg-slate-200" style="background-image:url('${photoUrl}');background-size:cover;background-position:center">
        <div class="absolute inset-x-0 bottom-0 h-14" style="background:linear-gradient(180deg,transparent,rgba(0,0,0,.55))"></div>
        <div class="absolute bottom-2 left-2">${categoryChip(cat, color, emoji)}</div>
      </div>
      <div class="px-3 py-2 text-[12px] text-slate-700 leading-snug">${desc}</div>
      <div class="px-3 pb-3 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
        <button class="flex items-center gap-1 hover:text-brand-600"><span class="text-sm">🔥</span> ${supports}</button>
        <button class="flex items-center gap-1 hover:text-brand-600"><span class="text-sm">💬</span> ${comments}</button>
        <button class="hover:text-brand-600" title="Compartilhar" aria-label="Compartilhar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </button>
        <button class="flex items-center gap-1 hover:text-brand-600 ml-auto"><span class="text-sm">📷</span> Enriquecer</button>
      </div>
    </div>`;
};

export default {
  title: 'Feed Cívico',
  group: 'core',
  summary: 'Timeline hiperlocal de vizinhos',
  note: `Feed em formato social — estimula engajamento. Cards mostram <b>foto, distância, apoio e comentários moderados por tags</b> (anti-toxicidade). Apoio = upvote visual.`,
  html: () => `
    <div class="relative h-full bg-slate-50">
      ${statusBar('dark')}
      <div class="px-4 pb-2">
        <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Feed</div>
        <div class="text-xl font-extrabold text-slate-900">No seu bairro</div>
      </div>
      <div class="px-4 mb-2">${searchBar('Buscar no feed do bairro…')}</div>
      <div class="px-4 mb-2 flex gap-1.5 text-[11px] font-bold">
        <span class="px-3 py-1.5 rounded-full bg-slate-900 text-white">📍 10 km</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200">Novos</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200">Mais apoiados</span>
      </div>

      <div class="px-3 pb-24 overflow-y-auto" style="max-height: 420px">
        ${feedItem({ avatar:'bg-gradient-to-br from-pink-400 to-rose-500', name:'Maria S.', address:'R. das Flores, 145', dist:'180m', cat:'Buraco', emoji:'🕳️', color:'bg-amber-500', photoUrl:'feed-photos/buraco.png', desc:'Buraco perigoso na rua principal. Duas motos já furaram o pneu hoje.', supports:'34', comments:'8', status:'' })}
        ${feedItem({ avatar:'bg-gradient-to-br from-sky-400 to-indigo-500', name:'Carlos M.', address:'Av. Atlântica, 1.220', dist:'420m', cat:'Lixo', emoji:'🗑️', color:'bg-emerald-500', photoUrl:'feed-photos/lixo.png', desc:'Lixo acumulado há 3 dias na esquina. Cheiro forte no calor.', supports:'22', comments:'4', status:'EM ANDAMENTO' })}
        ${feedItem({ avatar:'bg-gradient-to-br from-emerald-400 to-green-600', name:'Ana L.', address:'R. São Pedro, 88', dist:'680m', cat:'Poste', emoji:'💡', color:'bg-sky-500', photoUrl:'feed-photos/luz.png', desc:'Poste apagado há uma semana. Rua muito escura à noite.', supports:'18', comments:'3', status:'', isAnonymous:true })}
      </div>

      ${bottomNav('feed')}
    </div>`
};
