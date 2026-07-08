import { statusBar } from "../atoms/StatusBar.js";

const PLACA = [
  { k: "Contratante", v: "Prefeitura de Pôrto Belo · Sec. de Obras" },
  { k: "Empresa", v: "Construtora Ibirama Ltda." },
  { k: "CNPJ", v: "12.345.678/0001-90" },
  { k: "Resp. técnico", v: "Eng. Pedro Machado · CREA SC-123456" },
  { k: "Valor", v: "R$ 890.000,00" },
  { k: "Prazo", v: "120 dias · término 05/06/2026" },
];
const FINANCEIRO = [
  { k: "Fonte", v: "FPM (60%) + Tesouro Municipal (40%)" },
  { k: "Licitação", v: "Tomada de Preços 08/2025" },
  { k: "Aditivos", v: "1 de prazo (+15 dias) · 0 de valor" },
];
const CRONO = [
  { c: "bg-slate-400", t: "Projeto básico aprovado", d: "10/10/2025" },
  { c: "bg-slate-400", t: "Licitação homologada", d: "20/12/2025" },
  { c: "bg-indigo-500", t: "Contrato assinado", d: "15/01/2026" },
  { c: "bg-sky-500", t: "Início das obras", d: "05/02/2026" },
  { c: "bg-emerald-500", t: "Marco 50% executado", d: "02/04/2026" },
  { c: "bg-brand-500", t: "Situação atual · 72%", d: "Hoje", flag: true },
  { c: "bg-slate-200", t: "Entrega prevista", d: "05/06/2026" },
];
const GALERIA = [
  { date: "05/02", label: "Início", img: "feed-photos/obra-recapamento-1.png" },
  { date: "12/03", label: "25%", img: "feed-photos/obra-recapamento-2.png" },
  { date: "02/04", label: "50%", img: "feed-photos/obra-recapamento-3.png" },
  { date: "18/04", label: "72%", img: "feed-photos/obra-recapamento-4.png" },
];

/** Tela 26 · Detalhe da Obra (placa oficial · cronograma · financeiro) */
export default {
  title: "Detalhe da Obra",
  group: "core",
  summary: "Obra pública · placa oficial · cronograma · financeiro",
  note: `Transparência completa: todos os dados da <b>placa oficial da obra</b> (exigidos pela Lei 8.666 / TCU) + informações do Portal da Transparência (contrato, empresa, responsável técnico, medições, aditivos). Permite ao cidadão <b>fiscalizar</b> o uso do dinheiro público.`,
  html: () => `
    <div class="relative h-full bg-slate-50 flex flex-col overflow-hidden">
     <div class="flex-1 min-h-0 overflow-y-auto">

      <div class="relative h-52 overflow-hidden" style="background-image:url('feed-photos/obra-recapamento.png');background-size:cover;background-position:center">
        <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.6) 100%)"></div>
        ${statusBar("light")}
        <div class="absolute top-11 left-4 right-4 flex items-center justify-between">
          <button data-nav="prev" class="w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center">←</button>
          <button class="w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center">📤</button>
        </div>
        <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div class="flex gap-1.5 flex-wrap">
            <span class="px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black">🏗️ PAVIMENTAÇÃO</span>
            <span class="px-2 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> EM EXECUÇÃO
            </span>
          </div>
          <div class="text-white text-right flex-shrink-0">
            <div class="text-[9px] font-black tracking-wider opacity-80 leading-tight">PROGRESSO</div>
            <div class="text-2xl font-extrabold leading-none">72%</div>
          </div>
        </div>
      </div>

      <div class="px-4 pt-3">
        <div class="text-lg font-extrabold text-slate-900 leading-tight">Recapeamento Av. Gov. Celso Ramos</div>
        <div class="text-[11px] text-slate-500 mt-1">Centro · 2,4 km de extensão · contrato #08/2025</div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Andamento físico</div>
          <div class="text-[10px] font-black text-slate-500">Medição 18/04</div>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-3xl font-extrabold text-amber-600">72%</div>
          <div class="flex-1">
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full" style="width:72%;background:linear-gradient(90deg,#F97316,#F59E0B)"></div>
            </div>
            <div class="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2 text-center">
          <div class="bg-slate-50    rounded-lg p-2"><div class="font-black text-slate-900 text-[14px]">73</div> <div class="text-[9px] font-bold text-slate-500 uppercase leading-tight">Dias de obra</div></div>
          <div class="bg-slate-50    rounded-lg p-2"><div class="font-black text-slate-900 text-[14px]">120</div><div class="text-[9px] font-bold text-slate-500 uppercase leading-tight">Dias contrato</div></div>
          <div class="bg-emerald-50  rounded-lg p-2"><div class="font-black text-emerald-700 text-[14px]">05/jun</div><div class="text-[9px] font-bold text-emerald-600 uppercase leading-tight">Entrega</div></div>
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-lg">🪧</span>
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Placa oficial</div>
          <span class="ml-auto px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-black">LEI 8.666</span>
        </div>
        ${PLACA.map(
          (r, i, arr) => `
          <div class="flex gap-3 py-2 ${i < arr.length - 1 ? "border-b border-slate-50" : ""}">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 flex-shrink-0 leading-snug">${r.k}</div>
            <div class="text-[11px] text-slate-800 font-semibold flex-1 leading-snug">${r.v}</div>
          </div>`,
        ).join("")}
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-lg">💰</span>
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financeiro</div>
          <span class="ml-auto text-[9px] font-black text-sky-600 uppercase">Portal da transparência</span>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div class="bg-slate-50 rounded-lg p-3">
            <div class="text-[9px] font-bold text-slate-500 uppercase">Total do contrato</div>
            <div class="font-black text-slate-900 text-[15px] mt-0.5"><span class="text-[9px] opacity-60 font-bold mr-0.5">R$</span>890,0k</div>
          </div>
          <div class="bg-emerald-50 rounded-lg p-3">
            <div class="text-[9px] font-bold text-emerald-600 uppercase">Executado · 72%</div>
            <div class="font-black text-emerald-700 text-[15px] mt-0.5"><span class="text-[9px] opacity-60 font-bold mr-0.5">R$</span>640,8k</div>
          </div>
        </div>
        ${FINANCEIRO.map(
          (r, i, arr) => `
          <div class="flex gap-3 py-1.5 ${i < arr.length - 1 ? "border-b border-slate-50" : ""}">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 flex-shrink-0 leading-snug">${r.k}</div>
            <div class="text-[11px] text-slate-800 font-semibold flex-1 leading-snug">${r.v}</div>
          </div>`,
        ).join("")}
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-lg">📅</span>
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cronograma</div>
        </div>
        ${CRONO.map(
          (ev, i, arr) => `
          <div class="flex gap-2.5 ${i < arr.length - 1 ? "pb-3" : ""} relative">
            <div class="flex flex-col items-center">
              <div class="w-3 h-3 rounded-full ${ev.c} ring-4 ring-white ${ev.flag ? "animate-pulse" : ""}"></div>
              ${i < arr.length - 1 ? '<div class="w-0.5 flex-1 bg-slate-200 -mt-0.5"></div>' : ""}
            </div>
            <div class="flex-1 pb-1">
              <div class="text-[12px] font-bold ${ev.c === "bg-slate-200" ? "text-slate-400" : "text-slate-900"} flex items-center gap-1.5 flex-wrap">
                ${ev.t}
                ${ev.flag ? '<span class="text-[9px] font-black text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">VOCÊ ESTÁ AQUI</span>' : ""}
              </div>
              <div class="text-[10px] ${ev.c === "bg-slate-200" ? "text-slate-400" : "text-slate-500"}">${ev.d}</div>
            </div>
          </div>
        `,
        ).join("")}
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-soft">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">📷</span>
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Acompanhamento · 4 fotos</div>
          </div>
          <button class="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider">Ver todas</button>
        </div>
        <div class="flex gap-2 overflow-x-auto -mx-1 px-1">
          ${GALERIA.map(
            (p) => `
            <div class="w-24 flex-shrink-0">
              <div class="w-24 h-24 rounded-xl relative overflow-hidden flex items-end p-1.5" style="background-image:url('${p.img}');background-size:cover;background-position:center">
                <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 100%)"></div>
                <span class="relative px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-black">${p.label}</span>
              </div>
              <div class="text-[10px] text-slate-500 font-bold mt-1 text-center">${p.date}</div>
            </div>
          `,
          ).join("")}
        </div>
      </div>

      <div class="mx-4 mt-3 bg-white rounded-2xl p-3 shadow-soft flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" style="background:linear-gradient(135deg,#0EA5E9,#10B981)">AW</div>
        <div class="flex-1 min-w-0">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fiscal do contrato</div>
          <div class="font-extrabold text-slate-900 text-[13px]">Eng. Ana Luísa Werner</div>
          <div class="text-[10px] text-slate-500">Sec. de Obras · aciona em caso de problema</div>
        </div>
      </div>

      <div class="h-3"></div>
     </div>

      <div class="relative bg-white/95 backdrop-blur border-t border-slate-100 p-3 flex gap-2 z-30">
        <button class="flex-1 py-3 rounded-full bg-rose-50 text-rose-700 font-bold text-sm border border-rose-200">⚠️ Reportar</button>
        <button class="flex-1 py-3 rounded-full bg-brand-500 text-white font-extrabold text-sm shadow-lg">🔔 Acompanhar</button>
      </div>
    </div>`,
};
