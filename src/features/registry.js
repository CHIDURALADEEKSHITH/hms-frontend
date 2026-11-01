/* Data-only list of the extra features added for every role.
   (No component imports here, so layouts and menus can use it without circular imports.) */

export const ROLE_BASE = {
    ADMIN: "/admin",
    DOCTOR: "/doctor",
    NURSE: "/nurse",
    RECEPTIONIST: "/receptionist",
    PATIENT: "/patient",
    PHARMACIST: "/pharmacist",
    LAB_INCHARGE: "/lab",
    BED_INCHARGE: "/bed"
};

export const ROLE_TITLE = {
    ADMIN: "Administration",
    DOCTOR: "Doctor Portal",
    NURSE: "Nurse Portal",
    RECEPTIONIST: "Front Desk",
    PATIENT: "Patient Portal",
    PHARMACIST: "Pharmacy",
    LAB_INCHARGE: "Laboratory",
    BED_INCHARGE: "Bed Management"
};

export const FEATURES = {
    ADMIN: [
        { key: "analytics", label: "Analytics", icon: "📈", desc: "Revenue, appointment and staffing charts built from live hospital data." },
        { key: "reports", label: "Report Centre", icon: "🗂️", desc: "Export patients, staff, appointments and bills to CSV with date filters." },
        { key: "announcements", label: "Announcements", icon: "📣", desc: "Post notices that appear on every role's tools page." }
    ],
    DOCTOR: [
        { key: "clinical-tools", label: "Clinical Calculators", icon: "🧮", desc: "BMI, BSA, MAP, creatinine clearance and weight-based dose helper." },
        { key: "templates", label: "Prescription Templates", icon: "📋", desc: "Save common prescriptions once and reuse them in seconds." },
        { key: "follow-ups", label: "Follow-up Reminders", icon: "🔔", desc: "Track patients you asked to return, with due dates and status." }
    ],
    NURSE: [
        { key: "handover", label: "Shift Handover", icon: "🔁", desc: "Write SBAR handover notes per patient and print them for the next shift." },
        { key: "tasks", label: "Task & Medication Rounds", icon: "✅", desc: "A due-time checklist for medication rounds, dressings and observations." },
        { key: "clinical-tools", label: "EWS & Drip Calculator", icon: "🩺", desc: "NEWS2 early-warning score and IV drip-rate calculator." }
    ],
    RECEPTIONIST: [
        { key: "queue", label: "Token Queue", icon: "🎫", desc: "Issue tokens, call the next patient and show a live queue board." },
        { key: "visitors", label: "Visitor Log", icon: "🚪", desc: "Check visitors in and out with pass numbers and the patient visited." },
        { key: "callbacks", label: "Enquiry & Callbacks", icon: "☎️", desc: "Log phone enquiries and callbacks so nothing is forgotten." }
    ],
    PATIENT: [
        { key: "reminders", label: "Medicine Reminders", icon: "⏰", desc: "Set daily medicine times and get browser notifications." },
        { key: "health-tracker", label: "Health Tracker", icon: "❤️", desc: "Log weight, blood pressure and sugar and see your trend." },
        { key: "feedback", label: "Feedback & Support", icon: "💬", desc: "Rate your visit, send feedback and find help numbers." }
    ],
    PHARMACIST: [
        { key: "stock", label: "Medicine Stock", icon: "💊", desc: "Inventory with batch, expiry and low-stock alerts." },
        { key: "reorder", label: "Reorder List", icon: "🛒", desc: "Auto-built purchase list from low and expiring stock." },
        { key: "sales", label: "Sales Summary", icon: "📊", desc: "Daily pharmacy sales, payment split and top medicines." }
    ],
    LAB_INCHARGE: [
        { key: "catalog", label: "Test Catalogue", icon: "📚", desc: "Maintain tests, prices, reference ranges and turnaround times." },
        { key: "samples", label: "Sample Tracking", icon: "🧫", desc: "Track every sample from collection to report." },
        { key: "insights", label: "Lab Insights", icon: "📈", desc: "Test volume, status mix and busiest categories." }
    ],
    BED_INCHARGE: [
        { key: "housekeeping", label: "Housekeeping", icon: "🧹", desc: "Cleaning status per bed so discharged beds are ready quickly." },
        { key: "heatmap", label: "Occupancy Heatmap", icon: "🟥", desc: "Ward-by-ward visual map of every bed's status." },
        { key: "discharge-planning", label: "Discharge Planner", icon: "📤", desc: "Plan expected discharges and free beds ahead of time." }
    ]
};

export const featurePath = (role, key) => `${ROLE_BASE[role]}/${key}`;
export const hubPath = (role) => `${ROLE_BASE[role]}/more`;

export const roleFeatures = (role) =>
    (FEATURES[role] || []).map((f) => ({ ...f, path: featurePath(role, f.key) }));
