/**
 * Atom · SearchBar
 *
 * Barra de busca padrão do app — usada sempre que uma tela permite pesquisar.
 * Nunca representar busca como um botão ícone separado: a barra fica visível
 * no topo da tela (logo abaixo do header), revelando a intenção e poupando
 * um tap.
 *
 * Reutilizada por: 02 (Escolher Cidade), 07 (Feed Cívico), 25 (Obras),
 * e qualquer outra tela com busca.
 */
export const searchBar = (placeholder = "Buscar…") => `
  <div class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200">
    <span class="text-slate-400 text-sm">🔍</span>
    <input
      type="search"
      placeholder="${placeholder}"
      class="flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400"
      aria-label="${placeholder}"
    />
  </div>
`;
