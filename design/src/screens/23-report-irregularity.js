import { statusBar } from "../atoms/StatusBar.js";
import { staticBottomNav } from "../organisms/BottomNav.js";

const radioOpt = (label, sub, checked = false) => `
  <label class="flex items-start gap-2.5 p-3 rounded-xl border ${checked ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-white"} cursor-pointer">
    <span class="mt-0.5 w-4 h-4 rounded-full border-2 ${checked ? "border-rose-500" : "border-slate-300"} flex items-center justify-center shrink-0">${checked ? '<span class="w-2 h-2 rounded-full bg-rose-500"></span>' : ""}</span>
    <span class="flex-1 leading-tight">
      <span class="block text-[12px] font-extrabold ${checked ? "text-rose-700" : "text-slate-800"}">${label}</span>
      <span class="block text-[10px] text-slate-500 mt-0.5">${sub}</span>
    </span>
  </label>`;

/** Tela 23 · Denunciar irregularidade (roteamento oficial) */
export default {
  title: "Denunciar irregularidade",
  group: "support",
  summary: "Formulário · roteamento oficial · anonimato",
  note: `Formulário de denúncia que <b>não cria banco de denúncia no CityHero</b> — apenas orquestra e envia pro canal certo: <b>CGU (Fala.BR)</b> para recursos federais, <b>Ministério Público estadual</b> para desvios, <b>Ouvidoria Municipal</b> para questões operacionais. O botão "Enviar" gera o protocolo oficial e devolve o número pro cidadão. <b>Toggle de anonimato</b> com explicação honesta: anônima tem menos peso investigativo, identificada fica protegida por sigilo (Lei 13.460/2017). Upload de provas opcional (documentos/fotos). Aviso de Art. 339 do CP em destaque antes do envio. Na vida real, a prefeitura <b>não pode</b> receber denúncia contra si mesma — por isso o roteamento externo é a feature principal.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">
      ${statusBar("dark")}

      <div class="px-4 flex items-center gap-3">
        <button data-nav="prev" class="w-9 h-9 rounded-full bg-white shadow-soft flex items-center justify-center">←</button>
        <div class="flex-1">
          <div class="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Controle social</div>
          <div class="text-xl font-extrabold text-slate-900">Denunciar irregularidade</div>
        </div>
      </div>

      <div class="mx-4 mt-2 px-3 py-2 rounded-xl bg-white shadow-soft flex items-center gap-2">
        <span class="text-lg">🤝</span>
        <div class="flex-1 leading-tight">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Programa</div>
          <div class="text-[12px] font-extrabold text-slate-900">Bolsa Família · Pôrto Belo</div>
        </div>
        <button class="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider">Trocar</button>
      </div>

      <div class="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5">
        <span class="text-lg shrink-0">⚠️</span>
        <div class="text-[11px] text-amber-900 leading-snug">
          Denúncia <b>caluniosa</b> (acusar sabendo ser inocente) é <b>crime · Art. 339 CP · até 8 anos de prisão</b>. Envie apenas se tiver indícios reais. Sua identidade é protegida pela Lei 13.460/2017.
        </div>
      </div>

      <div class="mx-4 mt-3">
        <div class="text-[11px] font-black text-slate-700 mb-1.5">1 · Tipo de irregularidade</div>
        <div class="space-y-1.5">
          ${radioOpt("Beneficiário fora dos critérios", "Recebe mesmo com renda/patrimônio acima do corte", true)}
          ${radioOpt("Desvio ou mau uso de recurso público", "Dinheiro do programa usado para outra finalidade")}
          ${radioOpt("Cadastro duplicado ou fraudulento", "Mesma pessoa em múltiplos cadastros / laranjas")}
          ${radioOpt("Descumprimento das condicionalidades", "Criança fora da escola, vacina em atraso, etc.")}
          ${radioOpt("Outro", "Descreva abaixo")}
        </div>
      </div>

      <div class="mx-4 mt-3">
        <div class="text-[11px] font-black text-slate-700 mb-1.5">2 · Descreva os fatos</div>
        <div class="bg-white rounded-xl border border-slate-200 p-3">
          <div class="text-[11px] text-slate-400 italic leading-snug">
            Ex: "Vizinha recebe Bolsa Família há 2 anos, mas comprou dois carros novos em 2025 e tem imóvel alugado no centro. Não se encaixa no corte de renda."
          </div>
          <div class="mt-2 flex items-center justify-between text-[9px] text-slate-400">
            <span>Seja específica · quanto mais detalhe, mais investigável</span>
            <span>0 / 1000</span>
          </div>
        </div>
      </div>

      <div class="mx-4 mt-3 grid grid-cols-2 gap-2">
        <div>
          <div class="text-[11px] font-black text-slate-700 mb-1.5">📍 Bairro</div>
          <div class="bg-white rounded-xl border border-slate-200 px-3 py-2.5 text-[11px] text-slate-500">Centro ▾</div>
        </div>
        <div>
          <div class="text-[11px] font-black text-slate-700 mb-1.5">📅 Desde quando</div>
          <div class="bg-white rounded-xl border border-slate-200 px-3 py-2.5 text-[11px] text-slate-500">2024 ▾</div>
        </div>
      </div>

      <div class="mx-4 mt-3">
        <div class="text-[11px] font-black text-slate-700 mb-1.5">3 · Provas <span class="font-normal text-slate-400">(opcional)</span></div>
        <div class="bg-white rounded-xl border-2 border-dashed border-slate-300 p-4 flex flex-col items-center gap-1 text-center">
          <span class="text-2xl">📎</span>
          <div class="text-[11px] font-extrabold text-slate-700">Anexar documento ou foto</div>
          <div class="text-[9px] text-slate-500">Arquivos até 10MB · criptografados no envio</div>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-3.5 shadow-soft">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">🧭</span>
          <div class="text-[11px] font-black uppercase tracking-wider text-slate-500">Para onde vai sua denúncia</div>
        </div>
        <div class="space-y-2 text-[11px] text-slate-700 leading-snug">
          <div class="flex gap-2">
            <span class="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
            <div><b>CGU · Fala.BR</b> — recebe denúncias sobre programas federais (Bolsa Família, BPC).</div>
          </div>
          <div class="flex gap-2">
            <span class="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
            <div><b>Ministério Público de SC</b> — se houver indício de fraude ou desvio de recurso.</div>
          </div>
          <div class="flex gap-2">
            <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
            <div><b>Ouvidoria Municipal</b> — registro paralelo para acompanhamento local.</div>
          </div>
        </div>
        <div class="mt-2.5 pt-2.5 border-t border-slate-100 text-[9px] text-slate-500 leading-snug">
          CityHero <b>não armazena</b> o conteúdo da denúncia — somos apenas o canal. Você recebe o protocolo oficial por push e e-mail.
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-3.5 shadow-soft">
        <div class="flex items-center gap-2">
          <span class="text-base">🕵️</span>
          <div class="text-[11px] font-black uppercase tracking-wider text-slate-500 flex-1">Como se identificar</div>
        </div>
        <div class="mt-2 grid grid-cols-2 gap-2">
          <button class="p-2.5 rounded-xl border-2 border-rose-400 bg-rose-50 text-left">
            <div class="text-[12px] font-extrabold text-rose-700">Identificada</div>
            <div class="text-[9px] text-rose-900/70 leading-tight mt-0.5">Mais peso · sigilo garantido por lei</div>
          </button>
          <button class="p-2.5 rounded-xl border border-slate-200 bg-white text-left">
            <div class="text-[12px] font-extrabold text-slate-700">Anônima</div>
            <div class="text-[9px] text-slate-500 leading-tight mt-0.5">Aceita · pode ter menos prioridade</div>
          </button>
        </div>
      </div>

      <div class="mx-4 mt-3 mb-4">
        <button class="w-full py-3.5 rounded-2xl bg-rose-600 text-white font-extrabold text-[13px] shadow-lg active:scale-[.99] transition">
          🚨 Enviar denúncia
        </button>
        <div class="mt-2 text-center text-[9px] text-slate-500 leading-snug">
          Ao enviar você concorda com a <a class="underline">política de controle social</a> e declara que a denúncia é <b>verdadeira</b>.
        </div>
      </div>
     </div>

      ${staticBottomNav("more")}
    </div>`,
};
