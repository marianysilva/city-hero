/**
 * Organism · LeafletMap helper
 *
 * Monta um mapa Leaflet real dentro de um host DOM.
 * Usado apenas pela Home (Mapa Hiperlocal); telas pequenas usam MapBackground.
 *
 * Retorna `{ destroy }` para o renderer limpar a instância ao trocar de tela.
 */

const BLANK_TILE = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

const makeDivIcon = (bg, emoji, sm = false, selected = false) => {
  const baseSize = sm ? 30 : 36;
  const size = selected ? baseSize + 14 : baseSize;
  const fontSize = selected ? 19 : (sm ? 13 : 15);
  const border = selected ? '4px solid #fff' : '3px solid #fff';
  const shadow = selected
    ? `box-shadow:0 0 0 4px rgba(255,255,255,.9),0 0 0 9px ${bg},0 12px 26px -2px rgba(15,23,42,.55);`
    : `box-shadow:0 6px 14px -2px rgba(15,23,42,.4);`;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:${bg};border:${border};${shadow}display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:${fontSize}px;line-height:1">${emoji}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

const makeUserIcon = () => L.divIcon({
  className: '',
  html: `<div class="pulse-dot" style="position:relative"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/**
 * @param {HTMLElement} host   container onde o mapa será montado
 * @param {Object}      opts
 * @param {[number,number]} opts.center
 * @param {number}      [opts.zoom=16]
 * @param {Array<{pos:[number,number],bg:string,emoji:string,sm?:boolean,selected?:boolean,title?:string}>} [opts.markers]
 */
export const mountLeafletMap = (host, { center, zoom = 16, markers = [] }) => {
  if (typeof L === 'undefined' || !host) return null;

  // Guard — re-mount: Leaflet amarra uma _leaflet_id no host; precisa limpar
  if (host._leaflet_id) {
    try { delete host._leaflet_id; } catch (e) {}
    host.innerHTML = '';
  }

  let map;
  try {
    map = L.map(host, {
      center, zoom,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true,
    });
  } catch (e) {
    console.warn('[CityHero] Leaflet init falhou:', e);
    return null;
  }

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    crossOrigin: true,
    errorTileUrl: BLANK_TILE,
  }).addTo(map);

  L.control.attribution({ prefix: false, position: 'bottomleft' })
    .addAttribution('© OSM')
    .addTo(map);

  markers.forEach(m => {
    L.marker(m.pos, {
      icon: makeDivIcon(m.bg, m.emoji, m.sm, m.selected),
      title: m.title || '',
      zIndexOffset: m.selected ? 1000 : 0,
    }).addTo(map);
  });

  L.marker(center, { icon: makeUserIcon(), interactive: false, keyboard: false }).addTo(map);

  // Leaflet mede o container antes do CSS assentar às vezes; invalida depois.
  let sizingTimer = setTimeout(() => {
    sizingTimer = null;
    try { map.invalidateSize(); } catch (e) {}
  }, 120);

  return {
    destroy: () => {
      if (sizingTimer) { clearTimeout(sizingTimer); sizingTimer = null; }
      try { map.remove(); } catch (e) {}
    },
  };
};
