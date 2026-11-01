
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./admin.css";

const adminNavigation = [
    { label: "Dashboard", icon: "▣", path: "/admin" },
    { label: "Staff Management", icon: "👥", path: "/admin/staff" },
    { label: "Patients", icon: "🧑", path: "/admin/patients" },
    { label: "Appointments", icon: "📅", path: "/admin/appointments" },
    { label: "Billing", icon: "₹", path: "/admin/billing" },
    { label: "Hospital Overview", icon: "📊", path: "/admin/overview" },
    { label: "Beds", icon: "🛏️", path: "/admin/beds" }
];

const AdminSubpageLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <div className="admin-logo-icon">✚</div>
                    <div>
                        <h2>Thilak Hospital</h2>
                        <span>Care Portal</span>
                    </div>
                </div>

                <nav className="admin-menu" aria-label="Admin navigation">
                    {adminNavigation.map((item) => {
                        const active =
                            location.pathname === item.path ||
                            (item.path !== "/admin" &&
                                location.pathname.startsWith(`${item.path}/`));

                        return (
                            <button
                                key={item.path}
                                className={`admin-menu-item${active ? " active" : ""}`}
                                aria-current={active ? "page" : undefined}
                                onClick={() => navigate(item.path)}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-bottom">
                    <button
                        className="admin-menu-item logout-item"
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

            <main className="admin-main">{children}</main>
        </div>
    );
};

export default AdminSubpageLayout;
