import { statusBar } from "../atoms/StatusBar.js";

/** Tela 01 · Splash / Boas-vindas */
export default {
  title: "Splash / Boas-vindas",
  group: "onboarding",
  summary: "Primeira impressão · login Gov.br opcional",
  note: `Gradiente brand + partículas flutuantes reforçam o tom lúdico. <b>Tagline rotativa</b> (troca a cada 3s, ciclo de 18s) mostra 6 facetas do produto — engajamento + motivação cívica + transparência. Respeita <code>prefers-reduced-motion</code>. CTA primário leva ao onboarding; secundário entra via <b>Gov.br</b>.`,
  html: () => `
    <div class="relative h-full overflow-hidden" style="background: linear-gradient(160deg,#F97316 0%, #EA580C 35%, #7C3AED 100%);">
      ${statusBar("light")}
      <!-- Confetti -->
      <div class="confetti" style="background:#FCD34D;top:80px;left:50px;animation-delay:.2s"></div>
      <div class="confetti" style="background:#34D399;top:140px;right:60px;animation-delay:.6s"></div>
      <div class="confetti" style="background:#F472B6;top:220px;left:30px;animation-delay:1s"></div>
      <div class="confetti" style="background:#38BDF8;top:260px;right:30px;animation-delay:1.4s"></div>

      <div class="relative z-10 h-full flex flex-col items-center justify-between px-7 pt-2 pb-14 text-white">
        <div></div>

        <div class="flex flex-col items-center text-center mt-4">
          <div class="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mb-4 shadow-2xl border border-white/20">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-brand-100 flex items-center justify-center text-3xl">🦸</div>
          </div>
          <h1 class="text-4xl font-black tracking-tight">CityHero</h1>
          <div class="rot-wrap mt-3 max-w-[260px]">
            <p class="rot-line text-white/95 text-[15px] leading-snug font-semibold">
              Reporte em 3 segundos. Melhore a sua cidade.
            </p>
            <p class="rot-line text-white/95 text-[15px] leading-snug font-semibold">
              Cobre os políticos locais. Baseie-se em dados.
            </p>
            <p class="rot-line text-white/95 text-[15px] leading-snug font-semibold">
              Seja cidadão modelo<br/>no seu quarteirão.
            </p>
            <p class="rot-line text-white/95 text-[15px] leading-snug font-semibold">
              A prefeitura não vê tudo. Reporte.
            </p>
            <p class="rot-line text-white/95 text-[15px] leading-snug font-semibold">
              Cada foto sua torna a cidade melhor.
            </p>
            <p class="rot-line text-white/95 text-[15px] leading-snug font-semibold">
              Viu, fotografou, reportou. A rua agradece.
            </p>
          </div>
        </div>

        <div class="w-full">
          <button data-nav="next" class="w-full py-3.5 rounded-2xl bg-white text-brand-700 font-extrabold shadow-lg hover:bg-brand-50 transition">
            Entrar com e-mail
          </button>
          <button data-nav="gov" class="mt-2.5 w-full py-3.5 rounded-2xl bg-white/15 border border-white/25 backdrop-blur text-white font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition">
            <span class="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-300 to-green-400"></span>
            Entrar com Gov.br
          </button>
          <p class="text-center text-white/80 text-[10px] mt-3 leading-snug px-3">
            Ao continuar, você aceita a nossa <u>Política de Privacidade</u> (LGPD).
          </p>
        </div>
      </div>
    </div>`,
};
