# /goal — Alinhamento de docs/tasks e docs/engineering (apps/backend + apps/city-hero)

Plano de execução em 10 rodadas de `/goal`, uma por vez, cada uma em sua
própria sessão. Cada rodada só deve começar depois que a anterior tiver
**commitado** — algumas rodadas dependem de `docs/engineering/` já revisado
(`design-system.md`, `component-inventory.md`).

**Ordem de execução:** Batch 0 → Batch 1 → Batch 2 → B3 → B4 → B5 → B6 → B7 → B8 → B9

Combine com **auto mode** para as rodadas correrem sem parar pra aprovar
cada tool call. Se algum lote não terminar dentro do orçamento de turnos,
rode `/goal` sem argumento pra ver o motivo relatado pelo avaliador, ajuste
o turno-limite ou quebre o lote em pastas menores.

## Decisões que moldaram esse plano

- Tarefas rotuladas `backend` mas que dependem de infraestrutura fora de
  `apps/backend`/`apps/city-hero` (Airflow, dbt, Superset, `apps/web`,
  Field Team App) — como `tasks/21b-elected-officials/05-data-ingestion-pipeline.md`
  — são movidas inteiras para `docs/out-of-mvp/`, sem split. O rótulo não
  decide; a dependência real decide.
- `docs/engineering/*.md` (padrões/referência, não tarefas atômicas) entram
  no escopo de revisão, porque as tarefas herdam qualquer inconsistência
  desses documentos.
- Execução em lotes pequenos e correlacionados (não um único `/goal` gigante)
  para evitar estouro de contexto e deriva de qualidade nas rodadas finais.
- Cada rodada termina com commit `docs:` próprio — sem squash automático.

## Lotes de telas — reagrupados por correlação de domínio/fluxo

| Lote   | Pastas                                                                                                                                 | Por que agrupadas                                                                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B3** | 01-splash, 02-city-select, 03-onboarding-camera, 04-onboarding-gamification, 04b-onboarding-community-pact, 05-onboarding-neighborhood | Funil de onboarding completo — fluxo sequencial único, do splash até o usuário estar pronto pra usar o app                                                  |
| **B4** | 08-camera-live, 09-manual-report, 10-report-confirm, 11-anonymous-send, 12-heroes-league                                               | Fluxo de criação de report — camera-live cai em manual-report (fallback), ambos convergem em report-confirm, que bifurca em anonymous-send OU heroes-league |
| **B5** | 06-home-map, 07-civic-feed, 19-notifications                                                                                           | Hubs de navegação com padrão de lista+filter-chips compartilhado                                                                                            |
| **B6** | 13-detail-in-progress, 14-detail-ticket, 15-nps-feedback, 16-my-reports, 17-detail-merged, 18-sync-queue                               | Ciclo de vida do report após envio — my-reports lista, leva aos details, NPS pós-resolução, sync-queue pros criados offline                                 |
| **B7** | 20-city-profile, 21-prefecture-news, 21b-elected-officials, 22-programs-transparency, 23-bolsa-familia-detail, 24-irregularity-report  | Domínio de transparência cívica — city-profile é o hub, as outras são telas que ele referencia                                                              |
| **B8** | 25-services-public-works, 26-public-works-list, 27-public-work-detail                                                                  | Fluxo de obras públicas — services é o hub, list e detail são o drill-down                                                                                  |
| **B9** | 28-citizen-profile, 29-achievements-badges, 30-neighborhood-ranking                                                                    | Perfil e gamificação — citizen-profile é o hub, badges e ranking são extensões da gamificação                                                               |

---

## Batch 0 — Triagem e movimentação (rode primeiro, sozinho)

```
/goal Escopo: varrer docs/tasks/**/*.md e docs/engineering/*.md e mover para docs/out-of-mvp/ (preservando a estrutura de subpastas) qualquer arquivo cujos Critérios de Aceite dependam, como pré-requisito obrigatório, de infraestrutura fora de apps/backend e apps/city-hero — ou seja, de apps/web (Painel Operacional), Field Team App, analytics/pipelines (Airflow), analytics/transformations (dbt) ou analytics/visualizations (Superset). Isso vale mesmo que o header da tarefa esteja rotulado `backend` — o rótulo não decide, a dependência real decide. Exemplo confirmado: tasks/21b-elected-officials/05-data-ingestion-pipeline.md depende de Airflow+dbt, deve mover. Nesta rodada NÃO reescreva conteúdo de tarefa nenhuma além de: mover o arquivo, corrigir links de "Dependencies" que quebrarem por causa da mudança de caminho, e atualizar docs/tasks/README.md (árvore de pastas, tabela "Coverage by features.md section", contagem no rodapé) para refletir a nova localização.

Condição de conclusão: (0) a documentacao deve estar em ingles; (1) você rodou `grep -rliE "apps/web|field team|analytics/pipelines|analytics/transformations|analytics/visualizations|airflow|dbt |superset" docs/tasks docs/engineering` e colou o resultado na conversa, confirmando que os únicos hits restantes são menções informativas sem virar dependência de bloqueio; (2) você listou explicitamente na conversa cada arquivo movido (origem → destino) e o motivo; (3) docs/tasks/README.md foi atualizado e reflete a estrutura atual; (4) `npm run format:check` passa; (5) `git status` mostra apenas as movimentações e edições esperadas em docs/ (nada em apps/backend, apps/city-hero, apps/web ou outro código); (6) você commitou com `git commit -m "docs: move out-of-mvp tasks to docs/out-of-mvp"` e o `git log` mais recente confirma esse commit. Ou pare após 25 turnos e reporte o que falta.
```

---

## Batch 1 — `docs/engineering/*.md`

```
/goal Escopo: revisar e, quando necessário, reescrever os arquivos em docs/engineering/ (architecture-patterns.md, coding-standards.md, component-inventory.md, design-hygiene.md, design-system.md, observability.md, observability-package-research.md, open-questions.md, security-baseline.md, testing-strategy.md, README.md). Esses documentos são a fonte de padrões que as tarefas em docs/tasks referenciam — se estiverem desatualizados ou inconsistentes, isso se propaga pra todas as tarefas alinhadas depois.

Para cada arquivo: (a) confira se ainda reflete a estrutura real de apps/backend, apps/city-hero e packages/design_system (leia o código-fonte relevante, não assuma); (b) para toda recomendação de biblioteca/framework citada (FastAPI, SQLAlchemy, Alembic, Expo/React Native, NativeWind, Storybook, etc.), use o MCP context7 (resolve-library-id → query-docs) pra confirmar que a orientação bate com a documentação atual da versão realmente instalada no projeto — sinalize e corrija qualquer padrão desatualizado, depreciado, ou que hoje seria overengineering dado o tamanho do time (projeto solo); (c) mantenha o tom objetivo e evite prescrever complexidade que o time não vai usar. Não altere docs/tasks/ nesta rodada — isso é lote separado.

Condição de conclusão: (0) a documentacao deve estar em ingles; você releu todos os 11 arquivos de docs/engineering/, relatou na conversa, arquivo por arquivo, se houve mudança e por quê (ou "sem mudanças, já consistente"), citou pelo menos uma consulta ao context7 para cada biblioteca central mencionada nesses docs (FastAPI, SQLAlchemy/Alembic, Expo/React Native, NativeWind, Storybook), `npm run format:check` passa, `git status` mostra só edições dentro de docs/engineering/, e você commitou com `git commit -m "docs: reconcile engineering standards with current stack"`. Ou pare após 30 turnos e reporte o que falta.
```

---

## Batch 2 — `docs/tasks/00-foundation/`

```
/goal Escopo: revisar e alinhar todos os arquivos de docs/tasks/00-foundation/ (_README.md + as 18 tarefas numeradas) ao skeleton padrão descrito em docs/tasks/README.md (Header / Context / User Story / Acceptance Criteria em Gherkin / Frontend / Backend / Database / Edge Cases & Error States / Privacy-LGPD / Analytics / Tests / Definition of Done). O objetivo final é que cada tarefa fique clara e objetiva o bastante pra ser implementada autonomamente depois via /loop, sem depender de contexto tribal.

Para cada tarefa: (a) confirme que todas as seções do skeleton existem e estão preenchidas (não vazias, não "TBD" sem explicação); (b) cheque as Acceptance Criteria contra o código já existente em apps/backend, apps/city-hero e packages/design_system — se algo já foi implementado de forma diferente do que a tarefa descreve, reconcilie a tarefa com a realidade (siga o precedente do commit 89f1264 "docs: reconcile design-tokens task doc with what shipped" pra 02-design-tokens.md); (c) para toda referência técnica a uma biblioteca (FastAPI, SQLAlchemy, Alembic, PostGIS, Expo, YOLOv8, WatermelonDB/SQLite, etc.), use o MCP context7 pra validar contra a documentação atual e sinalizar padrões desatualizados ou overengineered; (d) confira que os campos Dependencies no header apontam pra arquivos que ainda existem em docs/tasks (não movidos pro Batch 0); (e) não toque em docs/tasks fora de 00-foundation/ nesta rodada.

Condição de conclusão: (0) a documentacao deve estar em ingles; você processou os 19 arquivos de docs/tasks/00-foundation/ e relatou, arquivo por arquivo, o que mudou (ou "sem mudanças"), citou consultas ao context7 feitas para reconciliar referências técnicas, confirmou que nenhum Dependencies aponta pra um caminho inexistente, `npm run format:check` passa, `git status` mostra só edições dentro de docs/tasks/00-foundation/, e você commitou com `git commit -m "docs: align 00-foundation tasks to current stack and template"`. Ou pare após 35 turnos e reporte o que falta.
```

---

## B3 — Onboarding

```
/goal Escopo: revisar e alinhar todos os arquivos (_README.md + tarefas numeradas) das pastas de tela 01-splash, 02-city-select, 03-onboarding-camera, 04-onboarding-gamification, 04b-onboarding-community-pact, 05-onboarding-neighborhood em docs/tasks/ ao skeleton padrão descrito em docs/tasks/README.md (Header / Context / User Story / Acceptance Criteria em Gherkin / Frontend / Backend / Database / Edge Cases & Error States / Privacy-LGPD / Analytics / Tests / Definition of Done). O objetivo final é que cada tarefa fique clara e objetiva o bastante pra ser implementada autonomamente depois via /loop, sem depender de contexto tribal.

Para cada tarefa: (a) confirme que todas as seções do skeleton existem e estão preenchidas; (b) cheque consistência do fluxo sequencial entre essas telas — o onboarding é um funil único (splash → city-select → onboarding-camera → onboarding-gamification/community-pact → onboarding-neighborhood), então nomenclatura de estado, transições de rota e regras de "pular etapa"/"voltar" precisam bater entre as tarefas; (c) verifique contra docs/engineering/design-system.md e docs/engineering/component-inventory.md se algum componente descrito localmente na tarefa já deveria viver em packages/design_system e corrija se estiver desalinhado; (d) cheque as Acceptance Criteria e referências técnicas contra o código já existente em apps/city-hero, apps/backend e packages/design_system — reconcilie onde a implementação real já divergiu da tarefa; (e) para toda referência a biblioteca (Expo Router, React Native, NativeWind, etc.), use o MCP context7 pra validar contra a documentação atual e sinalizar padrões desatualizados ou overengineered; (f) confirme que os campos Dependencies no header apontam pra arquivos que ainda existem em docs/tasks. Não toque em pastas de tela fora deste lote.

Condição de conclusão: (0) a documentacao deve estar em ingles; você processou todos os arquivos das pastas 01-splash, 02-city-select, 03-onboarding-camera, 04-onboarding-gamification, 04b-onboarding-community-pact, 05-onboarding-neighborhood e relatou, arquivo por arquivo, o que mudou (ou "sem mudanças"), citou consultas ao context7 feitas, confirmou que nenhum Dependencies aponta pra um caminho inexistente, confirmou consistência do fluxo sequencial entre as tarefas do lote, `npm run format:check` passa, `git status` mostra só edições dentro dessas pastas, e você commitou com `git commit -m "docs: align onboarding flow tasks to current stack and template"`. Ou pare após 35 turnos e reporte o que falta.
```

## B4 — Fluxo de criação de report

```
/goal Escopo: revisar e alinhar todos os arquivos (_README.md + tarefas numeradas) das pastas de tela 08-camera-live, 09-manual-report, 10-report-confirm, 11-anonymous-send, 12-heroes-league em docs/tasks/ ao skeleton padrão descrito em docs/tasks/README.md (Header / Context / User Story / Acceptance Criteria em Gherkin / Frontend / Backend / Database / Edge Cases & Error States / Privacy-LGPD / Analytics / Tests / Definition of Done). O objetivo final é que cada tarefa fique clara e objetiva o bastante pra ser implementada autonomamente depois via /loop, sem depender de contexto tribal.

Para cada tarefa: (a) confirme que todas as seções do skeleton existem e estão preenchidas; (b) esse é o fluxo central de criação de report — camera-live cai em manual-report como fallback, ambos convergem em report-confirm, que bifurca em anonymous-send OU heroes-league dependendo do toggle de identificação; cheque que essa bifurcação está descrita de forma idêntica e sem contradição nas tarefas envolvidas, e que os contratos de dados (foto, GPS, categoria, anonimização) são consistentes ponta a ponta; (c) valide que a etapa de anonimização automática (blur de rosto/placa) aparece como obrigatória antes de qualquer imagem ficar pública, em todas as tarefas relevantes deste lote — é requisito legal (LGPD) do projeto; (d) verifique contra docs/engineering/design-system.md e docs/engineering/component-inventory.md se algum componente local já deveria viver em packages/design_system; (e) cheque Acceptance Criteria e referências técnicas contra o código já existente em apps/city-hero, apps/backend e packages/design_system; (f) para toda referência a biblioteca (câmera/Expo Camera, GPS/expo-location, NativeWind, etc.), use o MCP context7 pra validar contra a documentação atual e sinalizar padrões desatualizados ou overengineered; (g) confirme que os campos Dependencies no header apontam pra arquivos que ainda existem em docs/tasks. Não toque em pastas de tela fora deste lote.

Condição de conclusão: (0) a documentacao deve estar em ingles; você processou todos os arquivos das pastas 08-camera-live, 09-manual-report, 10-report-confirm, 11-anonymous-send, 12-heroes-league e relatou, arquivo por arquivo, o que mudou (ou "sem mudanças"), confirmou explicitamente que a etapa de anonimização automática está presente e consistente em todas as tarefas relevantes, citou consultas ao context7 feitas, confirmou que nenhum Dependencies aponta pra um caminho inexistente, `npm run format:check` passa, `git status` mostra só edições dentro dessas pastas, e você commitou com `git commit -m "docs: align report-creation flow tasks to current stack and template"`. Ou pare após 35 turnos e reporte o que falta.
```

## B5 — Hubs de navegação (home, feed, notifications)

```
/goal Escopo: revisar e alinhar todos os arquivos (_README.md + tarefas numeradas) das pastas de tela 06-home-map, 07-civic-feed, 19-notifications em docs/tasks/ ao skeleton padrão descrito em docs/tasks/README.md (Header / Context / User Story / Acceptance Criteria em Gherkin / Frontend / Backend / Database / Edge Cases & Error States / Privacy-LGPD / Analytics / Tests / Definition of Done). O objetivo final é que cada tarefa fique clara e objetiva o bastante pra ser implementada autonomamente depois via /loop, sem depender de contexto tribal.

Para cada tarefa: (a) confirme que todas as seções do skeleton existem e estão preenchidas; (b) essas três telas compartilham o mesmo padrão de UI — lista/mapa + filter-chips + pull-to-refresh/realtime updates — cheque que os nomes de componentes, estados de loading/empty/erro e o comportamento de filtro são descritos de forma consistente entre elas, e reaproveitados de packages/design_system quando aplicável (não redefinidos localmente em cada pasta); (c) verifique contra docs/engineering/design-system.md e docs/engineering/component-inventory.md se algum componente local já deveria viver em packages/design_system; (d) cheque Acceptance Criteria e referências técnicas contra o código já existente em apps/city-hero, apps/backend e packages/design_system; (e) para toda referência a biblioteca (mapa/Leaflet wrapper, realtime/websockets, push notifications, NativeWind, etc.), use o MCP context7 pra validar contra a documentação atual e sinalizar padrões desatualizados ou overengineered; (f) confirme que os campos Dependencies no header apontam pra arquivos que ainda existem em docs/tasks. Não toque em pastas de tela fora deste lote.

Condição de conclusão: (0) a documentacao deve estar em ingles; você processou todos os arquivos das pastas 06-home-map, 07-civic-feed, 19-notifications e relatou, arquivo por arquivo, o que mudou (ou "sem mudanças"), confirmou consistência do padrão lista+filter-chips entre as três telas, citou consultas ao context7 feitas, confirmou que nenhum Dependencies aponta pra um caminho inexistente, `npm run format:check` passa, `git status` mostra só edições dentro dessas pastas, e você commitou com `git commit -m "docs: align navigation-hub tasks (home/feed/notifications) to current stack and template"`. Ou pare após 30 turnos e reporte o que falta.
```

## B6 — Ciclo de vida do report (my reports, detalhes, sync)

```
/goal Escopo: revisar e alinhar todos os arquivos (_README.md + tarefas numeradas) das pastas de tela 13-detail-in-progress, 14-detail-ticket, 15-nps-feedback, 16-my-reports, 17-detail-merged, 18-sync-queue em docs/tasks/ ao skeleton padrão descrito em docs/tasks/README.md (Header / Context / User Story / Acceptance Criteria em Gherkin / Frontend / Backend / Database / Edge Cases & Error States / Privacy-LGPD / Analytics / Tests / Definition of Done). O objetivo final é que cada tarefa fique clara e objetiva o bastante pra ser implementada autonomamente depois via /loop, sem depender de contexto tribal.

Para cada tarefa: (a) confirme que todas as seções do skeleton existem e estão preenchidas; (b) essas telas cobrem o ciclo de vida completo de um report após o envio — my-reports é a lista/hub, que leva aos três estados de detalhe (in-progress, ticket resolvido, merged/duplicado), nps-feedback acontece após resolução, e sync-queue cobre os reports criados offline ainda não sincronizados; cheque que os status/labels de ticket usados (ex.: nomes de status, ícones, cores) são exatamente os mesmos em todas as seis tarefas — inconsistência de nomenclatura de status aqui é o erro mais provável; (c) verifique contra docs/engineering/design-system.md e docs/engineering/component-inventory.md se algum componente local já deveria viver em packages/design_system; (d) cheque Acceptance Criteria e referências técnicas contra o código já existente em apps/city-hero, apps/backend e packages/design_system, incluindo o mapeamento Open311 de status; (e) para toda referência a biblioteca (WatermelonDB/SQLite offline queue, NativeWind, etc.), use o MCP context7 pra validar contra a documentação atual e sinalizar padrões desatualizados ou overengineered; (f) confirme que os campos Dependencies no header apontam pra arquivos que ainda existem em docs/tasks. Não toque em pastas de tela fora deste lote.

Condição de conclusão: (0) a documentacao deve estar em ingles; você processou todos os arquivos das pastas 13-detail-in-progress, 14-detail-ticket, 15-nps-feedback, 16-my-reports, 17-detail-merged, 18-sync-queue e relatou, arquivo por arquivo, o que mudou (ou "sem mudanças"), confirmou explicitamente que os status/labels de ticket são consistentes nas seis tarefas, citou consultas ao context7 feitas, confirmou que nenhum Dependencies aponta pra um caminho inexistente, `npm run format:check` passa, `git status` mostra só edições dentro dessas pastas, e você commitou com `git commit -m "docs: align report-lifecycle tasks to current stack and template"`. Ou pare após 35 turnos e reporte o que falta.
```

## B7 — Transparência cívica

```
/goal Escopo: revisar e alinhar todos os arquivos (_README.md + tarefas numeradas) das pastas de tela 20-city-profile, 21-prefecture-news, 21b-elected-officials, 22-programs-transparency, 23-bolsa-familia-detail, 24-irregularity-report em docs/tasks/ ao skeleton padrão descrito em docs/tasks/README.md (Header / Context / User Story / Acceptance Criteria em Gherkin / Frontend / Backend / Database / Edge Cases & Error States / Privacy-LGPD / Analytics / Tests / Definition of Done). O objetivo final é que cada tarefa fique clara e objetiva o bastante pra ser implementada autonomamente depois via /loop, sem depender de contexto tribal.

Para cada tarefa: (a) confirme que todas as seções do skeleton existem e estão preenchidas; (b) city-profile é o hub que referencia as outras cinco telas — cheque que os links/entradas descritos em city-profile batem exatamente com o que cada tela-filha implementa, e que bolsa-familia-detail e irregularity-report (que dependem de programs-transparency) descrevem o contrato de dados de forma consistente com a tela-mãe; (c) esse domínio historicamente depende de dados de fontes externas (TSE, Câmara, Portal da Transparência, dados do município) — se alguma Acceptance Criteria aqui exigir, como pré-requisito de bloqueio, uma pipeline de ingestão via Airflow/dbt (fora de apps/backend), sinalize claramente na conversa em vez de mover silenciosamente (esse tipo de dependência já deveria ter sido tratado no lote de triagem, então é só uma checagem de sanidade); (d) verifique contra docs/engineering/design-system.md e docs/engineering/component-inventory.md se algum componente local já deveria viver em packages/design_system; (e) cheque Acceptance Criteria e referências técnicas contra o código já existente em apps/city-hero, apps/backend e packages/design_system; (f) use o MCP context7 pra validar toda referência a biblioteca contra a documentação atual e sinalizar padrões desatualizados ou overengineered; (g) confirme que os campos Dependencies no header apontam pra arquivos que ainda existem em docs/tasks. Não toque em pastas de tela fora deste lote.

Condição de conclusão: (0) a documentacao deve estar em ingles; você processou todos os arquivos das pastas 20-city-profile, 21-prefecture-news, 21b-elected-officials, 22-programs-transparency, 23-bolsa-familia-detail, 24-irregularity-report e relatou, arquivo por arquivo, o que mudou (ou "sem mudanças"), confirmou que os links do hub city-profile batem com as telas-filhas, sinalizou explicitamente qualquer dependência de bloqueio remanescente em Airflow/dbt que tenha encontrado, citou consultas ao context7 feitas, confirmou que nenhum Dependencies aponta pra um caminho inexistente, `npm run format:check` passa, `git status` mostra só edições dentro dessas pastas, e você commitou com `git commit -m "docs: align civic-transparency tasks to current stack and template"`. Ou pare após 35 turnos e reporte o que falta.
```

## B8 — Obras públicas

```
/goal Escopo: revisar e alinhar todos os arquivos (_README.md + tarefas numeradas) das pastas de tela 25-services-public-works, 26-public-works-list, 27-public-work-detail em docs/tasks/ ao skeleton padrão descrito em docs/tasks/README.md (Header / Context / User Story / Acceptance Criteria em Gherkin / Frontend / Backend / Database / Edge Cases & Error States / Privacy-LGPD / Analytics / Tests / Definition of Done). O objetivo final é que cada tarefa fique clara e objetiva o bastante pra ser implementada autonomamente depois via /loop, sem depender de contexto tribal.

Para cada tarefa: (a) confirme que todas as seções do skeleton existem e estão preenchidas; (b) esse é um fluxo de drill-down único — services-public-works é o hub, public-works-list é a listagem filtrável, public-work-detail é o detalhe com timeline/marcos; cheque que o contrato de dados de uma obra (status, marcos, datas, custo) é descrito de forma idêntica entre a lista e o detalhe; (c) verifique contra docs/engineering/design-system.md e docs/engineering/component-inventory.md se algum componente local já deveria viver em packages/design_system; (d) cheque Acceptance Criteria e referências técnicas contra o código já existente em apps/city-hero, apps/backend e packages/design_system; (e) use o MCP context7 pra validar toda referência a biblioteca (mapa/Leaflet wrapper, NativeWind, etc.) contra a documentação atual e sinalizar padrões desatualizados ou overengineered; (f) confirme que os campos Dependencies no header apontam pra arquivos que ainda existem em docs/tasks. Não toque em pastas de tela fora deste lote.

Condição de conclusão: (0) a documentacao deve estar em ingles; você processou todos os arquivos das pastas 25-services-public-works, 26-public-works-list, 27-public-work-detail e relatou, arquivo por arquivo, o que mudou (ou "sem mudanças"), confirmou que o contrato de dados de obra é consistente entre lista e detalhe, citou consultas ao context7 feitas, confirmou que nenhum Dependencies aponta pra um caminho inexistente, `npm run format:check` passa, `git status` mostra só edições dentro dessas pastas, e você commitou com `git commit -m "docs: align public-works tasks to current stack and template"`. Ou pare após 25 turnos e reporte o que falta.
```

## B9 — Perfil e gamificação

```
/goal Escopo: revisar e alinhar todos os arquivos (_README.md + tarefas numeradas) das pastas de tela 28-citizen-profile, 29-achievements-badges, 30-neighborhood-ranking em docs/tasks/ ao skeleton padrão descrito em docs/tasks/README.md (Header / Context / User Story / Acceptance Criteria em Gherkin / Frontend / Backend / Database / Edge Cases & Error States / Privacy-LGPD / Analytics / Tests / Definition of Done). O objetivo final é que cada tarefa fique clara e objetiva o bastante pra ser implementada autonomamente depois via /loop, sem depender de contexto tribal.

Para cada tarefa: (a) confirme que todas as seções do skeleton existem e estão preenchidas; (b) citizen-profile é o hub que referencia achievements-badges e neighborhood-ranking — cheque que a nomenclatura de XP/níveis/títulos (Citizen → Watchman → Neighborhood Guardian) e de medalhas/badges é idêntica nas três tarefas, já que é o mesmo sistema de gamificação visto de três ângulos; (c) verifique contra docs/engineering/design-system.md e docs/engineering/component-inventory.md se algum componente local já deveria viver em packages/design_system; (d) cheque Acceptance Criteria e referências técnicas contra o código já existente em apps/city-hero, apps/backend e packages/design_system; (e) use o MCP context7 pra validar toda referência a biblioteca contra a documentação atual e sinalizar padrões desatualizados ou overengineered; (f) confirme que os campos Dependencies no header apontam pra arquivos que ainda existem em docs/tasks. Não toque em pastas de tela fora deste lote.

Condição de conclusão: (0) a documentacao deve estar em ingles; você processou todos os arquivos das pastas 28-citizen-profile, 29-achievements-badges, 30-neighborhood-ranking e relatou, arquivo por arquivo, o que mudou (ou "sem mudanças"), confirmou que a nomenclatura de XP/níveis/badges é consistente nas três tarefas, citou consultas ao context7 feitas, confirmou que nenhum Dependencies aponta pra um caminho inexistente, `npm run format:check` passa, `git status` mostra só edições dentro dessas pastas, e você commitou com `git commit -m "docs: align profile and gamification tasks to current stack and template"`. Ou pare após 25 turnos e reporte o que falta.
```
