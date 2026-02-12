import { statusBar } from '../atoms/StatusBar.js';

/** Tela 04b · Onboarding · Pacto Cidadão (entre Gamificação e Seu Bairro)
 *
 * Lembra o usuário, antes de começar, que o app é uma plataforma de
 * boa-fé: falsas denúncias e linguagem ofensiva têm consequências
 * (XP / conta), comentários podem ser denunciados, identidade é
 * verificada via Gov.br, e os dados são tratados conforme a LGPD.
 *
 * Inclui modal com rascunho dos termos da plataforma. O CTA "Continuar"
 * só habilita quando o checkbox "Li e aceito os termos" estiver marcado.
 *
 * A frase central do hero rota entre 4 variações por faixa etária. Em
 * produção é selecionada uma vez pela idade do Gov.br; no protótipo
 * rotaciona a cada 10s pra demonstrar todas.
 */
export default {
  title: 'Onboarding · Pacto Cidadão',
  group: 'onboarding',
  summary: 'Boa-fé · moderação · identidade · LGPD',
  note: `Esta tela existe pra estabelecer <b>combinados</b> antes do primeiro uso. Conteúdo divide-se em cinco pilares: <b>1) apartidarismo</b> (representa o povo, não partido), <b>2) moderação</b> (denúncias avaliadas), <b>3) consequências</b> (XP/suspensão), <b>4) identidade</b> (Gov.br garante usuário real), <b>5) LGPD</b> (proteção de dados). Hero rotaciona 4 mensagens por faixa etária (em produção, Gov.br escolhe uma). Termos da plataforma abrem em modal local. CTA "Continuar" só destrava com o checkbox marcado — barreira leve mas explícita.`,
  html: () => `
    <div class="relative h-full bg-gradient-to-b from-white to-violet-50 flex flex-col overflow-hidden">
      ${statusBar('dark')}
      <div class="px-6 pt-2 flex items-center justify-between">
        <button data-nav="back" class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">←</button>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Passo 4 de 5</span>
      </div>

      <div class="px-6 mt-4 flex-1 min-h-0 overflow-y-auto pb-2">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-civic-purple flex items-center justify-center text-3xl shadow-lg">🤝</div>
          <h2 class="mt-3 text-2xl font-extrabold text-slate-900 leading-tight text-center">Aqui sua palavra<br/>tem peso.</h2>
          <div class="mt-2 min-h-[64px] flex items-center" data-rotator-host>
            <div data-rotator class="text-[12.5px] text-slate-700 text-center leading-snug px-1"></div>
          </div>
          <div class="text-[9px] text-slate-400 mt-1 text-center italic">
            ↑ rotação a cada 10s (demo) · em produção a frase é escolhida pela faixa etária do Gov.br
          </div>
        </div>

        <div class="mt-5 space-y-3">
          <div class="flex items-start gap-3 p-3 rounded-2xl bg-white shadow-soft">
            <div class="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center text-lg shrink-0">🇧🇷</div>
            <div class="leading-snug">
              <div class="text-[12px] font-extrabold text-slate-900">Comunidade, não política</div>
              <div class="text-[11px] text-slate-600 mt-0.5">CityHero não é de partido nenhum. Representa quem mora, paga imposto e usa a rua: <b>o povo brasileiro</b>.</div>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-2xl bg-white shadow-soft">
            <div class="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-lg shrink-0">🚨</div>
            <div class="leading-snug">
              <div class="text-[12px] font-extrabold text-slate-900">Falsas denúncias e linguagem ofensiva são monitoradas</div>
              <div class="text-[11px] text-slate-600 mt-0.5">Tickets e comentários podem ser denunciados por outros cidadãos. Cada caso é avaliado pela equipe de moderação.</div>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-2xl bg-white shadow-soft">
            <div class="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-lg shrink-0">⚖️</div>
            <div class="leading-snug">
              <div class="text-[12px] font-extrabold text-slate-900">Denúncias confirmadas têm consequências</div>
              <div class="text-[11px] text-slate-600 mt-0.5">Podem reduzir o seu XP, suspender temporariamente o perfil ou bloquear a conta — proporcional à gravidade.</div>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-2xl bg-white shadow-soft">
            <div class="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-lg shrink-0">🔐</div>
            <div class="leading-snug">
              <div class="text-[12px] font-extrabold text-slate-900">Identidade verificada via Gov.br</div>
              <div class="text-[11px] text-slate-600 mt-0.5">Você pode reportar como <i>Anônimo</i> publicamente, mas a prefeitura e a moderação sempre sabem quem é o autor — não dá pra agir escondido.</div>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-2xl bg-white shadow-soft">
            <div class="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-lg shrink-0">🛡️</div>
            <div class="leading-snug">
              <div class="text-[12px] font-extrabold text-slate-900">Seus dados são protegidos pela LGPD</div>
              <div class="text-[11px] text-slate-600 mt-0.5">Seguimos a Lei Geral de Proteção de Dados. Rostos e placas são anonimizados antes do feed; você controla o que é público.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 pt-3 pb-4 border-t border-slate-200 bg-white/80 backdrop-blur">
        <label class="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            class="mt-0.5 w-5 h-5 rounded border-slate-300 accent-violet-600 shrink-0"
            data-role="accept-terms"
            onchange="this.closest('.relative.h-full').querySelector('[data-role=cta-continue]').disabled = !this.checked; this.closest('.relative.h-full').querySelector('[data-role=cta-continue]').classList.toggle('opacity-50', !this.checked)"
          />
          <span class="text-[12px] text-slate-700 leading-snug">
            Li e aceito os
            <button
              type="button"
              class="text-violet-700 font-bold underline"
              onclick="this.closest('.relative.h-full').querySelector('[data-modal=terms]').classList.remove('hidden')"
            >termos da plataforma</button>.
          </span>
        </label>

        <button
          data-role="cta-continue"
          data-nav="next"
          disabled
          class="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-civic-purple text-white font-extrabold text-[13px] shadow-lg opacity-50 disabled:cursor-not-allowed enabled:active:scale-[.99] transition"
        >
          Continuar →
        </button>
      </div>

      <div data-modal="terms" class="absolute inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-sm flex items-end">
        <div class="bg-white w-full max-h-[88%] rounded-t-3xl flex flex-col shadow-2xl">
          <div class="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-100">
            <div>
              <div class="text-[10px] font-black uppercase tracking-wider text-slate-400">CityHero · Pôrto Belo</div>
              <div class="text-[15px] font-extrabold text-slate-900">Termos da plataforma</div>
            </div>
            <button
              class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-lg"
              onclick="this.closest('[data-modal=terms]').classList.add('hidden')"
              aria-label="Fechar termos"
            >×</button>
          </div>

          <div class="px-5 py-4 overflow-y-auto text-[12px] text-slate-700 leading-relaxed space-y-3">
            <p><b>Rascunho · revisar com jurídico antes do lançamento.</b></p>
            <p><b>1. Aceitação.</b> Ao usar o CityHero, você concorda com estes termos. Se não concordar, não utilize o aplicativo.</p>
            <p><b>2. Conta e identidade.</b> O acesso é feito via Gov.br, garantindo identificação real do cidadão. Mesmo em reportes marcados como <i>anônimos</i> no feed público, a prefeitura e a equipe de moderação têm acesso à identidade do autor para fins legais e de moderação.</p>
            <p><b>3. Conteúdo.</b> Você é responsável pelo conteúdo que envia (fotos, descrições, comentários). É proibido enviar falsas denúncias, conteúdo ofensivo, discriminatório, difamatório, sexual, violento ou que viole direitos de terceiros.</p>
            <p><b>4. Moderação.</b> Reportes e comentários podem ser denunciados por outros usuários. A equipe avalia cada caso e pode aplicar sanções proporcionais: advertência, redução de XP, suspensão temporária da conta ou bloqueio definitivo.</p>
            <p><b>5. Privacidade e LGPD.</b> Tratamos seus dados conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018). Fotos enviadas têm rostos e placas automaticamente anonimizados antes da exibição pública. Para detalhes, consulte a Política de Privacidade.</p>
            <p><b>6. Propriedade intelectual.</b> Você concede ao CityHero e à prefeitura licença não exclusiva para usar o conteúdo enviado no contexto de manutenção urbana e prestação de contas à população.</p>
            <p><b>7. Limitação de responsabilidade.</b> O CityHero é uma ferramenta de intermediação; a execução dos serviços urbanos é responsabilidade da prefeitura.</p>
            <p><b>8. Alterações.</b> Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas com pelo menos 15 dias de antecedência.</p>
            <p><b>9. Foro.</b> Fica eleito o foro da comarca da cidade-piloto (Pôrto Belo · SC) para dirimir conflitos.</p>
            <p class="text-[10px] text-slate-400 pt-2">Última atualização: rascunho · versão de protótipo.</p>
          </div>

          <div class="px-5 py-3 border-t border-slate-100">
            <button
              class="w-full py-3 rounded-xl bg-slate-900 text-white font-extrabold text-[13px]"
              onclick="this.closest('[data-modal=terms]').classList.add('hidden')"
            >Entendi</button>
          </div>
        </div>
      </div>
    </div>`,
  onMount: (root) => {
    // Rotação das mensagens por faixa etária (demo do que será escolhido pelo
    // Gov.br em produção). Cada frase em ~30 palavras, em tom de norma social
    // (mais eficaz que shame/medo segundo a literatura de nudges).
    const target = root.querySelector('[data-rotator]');
    if (!target) return null;

    const messages = [
      {
        tag: '<18',
        bg: 'bg-sky-100 text-sky-700',
        html: `Aqui não é anônimo. Cada publicação está atrelada ao seu nome — pessoas da sua família, escola e cidade podem ver.`,
      },
      {
        tag: '+18',
        bg: 'bg-violet-100 text-violet-700',
        html: `Usamos seu perfil no Gov.br. O que você escrever impacta sua reputação na cidade — e fica registrado pra sempre.`,
      },
      {
        tag: '+30',
        bg: 'bg-amber-100 text-amber-700',
        html: `Aqui sua palavra vira ação na sua cidade. Mentir ou ofender desvia o foco da equipe que trabalha pra atender pessoas com problemas reais.`,
      },
      {
        tag: '+60',
        bg: 'bg-emerald-100 text-emerald-700',
        html: `Aqui sua voz constrói a cidade que fica pros seus filhos e netos. Trate ela com zelo — com a sua honra.`,
      },
    ];

    let i = 0;
    const render = () => {
      const m = messages[i];
      target.innerHTML = `
        <div>
          <span class="inline-block px-2 py-0.5 rounded-full ${m.bg} text-[10px] font-black mb-1.5">${m.tag} anos</span>
          <div>${m.html}</div>
        </div>
      `;
      i = (i + 1) % messages.length;
    };
    render();
    const id = setInterval(render, 10000);

    return { destroy: () => clearInterval(id) };
  },
};
