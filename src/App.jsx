import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./common/ProtectedRoute";

/* =========================
   AUTH
   ========================= */

import Login from "./auth/Login";
import StaffRegister from "./auth/StaffRegister";
import PatientRegister from "./auth/PatientRegister";

/* =========================
   ADMIN
   ========================= */

import AdminDashboard from "./admin/AdminDashboard";
import StaffManagement from "./admin/StaffManagement";
import StaffDetails from "./admin/StaffDetails";
import PatientManagement from "./admin/PatientManagement";
import AppointmentManagement from "./admin/AppointmentManagement";
import BillingManagement from "./admin/BillingManagement";
import HospitalOverview from "./admin/HospitalOverview";
import AdminSubpageLayout from "./admin/AdminSubpageLayout";
import BedsOverview from "./admin/BedsOverview";

/* =========================
   DOCTOR
   ========================= */

import DoctorDashboard from "./doctor/DoctorDashboard";
import DoctorSubpageLayout from "./doctor/DoctorSubpageLayout";
import DoctorProfile from "./doctor/DoctorProfile";
import Availability from "./doctor/Availability";
import DoctorAppointments from "./doctor/Appointments";
import PatientDetails from "./doctor/PatientDetails";
import Consultation from "./doctor/Consultation";
import Prescriptions from "./doctor/Prescriptions";
import LabOrders from "./doctor/LabOrders";
import DischargeSummary from "./doctor/DischargeSummary";

/* =========================
   NURSE
   ========================= */

import NurseDashboard from "./nurse/NurseDashboard";
import NursePatients from "./nurse/Patients";
import PatientVitals from "./nurse/PatientVitals";
import NursingNotes from "./nurse/NursingNotes";

/* =========================
   RECEPTIONIST
   ========================= */

import ReceptionistDashboard from "./receptionist/ReceptionistDashboard";
import PatientSearch from "./receptionist/PatientSearch";
import ReceptionistAppointments from "./receptionist/Appointments";
import WalkIn from "./receptionist/WalkIn";
import Admissions from "./receptionist/Admissions";
import ReceptionistBilling from "./receptionist/Billing";

/* =========================
   PATIENT
   ========================= */

import PatientDashboard from "./patient/PatientDashboard";
import PatientProfile from "./patient/PatientProfile";
import BookAppointment from "./patient/BookAppointment";
import MyAppointments from "./patient/MyAppointments";
import MedicalHistory from "./patient/MedicalHistory";
import PatientPrescriptions from "./patient/Prescriptions";
import LabReports from "./patient/LabReports";
import Bills from "./patient/Bills";
import AdmissionDetails from "./patient/AdmissionDetails";

/* =========================
   PHARMACIST
   ========================= */

import PharmacistDashboard from "./pharmacist/PharmacistDashboard";
import PrescriptionRequests from "./pharmacist/PrescriptionRequests";
import PharmacyBilling from "./pharmacist/PharmacyBilling";
import Dispensing from "./pharmacist/Dispensing";

/* =========================
   LAB
   ========================= */

import LabDashboard from "./lab/LabDashboard";
import PendingTests from "./lab/PendingTests";
import ProcessTest from "./lab/ProcessTest";
import TestResults from "./lab/TestResults";
import Reports from "./lab/Reports";
import LabSubpageLayout from "./lab/LabSubpageLayout";

/* =========================
   BED IN-CHARGE
   ========================= */

import BedDashboard from "./bed/BedDashboard";
import WardManagement from "./bed/WardManagement";
import BedManagement from "./bed/BedManagement";
import BedAdmissions from "./bed/Admissions";
import Transfers from "./bed/Transfers";
import BedSubpageLayout from "./bed/BedSubpageLayout";
import BedAvailability from "./bed/BedAvailability";
import RoomManagement from "./bed/RoomManagement";

import ForgotPassword from "./auth/ForgotPassword";
import VerifyOtp from "./auth/VerifyOtp";
import ResetPassword from "./auth/ResetPassword";
import featureRoutes from "./features/featureRoutes";



function App() {

    const { user, isLoggedIn } = useAuth();


    /* =========================================================
       DASHBOARD REDIRECTION
       ========================================================= */

    const getDashboardPath = () => {

        if (!user) {
            return "/";
        }

        switch (user.role) {

            case "ADMIN":
                return "/admin";

            case "DOCTOR":
                return "/doctor";

            case "NURSE":
                return "/nurse";

            case "RECEPTIONIST":
                return "/receptionist";

            case "PATIENT":
                return "/patient";

            case "PHARMACIST":
                return "/pharmacist";

            case "LAB_INCHARGE":
                return "/lab";

            case "BED_INCHARGE":
                return "/bed";

            default:
                return "/";
        }
    };


    return (

        <Routes>

            {/* =================================================
                AUTH ROUTES
               ================================================= */}

            <Route
                path="/"
                element={
                    isLoggedIn
                        ? <Navigate
                            to={getDashboardPath()}
                            replace
                          />
                        : <Login />
                }
            />

            <Route
                path="/staff-register"
                element={<StaffRegister />}
            />

            <Route
                path="/patient-register"
                element={<PatientRegister />}
            />


            {/* =================================================
                ADMIN ROUTES
               ================================================= */}

            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/staff"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminSubpageLayout>
                            <StaffManagement />
                        </AdminSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/staff/:id"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminSubpageLayout>
                            <StaffDetails />
                        </AdminSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/patients"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminSubpageLayout>
                            <PatientManagement />
                        </AdminSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/appointments"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminSubpageLayout>
                            <AppointmentManagement />
                        </AdminSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/billing"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminSubpageLayout>
                            <BillingManagement />
                        </AdminSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/overview"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminSubpageLayout>
                            <HospitalOverview />
                        </AdminSubpageLayout>
                    </ProtectedRoute>
                }
            />
            <Route
    path="/admin/beds"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminSubpageLayout>
                <BedsOverview />
            </AdminSubpageLayout>
        </ProtectedRoute>
    }
/>


            {/* =================================================
                DOCTOR ROUTES
               ================================================= */}

            <Route
                path="/doctor"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/profile"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <DoctorProfile />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/availability"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <Availability />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/appointments"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <DoctorAppointments />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                DOCTOR -> PATIENT DETAILS

                URL:
                /doctor/patient/10001/25

                10001 = Patient ID
                25    = Appointment DB ID
               ================================================= */}

            <Route
                path="/doctor/patient/:patientId/:appointmentId"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <PatientDetails />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                CONSULTATION
               ================================================= */}

            <Route
                path="/doctor/consultation"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <Consultation />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/consultation/:patientId/:appointmentId"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <Consultation />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PRESCRIPTIONS

                IMPORTANT:
                Prescription belongs to the appointment.

                URL:
                /doctor/prescriptions/10001/25

                10001 = Patient ID
                25    = Appointment DB ID
               ================================================= */}

            <Route
                path="/doctor/prescriptions"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <Prescriptions />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/prescriptions/:patientId/:appointmentId"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <Prescriptions />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                LAB ORDERS
               ================================================= */}

            <Route
                path="/doctor/lab-orders"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <LabOrders />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/lab-orders/:patientId"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <LabOrders />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/doctor/lab-orders/:patientId/:appointmentId"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <LabOrders />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                DISCHARGE
               ================================================= */}

            <Route
                path="/doctor/discharge"
                element={
                    <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorSubpageLayout>
                            <DischargeSummary />
                        </DoctorSubpageLayout>
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                NURSE ROUTES
               ================================================= */}

            <Route
                path="/nurse"
                element={
                    <ProtectedRoute allowedRoles={["NURSE"]}>
                        <NurseDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/nurse/patients"
                element={
                    <ProtectedRoute allowedRoles={["NURSE"]}>
                        <NursePatients />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/nurse/vitals"
                element={
                    <ProtectedRoute allowedRoles={["NURSE"]}>
                        <PatientVitals />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/nurse/notes"
                element={
                    <ProtectedRoute allowedRoles={["NURSE"]}>
                        <NursingNotes />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                RECEPTIONIST ROUTES
               ================================================= */}

            <Route
                path="/receptionist"
                element={
                    <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
                        <ReceptionistDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/receptionist/patients"
                element={
                    <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
                        <PatientSearch />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/receptionist/appointments"
                element={
                    <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
                        <ReceptionistAppointments />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/receptionist/walk-in"
                element={
                    <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
                        <WalkIn />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/receptionist/admissions"
                element={
                    <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
                        <Admissions />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/receptionist/billing"
                element={
                    <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
                        <ReceptionistBilling />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PATIENT ROUTES
               ================================================= */}

            <Route
                path="/patient"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <PatientDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/profile"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <PatientProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/book-appointment"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <BookAppointment />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/appointments"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <MyAppointments />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/history"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <MedicalHistory />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/medical-history"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <MedicalHistory />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/prescriptions"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <PatientPrescriptions />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/lab-reports"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <LabReports />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/bills"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <Bills />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/patient/admission"
                element={
                    <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <AdmissionDetails />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                PHARMACIST ROUTES
               ================================================= */}

            <Route
                path="/pharmacist"
                element={
                    <ProtectedRoute allowedRoles={["PHARMACIST"]}>
                        <PharmacistDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/pharmacist/prescriptions"
                element={
                    <ProtectedRoute allowedRoles={["PHARMACIST"]}>
                        <PrescriptionRequests />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/pharmacist/billing"
                element={
                    <ProtectedRoute allowedRoles={["PHARMACIST"]}>
                        <PharmacyBilling />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/pharmacist/dispensing"
                element={
                    <ProtectedRoute allowedRoles={["PHARMACIST"]}>
                        <Dispensing />
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                LAB ROUTES
               ================================================= */}

            <Route
                path="/lab"
                element={
                    <ProtectedRoute allowedRoles={["LAB_INCHARGE"]}>
                        <LabDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/lab/pending"
                element={
                    <ProtectedRoute allowedRoles={["LAB_INCHARGE"]}>
                        <LabSubpageLayout>
                            <PendingTests />
                        </LabSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/lab/process"
                element={
                    <ProtectedRoute allowedRoles={["LAB_INCHARGE"]}>
                        <LabSubpageLayout>
                            <ProcessTest />
                        </LabSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/lab/results"
                element={
                    <ProtectedRoute allowedRoles={["LAB_INCHARGE"]}>
                        <LabSubpageLayout>
                            <TestResults />
                        </LabSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/lab/reports"
                element={
                    <ProtectedRoute allowedRoles={["LAB_INCHARGE"]}>
                        <LabSubpageLayout>
                            <Reports />
                        </LabSubpageLayout>
                    </ProtectedRoute>
                }
            />


            {/* =================================================
                BED IN-CHARGE ROUTES
               ================================================= */}

            <Route
                path="/bed"
                element={
                    <ProtectedRoute allowedRoles={["BED_INCHARGE"]}>
                        <BedDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/bed/wards"
                element={
                    <ProtectedRoute allowedRoles={["BED_INCHARGE"]}>
                        <WardManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/bed/beds"
                element={
                    <ProtectedRoute allowedRoles={["BED_INCHARGE"]}>
                        <BedManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/bed/admissions"
                element={
                    <ProtectedRoute allowedRoles={["BED_INCHARGE"]}>
                        <BedSubpageLayout>
                            <BedAdmissions />
                        </BedSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/bed/transfers"
                element={
                    <ProtectedRoute allowedRoles={["BED_INCHARGE"]}>
                        <BedSubpageLayout>
                            <Transfers />
                        </BedSubpageLayout>
                    </ProtectedRoute>
                }
            />

            <Route
    path="/bed/availability"
    element={
        <ProtectedRoute allowedRoles={["BED_INCHARGE"]}>
            <BedSubpageLayout>
                <BedAvailability />
            </BedSubpageLayout>
        </ProtectedRoute>
    }
/>
<Route
    path="/bed/rooms"
    element={
        <ProtectedRoute allowedRoles={["BED_INCHARGE"]}>
            <BedSubpageLayout>
                <RoomManagement />
            </BedSubpageLayout>
        </ProtectedRoute>
    }
/>


            {/* =================================================
                EXTRA FEATURES (all roles) — see features/registry.js
               ================================================= */}

            {featureRoutes}


            {/* =================================================
                UNKNOWN URL
               ================================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to={
                            isLoggedIn
                                ? getDashboardPath()
                                : "/"
                        }
                        replace
                    />
                }
            />
            <Route
    path="/forgot-password"
    element={<ForgotPassword />}
/>

<Route
    path="/verify-otp"
    element={<VerifyOtp />}
/>

<Route
    path="/reset-password"
    element={<ResetPassword />}
/>

        </Routes>
    );
}

export default App;