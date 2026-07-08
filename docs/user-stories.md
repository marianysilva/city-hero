# User Stories - Gherkin (Given-When-Then)

## 1. Citizen Module: Reporting & Engagement

### US: AI-Assisted Incident Reporting

**As a** Citizen,
**I want** to take a photo of an urban issue so that the system automatically categorizes it,
**In order to** reduce the manual effort of filing a report.

- **Acceptance Criteria:**
- **Given** the user has opened the mobile app camera,
- **When** they capture an image of a "pothole",
- **Then** the YOLOv8 model should identify the object with at least 70% confidence and pre-select the "Road Maintenance" category.
- **And** the system must extract the GPS coordinates from the device to pin the exact location.

### US: Collaborative Evidence (Crowdsourcing)

**As a** Citizen passing by an existing report,
**I want** to add a new photo to a ticket created by someone else,
**In order to** earn extra XP and provide updated proof to the City Hall.

- **Acceptance Criteria:**
- **Given** there is an open ticket within a 20-meter radius of the user,
- **When** the user clicks "Add Photo" and captures the image,
- **Then** the system must validate via GPS that the user is physically at the location.
- **And** the user should receive "Double Points" (100 XP) upon successful upload.

## 2. Governance & Security

### US: Automated Privacy Filtering

**As a** Data Privacy Officer,
**I want** the system to blur sensitive information in public photos,
**In order to** comply with LGPD (General Data Protection Law).

- **Acceptance Criteria:**
- **Given** a photo uploaded by a citizen containing a car license plate or a part of body or faces,
- **When** the image is processed by the backend (FastAPI),
- **Then** an AI filter must automatically apply a blur effect to the sensitive areas before the image is visible in the Civic Feed.

# Edge Cases

## 1. Edge Case: Connectivity & Synchronization

### US: Offline Incident Capture (Graceful Degradation)

**As a** Citizen in a low-connectivity area,
**I want** to be able to capture an incident and save it locally,
**In order to** report it automatically once my internet connection is restored.

- **Acceptance Criteria:**
- **Given** the mobile app detects "No Internet Connection",
- **When** the user captures a photo and confirms the report,
- **Then** the app must store the image, GPS metadata, and timestamp in the local SQLite/WatermelonDB storage.
- **And** the system should automatically sync the data with the FastAPI backend once the device is back online.
- **And** the user must be notified that the report is "Pending Upload".

## 2. Edge Case: Fraud & Reputation Management

### US: Anti-Spoofing & GPS Validation

**As a** System Administrator,
**I want** to prevent users from uploading gallery photos as "Live Reports",
**In order to** ensure the data reflects a real-time, physical problem.

- **Acceptance Criteria:**
- **Given** a user attempts to create a report,
- **When** they try to upload a photo from the phone's gallery instead of using the "Live Camera",
- **Then** the system must flag the report for manual review or reject it if the EXIF metadata (timestamp/location) doesn't match the current device state.
- **And** if a user is caught "teleporting" (GPS spoofing), their reputation should drop by 50 points immediately.

### US: Reputation Recovery (Shadowban Exit)

**As a** Shadowbanned User,
**I want** to perform "Community Tasks" (validating other people's reports),
**In order to** recover my reputation and be allowed to post again.

- **Acceptance Criteria:**
- **Given** a user has a "Zero Score" and is currently shadowbanned,
- **When** they correctly validate 10 third-party reports (e.g., confirming "Yes, this pothole is still here"),
- **Then** their reputation should increase back to the "Citizen" level (50 points).

## 3. Edge Case: Operational Conflicts

### US: Cross-Departmental Collision Detection

**As a** Manager Panel Administrator,
**I want** the system to detect if a new ticket overlaps with an existing planned public work,
**In order to** avoid sending a maintenance crew to a site that is already scheduled for renovation.

- **Acceptance Criteria:**
- **Given** a new ticket is validated by the AI,
- **When** the FastAPI backend queries the PostGIS database,
- **Then** it must check against the "Planned Works" layer (GeoJSON/Shapefile).
- **And** if an overlap is found, the ticket status should change to "Managed by Existing Project" and notify the reporting citizen.

## 4. Technical Edge Case: Data Volume & Dashboard Performance

### US: Analytical Data Decoupling (ETL)

**As a** Data Engineer,
**I want** to use dbt to transform operational logs into summarized Fact Tables,
**In order to** keep the Superset Dashboards fast even with millions of reports.

- **Acceptance Criteria:**
- **Given** the "Tickets" table in PostgreSQL,
- **When** the Airflow orchestrator triggers the dbt job,
- **Then** the system must generate a `fact_monthly_issues_by_neighborhood` table.
- **And** the Superset dashboard must point to this summarized table instead of the raw logs.
