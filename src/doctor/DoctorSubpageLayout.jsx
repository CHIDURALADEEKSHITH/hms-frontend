import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./doctor.css";

const doctorNavigation = [
    { label: "Dashboard", icon: "▣", path: "/doctor" },
    { label: "My Profile", icon: "👨‍⚕️", path: "/doctor/profile" },
    { label: "Availability", icon: "🕐", path: "/doctor/availability" },
    { label: "Appointments", icon: "📅", path: "/doctor/appointments" },
    { label: "Patients", icon: "🧑", path: "/doctor/appointments" },
    { label: "Prescriptions", icon: "💊", path: "/doctor/prescriptions" },
    { label: "Lab Orders", icon: "🔬", path: "/doctor/lab-orders" },
    { label: "Discharge Summary", icon: "📄", path: "/doctor/discharge" }
];

const DoctorSubpageLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <div className="doctor-layout">
            <aside className="doctor-sidebar">
                <div className="doctor-logo">
                    <div className="doctor-logo-icon">✚</div>
                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Doctor Portal</span>
                    </div>
                </div>

                <nav className="doctor-menu" aria-label="Doctor navigation">
                    {doctorNavigation.map((item) => {
                        const active =
                            location.pathname === item.path ||
                            (item.path !== "/doctor" &&
                                location.pathname.startsWith(`${item.path}/`)) ||
                            (item.label === "Appointments" &&
                                location.pathname.startsWith("/doctor/patient/"));

                        return (
                            <button
                                key={`${item.label}-${item.path}`}
                                className={`doctor-menu-item${active ? " active" : ""}`}
                                aria-current={active ? "page" : undefined}
                                onClick={() => navigate(item.path)}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="doctor-sidebar-bottom">
                    <button
                        className="doctor-menu-item logout-item"
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                    >
                        <span>↪</span>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="doctor-main doctor-subpage-main">
                {children}
            </main>
        </div>
    );
};

export default DoctorSubpageLayout;
