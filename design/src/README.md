# CityHero · Protótipo modular

Versão modular do protótipo original (`design/index.html`, 3861 linhas monolíticas),
reescrita seguindo **Atomic Design** (Brad Frost) + **ES modules**. Sem build step
— roda direto no navegador abrindo `design/prototype.html`.

O HTML original segue intocado por duas razões:

1. É a fonte de referência visual enquanto o protótipo evolui.
2. Permite comparar as duas versões (pixel-perfect) enquanto a modular se estabiliza.

---

## Estrutura de pastas

```
design/
├── index.html              ← original, não mexer
├── prototype.html          ← entry modular (usa import type="module")
└── src/
    ├── main.js             ← boot: renderGrid + createFlow + wireFlowNavigation
    ├── renderer.js         ← lógica de renderização grid + flow modes
    ├── README.md           ← este arquivo
    │
    ├── tokens/             ← fonte única da paleta
    │   └── colors.js       ← BRAND, CIVIC, CATEGORY
    │
    ├── styles/             ← CSS que é mais claro fora de Tailwind
    │   └── base.css        ← frame de telefone, pin, pulse, ba-slider, tagline rotativa…
    │
    ├── atoms/              ← blocos indivisíveis · 1 função, nenhum estado
    │   ├── StatusBar.js    ← statusBar(theme) — barra 10:34 · GPS · 4G · 100%
    │   └── CategoryChip.js ← categoryChip(label, color, emoji)
    │
    ├── organisms/          ← regiões completas de UI, possivelmente com estado/lib
    │   ├── BottomNav.js    ← bottomNav / staticBottomNav (5 abas, FAB câmera)
    │   ├── MapBackground.js← fundo decorativo (onde não cabe Leaflet)
    │   └── LeafletMap.js   ← mountLeafletMap(host, { center, markers }) → { destroy }
    │
    ├── templates/          ← (reservado) layouts de tela que não são tela completa
    │
    ├── screens/            ← 29 telas, uma por arquivo. Cada uma exporta um Screen
    │   ├── 01-splash.js
    │   ├── 02-city-select.js
    │   ├── … (29 arquivos)
    │   └── index.js        ← registry ordenado (SCREENS[])
    │
    └── lib/
        └── nav.js          ← wireFlowNavigation — delegação de clicks data-nav=*
```

### Por que essa hierarquia?

| Camada | Responsabilidade | Dependências permitidas |
|---|---|---|
| **tokens** | Valores crus (cores, tipografia) | Nada |
| **styles** | CSS compartilhado | Nada |
| **atoms** | UI indivisível | tokens |
| **molecules** | Atoms compostos | atoms, tokens |
| **organisms** | Seções complexas | atoms, molecules, libs externas |
| **templates** | Layout de página sem conteúdo | organisms |
| **screens** | Tela inteira | tudo acima |

Regra: um módulo **só importa coisas da sua camada ou abaixo**. Isso é o que
garante que a base fica reutilizável sem acoplamento. Violações viram dependências
circulares silenciosas.

---

## Contrato de uma Screen

Cada arquivo em `screens/` exporta `default` um objeto com:

```js
{
  title:   string,   // identificador único (usado por data-target na navegação)
  group:   'onboarding' | 'core' | 'support' | 'gamification',
  summary: string,   // 1 linha, aparece no card do grid mode
  note:    string,   // HTML curto, aparece no painel "notas de design"
  html:    () => string,              // retorna o innerHTML do .phone-scroll
  onMount?: (root: HTMLElement) => ({ destroy? } | null),
}
```

O `onMount` é opcional e só é chamado depois que o HTML foi injetado no DOM —
é onde vivem efeitos colaterais (Leaflet, timers, observers). O retorno `{destroy}`
é chamado pelo renderer quando a tela é desmontada (evita leak e erros tipo
"Map container is already initialized" do Leaflet).

---

## Navegação interativa

Botões dentro de uma Screen podem carregar:

- `data-nav="next"` — próxima no registry
- `data-nav="prev"` — anterior
- `data-nav="goto" data-target="Nome da Tela"` — pula direto por título
- `data-nav="gov"`  — caso especial do Gov.br no splash (equivale a `next` na sequência)

Toda a lógica está em `src/lib/nav.js` via event delegation no `document`. Zero
setup necessário dentro da tela — só marcar o botão com os atributos.

---

## Como adicionar uma tela nova

1. Crie `src/screens/NN-slug.js` exportando o objeto Screen.
2. Importe e adicione na ordem em `src/screens/index.js`.
3. Pronto. O renderer pega sozinho.

Se precisar reusar um componente em mais de uma tela, promova de "helper local
dentro do arquivo" para `atoms/`, `molecules/` ou `organisms/` conforme a
complexidade. Helpers que só existem em uma tela (ex.: `feedItem` em `07-civic-feed.js`,
`obra` em `25-works-in-progress.js`) ficam inline até serem reusados.

---

## Caminho pra React / React Native

A arquitetura foi desenhada pra suportar uma migração direta:

1. **tokens** → viram `packages/design_system/src/tokens/`.
2. **atoms** → cada helper de template string vira `<StatusBar theme="dark" />`,
   `<CategoryChip label color emoji />` etc.
3. **organisms** → `<BottomNav active="home" />`, `<PhoneFrame />`, `<LeafletMap />`
   (com `react-leaflet` no web, `react-native-maps` no mobile).
4. **screens** → compositions chamando os componentes, talvez já em
   `apps/web/src/app/citizen-prototype/` (Next.js) ou `apps/mobile/src/screens/`
   (React Native).

O contrato `{title, group, html, onMount}` é o análogo de `React.FC + useEffect`.
A diferença é cosmética — o raciocínio atômico sobrevive à migração.

---

## O que não foi extraído (por opção)

- Caminhos de foto (`feed-photos/…`) estão hard-coded nas telas que os usam. Numa
  versão React seriam props ou um `assets/` tipado. Aqui, o ganho não compensa
  a indireção.
- `onclick="…"` inline em `10-report-confirm.js` (toggle Identificada/Anônima) —
  foi mantido como no original porque é um hack do protótipo pra mudar
  `data-target` dinamicamente. Em React viraria estado local.
- Gradientes e paletas específicas de uma tela ficaram inline. Só o que repete
  (brand/civic) vive em `tokens/colors.js`.
