# Thilak Hospital - Frontend

React + Vite frontend for the Thilak Hospital management portal.

```
npm install
npm run dev      # http://localhost:5173
npm run build
```

Backend URL is set in `.env` (VITE_API_BASE_URL).

## Extra features per role (src/features)

Every role has three extra tools, reachable from the **✦ Tools** button in the
bottom-right dock, from `Ctrl+K`, or from `/<role>/more` (tools + notices page).

| Role | Tools |
|---|---|
| Admin | Analytics · Report Centre (CSV export) · Announcements |
| Doctor | Clinical Calculators · Prescription Templates · Follow-up Reminders |
| Nurse | Shift Handover (SBAR) · Task & Medication Rounds · NEWS2 + Drip Calculator |
| Receptionist | Token Queue · Visitor Log · Enquiry & Callbacks |
| Patient | Medicine Reminders · Health Tracker · Feedback & Support |
| Pharmacist | Medicine Stock · Reorder List · Sales Summary |
| Lab In-Charge | Test Catalogue · Sample Tracking · Lab Insights |
| Bed In-Charge | Housekeeping · Occupancy Heatmap · Discharge Planner |

**Data:** Analytics, Report Centre, Sales Summary, Lab Insights, Occupancy Heatmap and
the Housekeeping / Discharge suggestions read the existing backend endpoints.
The rest (stock, queue, visitors, templates, reminders, etc.) are saved in
`localStorage` through `features/shared/storage.js`, so they work without new
backend APIs but are per-browser. To move one to the server, replace the
`useStore(...)` call in that page with API calls.

Adding another tool: add an entry to `features/registry.js`, create the page
(`FeatureLayout` + `RecordBoard` covers most list-style tools), and map it in
`features/featureRoutes.jsx`.
