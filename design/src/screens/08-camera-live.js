import { statusBar } from "../atoms/StatusBar.js";

/** Tela 08 · Câmera com IA (ao vivo) — viewfinder com bounding box animada */
export default {
  title: "Câmera com IA (ao vivo)",
  group: "core",
  summary: "Viewfinder · bounding box · 94%",
  note: `Tela mais "wow" do app. Bounding box ciano + label com % de confiança. <b>Aviso "Anonimização ativa"</b> aparece já para mostrar compliance (LGPD) sem precisar explicar. Sem câmera frontal.`,
  html: () => `
    <div class="relative h-full text-white overflow-hidden bg-black">
      <div class="cam-bg absolute inset-0" style="background-size:cover;background-position:center center;transition:background-image .25s ease"></div>
      <div class="absolute inset-x-0 top-0 h-36"    style="background:linear-gradient(180deg,rgba(0,0,0,.55),transparent)"></div>
      <div class="absolute inset-x-0 bottom-0 h-48" style="background:linear-gradient(180deg,transparent,rgba(0,0,0,.65))"></div>

      ${statusBar("light")}

      <div class="absolute top-11 left-0 right-0 px-4 flex items-center justify-between">
        <button class="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">←</button>
        <div class="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur text-[10px] font-bold flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ANONIMIZAÇÃO ATIVA
        </div>
        <button class="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">⚡</button>
      </div>

      <div class="detect-box cam-box" style="top:50%;left:45%;width:35%;height:20%;transition:all .45s cubic-bezier(.4,0,.2,1)"></div>
      <div class="cam-label absolute bg-cyan-400 text-slate-900 font-black px-3.5 py-1.5 rounded-md text-[12px] shadow-lg flex items-center gap-1.5 whitespace-nowrap" style="top:50%;left:45%;transform:translateY(-120%);transition:all .45s cubic-bezier(.4,0,.2,1)">
        <span class="cam-emoji">🕳️</span><span class="cam-text">BURACO · 94%</span>
      </div>

      <div class="absolute left-3 right-3 bottom-30 bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-4 py-2.5 text-[11px] leading-snug text-center">
        Enquadre o problema e <b>toque</b> para capturar.<br/>Evite capturar dados sensíveis e expor pessoas.
      </div>

      <div class="absolute bottom-8 left-0 right-0 flex items-center justify-center">
        <button data-nav="goto" data-target="Confirmação do Reporte" class="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl">
          <div class="w-16 h-16 rounded-full border-4 border-slate-900"></div>
        </button>
      </div>
    </div>`,
  onMount: (root) => {
    const bg = root.querySelector(".cam-bg");
    const box = root.querySelector(".cam-box");
    const label = root.querySelector(".cam-label");
    const emoji = root.querySelector(".cam-emoji");
    const text = root.querySelector(".cam-text");
    if (!bg || !box || !label) return null;

    // Coords calibradas a partir de marcadores nas fotos originais (container 320×660, background-size:cover).
    const frames = [
      {
        url: "feed-photos/camera-buraco.png",
        pos: "center center",
        box: { t: 51, l: 14, w: 50, h: 26 },
        emoji: "🕳️",
        label: "BURACO",
        conf: 94,
      },
      {
        url: "feed-photos/camera-placa-caida.png",
        pos: "center center",
        box: { t: 24, l: 53, w: 44, h: 31 },
        emoji: "🪧",
        label: "PLACA CAÍDA",
        conf: 89,
      },
      {
        url: "feed-photos/camera-vandalismo.png",
        pos: "0% 50%",
        box: { t: 33, l: 4, w: 53, h: 20 },
        emoji: "🎨",
        label: "PICHAÇÃO",
        conf: 91,
      },
    ];

    let i = 0;
    const apply = () => {
      const f = frames[i];
      bg.style.backgroundImage = `url('${f.url}')`;
      bg.style.backgroundPosition = f.pos;
      box.style.top = f.box.t + "%";
      box.style.left = f.box.l + "%";
      box.style.width = f.box.w + "%";
      box.style.height = f.box.h + "%";
      label.style.top = f.box.t + "%";
      label.style.left = f.box.l + "%";
      emoji.textContent = f.emoji;
      text.textContent = `${f.label} · ${f.conf}%`;
    };
    apply();
    const timer = setInterval(() => {
      i = (i + 1) % frames.length;
      apply();
    }, 3000);

    return { destroy: () => clearInterval(timer) };
  },
};
