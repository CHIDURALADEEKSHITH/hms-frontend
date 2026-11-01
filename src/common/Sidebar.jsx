import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./common.css";

const Sidebar = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const role = user?.role;

    const menus = {

        ADMIN: [
            { label: "Dashboard", icon: "📊", path: "/admin" },
            { label: "Staff Management", icon: "👥", path: "/admin/staff" },
            { label: "Patient Management", icon: "🧑‍⚕️", path: "/admin/patients" },
            { label: "Appointments", icon: "📅", path: "/admin/appointments" },
            { label: "Billing", icon: "💳", path: "/admin/billing" },
            { label: "Hospital Overview", icon: "🏥", path: "/admin/overview" }
        ],

        DOCTOR: [
            { label: "Dashboard", icon: "📊", path: "/doctor" },
            { label: "Profile", icon: "👨‍⚕️", path: "/doctor/profile" },
            { label: "Availability", icon: "🕐", path: "/doctor/availability" },
            { label: "Appointments", icon: "📅", path: "/doctor/appointments" },
            { label: "Patients", icon: "👥", path: "/doctor/patients" },
            { label: "Consultation", icon: "🩺", path: "/doctor/consultation" },
            { label: "Prescriptions", icon: "💊", path: "/doctor/prescriptions" },
            { label: "Lab Orders", icon: "🧪", path: "/doctor/lab-orders" },
            { label: "Discharge Summary", icon: "📄", path: "/doctor/discharge" }
        ],

        NURSE: [
            { label: "Dashboard", icon: "📊", path: "/nurse" },
            { label: "Patients", icon: "👥", path: "/nurse/patients" },
            { label: "Patient Vitals", icon: "❤️", path: "/nurse/vitals" },
            { label: "Nursing Notes", icon: "📝", path: "/nurse/notes" }
        ],

        RECEPTIONIST: [
            { label: "Dashboard", icon: "📊", path: "/receptionist" },
            { label: "Patient Search", icon: "🔍", path: "/receptionist/patients" },
            { label: "Appointments", icon: "📅", path: "/receptionist/appointments" },
            { label: "Walk-In", icon: "🚶", path: "/receptionist/walk-in" },
            { label: "Admissions", icon: "🏥", path: "/receptionist/admissions" },
            { label: "Billing", icon: "💳", path: "/receptionist/billing" }
        ],

        PATIENT: [
            { label: "Dashboard", icon: "📊", path: "/patient" },
            { label: "My Profile", icon: "👤", path: "/patient/profile" },
            { label: "Book Appointment", icon: "📅", path: "/patient/book" },
            { label: "My Appointments", icon: "🗓️", path: "/patient/appointments" },
            { label: "Medical History", icon: "📋", path: "/patient/history" },
            { label: "Prescriptions", icon: "💊", path: "/patient/prescriptions" },
            { label: "Lab Reports", icon: "🧪", path: "/patient/lab-reports" },
            { label: "Bills", icon: "💳", path: "/patient/bills" },
            { label: "Admission", icon: "🏥", path: "/patient/admission" }
        ],

        PHARMACIST: [
            { label: "Dashboard", icon: "📊", path: "/pharmacist" },
            { label: "Prescription Requests", icon: "📋", path: "/pharmacist/prescriptions" },
            { label: "Medicine Stock", icon: "💊", path: "/pharmacist/stock" },
            { label: "Pharmacy Billing", icon: "💳", path: "/pharmacist/billing" },
            { label: "Dispensing", icon: "📦", path: "/pharmacist/dispensing" }
        ],

        LAB_INCHARGE: [
            { label: "Dashboard", icon: "📊", path: "/lab" },
            { label: "Pending Tests", icon: "⏳", path: "/lab/pending" },
            { label: "Process Test", icon: "🧪", path: "/lab/process" },
            { label: "Test Results", icon: "📋", path: "/lab/results" },
            { label: "Reports", icon: "📄", path: "/lab/reports" }
        ],

        BED_INCHARGE: [
            { label: "Dashboard", icon: "📊", path: "/bed" },
            { label: "Wards", icon: "🏥", path: "/bed/wards" },
            { label: "Beds", icon: "🛏️", path: "/bed/beds" },
            { label: "Admissions", icon: "📋", path: "/bed/admissions" },
            { label: "Transfers", icon: "🔄", path: "/bed/transfers" }
        ]
    };

    const roleMenus = menus[role] || [];

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <aside className="common-sidebar">

            <div className="sidebar-brand">

                <div className="sidebar-brand-icon">
                    🏥
                </div>

                <div>
                    <h2>Thilak Hospital</h2>
                    <span>{role || "User"}</span>
                </div>

            </div>

            <nav className="sidebar-menu">

                {roleMenus.map((item) => {

                    const active =
                        location.pathname === item.path ||
                        (
                            item.path !== `/${role?.toLowerCase()}` &&
                            location.pathname.startsWith(item.path)
                        );

                    return (
                        <button
                            key={item.path}
                            className={`sidebar-item ${
                                active ? "active" : ""
                            }`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="sidebar-icon">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>
                        </button>
                    );

                })}

            </nav>

            <div className="sidebar-bottom">

                <div className="sidebar-user">

                    <div className="sidebar-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                        <strong>
                            {user?.name || "User"}
                        </strong>

                        <span>
                            {user?.role || ""}
                        </span>
                    </div>

                </div>

                <button
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </div>

        </aside>
    );
};

export default Sidebar;