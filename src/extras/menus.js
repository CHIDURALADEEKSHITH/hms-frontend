import { roleFeatures, hubPath } from "../features/registry";

/* Pages reachable from the quick-search palette, per role. */
export const ROLE_PAGES = {
    ADMIN: [
        ["Dashboard", "/admin"], ["Staff Management", "/admin/staff"], ["Patients", "/admin/patients"],
        ["Appointments", "/admin/appointments"], ["Billing", "/admin/billing"],
        ["Hospital Overview", "/admin/overview"], ["Beds Overview", "/admin/beds"]
    ],
    DOCTOR: [
        ["Dashboard", "/doctor"], ["My Profile", "/doctor/profile"], ["Availability", "/doctor/availability"],
        ["Appointments", "/doctor/appointments"], ["Consultation", "/doctor/consultation"],
        ["Prescriptions", "/doctor/prescriptions"], ["Lab Orders", "/doctor/lab-orders"],
        ["Discharge Summary", "/doctor/discharge"]
    ],
    NURSE: [
        ["Dashboard", "/nurse"], ["Patients", "/nurse/patients"], ["Patient Vitals", "/nurse/vitals"],
        ["Nursing Notes", "/nurse/notes"]
    ],
    RECEPTIONIST: [
        ["Dashboard", "/receptionist"], ["Patient Search", "/receptionist/patients"],
        ["Appointments", "/receptionist/appointments"], ["Walk-In", "/receptionist/walk-in"],
        ["Admissions", "/receptionist/admissions"], ["Billing", "/receptionist/billing"]
    ],
    PATIENT: [
        ["Dashboard", "/patient"], ["My Profile", "/patient/profile"], ["Book Appointment", "/patient/book-appointment"],
        ["My Appointments", "/patient/appointments"], ["Medical History", "/patient/history"],
        ["Prescriptions", "/patient/prescriptions"], ["Lab Reports", "/patient/lab-reports"],
        ["Bills", "/patient/bills"], ["Admission Details", "/patient/admission"]
    ],
    PHARMACIST: [
        ["Dashboard", "/pharmacist"], ["Prescription Requests", "/pharmacist/prescriptions"],
        ["Pharmacy Billing", "/pharmacist/billing"], ["Dispensing", "/pharmacist/dispensing"]
    ],
    LAB_INCHARGE: [
        ["Dashboard", "/lab"], ["Pending Tests", "/lab/pending"], ["Process Test", "/lab/process"],
        ["Test Results", "/lab/results"], ["Reports", "/lab/reports"]
    ],
    BED_INCHARGE: [
        ["Dashboard", "/bed"], ["Bed Availability", "/bed/availability"], ["Wards", "/bed/wards"],
        ["Rooms", "/bed/rooms"], ["Beds", "/bed/beds"], ["Admissions", "/bed/admissions"],
        ["Transfers", "/bed/transfers"]
    ]
};

/* Add the extra feature pages (and each role's tools hub) to the palette. */
Object.keys(ROLE_PAGES).forEach((role) => {
    ROLE_PAGES[role].push(["Tools & Notices", hubPath(role)]);
    roleFeatures(role).forEach((f) => ROLE_PAGES[role].push([f.label, f.path]));
});

/* Edit these to the real hospital numbers before the demo. */
export const HELPLINES = [
    { label: "Ambulance", number: "108", note: "Free emergency ambulance" },
    { label: "Emergency (all services)", number: "112", note: "Police / Fire / Medical" },
    { label: "Thilak Hospital Desk", number: "+91 00000 00000", note: "Reception, 24 hours" },
    { label: "Blood Bank", number: "+91 00000 00001", note: "Daily 8 AM – 8 PM" }
];

export const PALETTES = [
    { id: "maroon", name: "Maroon & Gold", swatch: ["#8c1d40", "#c79a3b"] },
    { id: "forest", name: "Forest & Brass", swatch: ["#1f6b4f", "#b8892e"] },
    { id: "midnight", name: "Midnight & Sky", swatch: ["#254a8f", "#5aa9e6"] },
    { id: "plum", name: "Plum & Rose", swatch: ["#6b2c6e", "#d98a9b"] }
];
