Este documento consolida todas as discussões técnicas, estratégicas e de produto que tivemos, servindo como um "manual de bordo" para o desenvolvimento do seu MVP (Mínimo Produto Viável).

---

# 🏙️ CityHero: Documentação Técnica e Estratégica

**Versão:** 1.0
**Conceito:** Plataforma de Zeladoria Urbana Inteligente & Engajamento Cidadão.

---

## 1. Visão Geral do Produto

O **CityHero** é um ecossistema de software focado em resolver a desconexão entre a população (que vê os problemas) e a prefeitura (que tem recursos limitados para resolver).

* **Diferencial:** Ao contrário dos sistemas atuais (burocráticos e baseados em formulários), o CityHero utiliza **Inteligência Artificial (Visão Computacional)**, **Gamificação** e **Predição de Dados** para otimizar a manutenção da cidade.
* **Estratégia de Entrada:** Atuar como uma "camada de inteligência" (Overlay) sobre os sistemas legados (ERPs) das prefeituras, sem tentar substituí-los no curto prazo.

---

## 2. Arquitetura do Ecossistema

### A. Aplicativo do Cidadão (Mobile)

* **Foco:** Engajamento, facilidade de uso e geração de dados de alta qualidade.
* **Tecnologia:** React Native ou Flutter.
* **Funcionalidades Chave:**
1. **Reporte via IA:** O usuário aponta a câmera, o app identifica o problema (Ex: "Buraco", "Lixo") e preenche a categoria automaticamente.
2. **Reporte Manual:** Seleção de local no mapa (Pino) e categoria via lista (para quando não há foto ou o usuário não está no local exato).
3. **Feed Cívico:** Uma "rede social" local onde vizinhos veem, apoiam (like) e comentam problemas do bairro.
4. **Gamificação:** Sistema de XP, Níveis (Cidadão -> Vigilante -> Guardião) e Conquistas.



### B. Painel do Gestor (Web)

* **Foco:** Tomada de decisão, eficiência operacional e predição.
* **Tecnologia:** React.js (Frontend) + Python/FastAPI (Backend de Dados).
* **Funcionalidades Chave:**
1. **Sala de Guerra:** Mapa de calor em tempo real dos problemas críticos.
2. **Roteirização Inteligente:** Agrupamento automático de chamados próximos para otimizar a rota das equipes de obras.
3. **Predição (IA):** Cruzamento de dados para prever problemas invisíveis (Ex: Vários relatos de "falta d'água" + "solo úmido" = Provável vazamento oculto).



---

## 3. Funcionalidades Detalhadas & Regras de Negócio

### 3.1. O Fluxo de Reporte e Enriquecimento (Crowdsourcing)

Para evitar dados duplicados e pobres:

* **Detecção de Proximidade:** Antes de criar um novo chamado, o sistema verifica se há reportes abertos num raio de **20 metros**.
* **Colaboração Visual:** Se o Usuário A criou um chamado *sem foto*, o Usuário B (ao passar pelo local) recebe um alerta: *"Ajude seu bairro! Adicione uma foto a este chamado e ganhe o dobro de pontos."*
* **Regra de Segurança:** A adição de fotos em chamados de terceiros exige validação de GPS (o usuário precisa estar fisicamente no local).

### 3.2. Feed Cívico e Comunidade

Transforma a reclamação solitária em pressão popular organizada.

* **Filtros:** "Meu Bairro" (Raio de 2km), "Em Alta" (Mais votados), "Resolvidos".
* **Interação:**
* **Apoiar:** Funciona como um "Upvote". Aumenta a prioridade do chamado no painel do prefeito.
* **Comentários:** Devem ser moderados por IA ou limitados a tags pré-definidas (Ex: [Perigoso], [Causa Trânsito]) para evitar toxicidade política.


* **Prova Social:** Exibir "Antes e Depois" quando um problema é resolvido.

### 3.3. Identidade e Anti-Spam

* **Login:** Inicialmente via Google/Telefone. Meta futura: Integração **Gov.br** (Login Único) para validação real de cidadania.
* **Reputação:**
* Usuário começa com 50 pontos.
* Reporte Falso (rejeitado pelo gestor) = -20 pontos.
* Score zero = Bloqueio automático (ou *Shadowban*: ele posta, mas ninguém vê).



---

## 4. Stack Tecnológico (Recomendado)

| Camada | Tecnologia | Motivo |
| --- | --- | --- |
| **Mobile** | React Native (Expo) | Rápido desenvolvimento, reaproveita lógica do React Web. |
| **Frontend Web** | React.js / Next.js | Padrão de mercado, ótimo para dashboards complexos. |
| **Backend** | Python (FastAPI) | Melhor linguagem para integrar IA e Ciência de Dados nativamente. |
| **Banco de Dados** | **PostgreSQL + PostGIS** | Essencial. O melhor banco open source para dados geográficos. |
| **Mapas** | Mapbox ou OpenStreetMap | Mais barato e customizável que Google Maps no início. |
| **IA / Visão** | YOLOv8 (Custom) ou AWS/Google Vision | Para detectar buracos/lixo nas fotos. |
| **Padrão API** | **Open311** (GeoReport v2) | Padrão internacional para interoperabilidade de sistemas cívicos. |
| **Visualização (BI)** | **Apache Superset** | Open Source, gratuito e extremamente poderoso. Permite criar os dashboards que serão embutidos no sistema. |
| **Embedding** | **Superset Embedded SDK** | Biblioteca JS que permite colocar o dashboard dentro do seu React App de forma fluida (sem iFrame feio). |
| **Embedding** | **Superset Embedded SDK** | Biblioteca JS que permite colocar o dashboard dentro do seu React App de forma fluida (sem iFrame feio). |
| **Transformação (ETL)** | **dbt** (data build tool) | Transforma os dados "sujos" do banco operacional em tabelas limpas para análise (Tabelas Fato/Dimensão). |
| **Orquestração** | **Apache Airflow** | Agenda e monitora os robôs (scrapers) e as atualizações dos dados a cada hora/dia. |
| **Data Warehouse** | **PostgreSQL/Snowflake** (Réplica) | Para o MVP, use uma réplica de leitura do Postgres. No futuro, migre para Snowflake se tiver milhões de linhas. |

**Com Postgres:**
Para o MVP (1 cidade, pouco dinheiro): É de graça e aguenta tranquilamente até uns 10 milhões de linhas.
Sistema -> API -> PostgreSQL (Transacional) -> dbt -> PostgreSQL (Analítico) -> Superset.


**Com Snowflake:**

Sistema -> API -> PostgreSQL (Transacional) -> Ingestão (Apache Airflow) -> Snowflake -> dbt -> Snowflake -> Superset.
Para a Versão 2.0 (Venda para grandes capitais): Sim. Quando você tiver 50 cidades e terabytes de fotos e dados de sensores, o PostgreSQL vai engasgar. Aí você migra para o Snowflake.

---

## 5. Panorama de Mercado e Sistemas Existentes

Aqui está o levantamento do que já existe, para você saber onde está pisando.

### A. Sistemas de Código Aberto (Open Source)

Estes você pode estudar o código, mas geralmente são tecnologicamente defasados.

1. **e-Cidade (Brasil):**
* *O que é:* ERP Público completo (Contabilidade, RH, Tributário).
* *Status:* Código aberto, mantido por comunidade e empresas.
* *Ponto Fraco:* Interface antiga, foco em burocracia interna, péssima experiência móvel para o cidadão.


2. **FixMyStreet (Global/Reino Unido):**
* *O que é:* O pai dos apps de zeladoria. Código aberto (baseado em Perl/Cobalt).
* *Status:* Muito usado na Europa.
* *Ponto Fraco:* É essencialmente um formulário de e-mail com mapa. Pouca ou nenhuma IA.


3. **Consul (Espanha/Global):**
* *O que é:* Focado em Democracia Participativa (votação de leis, orçamento).
* *Status:* Usado por grandes cidades.
* *Ponto Fraco:* Não é focado em zeladoria operacional (obras).



### B. Concorrentes Privados no Brasil (GovTechs)

Estes são seus rivais comerciais. Eles não são código aberto.

1. **Colab:**
* *Status:* Líder em engajamento no Brasil.
* *Foco:* Rede social cidadã e consultas públicas.
* *Sua Vantagem:* O Colab foca muito no "social/comunicação". O CityHero pode focar na "inteligência operacional/obras" (Hard Tech).


2. **1Doc / Solar BPM:**
* *Foco:* Eliminar papel (Tramitação de processos digitais).
* *Sua Vantagem:* Eles são ótimos em "processos" (PDFs), mas fracos em "mapas e zeladoria em tempo real".


3. **ERPs Tradicionais (IPM, Betha, Govbr):**
* *Foco:* Contabilidade e Folha de Pagamento.
* *Sua Vantagem:* Eles são dinossauros lentos. Sua interface moderna e IA são imbatíveis em usabilidade.



---

## 6. Riscos e Pontos de Atenção

### 🔴 Jurídico & Marcas

* **Nome "CityHero":** Já existe uma empresa *CityHeroes* atuando no mesmo ramo.
* *Ação:* Adotar um nome alternativo para registro oficial (Sugestões: **CivicHero**, **CitySquad**, **Zelo.AI**, **UrbanGuard**) ou usar CityHero apenas como nome fantasia do projeto piloto se não houver conflito no INPI Brasil.



### 🟡 Privacidade (LGPD)

* **Risco:** Fotos de buracos podem conter rostos de crianças ou placas de carros.
* *Ação:* Implementar filtro de IA para "blur" (borrar) automático antes da imagem ser pública no feed.

### 🟠 Resistência Cultural

* **Risco:** Funcionários da prefeitura podem ver o sistema como "mais trabalho" ou "vigilância".
* *Ação:* O sistema deve facilitar a vida deles (agrupar ordens de serviço, gerar rotas), não apenas cobrar. O dashboard deve mostrar "Quanto trabalho você economizou hoje".

### 🔵 Dependência de Dados

* **Risco:** Para o MVP, depender de *scrapers* (robôs) que leem portais da transparência é frágil (se o site muda, o robô quebra).
* *Ação:* Usar dados públicos apenas para demonstração de venda. O produto final exige contrato de integração oficial (API/Banco de Leitura).

---
