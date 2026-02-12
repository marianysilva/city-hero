# Features

## 1. Citizen App

*Focus: Friction reduction, engagement, and data quality.*
- **Edge AI Camera:** Automatic and instant detection of the problem type (pothole, trash, graffiti) when pointing the camera, without needing internet.
- **Automatic Anonymization:** Automatic blurring of faces and license plates in photos before upload (GDPR compliance). Search for more sensive things that can appear in the photo.
- **Strict Geographic Validation:** Blocking uploads from gallery or distant locations; user must be physically at report location (1 km tolerance).
- **City Hall Reporting:** Develop an integration layer for the City Hall’s grievance system/forms. This will automatically populate all relevant data to open a ticket when the municipality does not officially use CityHero. Include a brief promotion for the app within the ticket description.
- **Ticket Tracking:** Develop an integration layer to pull updates from the City Hall’s system and display summary responses directly within the app.
- **Projects in Progress:** Much like our reports, all ongoing municipal projects will be integrated into the city map. This provides full visibility into active developments, such as bridge construction, road paving, and the building of new schools and healthcare facilities. Key details—including start/end dates, cost, project milestones, and current status — will be added to the project details.
- **Offline Mode:** Ability to save a report (photo + GPS) when having no signal and automatically synchronize when connection returns.
- **Manual Report (Fallback):** Map interface for pin selection and category list for cases where AI fails.
- **Hyperlocal Civic Feed:** Timeline showing neighbor reports within a configurable radius (e.g., 10km).
- **Enrichment Crowdsourcing:** Alert for nearby users to add photos, comentaries and reactions to reports.
- **Support System (Upvote):** Button to "support" third-party reports, increasing the problem's visual priority for the city hall.
- **"Before and After" Visualization:** Interactive slider in the feed showing the problem photo and the solution photo when ticket is closed.
- **Gamification - XP and Levels:** Experience points system that unlocks titles (e.g., Citizen, Watchman, Neighborhood Guardian).
- **Gamification - Achievements/Badges:** Digital medals for specific behaviors (e.g., "First Report", "5 Supports", "Reported in 3 different neighborhoods").
- **User Profile and History:** Screen summarizing activities, status of own tickets, and reputation level.
- **Transactional Push Notifications:** Real-time alerts about status changes of reported or supported tickets.
- **Moderated Comments:** Pre-defined tag system for commenting on tickets (e.g., "Dangerous for pedestrians", "Blocks traffic") to avoid toxicity.
- **Gov.br Login Integration:** (Advanced phase) Authentication using official government digital identity.

## 2. Field Team App

*Focus: Execution efficiency and proof of work.*

- **Simplified Task List:** "To-Do List" view top priorities.
- **Georeferenced Check-in:** Validation that the team arrived at the occurrence location.
- **Mandatory Proof of Conclusion:** Requirement of a "After" photo to be able to close ticket in the system.
- **Impediment Flagging:** Button to mark report as "Not Resolved" with justification (e.g., "Vehicle parked over the pothole").
- **Execution Timer:** Automatic counting of time between report opened and service conclusion.

## 3. Operational Management Panel

*Focus: Triage, dispatch, and real-time monitoring.*

- **War Room:** Real-time heatmap showing where critical problem peaks are at the moment.
- **Kanban Demand Board:** Visualization of draggable cards by status (To Do, In Progress, Blocked, Done).
- **AI Prioritization Score:** Algorithm that orders tickets not just by date, but by severity, road type, and number of popular supports.
- **Duplicate Detection and Fusion:** Automatic suggestion to merge multiple reports of the same pothole into a single "parent" ticket.
- **Team and Fleet Management:** Registration of teams, specialties (e.g., "Lighting Team"), and available vehicles.
- **Smart Routing (Multi-stop):** Selection of multiple tickets on map and generation of optimized route via algorithm (e.g., Traveling Salesperson Problem) to save fuel.
- **Audit and Logs:** Complete history of who changed the status, dispatched, or closed each ticket.
- **Internal Communication:** Private note field in the ticket for communication between manager and field team (invisible to citizen).

## 4. Data Intelligence & BI

*Focus: Trend analysis, prediction, and ROI.*

- **Executive Dashboards (Superset):** Customizable visual panels with advanced filters (by neighborhood, period, problem type).
- **Historical Trend Analysis:** Line charts showing problem evolution over months/years.
- **Cluster Analysis (Hotspots):** Identification of chronic problem zones requiring structural intervention, not just pothole patching.
- **Maintenance Prediction (Predictive Model):** Risk alerts crossing data (e.g., areas with flooding history + heavy rain forecast = storm drain cleaning alert).
- **Team Performance Metrics:** Efficiency comparison between different field teams (average repair time, quantity of services).
- **Citizen Sentiment Analysis:** Natural language processing (NLP) on tags and comments to measure general satisfaction by neighborhood.
- **ROI/Savings Calculator:** Estimation of "saved resources" by using optimized routes versus traditional model.
- **Seasonal Analysis:** Automatic preparatory reports for specific seasons (e.g., "Pre-Rain Report", "Pre-Winter Pruning Report").
- **Neighborhood Comparison:** Ranking of neighborhoods with best and worst response times (to identify inequality in service provision).

## 5. Platform Core & Integrations

*Focus: Robustness, security, and interoperability.*

- **Open311 Compliance (GeoReport v2):** Internationally standardized API, allowing other systems to connect to CityHero.
- **AI Retraining Pipeline:** System to use validated "Before/After" photos to continuously retrain and improve the YOLOv8 model.
- **Multi-tenant Architecture:** Ability to run multiple cities on the same infrastructure in an isolated and secure way.
- **Role-Based Access Control (RBAC):** Granular permissions different for Mayor, Works Secretary, Dispatcher, and Field Team.
- **Legacy Webhooks:** Triggers to notify old city hall ERPs when a ticket is closed in CityHero (bidirectional sync).
- **Transparency Portal (Public View):** Simplified "read-only" web version of the map so any citizen (without the app) can see where the city hall is working.
- **IoT Data Ingestion (Future):** Endpoint prepared to receive data from automatic sensors (e.g., storm drain level sensors) and transform them into tickets.
- **Public Data Scrapers (Sales Tool):** Robots to read Official Gazettes or transparency portals and pre-populate the system with data for demonstrations.

---

## 6. Citizen ++

- **Dark Mode:** Adaptive interface for battery saving and nighttime visual comfort.
- **Screen Reader Support (A11y):** Semantic tags (WAI-ARIA) for blind users to use the app (VoiceOver/TalkBack).
- **Haptic Feedback:** Subtle vibration when AI successfully detects an object.
- **Private/Anonymous Report:** Option to send without linking to the public profile (no gamification).
- **"Reduced Data" Mode:** App version that doesn't download feed images on slow connections.
- **WhatsApp Deep Linking:** Button to share a specific report directly into neighborhood groups.
- **Dynamic Translation (i18n):** Support for multiple languages for tourist cities (en-us and pt-br).

## 7. Operational ++ (Fine Management & Integrations)

- **Automatic SLA Escalation:** If a critical ticket isn't seen in 2h, automatically notify the regional manager.
- **Preventive Maintenance Calendar:** Create automatic recurring tickets (e.g., "Storm Drain Cleaning Street X" every 3 months).
- **Geographic Polygon Blocking:** Prevent new reports in a specific area (e.g., during a major event or natural disaster).
- **Street View Visualization in Panel:** Integrate Open Street Map into the dashboard for the manager to see location before dispatching team.

## 8. Field Team ++ (Hardware & Security)

- **In-App Panic Button:** Discrete button for the field team to trigger security in risky areas.

## 9. Data & Advanced AI (Prediction & Analysis)

- **Anomaly Detection (Anti-Fraud):** Alert if a single user reports 50 problems in 10 minutes in distant locations (GPS spoofing).
- **Satellite Imagery Analysis (Macro):** Use Sentinel/Landsat images to detect large areas of deforestation or invasion (not real-time).
- **Automatic Seasonal Analysis:** The system suggests "Tree Pruning Campaign" before rainy season starts.

## 10. Core, Infra & Enterprise Security

- **Two-Factor Authentication (2FA):** Mandatory for managers and administrators of the web panel.
- **Real-time Websockets:** Update without needing to "refresh" the page.
- **GraphQL API:** Alternative to REST so frontend can request only needed data.
- **Rate Limiting by IP/User:** Protection against denial-of-service attacks (DDoS) on the API.
- **Immutable Audit Trails:** Detailed log of all database actions for legal purposes.
- **Disaster Recovery Mode (DR):** Script to stand up infrastructure in another cloud region in case of catastrophic failure.

## 11. Scope Expansion (New Report Types)

- **Noise Pollution Report:** App records 10s of audio, measures decibels, and sends (requires calibration).
- **Tree Pruning Request:** Use of AI to estimate tree height/risk from the photo.
- **Abandoned Animals/Zoonoses:** Special category notifying a different department (municipal kennel).
- **Irregular Construction Enforcement:** Category to report construction without permit.
- **Sidewalk Occupation:** Report bar tables or debris blocking pedestrian passage.

## 12. Admin & Extra Engagement

- **Dynamic Category Configuration:** Add a new problem type (e.g., "Wasp Nest") without needing to update app in store.
- **Dynamic White-labeling:** Change app colors and logo based on the city user is in (multitenant).
- **Feature Flags:** Turn features on/off remotely for A/B testing or gradual rollout.
- **Quick Satisfaction Survey (NPS):** Ask for a "Score from 1 to 10" after ticket conclusion.
- **Official News Feed:** Space in the app for city hall to post announcements (e.g., "Vaccination tomorrow").
- **Link to External Services:** Quick button to "Pay Taxes" or "Check Fines" (webview).
- **FAQ Chatbot:** Simple AI to answer basic questions about urban maintenance.
- **Interactive API Documentation (Swagger/Redoc):** To facilitate external developer integration.
- **Performance Monitoring (APM):** Integration with Datadog/New Relic to see backend bottlenecks.
