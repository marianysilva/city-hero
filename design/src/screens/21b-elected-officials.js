import { statusBar } from "../atoms/StatusBar.js";
import { searchBar } from "../atoms/SearchBar.js";
import { staticBottomNav } from "../organisms/BottomNav.js";

/** Molecule local · OfficialCard — usada só nesta tela. */
const official = ({
  photoUrl,
  name,
  partyAcr,
  partyColor,
  partyName,
  role,
  level,
  levelColor,
  mandate,
  votes,
  transparencyId,
}) => `
  <div class="bg-white rounded-2xl shadow-soft p-3 mb-2.5">
    <div class="flex items-start gap-3">
      <div class="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden" ${photoUrl ? `style="background-image:url('${photoUrl}');background-size:cover;background-position:center"` : ""}>${photoUrl ? "" : "👤"}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 flex-wrap">
          <div class="text-[13px] font-extrabold text-slate-900 leading-tight">${name}</div>
          <span class="px-1.5 py-0.5 rounded ${partyColor} text-[9px] font-black tracking-wider">${partyAcr}</span>
        </div>
        <div class="text-[11px] text-slate-500 leading-tight">${role} · ${level}</div>
        <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
          <span>🗓️ ${mandate}</span>
          <span>🗳️ ${votes} votos na cidade</span>
        </div>
      </div>
      <span class="px-2 py-0.5 rounded-full ${levelColor} text-[9px] font-black tracking-wider whitespace-nowrap">${level.toUpperCase()}</span>
    </div>

    <div class="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
      <a href="https://portaldatransparencia.gov.br/pessoa/${transparencyId}" target="_blank" rel="noopener" class="flex-1 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-extrabold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition">
        🔍 Portal da Transparência →
      </a>
      <button class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base" title="Compartilhar" aria-label="Compartilhar">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-600"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
      </button>
    </div>
  </div>
`;

/** Tela 21b · Políticos da Cidade (lista de eleitos com link pro Portal da Transparência) */
export default {
  title: "Políticos da Cidade",
  group: "support",
  summary: "Eleitos da cidade · link pro Portal da Transparência",
  note: `Lista os <b>políticos eleitos pela cidade</b> ou que representam a região: vereadores, prefeito/vice, deputados estaduais/federais e senadores que tiveram votação relevante em Pôrto Belo. Cada card mostra cargo, partido, mandato e votos na cidade. O CTA principal é o <b>Portal da Transparência</b> (federal) já com o ID do político — o cidadão consulta gastos, despesas de gabinete, votações, etc. Fontes: TSE (eleitos + votos por município), Câmara dos Deputados, Senado, Câmara Municipal. Sem opinião editorial — só dados públicos.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto pb-24">
      ${statusBar("dark")}

      <div class="px-4 flex items-center gap-3">
        <button data-nav="prev" class="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center">←</button>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Controle social</div>
          <div class="text-xl font-extrabold text-slate-900">Políticos da cidade</div>
        </div>
      </div>

      <div class="mx-4 mt-2 p-3.5 rounded-2xl text-white shadow-soft" style="background:linear-gradient(135deg,#4F46E5 0%,#0EA5E9 100%)">
        <div class="flex items-center gap-2">
          <span class="text-xl">🗳️</span>
          <div class="flex-1 leading-tight">
            <div class="text-[10px] font-black uppercase tracking-wider text-white/80">Pôrto Belo · SC</div>
            <div class="text-[13px] font-extrabold">23 eleitos representam a cidade</div>
          </div>
        </div>
        <div class="mt-2.5 grid grid-cols-4 gap-1.5">
          <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-1.5 text-center">
            <div class="text-[14px] font-black leading-none">11</div>
            <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">vereadores</div>
          </div>
          <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-1.5 text-center">
            <div class="text-[14px] font-black leading-none">2</div>
            <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">prefeito · vice</div>
          </div>
          <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-1.5 text-center">
            <div class="text-[14px] font-black leading-none">7</div>
            <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">estaduais</div>
          </div>
          <div class="bg-white/15 backdrop-blur rounded-lg px-2 py-1.5 text-center">
            <div class="text-[14px] font-black leading-none">3</div>
            <div class="text-[8px] font-bold uppercase text-white/80 mt-0.5">federais · sen.</div>
          </div>
        </div>
      </div>

      <div class="px-4 mt-3">${searchBar("Buscar político…")}</div>

      <div class="px-4 mt-2 flex gap-1.5 text-[11px] font-bold overflow-x-auto no-scrollbar">
        <span class="px-3 py-1.5 rounded-full bg-slate-900 text-white whitespace-nowrap">Todos · 23</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Municipal</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Estadual</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Federal</span>
        <span class="px-3 py-1.5 rounded-full bg-white border border-slate-200 whitespace-nowrap">Senador</span>
      </div>

      <div class="px-4 mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Executivo municipal</div>
      <div class="px-4 mt-2">
        ${official({
          name: "Aroldo Schappo",
          partyAcr: "PSD",
          partyColor: "bg-orange-100 text-orange-700",
          partyName: "Partido Social Democrático",
          role: "Prefeito",
          level: "Municipal",
          levelColor: "bg-amber-100 text-amber-700",
          mandate: "2025–2028",
          votes: "6.842",
          transparencyId: "demo-prefeito-1",
        })}
        ${official({
          name: "Marcia Krammes",
          partyAcr: "PP",
          partyColor: "bg-blue-100 text-blue-700",
          partyName: "Progressistas",
          role: "Vice-prefeita",
          level: "Municipal",
          levelColor: "bg-amber-100 text-amber-700",
          mandate: "2025–2028",
          votes: "6.842",
          transparencyId: "demo-vice-1",
        })}
      </div>

      <div class="px-4 mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Câmara municipal · vereadores (11)</div>
      <div class="px-4 mt-2">
        ${official({
          name: "Robson Cabral",
          partyAcr: "PL",
          partyColor: "bg-yellow-100 text-yellow-700",
          partyName: "Partido Liberal",
          role: "Vereador · Pres. da Câmara",
          level: "Municipal",
          levelColor: "bg-amber-100 text-amber-700",
          mandate: "2025–2028",
          votes: "1.482",
          transparencyId: "demo-vereador-1",
        })}
        ${official({
          name: "Joana Demarchi",
          partyAcr: "PT",
          partyColor: "bg-red-100 text-red-700",
          partyName: "Partido dos Trabalhadores",
          role: "Vereadora",
          level: "Municipal",
          levelColor: "bg-amber-100 text-amber-700",
          mandate: "2025–2028",
          votes: "1.024",
          transparencyId: "demo-vereador-2",
        })}
        <button class="w-full py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-extrabold text-slate-700 mt-1">Ver os outros 9 vereadores →</button>
      </div>

      <div class="px-4 mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Assembleia Legislativa (SC) · votação relevante na cidade</div>
      <div class="px-4 mt-2">
        ${official({
          name: "Carla Tavares",
          partyAcr: "MDB",
          partyColor: "bg-emerald-100 text-emerald-700",
          partyName: "Movimento Democrático Brasileiro",
          role: "Deputada estadual",
          level: "Estadual",
          levelColor: "bg-sky-100 text-sky-700",
          mandate: "2023–2026",
          votes: "3.210",
          transparencyId: "demo-dep-est-1",
        })}
        <button class="w-full py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-extrabold text-slate-700 mt-1">Ver os outros 6 estaduais →</button>
      </div>

      <div class="px-4 mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Câmara dos Deputados + Senado · votação relevante na cidade</div>
      <div class="px-4 mt-2">
        ${official({
          name: "Bruno Werlang",
          partyAcr: "PSD",
          partyColor: "bg-orange-100 text-orange-700",
          partyName: "Partido Social Democrático",
          role: "Deputado federal",
          level: "Federal",
          levelColor: "bg-indigo-100 text-indigo-700",
          mandate: "2023–2026",
          votes: "4.105",
          transparencyId: "demo-dep-fed-1",
        })}
        ${official({
          name: "Helena Macedo",
          partyAcr: "PSDB",
          partyColor: "bg-cyan-100 text-cyan-700",
          partyName: "Partido da Social Democracia Brasileira",
          role: "Senadora",
          level: "Federal",
          levelColor: "bg-indigo-100 text-indigo-700",
          mandate: "2023–2030",
          votes: "5.890",
          transparencyId: "demo-senadora-1",
        })}
      </div>

      <div class="mx-4 mt-4 bg-white rounded-2xl p-3 shadow-soft flex items-center gap-2">
        <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg">🛡️</div>
        <div class="flex-1 leading-tight">
          <div class="text-[11px] font-extrabold text-slate-800">Fonte dos dados</div>
          <div class="text-[10px] text-slate-500">TSE (eleitos + votação por município), Câmara dos Deputados, Senado, Câmara Municipal de Pôrto Belo. Atualizado mensalmente. Link "Portal da Transparência" abre fora do app.</div>
        </div>
      </div>

      <div class="mx-4 mt-2 mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2">
        <span class="text-base">⚖️</span>
        <div class="text-[10px] text-emerald-900 leading-snug">
          Cargos públicos têm <b>dados nominais públicos</b> (Constituição art. 37 + Lei de Acesso à Informação). CityHero não emite opinião sobre nenhum mandatário — só agrega dados oficiais e facilita o acesso ao Portal da Transparência.
        </div>
      </div>
     </div>

      ${staticBottomNav("more")}
    </div>`,
};
