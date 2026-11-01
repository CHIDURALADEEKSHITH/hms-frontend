import { Route } from "react-router-dom";
import ProtectedRoute from "../common/ProtectedRoute";
import { FEATURES, ROLE_BASE } from "./registry";
import FeatureHub from "./FeatureHub";

import Analytics from "./admin/Analytics";
import ReportCentre from "./admin/ReportCentre";
import Announcements from "./admin/Announcements";
import ClinicalCalculators from "./doctor/ClinicalCalculators";
import PrescriptionTemplates from "./doctor/PrescriptionTemplates";
import FollowUps from "./doctor/FollowUps";
import ShiftHandover from "./nurse/ShiftHandover";
import NurseTasks from "./nurse/NurseTasks";
import EwsAndDrip from "./nurse/EwsAndDrip";
import TokenQueue from "./receptionist/TokenQueue";
import VisitorLog from "./receptionist/VisitorLog";
import CallbackLog from "./receptionist/CallbackLog";
import MedicineReminders from "./patient/MedicineReminders";
import HealthTracker from "./patient/HealthTracker";
import FeedbackSupport from "./patient/FeedbackSupport";
import MedicineStock from "./pharmacist/MedicineStock";
import ReorderList from "./pharmacist/ReorderList";
import SalesSummary from "./pharmacist/SalesSummary";
import TestCatalog from "./lab/TestCatalog";
import SampleTracking from "./lab/SampleTracking";
import LabInsights from "./lab/LabInsights";
import Housekeeping from "./bed/Housekeeping";
import OccupancyHeatmap from "./bed/OccupancyHeatmap";
import DischargePlanner from "./bed/DischargePlanner";

const PAGES = {
    ADMIN: { analytics: Analytics, reports: ReportCentre, announcements: Announcements },
    DOCTOR: { "clinical-tools": ClinicalCalculators, templates: PrescriptionTemplates, "follow-ups": FollowUps },
    NURSE: { handover: ShiftHandover, tasks: NurseTasks, "clinical-tools": EwsAndDrip },
    RECEPTIONIST: { queue: TokenQueue, visitors: VisitorLog, callbacks: CallbackLog },
    PATIENT: { reminders: MedicineReminders, "health-tracker": HealthTracker, feedback: FeedbackSupport },
    PHARMACIST: { stock: MedicineStock, reorder: ReorderList, sales: SalesSummary },
    LAB_INCHARGE: { catalog: TestCatalog, samples: SampleTracking, insights: LabInsights },
    BED_INCHARGE: { housekeeping: Housekeeping, heatmap: OccupancyHeatmap, "discharge-planning": DischargePlanner }
};

/* One <Route> per feature + one "/more" hub per role. */
const featureRoutes = Object.keys(FEATURES).flatMap((role) => {
    const base = ROLE_BASE[role];
    const routes = FEATURES[role].map((f) => {
        const Page = PAGES[role][f.key];
        return (
            <Route
                key={`${role}-${f.key}`}
                path={`${base}/${f.key}`}
                element={<ProtectedRoute allowedRoles={[role]}><Page /></ProtectedRoute>}
            />
        );
    });
    routes.push(
        <Route
            key={`${role}-more`}
            path={`${base}/more`}
            element={<ProtectedRoute allowedRoles={[role]}><FeatureHub /></ProtectedRoute>}
        />
    );
    return routes;
});

export default featureRoutes;
