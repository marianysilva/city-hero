/**
 * Atom · CategoryChip
 *
 * Pill com emoji + label, cor sólida.
 * Usado em Feed Cívico, Obras em Andamento, Home (pins/filtros), etc.
 */
export const categoryChip = (label, color = "bg-brand-500", emoji = "🕳️") => `
  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${color} text-white text-[10px] font-bold">
    <span>${emoji}</span>${label}
  </span>`;
