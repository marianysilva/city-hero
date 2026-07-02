This document consolidates all technical, strategic, and product discussions we have had, serving as a "flight manual" for the development of your MVP (Minimum Viable Product).

---

# 🏙️ CityHero: Technical and Strategic Documentation

**Version:** 1.0
**Concept:** Intelligent Urban Maintenance & Citizen Engagement Platform.

![CityHero-Example](docs/example.png)
![CityHero-Example](docs/example-2.png)

---

## 1. Product Overview

**CityHero** is a software ecosystem designed to resolve the disconnect between the population (who sees the problems) and the City Hall (which has limited resources to solve them).

* **Key Differentiator:** Unlike current systems (bureaucratic and form-based), CityHero utilizes **Artificial Intelligence (Computer Vision)**, **Gamification**, and **Data Prediction** to optimize city maintenance.
* **Entry Strategy:** Act as an "Intelligence Layer" (Overlay) on top of the City Halls' legacy systems (ERPs), without attempting to replace them in the short term.

### 1.2 Prototype

```
cd design/
python3 -m http.server 5173
```

---

## 2. Getting Started

> **Pick the workflow for your OS.** There are two entry points and they are **not** interchangeable — the `make` targets rely on Colima (a macOS VM) and BSD shell behavior, while `scripts/dev.sh` mirrors them with portable commands for Windows/Linux. Use the row for your platform:
>
> | OS | Workflow | Prerequisites | Status |
> |---|---|---|---|
> | **macOS** | `make …` — [Make sections](#first-time-setup-macos) below | Colima · Docker CLI · Node 20+ | ✅ Supported |
> | **Windows** | `./scripts/dev.sh …` — [Windows and Linux](#windows-and-linux) below | Git Bash · Podman · Node 20+ | ✅ Supported (tested) |
> | **Linux** | `./scripts/dev.sh …` — [Windows and Linux](#windows-and-linux) below | bash · Docker/Podman · Node 20+ | ⚠️ Should work; not yet tested end-to-end |
>
> On **Linux** you can alternatively skip both and follow the individual setup instructions in each project's own README (`apps/backend/README.md`, `apps/web/README.md`, etc.), running the services directly (e.g. `docker compose up`, `uvicorn`, `npm run dev`).

> **Live reload:** all three apps pick up source changes without a manual restart. Web (`next dev`) and mobile (`expo start`) use Fast Refresh; the backend runs `uvicorn --reload` with its source bind-mounted via `docker-compose.override.yml`, so editing a `.py` under `apps/backend/` restarts the API in place. **Still needs a rebuild:** new Python deps (`docker-compose up -d --build backend`) and new JS deps (`npm install`). New Alembic migrations apply on the next `migrate` run.

### First-time setup (macOS)

> Everything under this heading (through **Stopping**) is the **macOS** workflow — it uses `make` + Colima. Windows and Linux users: skip to [Windows and Linux](#windows-and-linux).

Requires [Colima](https://github.com/abiosoft/colima), the [Docker CLI](https://docs.docker.com/engine/install/), and [Node.js](https://nodejs.org/) 20+ (`brew install colima docker docker-compose node`).

```bash
git clone <repo-url>
cd city-hero
make setup
```

This generates `.env` (root) and `apps/web/.env.local` with fresh secrets — skipping any that already exist — installs JS dependencies, then runs `make start`.

> `.env` and `.env.local` are gitignored — never commit real credentials. `apps/backend/.env.sample` is only needed when running the backend **outside Docker** (e.g. `uvicorn` locally); `make start` reads the root `.env` instead.

### Running everything (macOS)

Once `.env` exists (i.e. after the first-time setup above), start everything again with:

```bash
make start
```

This runs services in dependency order — if any step fails the chain stops:

```
Colima (VM) → Database (PostgreSQL) → Backend (FastAPI) → Web (Next.js) + Mobile (Expo)
```

Once running:

| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Web Dashboard | http://localhost:3000 |
| Mobile (browser) | http://localhost:8081 |

### Make command reference (macOS)

| Command | Description |
|---|---|
| `make start` | Start all services in order |
| `make stop` | Stop all services (reverse order) |
| `make restart` | Stop then start |
| `make status` | Show running state of each service |
| `make logs-docker` | Stream backend + db logs |
| `make logs-web` | Stream Next.js logs |
| `make logs-mobile` | Stream Expo logs |
| `make stop-colima` | Stop the Colima VM (full shutdown) |
| `make setup` | First-time setup (generates `.env` secrets, `npm install`) + `make start` |
| `make destroy-environment` | ⚠️ Deletes the Colima VM (all Docker data on this machine) and removes every gitignored file. Asks for confirmation. |

### Starting individual services (macOS)

Useful when iterating on a single layer:

```bash
make colima    # VM only
make db        # PostgreSQL (waits until healthy)
make backend   # Migrations + FastAPI (waits until healthy)
make web       # Next.js dev server (local)
make mobile    # Expo web dev server (local)
```

> **Note:** `db` must be running before `backend`, and `backend` must be running before `web`/`mobile` — the API client in both apps expects the backend to be reachable.

### Stopping (macOS)

```bash
make stop          # Stop web, mobile, backend, db (keeps Colima running)
make stop-colima   # Also stop the VM (full shutdown)
```

---

### Windows and Linux

The `make` targets rely on Colima (a macOS VM) and BSD shell behavior, so on **Windows and Linux** use the **`scripts/dev.sh`** helper instead — it mirrors the same commands with portable, Podman-compatible calls and auto-detects the OS for process management (`taskkill` on Windows, `kill` on Linux/macOS).

- **Windows** ✅ *tested* — run it from **Git Bash** (MINGW64), with [Podman](https://podman.io/) providing the `docker` / `docker-compose` CLIs and [Node.js](https://nodejs.org/) 20+ installed.
- **Linux** ⚠️ *expected to work, not yet tested end-to-end* — run it with your system `bash`, using Docker or Podman for `docker-compose` and Node 20+.

First-time setup (generates `.env` secrets, installs JS deps, then starts everything):

```bash
./scripts/dev.sh setup
```

Afterwards, start/stop the stack with:

```bash
./scripts/dev.sh start      # db → backend → web → mobile
./scripts/dev.sh stop       # stop everything
./scripts/dev.sh restart    # stop + start
./scripts/dev.sh status     # show running state
```

The URLs are the same as the macOS workflow (Backend `:8000`, Web `:3000`, Mobile `:8081`).

| Command | Description |
|---|---|
| `./scripts/dev.sh start` | Start all services (db → backend → web → mobile) |
| `./scripts/dev.sh stop` | Stop all services |
| `./scripts/dev.sh restart` | Stop then start |
| `./scripts/dev.sh status` | Show running state of each service |
| `./scripts/dev.sh db` / `backend` / `web` / `mobile` | Start a single service (respect the `db → backend → web/mobile` order) |
| `./scripts/dev.sh stop-db` / `stop-backend` / `stop-web` / `stop-mobile` | Stop a single service |
| `./scripts/dev.sh logs-web` / `logs-mobile` / `logs-docker` | Tail logs |
| `./scripts/dev.sh setup` | First-time setup (generate `.env`, `npm install`) + start |
| `./scripts/dev.sh destroy` | Remove containers, volumes, and gitignored files. Asks for confirmation. |

> **Notes:** Build images one at a time on WSL2 to avoid TAR errors — the script already sequences `migrate` then `backend` for this reason. Web and mobile run as local Node processes (not containers), with PIDs tracked in `.pids/` and logs in `.logs/`.

---

## 3. Ecosystem Architecture

**Technology:** Mobile First (Mobile and Web) + Python (Backend/Data).

### A. Citizen App

* **Focus:** Engagement, ease of use, and generation of high-quality data.
* **Key Features:**
1. **AI Reporting:** The user points the camera, and the app automatically identifies the problem (e.g., "Pothole", "Trash") and fills in the category.
2. **Civic Feed:** A local "social network" where neighbors view, support (upvote), and comment on neighborhood issues.
3. **Gamification:** XP System, Levels (Citizen -> Watchman -> Guardian), and Achievements.
4. **Public Services:** Links to services provided by the City Hall

### B. Manager Panel

* **Focus:** Decision making, operational efficiency, and prediction.
* **Key Features:**
1. **War Room:** Real-time heatmap of critical issues.
2. **Smart Routing:** Automatic grouping of nearby tickets.
3. **Prediction (AI):** Cross-referencing data to predict invisible problems (e.g., multiple reports of "water outage" + "damp soil" = Probable hidden leak).

---

## 4. [Features](./docs/features.md)

---

## 5. [User Stories](./docs/user-stories.md)

---

## 6. [IA Plans](./docs/tasks/README.md)

---

## 7. Tech Stack (Recommended)

| Layer | Technology | Reason |
| --- | --- | --- |
| **Mobile** | React Native (Expo) | Rapid development, reuses React Web logic. |
| **Frontend Web** | React.js / Next.js | Market standard, great for complex dashboards. |
| **Backend** | Python | Best language to natively integrate AI and Data Science. |
| **Database** | **PostgreSQL + PostGIS** | Essential. The best open-source database for geographic data. |
| **Maps** | OpenStreetMap | Cheaper and more customizable for the start. |
| **AI / Vision** | YOLOv8 (Custom) | To detect potholes/trash/others in photos. |
| **API Standard** | **Open311** (GeoReport v2) | International standard for civic system interoperability. |
| **Visualization (BI)** | **Apache Superset** | Open Source, free, and extremely powerful. Allows creating dashboards that will be embedded in the system. |
| **Embedding** | **Superset Embedded SDK** | JS Library that allows placing the dashboard inside your React App seamlessly (without ugly iFrames). |
| **Transformation (ETL)** | **dbt** (data build tool) | Transforms "dirty" data from the operational database into clean tables for analysis (Fact/Dimension Tables). |
| **Orchestration** | **Apache Airflow** | Schedules and monitors bots (scrapers) and data updates every hour/day. |
| **Data Warehouse** | **PostgreSQL/Snowflake** (Replica) | For the MVP, use a Postgres read replica. In the future, migrate to Snowflake if you have millions of rows. |

**With Postgres:**
For the MVP (1 city, low budget): It's free and easily handles up to ~10 million rows.
System -> API -> PostgreSQL (Transactional) -> dbt -> PostgreSQL (Analytical) -> Superset.

**With Snowflake:**
System -> API -> PostgreSQL (Transactional) -> Ingestion (Apache Airflow) -> Snowflake -> dbt -> Snowflake -> Superset.
For Version 2.0 (Selling to large capitals): Yes. When you have 50 cities and terabytes of photos and sensor data, PostgreSQL will choke. That is when you migrate to Snowflake.

---

## 8. Risks and Points of Attention

### 🔴 Legal & Trademarks

* **Name "CityHero":** There is already a company called *CityHeroes* operating in the same sector.
* *Action:* Adopt an alternative name for official registration (Suggestions: **CivicHero**, **CitySquad**, **Zelo.AI**, **UrbanGuard**) or use CityHero only as a fantasy name for the pilot project if there is no conflict at the Brazilian INPI.

### 🟡 Privacy (GDPR/LGPD)

* **Risk:** Photos of potholes may contain faces of children or car license plates.
* *Action:* Implement automatic AI filter to "blur" faces/plates before the image goes public on the feed.

### 🟠 Cultural Resistance

* **Risk:** City Hall employees may view the system as "more work" or "surveillance".
* *Action:* The system must facilitate their lives (grouping service orders, generating routes), not just demand tasks. The dashboard should show "How much work you saved today".

### 🔵 Data Dependency

* **Risk:** For the MVP, relying on *scrapers* (bots) that read transparency portals is fragile (if the site changes, the bot breaks).
* *Action:* Use public data only for sales demos. The final product requires an official integration contract (API/Database Read Access).
