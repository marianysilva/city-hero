This document consolidates all technical, strategic, and product discussions we have had, serving as a "flight manual" for the development of your MVP (Minimum Viable Product).

---

# 🏙️ CityHero: Technical and Strategic Documentation

**Version:** 1.0
**Concept:** Intelligent Urban Maintenance & Citizen Engagement Platform.

---

## 1. Product Overview

**CityHero** is a software ecosystem designed to resolve the disconnect between the population (who sees the problems) and the City Hall (which has limited resources to solve them).

* **Key Differentiator:** Unlike current systems (bureaucratic and form-based), CityHero utilizes **Artificial Intelligence (Computer Vision)**, **Gamification**, and **Data Prediction** to optimize city maintenance.
* **Entry Strategy:** Act as an "Intelligence Layer" (Overlay) on top of the City Halls' legacy systems (ERPs), without attempting to replace them in the short term.

---

## 2. Ecosystem Architecture

### A. Citizen App (Mobile)

* **Focus:** Engagement, ease of use, and generation of high-quality data.
* **Technology:** React Native or Flutter.
* **Key Features:**
1. **AI Reporting:** The user points the camera, and the app automatically identifies the problem (e.g., "Pothole", "Trash") and fills in the category.
2. **Manual Reporting:** Selection of location on the map (Pin) and category via list (fallback for when there is no photo or the user is not at the exact location).
3. **Civic Feed:** A local "social network" where neighbors view, support (upvote), and comment on neighborhood issues.
4. **Gamification:** XP System, Levels (Citizen -> Watchman -> Guardian), and Achievements.



### B. Manager Panel (Web)

* **Focus:** Decision making, operational efficiency, and prediction.
* **Technology:** React.js (Frontend) + Python/FastAPI (Data Backend).
* **Key Features:**
1. **War Room:** Real-time heatmap of critical issues.
2. **Smart Routing:** Automatic grouping of nearby tickets to optimize routes for maintenance crews.
3. **Prediction (AI):** Cross-referencing data to predict invisible problems (e.g., multiple reports of "water outage" + "damp soil" = Probable hidden leak).



---

## 3. Detailed Features & Business Rules

### 3.1. Reporting Flow and Enrichment (Crowdsourcing)

To avoid duplicate and poor-quality data:

* **Proximity Detection:** Before creating a new ticket, the system checks for open reports within a **20-meter radius**.
* **Visual Collaboration:** If User A created a report *without a photo*, User B (passing by the location) receives an alert: *"Help your neighborhood! Add a photo to this report and earn double points."*
* **Security Rule:** Adding photos to third-party reports requires GPS validation (the user must be physically at the location).

### 3.2. Civic Feed and Community

Transforms solitary complaints into organized popular pressure.

* **Filters:** "My Neighborhood" (2km radius), "Trending" (Most voted), "Resolved".
* **Interaction:**
* **Support:** Functions like an "Upvote". Increases the ticket priority in the Mayor's dashboard.
* **Comments:** Must be moderated by AI or limited to pre-defined tags (e.g., [Dangerous], [Causes Traffic]) to avoid political toxicity.


* **Social Proof:** Display "Before and After" when a problem is resolved.

### 3.3. Identity and Anti-Spam

* **Login:** Initially via Google/Phone. Future goal: **Gov.br** (National ID) integration for real citizenship validation.
* **Reputation:**
* User starts with 50 points.
* False Report (rejected by manager) = -20 points.
* Zero Score = Automatic block (or *Shadowban*: they post, but no one sees it).



---

## 4. Tech Stack (Recommended)

| Layer | Technology | Reason |
| --- | --- | --- |
| **Mobile** | React Native (Expo) | Rapid development, reuses React Web logic. |
| **Frontend Web** | React.js / Next.js | Market standard, great for complex dashboards. |
| **Backend** | Python (FastAPI) | Best language to natively integrate AI and Data Science. |
| **Database** | **PostgreSQL + PostGIS** | Essential. The best open-source database for geographic data. |
| **Maps** | Mapbox or OpenStreetMap | Cheaper and more customizable than Google Maps for the start. |
| **AI / Vision** | YOLOv8 (Custom) or AWS/Google Vision | To detect potholes/trash in photos. |
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

## 5. Market Overview and Existing Systems

Here is the survey of what already exists, so you know the landscape.

### A. Open Source Systems

You can study the code for these, but they are generally technologically outdated.

1. **e-Cidade (Brazil):**
* *What it is:* Complete Public ERP (Accounting, HR, Tax).
* *Status:* Open source, maintained by community and companies.
* *Weakness:* Old interface, focus on internal bureaucracy, terrible mobile experience for the citizen.


2. **FixMyStreet (Global/UK):**
* *What it is:* The father of maintenance apps. Open source (based on Perl/Cobalt).
* *Status:* Widely used in Europe.
* *Weakness:* It is essentially an email form with a map. Little to no AI.


3. **Consul (Spain/Global):**
* *What it is:* Focused on Participatory Democracy (voting on laws, budget).
* *Status:* Used by major cities.
* *Weakness:* Not focused on operational maintenance (public works).



### B. Private Competitors in Brazil (GovTechs)

These are your commercial rivals. They are not open source.

1. **Colab:**
* *Status:* Leader in engagement in Brazil.
* *Focus:* Citizen social network and public consultations.
* *Your Advantage:* Colab focuses heavily on "social/communication". CityHero can focus on "operational intelligence/works" (Hard Tech).


2. **1Doc / Solar BPM:**
* *Focus:* Eliminating paper (Digital process workflow).
* *Your Advantage:* They are great at "processes" (PDFs), but weak at "real-time maps and maintenance".


3. **Traditional ERPs (IPM, Betha, Govbr):**
* *Focus:* Accounting and Payroll.
* *Your Advantage:* They are slow dinosaurs. Your modern interface and AI are unbeatable in usability.



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
