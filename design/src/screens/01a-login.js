import { statusBar } from "../atoms/StatusBar.js";

/** Tela 01a · Login */
export default {
  label: "01a",
  title: "Login",
  group: "onboarding",
  summary: "E-mail e senha · acesso rápido",
  note: `Tela de login simples com <b>e-mail e senha</b>. Aparece após o usuário tocar em "Começar — sou cidadão" na splash. Link para criação de conta e recuperação de senha. Design limpo com fundo gradiente sutil, mantendo a identidade visual do CityHero.`,
  html: () => `
    <div class="relative h-full bg-gradient-to-b from-white to-brand-50">
      ${statusBar("dark")}
      <div class="px-6 pt-2 flex items-center">
        <button data-nav="prev" class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">←</button>
      </div>

      <div class="px-7 mt-4 flex flex-col items-center">
        <!-- Logo pequena -->
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-civic-purple flex items-center justify-center shadow-lg mb-3">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-2xl">🦸</div>
        </div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Entrar no CityHero</h1>
        <p class="text-[13px] text-slate-500 mt-1">Faça login para reportar e acompanhar</p>
      </div>

      <div class="px-7 mt-7 space-y-4">
        <!-- Campo e-mail -->
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">E-mail</label>
          <div class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-slate-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition shadow-sm">
            <span class="text-slate-400 text-[15px]">✉</span>
            <input type="email" placeholder="seu@email.com" class="flex-1 bg-transparent text-[14px] text-slate-800 placeholder:text-slate-300 outline-none font-medium" />
          </div>
        </div>

        <!-- Campo senha -->
        <div>
          <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Senha</label>
          <div class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-slate-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition shadow-sm">
            <span class="text-slate-400 text-[15px]">🔒</span>
            <input type="password" placeholder="••••••••" class="flex-1 bg-transparent text-[14px] text-slate-800 placeholder:text-slate-300 outline-none font-medium" />
            <button class="text-[11px] font-bold text-brand-500 hover:text-brand-700 transition">VER</button>
          </div>
        </div>

        <!-- Esqueci senha -->
        <div class="flex justify-end">
          <button class="text-[12px] font-semibold text-brand-600 hover:text-brand-800 transition">Esqueci minha senha</button>
        </div>

        <!-- Botão Entrar -->
        <button data-nav="next" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-extrabold shadow-lg hover:from-brand-600 hover:to-brand-700 transition text-[15px]">
          Entrar
        </button>
      </div>

      <!-- Criar conta -->
      <div class="absolute bottom-5 left-0 right-0 px-7">
        <p class="text-center text-[13px] text-slate-500">
          Não tem conta? <button class="font-bold text-brand-600 hover:text-brand-800 transition">Criar agora</button>
        </p>
      </div>
    </div>`,
};
