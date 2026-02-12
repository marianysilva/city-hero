/**
 * Organism · MapBackground
 *
 * Fundo decorativo de mapa (ruas em grid, parques, água).
 * Usado só onde o Leaflet não cabe (onboarding, confirmações pequenas).
 * A Home usa LeafletMap.js (mapa real).
 */
export const mapBackground = () => `
  <div class="map-bg absolute inset-0">
    <div class="streets"></div>
    <div class="park"  style="width:130px;height:90px;top:80px;left:30px"></div>
    <div class="park"  style="width:80px;height:60px;bottom:170px;right:40px"></div>
    <div class="water" style="width:160px;height:180px;bottom:0;right:-60px"></div>
    <div class="absolute text-[9px] font-semibold text-slate-400 tracking-wider" style="top:160px;left:40px;transform:rotate(-8deg)">Rua das Flores</div>
    <div class="absolute text-[9px] font-semibold text-slate-400 tracking-wider" style="top:260px;left:80px">Av. Atlântica</div>
    <div class="absolute text-[9px] font-semibold text-slate-400 tracking-wider" style="top:360px;left:50px;transform:rotate(-5deg)">R. São Pedro</div>
    <div class="absolute text-[9px] font-semibold text-slate-400 tracking-wider" style="top:200px;right:30px">R. do Porto</div>
  </div>`;
