import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const bedNavigation = [
    { label: "Dashboard", icon: "📊", path: "/bed" },
    { label: "Bed Availability", icon: "📈", path: "/bed/availability" },
    { label: "Wards", icon: "🏥", path: "/bed/wards" },
    { label: "Rooms", icon: "🚪", path: "/bed/rooms" },
    { label: "Beds", icon: "🛏️", path: "/bed/beds" },
    { label: "Admissions", icon: "📋", path: "/bed/admissions" },
    { label: "Transfers", icon: "🔄", path: "/bed/transfers" }
];

const BedSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <aside className="bed-sidebar">
            <div className="bed-logo">
                <div className="bed-logo-icon">🏥</div>
                <div>
                    <h2>Thilak Hospital</h2>
                    <span>Bed In-Charge</span>
                </div>
            </div>

            <nav className="bed-nav">
                {bedNavigation.map((item) => (
                    <button
                        key={item.path}
                        className={`bed-nav-item ${
                            location.pathname === item.path ? "active" : ""
                        }`}
                        onClick={() => navigate(item.path)}
                    >
                        <span aria-hidden="true">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="bed-sidebar-bottom">
                <button
                    className="bed-nav-item logout"
                    onClick={handleLogout}
                >
                    ⇥ Logout
                </button>

                {user?.name && (
                    <span className="bed-sidebar-user-name">
                        {user.name}
                    </span>
                )}
            </div>
        </aside>
    );
};

export default BedSidebar;