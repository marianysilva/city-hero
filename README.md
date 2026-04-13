This document consolidates all technical, strategic, and product discussions we have had, serving as a "flight manual" for the development of your MVP (Minimum Viable Product).

---

# 🏙️ CityHero: Technical and Strategic Documentation

**Version:** 1.0
**Concept:** Intelligent Urban Maintenance & Citizen Engagement Platform.

![CityHero-Example](docs/example.png)

---

## 1. Product Overview

**CityHero** is a software ecosystem designed to resolve the disconnect between the population (who sees the problems) and the City Hall (which has limited resources to solve them).

* **Key Differentiator:** Unlike current systems (bureaucratic and form-based), CityHero utilizes **Artificial Intelligence (Computer Vision)**, **Gamification**, and **Data Prediction** to optimize city maintenance.
* **Entry Strategy:** Act as an "Intelligence Layer" (Overlay) on top of the City Halls' legacy systems (ERPs), without attempting to replace them in the short term.

---

## 2. Ecosystem Architecture

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

## 3. [Features](./docs/features.md)

---

## 4. [User Stories](./docs/user-stories.md)

---

## 5. Tech Stack (Recommended)

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

## 6. Risks and Points of Attention

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
